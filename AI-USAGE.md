# AI usage

This project was developed with AI assistance. This file documents how I used AI during development, what I asked it to do, what I learned from its suggestions, and which parts of the project I wrote myself.

I used AI mainly to help me understand unfamiliar concepts, organize the initial frontend, troubleshoot errors, and implement or integrate certain features. I reviewed and tested the resulting code and made adjustments based on the requirements of my system.

## 1. How I used AI

### 2026-09-21 - Initial frontend structure

- **Tool:** Claude
- **What I asked for:** I asked Claude to help me organize and build the initial frontend because I was still unsure how to start the project and structure its pages and components.
- **What it gave back:** Claude helped me establish the initial frontend structure, organize the components, and create the basic layout of the application.
- **What I kept, what I changed, and why:** I used the suggested structure as a starting point and adjusted the code to fit my system's requirements. The commit represents the resulting frontend after my initial changes and refinements rather than a separate record of every AI-generated change.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/2503b3fa1cd3a0aec3a080633816ac06b1ed3b5c

### 2026-09-21 - Frontend design and responsiveness

- **Tool:** Claude
- **What I asked for:** I asked Claude to help improve the frontend design and fix responsiveness issues across different screen sizes.
- **What it gave back:** Claude suggested changes to the styling, layout, and responsive behavior of the frontend.
- **What I kept, what I changed, and why:** I kept the changes that fit my intended design and adjusted the implementation when needed. The commit contains the resulting design improvements and responsiveness fixes, not a separate before-and-after record of each AI-assisted change.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/2503b3fa1cd3a0aec3a080633816ac06b1ed3b5c

### 2026-09-24 - Database schema review and correction

- **Tool:** Claude
- **What I asked for:** I asked Claude to review and validate my `schema.sql` and identify database fields that needed to allow missing values.
- **What it gave back:** Claude suggested adjusting the `year_to` field in `car_models` and the `kerb_weight_kg` field in `vehicles` to allow NULL values.
- **What I kept, what I changed, and why:** I applied the suggested changes because some car models and vehicle specifications may not have complete information. Allowing NULL values prevents the database from requiring information that may not be available.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/c53cbc8725997cde82834971730dc7c2a5992e64

### 2026-09-24 - Backend repository integration

- **Tool:** Claude
- **What I asked for:** I asked Claude to help integrate my newly created `carModelsRepo.js` and `fuelPricesRepo.js` into `server.js`.
- **What it gave back:** Claude provided changes to the server configuration to connect the repositories with the existing backend.
- **What I kept, what I changed, and why:** I used the suggested integration to make the car catalog and fuel price data accessible through the backend. I reviewed the changes to ensure the repositories were connected to the correct routes and database operations.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/a9ee205cc05521982753d256f944cd49f816a85e

### 2026-09-24 - TomTom API integration

- **Tool:** Claude
- **What I asked for:** I asked Claude to help create the TomTom integration because I was unfamiliar with the structure and requests required to use the TomTom API for routes and travel-time information.
- **What it gave back:** Claude helped create the initial `tomtom.js` structure for making API requests and handling route-related information.
- **What I kept, what I changed, and why:** I used the suggested implementation as the starting point for the TomTom integration. I kept the API calls on the server so that the API key would not be exposed in the frontend. I reviewed the integration based on the requirements of my routing feature.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/0ad17bf78f7bd070ea86db6bb7e75a178eec42f5

### 2026-09-24 - Connecting the backend to the frontend

- **Tool:** Claude
- **What I asked for:** I asked Claude to help connect my existing backend server to the frontend client so that the frontend could use the API instead of relying only on demo data.
- **What it gave back:** Claude provided changes to connect the frontend with the backend endpoints and integrate the existing API into the client.
- **What I kept, what I changed, and why:** I used the suggested integration as a starting point and reviewed the changes to ensure that the frontend was communicating with the correct backend endpoints. This was necessary to move my system toward using real backend data.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/93648ca5ca98be070c7090e5441bf2091367ae33

### 2026-09-25 - Vehicle and trip repository integration

- **Tool:** Claude
- **What I asked for:** I asked Claude to help integrate my existing `vehicleRepo` and `tripRepo` into `server.js` so that the backend could handle vehicle and trip operations.
- **What it gave back:** Claude suggested the required server changes to connect the repositories with the appropriate routes and database operations.
- **What I kept, what I changed, and why:** I used the integration to support saving and retrieving vehicles and trips through the backend. I reviewed the changes to ensure that the repositories were connected to the correct endpoints and that user ownership checks were maintained.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/8bb657cc2bcbfe8abe4ccb071178ac1afbbd4e63

