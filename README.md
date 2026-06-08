# MyTicket — Talent Dashboard

Standalone micro-frontend for Talent users at `talent.myticket.com` (dev: [http://localhost:5175](http://localhost:5175)).

## Features

- Login (email/password + Google OAuth)
- Talent role application wizard (pre-approval)
- Application status tracking (submitted / rejected / approved)
- Post-approval profile management
- Availability toggle (`available` / `reserved`)
- Engagements inbox (accept, decline, message, complete)
- Ratings display (stars only)
- Bilingual UI (English / Arabic) with RTL support

## Stack

Bun · Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · Lucide · Redux Toolkit · RTK Query · react-hook-form · Yup · react-i18next

## Scripts

```bash
bun install
bun run dev      # http://localhost:5175
bun run build
bun run test
bun run lint
```

## Environment

Copy `.env.example` to `.env` and set:

- `VITE_API_BASE_URL` — API host (default `http://localhost:8000`)
- `VITE_API_PREFIX` — API prefix (default `/api/v1/main`)
- `VITE_MAIN_WEBSITE_URL` — main site for tickets/public profiles
- `VITE_UPLOAD_URL` — optional CDN upload endpoint for application media

## Documentation

- [myticket_talent_dashboard_guide.md](myticket_talent_dashboard_guide.md) — full build guide
- [frontend-handoff-talent-api.md](frontend-handoff-talent-api.md) — API reference

## Main website handoff

Point the main site env `VITE_TALENT_DASHBOARD_URL` to this dev server:

`VITE_TALENT_DASHBOARD_URL=http://localhost:5175`

## Deployment

Production URL: `https://talent.myticket.com`

### VPS (GitHub Actions)

Push to `master` runs `.github/workflows/deploy-vps.yml`, which:

1. `bun install --frozen-lockfile`
2. `bun run build`
3. Rsyncs `dist/` to `/var/www/html/myticket/myticket-talent` on the VPS

Required repository secrets (same as other MyTicket frontends):

- `VPS_SSH_PRIVATE_KEY`
- `VPS_HOST`
- `VPS_USER`

### CI

Every push/PR runs `.github/workflows/ci.yml` (`lint` → `test` → `build`).

### Production env (build-time)

Set these when building for production:

- `VITE_API_BASE_URL` — API host
- `VITE_API_PREFIX` — `/api/v1/main`
- `VITE_MAIN_WEBSITE_URL` — `https://myticket.com`
- `VITE_UPLOAD_URL` — CDN upload endpoint for application media
