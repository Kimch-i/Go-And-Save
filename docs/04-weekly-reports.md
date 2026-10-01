# Weekly reports

---

## Week of 2026-09-28 (Week 2)

**Done.** The whole `server/` backend now exists, replacing the template's example
API. The database is on Neon, the API is deployed on Render, and the deployed
client points at the live API through repository variables.

First batch, built from my own plan (schema and routes first, TomTom and Nominatim
called from the server so the key never reaches the browser, JWT auth last).

- `90cf42d` updated the database schema for the system's requirements
- `c53cbc8` corrected the database fields for car model years and vehicle kerb weight
- `34f8d42` converted the initial seed data into SQL for database initialisation
- `a9ee205` created repositories for car models and fuel prices and updated the main server configuration
- `ebd6917` removed the unused sightings repository
- `24334ca` removed the course template's introductory documentation
- `c2ce2cb` place search for Philippine locations using Nominatim
- `4b796b4` API endpoint for searching and retrieving places
- `0ad17bf` TomTom integration for route generation
- `44de3bc` user repository for user-related database operations
- `1dbdcca` authentication utilities and JWT middleware
- `93648ca` connected the backend API with the frontend
- `3f5e8e3` moved the authentication module outside the database directory
- `79765a1` vehicle management with ownership validation, so users can only access their own vehicles
- `fcea70c` trip management for storing and retrieving saved trips
- `8bb657c` integrated the vehicle and trip repositories into the main server
- `1586ed2` account deletion
- `e65b8b0` utility for converting text between letter cases
- `1d4ff9f` connected the authentication page to the backend for sign up and login

Second batch, added once the server existed.

- `c3893bd` server-side request validation (`server/validate.js`) on the vehicle, trip and account routes
- `644168d` `helmet` and rate limiting on the API, and `npm audit fix`
- `30702fa` car catalog expanded from 9 rows to 66, in both `server/db/seed.sql` and the mock `client/src/api/seed.json`
- `9686e04` weekly scheduled check (`scripts/update-fuel-prices.mjs` and `.github/workflows/update-fuel-prices.yml`) that reads a public fuel price page and opens a pull request with the new price
- `4538ed2` two bar charts and a total distance stat on the Trips page (`TripBarChart.jsx`)

**Why.** Render's own free Postgres deletes the database after 30 days, which does
not fit a project that runs the whole term. The `.env.example` already pointed at
Neon, so the database is on Neon and the Express app is on Render.

For fuel prices I first considered fetching them live on a schedule and writing
straight into the database. I decided against it. The source page has no published
API, so a scraper can break silently, and a bad number landing in the app with
nobody checking is worse than a stale one. The version I built only opens a pull
request with the new number and a source link. I still look at it and merge it
myself, and it is never auto-merged.

**Stuck.**

- GitHub Pages ran green and published nothing, because the Pages source was never
  switched from the default to GitHub Actions.
- The first price checker tried to read a date off the source page in a fixed
  format, and the real HTML did not match. Fixed by using the date the check itself
  ran on.
- The price checker's pull request step failed with "GitHub Actions is not
  permitted to create or approve pull requests". That repository setting is off by
  default and has to be turned on by hand.
- `helmet`'s default settings include a header that would have silently blocked the
  deployed front end from reading the API's responses once they were on different
  domains. I caught it by testing the header on a real request, not by installing
  the package and assuming it worked.

**Hours.** About 20 hours total: backend and routes — 9 hours, Neon and Render deployment — 4 hours, fuel price checker — 4 hours, and validation and Helmet — 3 hours.

**Next.**

- Check the second-batch hashes above against `git log --oneline`. Only the first
  batch was copied from the log.
- Update `docs/06-security-and-privacy.md` and record the demo video

---

## Week of 2026-09-21 (Week 1)

**Done.** Three commits, all on GitHub.

- `f0c8d10` initial commit, repo created from the 6APSI course template (React and
  Vite client, Express server folder, GitHub Pages workflow)
- `2503b3f` React front end for GAS, running in demo mode. All six screens in React
  with React Router (Trip Planner, My Vehicles and Add Vehicle, Fuel Prices, Saved
  Trips, Log in and Sign up, Profile), the two-number estimate in
  `client/src/lib/estimate.js`, the fuel price trend in
  `client/src/lib/priceTrend.js`, the Leaflet map with OpenStreetMap tiles, light
  and dark themes, and a guest-first flow where a trip saved while logged out is
  kept in localStorage and saved after sign up. The data layer follows the
  template's `client/src/api/` shape, with `mockApi.js` for demo mode and
  `httpApi.js` for the future Express API.
- `336310c` project documentation and progress tracking (README rewrite and 5
  screenshots). `AI-USAGE.md` is unchanged, still the blank template.

The app runs in demo mode with sample data from `seed.json`. There is no server or
database behind it yet.

**Why.** The two peso figures are the whole point of GAS, so the maths came first,
as a pure function with no React in it, so it could be tested with numbers I can
check by hand. After that I built the front end against a mock API so every screen
could be clicked through before the server exists. When the server is ready only
the API layer changes and the screens stay the same.

**Stuck.**

- All three commits are dated the same day, so the history does not show
  day-by-day progress. From next week I commit as I do the work, not in one batch
  at the end.
- The `server/` folder is still the template's example. There is no PostgreSQL, no
  TomTom, no Nominatim and no real routes yet.
- I have not confirmed the TomTom free tier after its July 2026 pricing change.
- The car catalog only has sample rows, not the 50 to 80 I need.

**Hours.** About 4 hours for the frontend.

**Next.**

- PostgreSQL schema, car catalog and DOE price seed, and the Express routes with
  input validation.
- TomTom and Nominatim called from the server so the API key stays off the client.
  JWT auth last.
- Deploy the server and database, turn demo mode off, delete `START-HERE.md`,
  confirm the Pages source is set to GitHub Actions, and finish `AI-USAGE.md`.
