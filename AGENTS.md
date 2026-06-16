# AGENTS.md

## Cursor Cloud specific instructions

This repo is **Creative Touch Business Hub** — a single Next.js 16 (App Router) +
React 19 + TypeScript app that serves as an internal operations platform (clients,
leads, projects, tasks, content calendar, invoices, team). npm is the package
manager.

### Running

- Dev server: `npm run dev` → http://localhost:3000. Standard scripts live in
  `package.json` (`dev`, `build`, `start`, `lint`, `test`); see `README.md`.
- Node 20+ (the VM default Node 22 works).

### Data layer (non-obvious)

- Persistence is a **local SQLite file** via `better-sqlite3` at
  `data/creativetouch.db` (git-ignored). No external database or env vars are needed.
- The schema is created and **seeded automatically on first DB access** (see
  `lib/db.ts`). To reset to fresh sample data, stop the server and delete the `data/`
  directory — it is recreated and reseeded on the next request.
- `better-sqlite3` is a native module and is server-only. It is listed in
  `serverExternalPackages` in `next.config.ts` so Turbopack/webpack don't bundle it.
  Only import `lib/db.ts` / `lib/repo.ts` from server code (API route handlers).
  Client components must use `import type` when referencing types from `lib/repo.ts`.
- The DB connection is cached on `globalThis` so dev hot-reload does not reopen the
  handle or re-run seeding.

### Architecture

- All data access goes through `lib/repo.ts`; API route handlers under `app/api/*`
  are thin wrappers (each sets `runtime = "nodejs"` and `dynamic = "force-dynamic"`).
- UI pages under `app/*` are client components that fetch the JSON REST API via the
  helpers in `hooks/use-resource.ts`. Shared UI primitives live in `components/ui.tsx`.
