# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single Next.js 16 (App Router) + React 19 + TypeScript weather app. There is no database or other backing service — it is a stateless app that proxies the Weatherbit API through its own Next.js API routes. npm is the package manager (`package-lock.json`).

### Running

- Dev server: `npm run dev` (Turbopack) → http://localhost:3000. Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`, `test`, `test:watch`); see `README.md` for full setup.
- Node 22 (the VM default) works fine even though `README.md` lists Node 18/20.

### Weatherbit API key (needed for live weather)

- Live weather (current, forecast, history) requires `WEATHERBIT_API_KEY`. Without it, `/api/weather*` routes return HTTP 503 `"Weather API is not configured."` and the UI shows a graceful "Unable to load weather" message; the UI itself still loads and is interactive.
- In Cursor Cloud, add `WEATHERBIT_API_KEY` as a secret. Secrets are injected as environment variables, and Next.js reads `process.env.WEATHERBIT_API_KEY` directly — you do NOT need to create `.env.local`. (Locally, `cp .env.example .env.local` per the README also works.)
- Reverse geocoding (`/api/geocode/reverse`, used by "use my location") calls public Nominatim/OpenStreetMap and needs no key.

### Tests / lint caveats

- `npm test` (Vitest + jsdom) runs without any API key or network — it uses mocked data.
- As of environment setup, the repo has pre-existing `npm run lint` errors and one failing Vitest test that are NOT caused by environment setup (clean checkout, only `npm install` run). Do not assume the tree is green; verify against `main` before attributing failures to your changes.
