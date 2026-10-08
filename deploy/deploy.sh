#!/usr/bin/env bash
# K'ART deploy. Called by GitHub Actions; can also run manually on the VPS.
#
# Shared VPS: Vexara's nginx container (vx-nginx) owns 80/443 and proxies
# k-artracing.com to this site, a Node server under systemd on the docker0
# gateway, the same way it reaches the Treble Quest API. Its server block
# lives in the vexara repo: deploy/nginx/kart.conf.template.
#
# Each build is extracted into $APP_DIR/releases/<sha> and "current" is
# repointed before the service restarts. Content and uploads live in
# $APP_DIR/data, outside the releases, so they survive every deploy.

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/k-art}"
DOMAIN="${DOMAIN:-k-artracing.com}"
RELEASE="${RELEASE:-$(date +%Y%m%d%H%M%S)}"
ARTIFACT="$APP_DIR/k-art-build.tar.gz"
RELEASE_DIR="$APP_DIR/releases/$RELEASE"
DATA_DIR="$APP_DIR/data"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
SERVICE_USER=kart
ENV_FILE=/etc/k-art.env
# docker0 gateway, port next to the Treble API (8787) and contact form (8788)
SITE_HOST=172.17.0.1
SITE_PORT=8789

echo "[deploy] Starting K'ART deploy ($RELEASE)"

if [ ! -f "$ARTIFACT" ]; then
  echo "[deploy] FATAL: build artifact missing at $ARTIFACT" >&2
  exit 1
fi

# SvelteKit 3 needs Node 22.17 or newer
if ! node -e 'const [a, b] = process.versions.node.split(".").map(Number); process.exit(a > 22 || (a === 22 && b >= 17) ? 0 : 1)'; then
  echo "[deploy] FATAL: Node $(node -v) is too old, the site needs 22.17+" >&2
  exit 1
fi

# ─── Host setup ───────────────────────────────────────────────────────────────
# Idempotent. vexara's bootstrap-vps.sh does the same on a fresh host; this
# covers a host that was bootstrapped before K'ART existed.
if ! id "$SERVICE_USER" &>/dev/null; then
  sudo useradd --system --no-create-home --shell /usr/sbin/nologin "$SERVICE_USER"
fi
sudo install -d -o "$SERVICE_USER" -g "$SERVICE_USER" -m 750 "$DATA_DIR"
mkdir -p "$APP_DIR/releases"

# Let the nginx container (any Docker bridge network) reach the site. Nothing
# else can: the server only listens on the docker0 gateway.
sudo ufw allow proto tcp from 172.16.0.0/12 to "$SITE_HOST" port "$SITE_PORT" \
  comment 'k-art site from docker nginx' > /dev/null

# vx-nginx only serves k-artracing.com once this cert exists. DNS-01 through
# the Cloudflare token when the host has one, otherwise HTTP-01 through the
# nginx webroot, which needs the DNS records unproxied (grey) for the first issue.
if ! sudo test -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem"; then
  echo "[deploy] Issuing the $DOMAIN certificate..."
  CF_INI=/root/.secrets/cloudflare.ini
  issue_cert() {
    sudo certbot certonly "$@" --cert-name "$DOMAIN" -d "$DOMAIN" -d "www.$DOMAIN" \
      --non-interactive --agree-tos --keep-until-expiring
  }
  if { sudo test -f "$CF_INI" \
         && issue_cert --dns-cloudflare --dns-cloudflare-credentials "$CF_INI" --dns-cloudflare-propagation-seconds 30; } \
     || issue_cert --webroot -w /var/www/certbot; then
    sudo chmod 0755 /etc/letsencrypt/live /etc/letsencrypt/archive
  else
    echo "[deploy] FATAL: could not issue the $DOMAIN certificate. Either give the Cloudflare" >&2
    echo "[deploy] token in $CF_INI DNS edit access to the $DOMAIN zone, or point $DOMAIN and" >&2
    echo "[deploy] www.$DOMAIN at this VPS with the Cloudflare proxy off, then deploy again." >&2
    exit 1
  fi
fi

# ─── Release ──────────────────────────────────────────────────────────────────
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
tar -xzf "$ARTIFACT" -C "$RELEASE_DIR"
# The service runs as $SERVICE_USER, not the deploy user
chmod -R a+rX "$RELEASE_DIR"

