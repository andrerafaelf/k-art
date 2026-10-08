# K'ART Racing Team

Website for K'ART Racing Team, a karting team from Madeira, Portugal, with an admin at `/admin`
for keeping it up to date. Built with SvelteKit 3, Svelte 5 and TypeScript, served by Node.

The site is in Portuguese (pt-PT) at `/` and English at `/en`. Anything written in the admin has a
Portuguese and an English version; if the English is left empty the English site shows the
Portuguese, and the other way round.

## Run locally

Requires Node 22.9+.

```sh
npm install
cp .env.example .env   # then set ADMIN_PASSWORD
npm run dev            # http://localhost:5173, admin at /admin
npm run check          # type-check
```

On first start the site creates `data/content.json` from the starting content in
`src/lib/server/seed.ts` (placeholder names, results and email).

## Deploy

Production is https://k-artracing.com, on the VPS shared with Vexara, Treble Quest and the
portfolio. Every push to `main` deploys through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml);
setup, secrets, rollback and restore are in [`deploy/RUNBOOK.md`](deploy/RUNBOOK.md).

Elsewhere it needs a Node host with a disk that survives redeploys (a VPS, Railway, Render or Fly
with a volume). Serverless hosts like Vercel or Netlify won't keep the data file.

```sh
npm ci
npm run build
npm start              # reads .env, serves on PORT (3000 by default)
```

Environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `ADMIN_USER`, `ADMIN_PASSWORD` | The first admin account, created on first start while no accounts exist. After that, accounts are managed in the admin and these are ignored. The admin stays locked until there is an account. |
| `DATA_DIR` | Folder for `content.json`, `backups/`, `uploads/`, the accounts (`users.json`, `sessions.json`) and the change log (`changelog.jsonl`). Default `data`. Point it at the persistent volume. |
| `BODY_SIZE_LIMIT` | Set to `10M`. The default of 512 KB is too small for photo uploads. |
| `PORT` | Port to listen on. |
| `PROTOCOL_HEADER`, `HOST_HEADER`, `ADDRESS_HEADER` | Only behind a reverse proxy that speaks plain HTTP to Node, usually `x-forwarded-proto`, `x-forwarded-host` and `x-forwarded-for`. Without them, saving in the admin fails with "Cross-site POST form submissions are forbidden". |

Serve the site over HTTPS. The sign-in cookie is only marked secure (and gets its `__Host-` prefix)
over HTTPS.

Back up `DATA_DIR` along with the rest of the server.

## The admin

`/admin`, with a sign-in page at `/admin/login`. Changes go live as soon as they are saved. The
admin is in European Portuguese by default; each person can switch it to English in My account.

- **Overview**: the next race, season and career totals, and a to-do list (rounds that need
  results, drivers without photos, text with no English version yet).
- **Drivers**: add, edit, reorder and remove. Career record, profile, quote, best result and photo.
  The career records are added together for the team stats on the homepage.
- **Calendar & results**: add rounds; they are numbered by date automatically. After a race weekend,
  add each team driver's finishing position. Wins and podiums on the site are counted from these.
- **Hall of Fame**: past seasons (headline, story, numbers, titles, line-up) and former drivers
  (years with the team, record, titles, where they race now). "Archive the season" fills a season in
  from the calendar, and "Move to the Hall of Fame" on a driver takes them out of the line-up and
  into the former drivers. Shown on the homepage and at `/hall-of-fame` (`/en/hall-of-fame` in English).
- **News**: posts with a cover photo, published or kept as drafts. The three latest appear on the
  homepage; all of them at `/noticias` and `/en/news`. The text editor has buttons for subheadings,
  lists, quotes, bold, italic and links, and a preview. Underneath it writes `## headings`,
  `- lists`, `> quotes`, `**bold**`, `_italic_` and `[links](https://...)` (see `lib/markdown.ts`).
  A published post with a future date waits until that day (Madeira time). Drafts and scheduled
  posts can be previewed on the real page by anyone signed in.
