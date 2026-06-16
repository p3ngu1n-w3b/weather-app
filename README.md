# Creative Touch Business Hub

An all-in-one internal operations platform for **Creative Touch** — a South African
digital advertising & marketing agency (George, Western Cape). It brings everything
the agency needs to run day-to-day into one place: clients, sales leads, projects,
tasks, a social content calendar, invoicing and the team.

## Features

- **Dashboard** — KPIs at a glance: active clients, open projects/tasks, paid &
  outstanding revenue, sales pipeline value, plus upcoming tasks, recent leads and
  scheduled posts.
- **Clients (CRM)** — manage client companies, contacts and status.
- **Leads** — a sales pipeline board (new → contacted → proposal → won/lost) with
  one-click "convert to client".
- **Projects** — track client work by service type, status, budget and dates.
- **Tasks** — a kanban board (To Do / In Progress / Done) with assignees, priority
  and due dates.
- **Content Calendar** — plan and schedule social media posts per client and platform.
- **Invoices** — create invoices with line items (ZAR), track draft/sent/paid/overdue.
- **Team** — directory of staff members.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** for styling
- **better-sqlite3** — a local, file-based SQLite database (no external services).
  The database is created and seeded automatically on first run at
  `data/creativetouch.db`.

## Setup and run

### Prerequisites

- **Node.js** 20.x or newer
- **npm**

### 1. Install dependencies

```bash
npm install
```

### 2. Run the app (development)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database is created
and seeded with realistic sample data on first request — no configuration needed.

### Other scripts

- `npm run build` / `npm start` — production build and run
- `npm run lint` — run ESLint
- `npm test` — run the Vitest unit/component tests

## Data & persistence

All data is stored in a local SQLite file under `data/` (git-ignored). To reset the
app to fresh seed data, stop the dev server and delete the `data/` directory; it will
be recreated and reseeded on the next run.

## API

The UI talks to JSON REST endpoints under `/api`:

| Resource | Endpoints |
| --- | --- |
| Clients | `/api/clients`, `/api/clients/[id]` |
| Leads | `/api/leads`, `/api/leads/[id]`, `/api/leads/[id]/convert` |
| Projects | `/api/projects`, `/api/projects/[id]` |
| Tasks | `/api/tasks`, `/api/tasks/[id]` |
| Content | `/api/content`, `/api/content/[id]` |
| Invoices | `/api/invoices`, `/api/invoices/[id]` |
| Team | `/api/team`, `/api/team/[id]` |
| Dashboard | `/api/dashboard` |
