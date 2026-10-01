-- Users and their account information
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Car models available in the car catalog
CREATE TABLE IF NOT EXISTS car_models (
  id                   SERIAL PRIMARY KEY,
  make                 TEXT NOT NULL,
  model                TEXT NOT NULL,
  year_from            INTEGER NOT NULL,
  year_to              INTEGER,
  fuel_type            TEXT NOT NULL CHECK (fuel_type IN ('gasoline', 'diesel')),
  km_per_liter_city    NUMERIC NOT NULL,
  km_per_liter_highway NUMERIC NOT NULL,
  kerb_weight_kg       NUMERIC NOT NULL,
  idle_rate_lph        NUMERIC NOT NULL
);

-- One row per real car (same make/model/years/fuel can't appear twice).
-- seed.sql upserts on this instead of wiping the table, so a vehicle a user
-- has already picked keeps pointing at the same row -- see seed.sql's header
-- comment for why that matters. year_to is COALESCEd to 0 because two NULLs
-- are never equal to a unique index or to ON CONFLICT -- without this, every
-- "still in production" car (year_to left blank) would insert as a fresh
-- duplicate row on every reseed instead of updating in place.
CREATE UNIQUE INDEX IF NOT EXISTS car_models_natural_key_idx
  ON car_models (make, model, year_from, COALESCE(year_to, 0), fuel_type);

-- Fuel prices by fuel type and week
CREATE TABLE IF NOT EXISTS fuel_prices (
  id              SERIAL PRIMARY KEY,
  fuel_type       TEXT NOT NULL CHECK (fuel_type IN ('gasoline', 'diesel')),
  price_per_liter NUMERIC NOT NULL,
  week_of         DATE NOT NULL
);

-- One row per fuel type per week -- same reason as car_models above.
CREATE UNIQUE INDEX IF NOT EXISTS fuel_prices_natural_key_idx
  ON fuel_prices (fuel_type, week_of);

-- Vehicles saved by users
CREATE TABLE IF NOT EXISTS vehicles (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  nickname       TEXT NOT NULL,
  car_model_id   INTEGER,
  fuel_type      TEXT NOT NULL CHECK (fuel_type IN ('gasoline', 'diesel')),
  km_per_liter   NUMERIC NOT NULL,
  idle_rate_lph  NUMERIC NOT NULL,
  kerb_weight_kg NUMERIC,
  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY (car_model_id)
    REFERENCES car_models(id)
    ON DELETE SET NULL
);

-- Saved trips and their fuel calculations
CREATE TABLE IF NOT EXISTS trips (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  origin_label   TEXT NOT NULL,
  origin_lat     NUMERIC NOT NULL,
  origin_lon     NUMERIC NOT NULL,
  dest_label     TEXT NOT NULL,
  dest_lat       NUMERIC NOT NULL,
  dest_lon       NUMERIC NOT NULL,
  distance_km    NUMERIC NOT NULL,
  vehicle_id     INTEGER,
  passengers     INTEGER NOT NULL,
  cargo_kg       NUMERIC NOT NULL,
  ideal_liters   NUMERIC NOT NULL,
  ideal_cost     NUMERIC NOT NULL,
  actual_liters  NUMERIC NOT NULL,
  actual_cost    NUMERIC NOT NULL,
  delay_minutes  INTEGER NOT NULL,
  round_trip     BOOLEAN NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY (vehicle_id)
    REFERENCES vehicles(id)
    ON DELETE SET NULL
);

-- Speeds up loading a user's saved trips by newest first
CREATE INDEX IF NOT EXISTS trips_user_id_created_at_idx
  ON trips (user_id, created_at DESC);

-- Speeds up loading a user's saved vehicles
CREATE INDEX IF NOT EXISTS vehicles_user_id_idx
  ON vehicles (user_id);