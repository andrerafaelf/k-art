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
| `ADMIN_USER`, `ADMIN_PASSWORD` | Sign-in for `/admin`. The admin stays locked (503) until both are set. Use a long random password. |
| `DATA_DIR` | Folder for `content.json`, `backups/` and `uploads/`. Default `data`. Point it at the persistent volume. |
| `BODY_SIZE_LIMIT` | Set to `10M`. The default of 512 KB is too small for photo uploads. |
| `PORT` | Port to listen on. |
| `PROTOCOL_HEADER`, `HOST_HEADER`, `ADDRESS_HEADER` | Only behind a reverse proxy that speaks plain HTTP to Node, usually `x-forwarded-proto`, `x-forwarded-host` and `x-forwarded-for`. Without them, saving in the admin fails with "Cross-site POST form submissions are forbidden". |

Serve the site over HTTPS. The admin uses HTTP Basic Auth, which is only safe over HTTPS.

Back up `DATA_DIR` along with the rest of the server.

## The admin

`/admin`, signed in with `ADMIN_USER` and `ADMIN_PASSWORD`. Changes go live as soon as they are
saved.

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
  homepage; all of them at `/noticias` and `/en/news`. Text supports `## headings`, `- lists`,
  `> quotes`, `**bold**`, `_italic_` and `[links](https://...)`.
- **Partners**: sponsor logos for the "Our partners" strip (SVG or transparent PNG).
- **Site settings**: contact details, hero text, season year, calendar intro, sponsorship packages
  and contact texts. Also **version history**: a copy of everything is kept before each save (the
  last 40), and any of them can be restored.

Failed sign-ins are limited to 10 per IP every 15 minutes. Basic Auth has no sign-out button;
closing the browser signs out.

Uploaded images are checked by their content, not their file name, and stored with random names.
Replaced images stay on disk so that restoring an older version brings its images back too.

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
  circuit. The lap length is measured along the mapped line, so it is approximate.
- `static/og.png`: the image shown when the site is shared on social media.

## Structure

```
src/routes/[[lang=lang]]/   Public site: home, Hall of Fame, /noticias and /en/news
src/routes/admin/           Admin pages and their form actions
src/routes/uploads/         Serves uploaded images
src/hooks.server.ts         Basic Auth for /admin, page language
src/lib/content.ts          Content types and the stats derived from them
src/lib/i18n.ts             Interface text in Portuguese and English, language URLs
src/lib/server/store.ts     Reads and writes content.json, backups and uploads
src/lib/server/seed.ts      Starting content for a fresh install
src/lib/components/         Site sections
src/lib/admin/              Admin styles and form components
src/env.ts                  Environment variables
```

CSS is mobile-first: base styles target phones, with `min-width` media queries for larger screens.
Imports use the `#lib/*` subpath alias defined in `package.json`.

Writing style: no em dashes anywhere on the site, use commas instead.