### 2026-09-25 - User account deletion

- **Tool:** Claude
- **What I asked for:** I asked Claude to help implement the account deletion functionality in my backend.
- **What it gave back:** Claude provided an implementation for deleting a user account and handling the associated backend operation.
- **What I kept, what I changed, and why:** I used the suggested implementation as part of my account management functionality. I reviewed how the deletion operation connected to the user repository and account routes to ensure that the feature matched my system's requirements.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/1586ed2945ea87dcccf07f4f8fb366ef6cbb2b28

### 2026-09-27 - Automated fuel price update workflow

- **Tool:** Claude
- **What I asked for:** Since I could not find a live API for retrieving DOE gasoline and diesel prices, I asked Claude for an alternative way to keep my fuel price data updated.
- **What it gave back:** Claude suggested creating a scheduled script that reads a public fuel price page and uses GitHub Actions to automate the checking process.
- **What I kept, what I changed, and why:** I used the suggested approach to create a weekly fuel price checker that opens a pull request with the updated price data. I chose to review and merge the changes manually instead of automatically updating the database because the source page does not provide a published API, and I wanted to check the extracted prices before using them in my system.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/9686e04c1b70303fe058a12eb4e71693d12eeba0

## 2. Where the AI got it wrong

### Case 1 - Incorrect authentication file location

- **What it gave me:** Claude suggested placing `auth.js` inside the `server/db` directory while helping me integrate the authentication functionality.
- **What was wrong with it:** The authentication module was not located where the server expected it to be. Even after restarting the system and reinstalling the npm packages, the server continued to fail with the message `Failed running 'server.js'. Waiting for file changes before restarting...`.
- **What I did instead:** I investigated the file structure and moved `auth.js` outside the database directory into the main `server` directory. This corrected the file organization and allowed the server to reference the authentication module from the proper location.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/3f5e8e3a32dc4e6a077ef3b1932962f3ffee450d 

### Case 2 - Inconsistent naming conventions

- **What it gave me:** The initial implementation used snake_case field names from the database in parts of the frontend, while the client expected camelCase properties.
- **What was wrong with it:** The inconsistent naming caused problems when the frontend accessed data returned by the backend. Some properties did not match the names expected by the client.
- **What I did instead:** I used Claude to help create `caseconvert.js`, a utility that converts between snake_case and camelCase. This allowed the backend and frontend to use their respective naming conventions without manually changing every field.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/e65b8b036e76d55c9808ec246812f045455d8cad

### Case 3 - Vehicle page not refreshing correctly

- **What it gave me:** Claude initially provided changes to help fix the vehicle page, which was taking too long to reload or was not displaying updated information correctly.
- **What was wrong with it:** The initial behavior was not resolving the problem with refreshing the vehicle data. I needed to investigate how the client and server were handling the vehicle information and database operations.
- **What I did instead:** I asked Claude to analyze and update the relevant client and server files. I used the suggested changes to improve request validation and the handling of vehicle-related requests, then reviewed the implementation to address the problem.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/c3893bd1129cd7234214d5635032cdd2c77a17ea

### Case 4 - Incorrect date extraction in the fuel price checker

- **What it gave me:** Claude helped create the fuel price checker, which initially attempted to extract a date in the format `Updated: YYYY-MM-DD` from the source page.
- **What was wrong with it:** The actual page did not contain the date in the expected format. When I ran `node scripts/update-fuel-prices.mjs`, the script failed with the message `could not find an "Updated: YYYY-MM-DD" date on the page`.
- **What I did instead:** I changed the implementation to use the date when the scheduled check runs instead of trying to extract a date from the page. This removed the dependency on the source page having a specific date format.
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/be23eea3304070ab148c44eff48b2b18eb52c9f9

## 3. Who wrote what

The following section documents the parts of the project I implemented myself. I used AI as a coding assistant for selected tasks, but I also worked directly on the database structure, repositories, API integration, and other backend functionality.

### Written by me

#### 1. Database schema

- **File:** `server/db/schema.sql`
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/90cf42d5108c1eff5bc4b3bd2d176fd160e5140c
- **What it does and why it is built this way:** I created the database schema for the main entities of my system, including users, car models, vehicles, fuel prices, and trips. I organized the tables and their relationships so that the database could store the information needed by the different features of my application.

#### 2. Database seed data

- **File:** `server/db/seed.sql`
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/34f8d42cdef22ca0fc55c0deea4cb3764718d098
- **What it does and why it is built this way:** I converted the initial seed data from JSON into SQL so that I could populate my PostgreSQL database with the initial records needed by the application.