if [ ! -f "$RELEASE_DIR/build/index.js" ]; then
  echo "[deploy] FATAL: build/index.js missing from build artifact" >&2
  exit 1
fi

# Atomic swap: build the new symlink beside the old one, then rename over it
ln -sfn "$RELEASE_DIR" "$APP_DIR/current.next"
mv -T "$APP_DIR/current.next" "$APP_DIR/current"
rm -f "$ARTIFACT"

echo "[deploy] Pruning old releases, keeping $KEEP_RELEASES..."
find "$APP_DIR/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
  | sort -nr \
  | awk "NR>$KEEP_RELEASES {print \$2}" \
  | xargs -r rm -rf

# ─── Service ──────────────────────────────────────────────────────────────────
# ADMIN_USER, ADMIN_PASSWORD and SITE_ALLOW_IPS come from CI; on a manual run
# without them the existing $ENV_FILE is kept. The proxy headers are what
# vx-nginx sends, without them saving in the admin fails SvelteKit's cross-site
# POST check. SITE_ALLOW_IPS, when set, limits the site to those addresses.
if [ -n "${ADMIN_USER:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  printf '%s\n' \
    "NODE_ENV=production" \
    "HOST=$SITE_HOST" \
    "PORT=$SITE_PORT" \
    "DATA_DIR=$DATA_DIR" \
    "BODY_SIZE_LIMIT=10M" \
    "PROTOCOL_HEADER=x-forwarded-proto" \
    "HOST_HEADER=x-forwarded-host" \
    "ADDRESS_HEADER=x-forwarded-for" \
    "ADMIN_USER=$ADMIN_USER" \
    "ADMIN_PASSWORD=$ADMIN_PASSWORD" \
    "SITE_ALLOW_IPS=${SITE_ALLOW_IPS:-}" \
    | sudo tee "$ENV_FILE" > /dev/null
  sudo chown root:"$SERVICE_USER" "$ENV_FILE"
  sudo chmod 0640 "$ENV_FILE"
elif ! sudo test -f "$ENV_FILE"; then
  echo "[deploy] FATAL: ADMIN_USER / ADMIN_PASSWORD not set and $ENV_FILE missing" >&2
  exit 1
fi

sudo cp "$APP_DIR/deploy/k-art.service" /etc/systemd/system/k-art.service
sudo systemctl daemon-reload
sudo systemctl enable --quiet k-art
sudo systemctl restart k-art

for attempt in $(seq 1 15); do
  if curl -fsS -o /dev/null "http://$SITE_HOST:$SITE_PORT/healthz"; then
    echo "[deploy] Site service healthy"
    break
  fi
  if [ "$attempt" -eq 15 ]; then
    echo "[deploy] FATAL: site service did not start" >&2
    sudo journalctl -u k-art --no-pager -n 50 >&2
    exit 1
  fi
  sleep 2
done

# ─── Smoke test through the shared nginx edge ─────────────────────────────────
# vexara's deploy.sh only renders kart.conf once the cert exists, so right
# after the first deploy it is still empty. That means vexara needs a deploy,
# not that this one failed.
KART_CONF=/opt/vexara/runtime/nginx/kart.conf
if [ ! -s "$KART_CONF" ]; then
  echo "[deploy] WARN: vx-nginx is not routing $DOMAIN yet, deploy vexara to pick up kart.conf"
  echo "[deploy] Deploy complete, site running on $SITE_HOST:$SITE_PORT"
  exit 0
fi

# Hit the edge locally (cert + vhost + upstream), independent of DNS/Cloudflare.
# /healthz, because SITE_ALLOW_IPS may keep this host out of the pages.
echo "[deploy] Running local smoke test..."
for attempt in $(seq 1 12); do
  if curl -fsS -o /dev/null --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/healthz"; then
    echo "[deploy] Smoke test passed"
    echo "[deploy] Deploy complete: https://$DOMAIN"
    exit 0
  fi
  echo "[deploy] Smoke attempt $attempt failed, retrying in 5s..."
  sleep 5
done

echo "[deploy] Smoke test failed through vx-nginx" >&2
sudo docker logs --tail 30 vx-nginx >&2 || true
exit 1
