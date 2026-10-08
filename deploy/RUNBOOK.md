# K'ART Production Runbook

## Architecture

```text
Internet
  |
  v
Cloudflare (k-artracing.com, www)
  |
  v
[ shared VPS ]  vx-nginx container (from the vexara repo) owns 80/443
  |
  v
k-art.service (systemd, Node)  on 172.17.0.1:8789
  |
  |- /opt/k-art/current  ->  releases/<git sha>
  '- /opt/k-art/data         content.json, backups/, uploads/
```

The site shares a VPS with Vexara, Treble Quest and the portfolio. It runs on
the host as the `k-art` systemd unit (user `kart`), bound to the docker0
gateway. Vexara's nginx container reaches it as `host.docker.internal:8789`,
the same way it reaches the Treble Quest API. The server block lives in the
**vexara** repo: `deploy/nginx/kart.conf.template` (www redirects to the apex).

GitHub Actions type-checks and builds the site, copies a tarball to the VPS,
extracts it into a release directory, repoints `current`, restarts the service
and smoke-tests it through the local nginx edge.

Content lives in `/opt/k-art/data`, outside the releases, so deploys never
touch it. Vexara's nightly `deploy/backup.sh` archives it with the other apps.

## First-time setup

On a host bootstrapped before K'ART existed, the first deploy sets itself up:
the `kart` user, `/opt/k-art/data`, the UFW rule for port 8789 and the Let's
Encrypt cert for `k-artracing.com` + `www`. On a fresh host, vexara's
`deploy/bootstrap-vps.sh` does the same.

DNS (Cloudflare):

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | VPS IPv4 |
| A | `www` | VPS IPv4 |

The cert is issued with DNS-01 when `/root/.secrets/cloudflare.ini` holds a
Cloudflare token that can edit the `k-artracing.com` zone. Otherwise it falls
back to HTTP-01, which needs both records unproxied (grey cloud) for the first
issue. Turn the proxy on once the site is up.

Order for the very first deploy:

1. Deploy K'ART (push to main, or Actions > Deploy > Run workflow). It issues
   the cert and starts the service, and warns that nginx is not routing yet.
2. Deploy Vexara (Actions > CI/CD > Run workflow). It renders `kart.conf` now
   that the cert exists.

## GitHub Actions secrets

| Name | Description |
| --- | --- |
| `VPS_HOST` | VPS IP address or hostname |
| `VPS_USER` | SSH user, `deploy` |
| `VPS_SSH_KEY` | Private key of `github-actions-k-art`, K'ART's own entry in the deploy user's `authorized_keys` |
| `VPS_PORT` | Optional SSH port, defaults to `22` |
| `ADMIN_USER` | Username of the first admin account (see below) |
| `ADMIN_PASSWORD` | Its password, a long random string |

The deploy writes the rest of `/etc/k-art.env` (port, data dir, upload limit,
proxy headers) itself.

## Admin accounts

The first start with an empty `/opt/k-art/data/users.json` (or none) creates
one account from `ADMIN_USER` and `ADMIN_PASSWORD`. From then on accounts are
managed in the admin (My account), and the two secrets are ignored. Change
that first password after signing in.

If someone forgets their password, the other person sets a new one in My
account. If nobody can sign in, recreate the first account from the secrets:

```bash
sudo systemctl stop k-art
sudo mv /opt/k-art/data/users.json /opt/k-art/data/users.json.old
sudo systemctl start k-art
```

Then sign in with `ADMIN_USER` / `ADMIN_PASSWORD` and add the other person
again. Content, history and backups are untouched.

## Before launch: limit the site to some IPs

The repo variable `SITE_ALLOW_IPS` (Settings > Secrets and variables > Actions >
Variables) takes comma-separated IPs or CIDR ranges, IPv4 and IPv6. While it is
set, everyone else gets a holding page (403) on every page, the admin and the
uploads. Static build files (scripts, styles, the logo) stay public. Home
connections with IPv6 change their address often, so allow the `/64`, not a
single IPv6 address.

Change or delete the variable, then run the workflow again (Actions > Deploy >
Run workflow). Deleting it opens the site to everyone. `/healthz` always
answers, for the deploy checks.

## Manual deploy

From the VPS, after placing `k-art-build.tar.gz` in `/opt/k-art`:

```bash
cd /opt/k-art
bash deploy/deploy.sh
```

Without `ADMIN_USER` / `ADMIN_PASSWORD` in the environment it keeps the
existing `/etc/k-art.env`.

## Rollback

```bash
ls -lt /opt/k-art/releases
ln -sfn /opt/k-art/releases/<release> /opt/k-art/current
sudo systemctl restart k-art
```

To undo a content change, use History in the admin: it shows who changed what,
and can put the site back to how it was before any change.

## Restore the data from a backup

```bash
sudo systemctl stop k-art
sudo mv /opt/k-art/data /opt/k-art/data.old
sudo tar -xzf k-art_YYYY-MM-DDTHH-MM-SSZ.tar.gz -C /opt/k-art
sudo chown -R kart:kart /opt/k-art/data
sudo systemctl start k-art
```

## Common checks

```bash
curl -I https://k-artracing.com
curl -I --resolve k-artracing.com:443:127.0.0.1 https://k-artracing.com
systemctl status k-art
journalctl -u k-art -n 50 --no-pager
docker logs --tail 50 vx-nginx
```
