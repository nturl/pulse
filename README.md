# Pulse

First-party, cookieless analytics for Noel's own sites and Topsail Traffic's client demo sites. One dashboard, one tracking snippet, no third-party analytics vendor.

Live at [pulse-eight-pink.vercel.app](https://pulse-eight-pink.vercel.app) (password-gated).

## What it does

- **Dashboard** ([src/app/page.tsx](src/app/page.tsx)): for each tracked site, visitor/view tiles for today/7d/30d/90d, a 90-day sparkline, and top-6 lists for referrers, pages, cities, and devices.
- **Cookieless visitor identity**: a visitor is `sha256(site|ip|user-agent|day)`, truncated to 16 hex chars and rotated daily ([src/app/api/t/route.ts](src/app/api/t/route.ts)). No persistent cookie, no fingerprinting library.
- **Tracking snippet** ([public/p.js](public/p.js)): a tracked site adds one script tag —
  ```html
  <script defer data-site="<id>" src="https://pulse-eight-pink.vercel.app/p.js"></script>
  ```
  It sends a pageview via `sendBeacon` (falling back to `fetch` with `keepalive`) on load, and again on `pushState`, `replaceState`, and `popstate`, so SPA routers that navigate without a full reload still get tracked.
- **Site registry** ([src/lib/sites.ts](src/lib/sites.ts)): 35 tracked sites — Noel's own apps and a set of Topsail Traffic restaurant/medical demo sites — each a `{ id, name, host, url }` entry. Adding a site means one entry here plus the snippet tag on that site.
- **Single-password auth**: everything except the tracker, login, and PWA files requires a session cookie ([src/proxy.ts](src/proxy.ts)); the password is one shared value, not per-user accounts.
- **Installable PWA**: a "Get the app" button ([src/components/GetAppButton.tsx](src/components/GetAppButton.tsx)) opens an install sheet ([src/components/InstallSheet.tsx](src/components/InstallSheet.tsx)) that captures Chrome/Edge's native `beforeinstallprompt`, or walks iOS Safari through the manual Add-to-Home-Screen steps (iOS never fires that event).

## How it works

Each pageview POSTs to `/api/t` and is stored as one private Vercel Blob per event, keyed `e/<site>/<day>/<timestamp>-<rand>.json`. `getSiteAgg` ([src/lib/store.ts](src/lib/store.ts)) folds any unfolded events for today and yesterday into a per-site aggregate blob (`a/<site>.json`) — at most once every 3 minutes, via `unstable_cache` — and keeps a rolling 90 days of daily buckets, dropping anything older. Country, region, and city come from Vercel's edge request headers (`x-vercel-ip-country` and friends), not a client-side geo library, so geo only starts accruing once a site is added.

The ingest route skips requests whose user-agent matches `bot|crawler|spider|preview|vercel-screenshot`; there is no other bot filtering.

## Run locally

Requires Node with Next 16.2.4 / React 19.2.4 (pinned in [package.json](package.json)), plus a `.env.local` with the two vars below (see Configuration).

```bash
npm install
npm run dev    # next dev — local dashboard against live Blob data
npm run build  # next build
npm run start  # next start
```

## Configuration

| Var | Purpose |
| --- | --- |
| `PULSE_PASS` | The single shared dashboard password. Also salts the session-cookie hash ([src/proxy.ts](src/proxy.ts), [src/app/api/login/route.ts](src/app/api/login/route.ts)). Vercel holds separate Production and Development values — `vercel env pull` defaults to Development, which will not match the production login. |
| `BLOB_READ_WRITE_TOKEN` | Bearer token for reading and writing the private Vercel Blob store that holds raw events and folded aggregates ([src/lib/store.ts](src/lib/store.ts)). |

Both live in the Vercel project's environment settings, not the repo. `.env.local` is gitignored.

## Deploy

Vercel project `pulse` (linked via `.vercel/project.json`). There is no git integration — pushing to GitHub does not trigger a deploy.

```bash
vercel --prod
```

## Code map

| Path | Purpose |
| --- | --- |
| [src/app/page.tsx](src/app/page.tsx) | Dashboard: tiles, sparkline, top lists |
| [src/lib/store.ts](src/lib/store.ts) | Event folding and the aggregate data model |
| [src/lib/sites.ts](src/lib/sites.ts) | Registry of tracked sites |
| [src/app/api/t/route.ts](src/app/api/t/route.ts) | Ingest endpoint (CORS-open POST) |
| [public/p.js](public/p.js) | Tracking snippet served to tracked sites |
| [src/proxy.ts](src/proxy.ts) | Auth gate: allowlist + session-cookie check |
| [src/app/api/login/route.ts](src/app/api/login/route.ts), [src/app/login/page.tsx](src/app/login/page.tsx) | Password login |
| [src/components/InstallSheet.tsx](src/components/InstallSheet.tsx), [GetAppButton.tsx](src/components/GetAppButton.tsx), [ServiceWorkerRegister.tsx](src/components/ServiceWorkerRegister.tsx) | PWA install flow |
| [src/lib/icon-art.tsx](src/lib/icon-art.tsx), [src/app/icon.tsx](src/app/icon.tsx), [apple-icon.tsx](src/app/apple-icon.tsx), [manifest.ts](src/app/manifest.ts) | Generated app icons and manifest |
| [public/sw.js](public/sw.js) | Service worker: network-first, skips `/api/*` and `/login` |

## Tests

None. Verification is manual: a clean `next build`, then a live check of the `/login` redirect and dashboard render after each deploy.

## Limits and non-goals

- One shared password, not per-user accounts — anyone with it sees every tracked site.
- Bot filtering is a single user-agent regex, not a real bot-detection service.
- Geo only accrues from the point a site was added to the registry; there is no historical backfill.
- The site registry is hardcoded in `sites.ts`, not self-serve — this is not a general-purpose analytics product.

## Status

Live. Last commit 2026-09-03 (PWA install flow: manifest, icons, service worker, install sheet).

## Credits and license

Personal project. No LICENSE file; not distributed.