#### 3. Car models and fuel prices repositories

- **Files:** `server/db/carModelsRepo.js` and `server/db/fuelPricesRepo.js`
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/a9ee205cc05521982753d256f944cd49f816a85e
- **What it does and why it is built this way:** I created the repositories for retrieving car model information and fuel prices from the database. Separating these operations into repository files makes it easier to organize the database queries and connect them to the API routes.

#### 4. Philippine place search

- **File:** `server/nominatim.js`
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/c2ce2cb868c203c8f5e23cabaa6472f8f83febc6
- **What it does and why it is built this way:** I implemented the Nominatim integration for searching places in the Philippines. This supports the location-search feature of my system and allows the server to handle requests to the external service.

#### 5. User repository

- **File:** `server/db/usersRepo.js`
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/44de3bc71eb7a7e00ab0cd6365c515d9974e62bd
- **What it does and why it is built this way:** I created the user repository to handle user-related database operations. It provides a separate place for the queries needed by the authentication and account management features.

#### 6. Authentication implementation

- **File:** `server/auth.js`
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/1dbdcca3fd5e63ef8c29748386a8453bb293b5ea
- **What it does and why it is built this way:** I worked on the authentication helpers and JWT middleware to support authenticated requests. This allows the backend to identify users and protect routes that require authentication.

#### 7. Vehicle repository

- **File:** `server/db/vehiclesRepo.js`
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/79765a1343c4f99fcd21fdcb0573ecf60d7a93f9
- **What it does and why it is built this way:** I implemented the vehicle repository for saving and retrieving users' vehicles. I included ownership checks so that vehicle records are associated with the correct user and cannot be accessed through another user's account.

#### 8. Trip repository

- **File:** `server/db/tripsRepo.js`
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/fcea70cae83735895523d14d55e62fba83ee106e
- **What it does and why it is built this way:** I created the trip repository to handle saving and retrieving users' trips. This allows the application to maintain trip records and use them to display information on the Trips page.

#### 9. Expanded car catalog

- **File:** `server/db/seed.sql`
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/30702fae4f5694d59c4ee1231911c6c06865b80c
- **What it does and why it is built this way:** I expanded the initial car catalog from 9 to 66 entries and updated both the SQL seed data and the mock client data. I did this to provide more vehicle options for users when adding their vehicles.

### The AI-written part I understand best

#### TomTom route integration

- **File:** `server/tomtom.js`
- **Commit:** https://github.com/Kimch-i/Go-And-Save/commit/0ad17bf78f7bd070ea86db6bb7e75a178eec42f5
- **What it does and why we kept it:** Claude helped me create the initial structure for communicating with the TomTom API. I understand that the server sends the routing request to TomTom, processes the response, and returns the necessary route information to the frontend. I kept this approach because it allows the application to retrieve route and travel-time information without exposing the API key in the client.

#### Frontend and backend integration

- **File:** `server.js` and the relevant client API files
- **Commit:** [Integrate frontend and backend](https://github.com/Kimch-i/Go-And-Save/commit/93648ca5ca98be070c7090e5441bf2091367ae33)
- **What it does and why we kept it:** This integration allows the frontend to communicate with the Express backend through HTTP requests. The server processes the requests, interacts with the database when needed, and sends responses back to the frontend. I understand that the frontend is responsible for displaying the data, while the backend handles the API logic and database operations. We kept this approach because it allows the system to use actual stored data instead of relying only on demo data.

#### Automated fuel price workflow

- **File:** `scripts/update-fuel-prices.mjs`, `.github/workflows/update-fuel-prices.yml`
- **Commit:** [Automate weekly fuel price updates](https://github.com/Kimch-i/Go-And-Save/commit/9686e04c1b70303fe058a12eb4e71693d12eeba0)
- **What it does and why we kept it:** The script handles the fuel price update process, while the GitHub Actions workflow automates its scheduled execution. I understand that the workflow can prepare updates and open a pull request for review. We kept the manual review step because fuel price information must be checked before it becomes part of the application's data.

#### Vehicle and trip repository integration

- **File:** `server.js`, `server/db/vehiclesRepo.js`, `server/db/tripsRepo.js`
- **Commit:** [Integrate vehicle and trip repositories](https://github.com/Kimch-i/Go-And-Save/commit/8bb657cc2bcbfe8abe4ccb071178ac1afbbd4e63)
- **What it does and why we kept it:** This implementation connects the vehicle and trip repository functions to the backend routes. I understand that the routes receive requests, validate the required information, call the appropriate repository functions, and return a response. We kept this approach because it separates the API logic from the SQL queries and helps make the backend easier to maintain.