- **Partners**: sponsor logos for the "Our partners" strip (SVG or transparent PNG).
- **Site settings**: contact details, hero text, season year, calendar intro, sponsorship packages
  and contact texts.
- **History**: every change, who made it and when, down to which fields changed. Any change can be
  undone by going back to the version from just before it; going back is recorded too, so it can be
  undone as well. Sign-ins and account changes are under "Everything".
- **My account**: name, username, password, admin language, the devices you're signed in on, and
  the people with access (add someone, set a new password for someone who forgot theirs, remove
  access). Everyone with access can do everything.

Signing in:

- Accounts live in `users.json` with scrypt password hashes. Sessions live in `sessions.json`,
  which only stores a hash of each session token, so they survive restarts and deploys.
- "Keep me signed in" keeps a device signed in for 30 days after its last use (at most 180 days);
  without it the session ends when the browser closes or after 12 hours unused.
- Ten wrong passwords from one address, or thirty for one username, block sign-in for 15 minutes.
- Forgotten password: the other person sets a new one in My account. If nobody can sign in, see
  the RUNBOOK.

While editing:

- Leaving a form with unsaved changes asks first.
- If someone else saved the same item after you opened it, saving asks whether to discard your
  version or save over theirs.

Images:

- Photos are resized to at most 2400 px and re-saved in the browser before upload, which also drops
  their metadata, including the GPS position phones record. JPEGs that arrive untouched get their
  GPS data blanked on the server, and photos uploaded before this was added were cleaned once on
  startup.
- Uploads are checked by their content, not their file name, and stored with random names.
- Replaced images stay on disk while any kept version of the site still uses them, then are deleted.
  Versions are kept for every save in the last 30 days, then one a day for a year.

## Brand assets

- `src/lib/brand.ts`: the official logo as vector paths, taken from `K-ART_LOGO25.pdf`. Use the
  `Logo` component, which supports the official colourways: the K in lime (`accent="lime"`) or
  blue (`accent="blue"`) with the rest in the text colour, or everything in one colour
  (`accent="mono"`, for example black on lime).
- Brand colours in `src/app.css`: lime `#D6F906` and blue `#0478FB` from the logo, sky blue
  `#21BBED` and number-plate yellow `#FEDA00` from the 2026 livery.
- `src/lib/madeira.ts`: the map of Madeira, generated from the OpenStreetMap coastline (ODbL)
  and NASA SRTM elevation, with contour lines every 150 m.
- `src/lib/faial.ts`: the Kartódromo do Faial track map, drawn from the OpenStreetMap survey of the
  circuit. The lap length shown on the site is the official 1040 m, set by hand in
  `src/lib/components/Track.svelte`, not taken from the map.
- `static/og.png`: the image shown when the site is shared on social media.

## Structure

```
src/routes/[[lang=lang]]/   Public site: home, Hall of Fame, /noticias and /en/news
src/routes/admin/           Admin pages and their form actions
src/routes/uploads/         Serves uploaded images
src/hooks.server.ts         Sessions and the /admin sign-in check, page language
src/lib/content.ts          Content types and the stats derived from them
src/lib/i18n.ts             Interface text in Portuguese and English, language URLs
src/lib/server/store.ts     Reads and writes content.json, backups and uploads
src/lib/server/auth.ts      Admin accounts, passwords and sessions
src/lib/server/log.ts       The change log (who changed what)
src/lib/admin/i18n.ts       Admin interface text in Portuguese and English
src/lib/server/seed.ts      Starting content for a fresh install
src/lib/components/         Site sections
src/lib/admin/              Admin styles and form components
src/env.ts                  Environment variables
```

CSS is mobile-first: base styles target phones, with `min-width` media queries for larger screens.
Imports use the `#lib/*` subpath alias defined in `package.json`.

Writing style: no em dashes anywhere on the site, use commas instead.
