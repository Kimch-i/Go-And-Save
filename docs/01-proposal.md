# Proposal

GAS (Go and Save)

## What the app is for

GAS lets a Philippine driver enter a start and end point, pick their car and how
many people are riding, and see two peso figures side by side. One is what the
trip would cost with clear roads. The other is what it will cost in the traffic
happening right now.

## Who it is for

Everyday Filipino drivers who pay for their own fuel. A student driving from Porac
to Angeles City for school every day. A family loading five people into a Vios for
a Baguio weekend. A small business owner doing deliveries around Pampanga. The
first testers are drivers I know personally.

They open the app in one of three moments.

- Before a trip, to find out how much cash to bring.
- Before leaving, to see whether traffic right now is bad enough that waiting an
  hour is worth it.
- Before gassing up, to check whether DOE prices are trending up this week, so
  they know to fill the tank instead of topping up.

## Screens and routes (revised)

The original proposal listed five routes. The wireframes and the built app have
seven, so the table below is the revised list. The two added rows are marked.

| # | Route | Screen | What it is for |
|---|-------|--------|----------------|
| 1 | `/` | Trip Planner (home) | Enter origin and destination, pick a vehicle and load, see the route on a map and two cost figures: ideal and with current traffic. |
| 2 | `/vehicles` | My Vehicles | Search a seeded catalog of common Philippine cars and save the ones you drive, so estimates use your real efficiency. |
| 3 | `/vehicles/add` | Add Vehicle (added) | Catalog search and manual entry. Save returns to the screen the user came from. |
| 4 | `/prices` | Fuel Prices | Current DOE price per fuel type, a 12-week chart and a simple up or down reading to answer "fill up now or wait?" |
| 5 | `/trips` | Saved Trips | Past estimates, so a user can see what a repeated commute costs per week or month. |
| 6 | `/auth` | Log in / Sign up | One route with a toggle. Saved vehicles and trips follow the user across devices. |
| 7 | `/profile` | Profile (added) | Name, email, theme, default vehicle, export and delete account. |

Each one earns its place. Remove Vehicles and the estimate is a guess. Remove
Prices and the peso figure has no source and the fill-up-now feature dies. Remove
Saved Trips and the app cannot answer what a commute costs over time. Auth comes
last because everything else works without it, and the planner runs fine for a
guest.

## State: what data the app holds

Most important screen: Trip Planner.

| State | Shape (rough) | Owner | Changes when |
|-------|---------------|-------|--------------|
| origin | `{ label, lat, lon }` or null | TripPlanner | user picks a suggestion in the origin search |
| destination | `{ label, lat, lon }` or null | TripPlanner | user picks a suggestion in the destination search |
| suggestions | `[{ label, lat, lon }]` | LocationSearch | user types and the debounced Nominatim lookup returns |
| vehicles | `[{ id, nickname, carModelId, kmPerLiter, idleRateLph }]` | App | app loads from the API, user adds, edits or deletes a vehicle |
| selectedVehicleId | number or null | TripPlanner | user picks a vehicle from the dropdown |
| load | `{ passengers, cargoKg }` | TripPlanner | user changes the passenger or cargo steppers |
| route | `{ distanceKm, trafficSeconds, freeFlowSeconds, geometry }` or null | TripPlanner | the TomTom routing call returns for the current origin and destination |
| fuelPrices | `[{ fuelType, pricePerLiter, weekOf }]` | App | app loads seeded DOE prices from the backend on start |
| estimate | `{ ideal: { liters, cost }, actual: { liters, cost }, delayMinutes }` | derived in TripPlanner | recomputed whenever route, vehicle, load or price changes |
| status | `"idle"`, `"loading"` or `"error"` | TripPlanner | a route or geocode request starts, succeeds or fails |

`vehicles` and `fuelPrices` live in App because more than one route needs them.
Everything tied to a single trip stays inside TripPlanner. `estimate` is never
stored. One pure function (`client/src/lib/estimate.js`) recalculates it, so there
is no stale state to keep in sync.

## What the Trip Planner contains

