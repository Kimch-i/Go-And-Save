# Security checklist

This checklist is based on my repository (https://github.com/Kimch-i/Go-And-Save)
and its live deployment before making the repository public.

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | Lines 2–3 of `.gitignore` exclude `.env` and `.env.*` while allowing `.env.example`. `git ls-files | grep env` returns only `.env.example`, `client/.env.example`, and `server/.env.example`. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | All three `.env.example` files contain only placeholders (`change-this-to-something-long-and-random` or empty key values) or a local development default (`postgresql://postgres:devpassword@localhost:5432/gas`). No real credentials are included. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | Yes | No hardcoded connection strings, keys, tokens, or passwords were found in `client/` or `server/` outside the `.env.example` files. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | Yes | `git log -p --all` contains no actual secrets. The only match for the searched patterns was a validation error message (`'Use at least 8 characters.'`). |
| 5 | Any credential that was ever committed has been rotated | N/A | No credentials were found in the commit history (see #4), so none required rotation. |
| 6 | Production credentials live only in my hosting provider's environment settings | Yes | `DATABASE_URL`, `JWT_SECRET`, `TOMTOM_API_KEY`, and `CORS_ORIGINS` are configured in Render's dashboard. `server/db/pool.js` reads these values from `process.env`. |

## GitHub Actions

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | Yes | Neither `.github/workflows/deploy-pages.yml` nor `update-fuel-prices.yml` contains literal secret values. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | Neither workflow uses secrets. `deploy-pages.yml` reads only public repository variables (`vars.VITE_USE_MOCK_API` and `vars.VITE_API_BASE_URL`), which are included in the public JavaScript bundle. `update-fuel-prices.yml` fetches a public webpage and opens a pull request using the default `GITHUB_TOKEN`. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | Yes | The merged fuel-price-check workflow run prints only parsed fuel-price values and pull-request information. It does not print secrets because the workflow does not use any (see #8). |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | Yes | The only uploaded artifact is `client/dist`, the built React application. `.env` is gitignored and is not included in the checkout. Vite compiles `VITE_` variables into the bundle; these variables are intended to be public. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | No | Both workflows reference actions by version tags: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`, and `peter-evans/create-pull-request@v6`. None is pinned to a commit SHA. These steps do not handle secrets, but the check is marked No because the actions are not pinned to commit SHAs. |
| 12 | Secret scanning and push protection are enabled on the repository | Yes | Secret scanning and push protection are enabled under Settings > Code security. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | Queries in `server/db/*.js` use parameterized inputs rather than string concatenation. For example, `carModelsRepo.js` uses `pool.query('... ILIKE $1', [term])`, and the same `$1`/`$2` pattern is used throughout the repository. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | No | Neon's free tier does not provide IP allowlisting, so connection attempts can come from any address. Access relies on the connection string's credentials. This is a free-tier limitation and means anyone with the connection string—not only the app—could connect. |
| 15 | The database user the app connects as has only the permissions it needs | No | `schema.sql` contains no `GRANT`, `CREATE ROLE`, or other least-privilege configuration. The app connects using Neon's default project role, which owns the database; a separate role with limited read/write permissions is not configured. |
| 16 | Seed and sample data is invented, not real people's data | Yes | The car catalog in `server/db/seed.sql` contains public vehicle specifications (make, model, year, and fuel economy). User accounts, vehicles, and trips are created by people who sign up; no real people's data is pre-seeded. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | `db:seed` and `db:reset` are scripts in `package.json` that run manually against `DATABASE_URL`. `server.js` contains no HTTP routes for seed, reset, or debug operations. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | `server/auth.js` hashes passwords with bcrypt and issues a JWT during login and signup. |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | N/A | The project uses PostgreSQL through its API and does not use Supabase or Firebase. |
| 20 | If Zero Trust: on the access policy. If an app password: in my private workspace `project/README.md` | N/A | The project does not use Zero Trust or an application password (see #18). |
| 21 | The gate covers every route, including the ones that only change data | Yes | `server.js` applies `requireAuth` to all `/api/vehicles` routes (GET/POST/DELETE), `/api/trips` routes (GET/POST), and `/api/account` routes (PUT/DELETE). The unauthenticated routes—`/healthz`, `/readyz`, `/api/prices`, `/api/cars`, `/api/places`, `/api/route`, and `/api/auth/*`—are read-only or handle login/signup and are public as intended. |
| 22 | The credentials for the gate are environment variables, not in source | Yes | `auth.js` reads `JWT_SECRET` from `process.env`; the value is configured only in Render's dashboard (see #6). |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | Input from the user is validated on the server, not only in the browser | Yes | `server/validate.js` exports `vehicleErrors`, `tripErrors`, and `accountErrors`, and each validator is called in its corresponding route in `server.js`. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | React escapes JSX text content by default. `client/src` contains no uses of `dangerouslySetInnerHTML` or `innerHTML`. |
| 25 | Error responses do not expose stack traces, file paths or connection details | Yes | The catch-all error handler in `server.js` logs errors server-side with `console.error` and returns only `{ error: 'Something went wrong on the server' }` or a specific safe message for the recognized case. It does not send `error.stack` or `error.message` to the client. |
| 26 | CORS is not a wildcard on routes that change data | Yes | The app uses one global `cors({ origin: allowedOrigins })` configuration, with `allowedOrigins` built from `CORS_ORIGINS`. It does not use `cors()` without options, which would allow `*`. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | No | `git log --format='%an <%ae>'` shows my personal Gmail address in the author metadata for every commit (`markvalderrama01@gmail.com`). This is stored in Git's commit metadata rather than in a repository file, but is visible in the public commit history. |
| 28 | No classmate's personal data in the repository | Yes | The repository contains no classmate personal data based on searches for names, email addresses, phone numbers, and IDs, excluding code and documentation with generic placeholders. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | Dependencies are installed with `npm install` from the public npm registry. Line 6 of `.gitignore` excludes `node_modules/`, and `git ls-files | grep node_modules` returns no results. |
| 30 | Images, fonts and other assets are mine, licensed, or credited | Yes | The tracked assets are `client/public/favicon.svg` and screenshots in `docs/assets/`, captured from my own running application. No third-party images or fonts are bundled. |
| 31 | Repository visibility is deliberate, and I checked it after my last push | Yes | The repository is public and remains public after my latest push. It was created from the course template, which instructs users to make it public. GitHub Pages on the free tier also requires a public repository. |

## Anything I found and fixed

During the review, I found two issues I had not previously noticed. First, my personal Gmail address is included in the author metadata of every commit because it was configured in my local Git settings when I started committing. This information is visible in the public repository's commit history. Removing it from commits that have already been pushed would require rewriting the Git history. Second, I had not created a database role with limited permissions. The app connects to Neon using the same role that owns the database, which gives it more access than it needs.

The remaining checks matched my expectations: no secrets were found in Git, neither workflow uses or exposes secrets, all routes that modify data require authentication, and input validation is performed on the server rather than only in the browser.
