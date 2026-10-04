# Security and privacy checklist

## Before the first push

- [x] `.gitignore` includes `.env`, and `git check-ignore -v .env` confirms it
- [x] `git ls-files | grep -iE '\.env$|\.pem$|id_rsa'` prints nothing
- [x] `.env.example` is committed, with placeholder values only
- [x] No connection string, key or password anywhere in the repository,
      including in a screenshot
- [x] No `student.json`, and no name, student number or email of yours or
      anyone else's

## The application

- [x] Every SQL query is parameterised. Checked every `pool.query()` call
      across `server/db/*.js` — `tripsRepo.js`, `vehiclesRepo.js`,
      `usersRepo.js`, `carModelsRepo.js`, `fuelPricesRepo.js`. All use
      `$1`/`$2`-style placeholders with a values array. No template-literal
      or string-concatenated query anywhere.
- [x] Input is validated on the server, not only in React.
      `server/validate.js` has `vehicleErrors`, `tripErrors`,
      `accountErrors`, each with length limits (nickname ≤60, name ≤100,
      labels ≤300) and range checks on every numeric field.
- [x] `cors({ origin: allowedOrigins })` names your origins.
      `server.js` line 27, `allowedOrigins` read from `CORS_ORIGINS` env
      var.
- [x] No stack trace in any response body. The one error handler
      (`server.js` line 259) always responds with a generic message and
      logs the real error server-side only.
- [x] `helmet` installed. `server.js` line 26.
- [x] Anything that costs money or accepts a password is rate limited.
      `authLimiter` (20 req/15min) on `/api/auth/*`, `externalApiLimiter`
      (120 req/15min) on `/api/places` and `/api/route`.
- [x] Passwords hashed with bcrypt (cost factor 10, in `auth.js`), never logged — I manually checked the console.log/console.error statements in server/*.js and found no password, token, or body being logged.
- [x] Every route that touches somebody's data has the ownership check in
      the query: `tripsRepo.remove` and `vehiclesRepo.remove` both do
      `WHERE id = $1 AND user_id = $2` inside the SQL.
- [x] `npm audit` run (fresh clone, `--omit=dev`): 0 vulnerabilities in
      both `server/` and `client/`.

## Privacy

- [x] Seed data is invented. `server/db/seed.sql`'s car catalog is public
      spec data, not people. No real classmate names, numbers or emails
      found anywhere in the repo text.
- [x] No real classmates' names, numbers, emails or photos, anywhere — not
      in seed data, not in screenshots, not in the demo video.
- [x] If real people tested your app, even three friends, their data is
      deleted before you submit. I was the only tester, so there is no other person’s data in the database.
- [x] If your app collects anything about anyone, the app says what it
      collects. The system only collects user information when the user chooses to sign up for an account.
- [x] Any face in a screenshot is stock, generated, or yours. There are no faces shown in any of the screenshots.

## Journal paragraph — raw material

- I checked the app-security requirements and confirmed that the main areas are covered: parameterized queries, ownership checks, rate limiting, bcrypt password hashing, and no audit vulnerabilities found.
- For privacy, I checked the demo video and confirmed that no real classmates appear in it. I was also the only person who tested the system, so there is no other person’s data in the database.
- One tradeoff I identified is that saved trips store origin_label and dest_label as free text, with a limit of 300 characters. This could reveal places such as where a user lives or works, especially if they enter something like “home” as the origin. I accepted this because the system needs the actual origin and destination to calculate the two fuel-cost figures.