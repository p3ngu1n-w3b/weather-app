# Weather App

A Next.js weather app with current conditions, 3-day forecast, and historical weather. Geared toward South Africa (default country and timezone), with city search and “use my location” support.

## Setup and run

### Prerequisites

- **Node.js** 18.x or 20.x (LTS recommended)
- **npm** (or yarn/pnpm)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and add your API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your [Weatherbit](https://www.weatherbit.io/) API key:

```
WEATHERBIT_API_KEY=your_api_key_here
```

You can get a free API key at [weatherbit.io](https://www.weatherbit.io/).

### 3. Run the app

**Development** (with hot reload):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Production build and run:**

```bash
npm run build
npm start
```

**Other scripts:**

- `npm run lint` — run ESLint
- `npm test` — run Vitest once
- `npm run test:watch` — run Vitest in watch mode

---

## Design decisions and trade-offs

### Stack

- **Next.js 16 (App Router)** — Server components, API routes, and simple deployment.
- **React 19** — Current React with hooks used for all client state and data fetching.
- **Tailwind CSS 4** — Utility-first styling and consistent spacing/typography.

### Data and APIs

- **Weatherbit** — Single provider for current weather, 16-day forecast, and history. Keeps the stack simple and avoids coordinating multiple weather APIs; trade-off is vendor lock-in and one point of failure.
- **API key on the server only** — All Weatherbit requests go through Next.js API routes (`/api/weather`, `/api/weather/forecast`, `/api/weather/history`). The key stays in `WEATHERBIT_API_KEY` and is never sent to the client.
- **Nominatim (OpenStreetMap)** — Used for reverse geocoding when the user chooses “use my location.” Converts lat/lon to a readable place name (e.g. suburb) instead of showing the raw weather-station name from Weatherbit. Free, no key required; trade-off is rate limits and dependency on an external service.

### Caching and performance

- **Client-side cache (localStorage)** — Current weather results are cached in the browser with a 10-minute TTL. Repeat searches for the same city are instant and reduce API calls. Trade-off: no shared cache across devices, and cache is per browser.
- **No server-side cache** — Forecast and history are fetched on demand per request. Adding Redis or in-memory cache would improve repeat loads and reduce Weatherbit usage but was omitted to keep the app stateless and easy to run.

### UX and behaviour

- **South Africa default** — Country is fixed to `ZA` and timezone to `Africa/Johannesburg` so search and time-based data (forecast/history) are aligned with SA usage. The codebase centralises this in `lib/constants.ts` so it can be changed later if needed.
- **Custom hooks** — `useWeather` (current) and `useForecastAndHistory` (forecast + history) encapsulate loading states, errors, and API calls. The page composes these hooks and stays focused on layout and user actions.
- **Recent queries** — The last few successful city queries are stored in localStorage and shown in the UI. Implemented by reusing the same cache keys as current weather; clearing “recent” clears that cache.

### Types and maintainability

- **Weatherbit types** — Response shapes are defined in `lib/weather-types.ts` and aligned with the Weatherbit API docs. This gives type safety and a single place to update when the API changes.