1. Header with the app name and links to Vehicles, Prices and Trips.
2. Trip form: origin search, destination search, vehicle dropdown, Estimate button.
3. Load panel: passenger and cargo steppers, collapsed by default, with a small line
   showing the effect on km/L.
4. Map: Leaflet map with start and end markers and the route line.
5. Two result cards: "If the road were clear" and "Leaving now", each with a peso
   figure, litres and travel time. "Leaving now" is the larger, filled card.
6. Traffic gap line: one sentence naming what traffic costs, in pesos.
7. Price footnote and Save button: which DOE price was used, the week it is from,
   and a note that load and idling figures are estimates.
8. Empty and error states for no route found and for the API being down.

The two peso figures are the focal point of the screen. Anything added to the
planner must not compete with them.

## Content to gather

- **DOE fuel prices.** 8 to 12 weeks of Luzon gasoline and diesel prices, cleaned
  and seeded into PostgreSQL. Updated weekly through a pull request I review and
  merge (see Changes below).
- **Philippine car catalog.** 50 to 80 common vehicles (Vios, Innova, Mirage,
  Avanza, Ertiga, Hilux, motorcycles) with make, model, year range, fuel type,
  km/L city and highway, and kerb weight. The free EPA dataset is US-market only,
  so this is built by hand.
- **TomTom API key** (free tier), and confirmation that the routing response
  returns both travel time and no-traffic travel time.
- **Nominatim usage policy.** Required user-agent header and request throttling.
- **Leaflet and OpenStreetMap tiles**, with the attribution text the tiles require.
- **Sources for the estimate figures.** The 1%-per-100lb weight rule and typical
  idle fuel consumption rates. Both are rules of thumb, so both are cited as such.
- **Logo and palette.** Dark instrument-panel look with an amber accent, plus a
  light theme.
- **Copy.** Empty states and a short "how we compute this" explainer so the two
  numbers do not look like magic.

## Hosting

| Piece | Host | Catch of the free tier |
|-------|------|------------------------|
| Client | GitHub Pages, deployed by GitHub Actions | Static only. The Pages source must be set to GitHub Actions or the workflow runs green and publishes nothing. |
| API | Render | The free service sleeps when idle, so the first request after a quiet spell is slow. |
| Database | Neon (PostgreSQL) | Free storage and compute limits. Compute pauses when idle. |

Host change, Week 2: the database moved from Render's own free Postgres to Neon.
Render's free Postgres is deleted after 30 days, which does not fit a project
that runs the whole term.

## Demo mode

Demo mode served sample data from `client/src/api/seed.json` through `mockApi.js`.
It was meant to go off when the API was deployed. In Week 2 the client was
repointed at the live API using repository variables, so it should be off now.
Confirm the deployed site is calling the API and not `seed.json`.

## Changes since the first proposal

- **Screens.** Added `/vehicles/add` and `/profile`. Both appeared in the
  wireframes but not in the original route table.
- **Fuel prices.** The first plan was a seeded CSV with no live updates. The
  built version has a weekly scheduled check that reads a public price page and
  opens a pull request with the new price and a source link. I review and merge
  it myself. It never writes to the database directly, because the page has no
  published API and a scraper can break silently.
- **Saved Trips charts.** Two bar charts and a total distance stat were added to
  the Trips page. Not in the original plan.
- **Cut or moved to stretch.** None yet. Record anything cut here, with the
  reason.

## Risks

- **Map and traffic routing** (was the biggest risk). Smaller now. Leaflet is
  built and the TomTom call runs from the server so the key stays off the client.
  Still open, the free tier terms after TomTom's July 2026 pricing change are not
  confirmed. The fallback still stands, if traffic data is unavailable the app
  shows the ideal-only estimate.
- **Car catalog accuracy** (new). 66 rows exist, but only one (the Vios) has a
  cited source. The rest are my own estimates and are labelled as estimates in
  `server/db/seed.sql`.
- **Fuel price source** (new). The source page can change its HTML without
  warning. The pull request step means a bad number is caught before it reaches
  users.
- **Personal data** (new). Accounts store a name, email and password hash, and
  saved trips store places that can reveal where someone lives or works. See
  `docs/06-security-and-privacy.md`.
