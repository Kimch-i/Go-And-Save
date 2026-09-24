-- Sample data for the car catalog and fuel prices.

TRUNCATE TABLE car_models, fuel_prices RESTART IDENTITY CASCADE;

-- Car models available in the car catalog.
INSERT INTO car_models
  (make, model, year_from, year_to, fuel_type, km_per_liter_city,
   km_per_liter_highway, kerb_weight_kg, idle_rate_lph)
VALUES
  ('Toyota', 'Vios', 2018, 2022, 'gasoline', 15, 19, 1075, 0.7),
  ('Toyota', 'Vios', 2023, NULL, 'gasoline', 16, 20, 1105, 0.7),
  ('Toyota', 'Vios GR-S', 2021, NULL, 'gasoline', 14, 18, 1110, 0.7),
  ('Toyota', 'Innova', 2016, NULL, 'diesel', 12.5, 15.5, 1755, 0.9),
  ('Toyota', 'Hilux', 2016, NULL, 'diesel', 11, 14, 1995, 1),
  ('Mitsubishi', 'Mirage G4', 2017, NULL, 'gasoline', 19, 23, 920, 0.5),
  ('Toyota', 'Avanza', 2019, NULL, 'gasoline', 13, 16, 1170, 0.8),
  ('Suzuki', 'Ertiga', 2019, NULL, 'gasoline', 14, 18, 1180, 0.7),
  ('Honda', 'Click 125i', 2018, NULL, 'gasoline', 45, 50, 105, 0.2);

-- Weekly fuel prices.
INSERT INTO fuel_prices
  (fuel_type, price_per_liter, week_of)
VALUES
  ('gasoline', 59.2, '2026-06-08'),
  ('diesel', 56.1, '2026-06-08'),
  ('gasoline', 59.8, '2026-06-15'),
  ('diesel', 56.4, '2026-06-15'),
  ('gasoline', 60.4, '2026-06-22'),
  ('diesel', 57, '2026-06-22'),
  ('gasoline', 60.1, '2026-06-29'),
  ('diesel', 56.6, '2026-06-29'),
  ('gasoline', 61.3, '2026-07-06'),
  ('diesel', 57.4, '2026-07-06'),
  ('gasoline', 62, '2026-07-13'),
  ('diesel', 58, '2026-07-13'),
  ('gasoline', 61.6, '2026-07-20'),
  ('diesel', 57.8, '2026-07-20'),
  ('gasoline', 62.4, '2026-07-27'),
  ('diesel', 58.3, '2026-07-27'),
  ('gasoline', 62.8, '2026-08-03'),
  ('diesel', 58.6, '2026-08-03'),
  ('gasoline', 63.1, '2026-08-10'),
  ('diesel', 58.9, '2026-08-10'),
  ('gasoline', 63.2, '2026-08-17'),
  ('diesel', 58.6, '2026-08-17'),
  ('gasoline', 64, '2026-08-24'),
  ('diesel', 59.4, '2026-08-24');
