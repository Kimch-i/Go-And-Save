
TRUNCATE TABLE car_models, fuel_prices RESTART IDENTITY CASCADE;

-- Car models available in the car catalog.
INSERT INTO car_models
  (make, model, year_from, year_to, fuel_type, km_per_liter_city,
   km_per_liter_highway, kerb_weight_kg, idle_rate_lph)
VALUES
  -- Toyota
  ('Toyota', 'Wigo', 2018, 2022, 'gasoline', 18, 22, 885, 0.4),
  ('Toyota', 'Wigo', 2023, NULL, 'gasoline', 19, 23, 900, 0.4),
  ('Toyota', 'Vios', 2018, 2022, 'gasoline', 12.2, 19.9, 1075, 0.7),
  ('Toyota', 'Vios', 2023, NULL, 'gasoline', 16, 20, 1105, 0.7),
  ('Toyota', 'Vios GR-S', 2021, NULL, 'gasoline', 14, 18, 1110, 0.7),
  ('Toyota', 'Yaris', 2019, 2022, 'gasoline', 14, 18, 1090, 0.5),
  ('Toyota', 'Corolla Altis', 2019, 2022, 'gasoline', 14, 18, 1320, 0.6),
  ('Toyota', 'Corolla Altis', 2023, NULL, 'gasoline', 15, 19, 1340, 0.6),
  ('Toyota', 'Avanza', 2019, 2021, 'gasoline', 13, 16, 1170, 0.8),
  ('Toyota', 'Avanza', 2022, NULL, 'gasoline', 13.5, 17, 1185, 0.8),
  ('Toyota', 'Rush', 2018, 2022, 'gasoline', 12, 15, 1155, 0.7),
  ('Toyota', 'Innova', 2016, 2022, 'diesel', 12.5, 15.5, 1755, 0.9),
  ('Toyota', 'Innova', 2023, NULL, 'gasoline', 13, 16.5, 1780, 0.8),
  ('Toyota', 'Fortuner', 2016, 2020, 'diesel', 10.5, 13.5, 2110, 1.0),
  ('Toyota', 'Fortuner', 2021, NULL, 'diesel', 11, 14, 2135, 1.0),
  ('Toyota', 'Hilux', 2016, 2020, 'diesel', 11, 14, 1995, 1.0),
  ('Toyota', 'Hilux', 2021, NULL, 'diesel', 11.5, 14.5, 2005, 1.0),
  ('Toyota', 'HiAce Commuter', 2019, NULL, 'diesel', 8.5, 11, 2150, 1.2),

  -- Mitsubishi
  ('Mitsubishi', 'Mirage', 2017, 2022, 'gasoline', 18.5, 22.5, 900, 0.5),
  ('Mitsubishi', 'Mirage G4', 2017, NULL, 'gasoline', 19, 23, 920, 0.5),
  ('Mitsubishi', 'Xpander', 2018, 2022, 'gasoline', 13.5, 17, 1240, 0.7),
  ('Mitsubishi', 'Xpander', 2023, NULL, 'gasoline', 14, 17.5, 1255, 0.7),
  ('Mitsubishi', 'Montero Sport', 2016, 2019, 'diesel', 10, 13, 1955, 0.9),
  ('Mitsubishi', 'Montero Sport', 2020, NULL, 'diesel', 10.5, 13.5, 1985, 0.9),
  ('Mitsubishi', 'Strada', 2019, NULL, 'diesel', 11, 14, 1935, 1.0),

  -- Honda
  ('Honda', 'Brio', 2019, 2022, 'gasoline', 18, 22, 940, 0.4),
  ('Honda', 'Brio', 2023, NULL, 'gasoline', 18.5, 22.5, 950, 0.4),
  ('Honda', 'City', 2018, 2020, 'gasoline', 15, 19, 1090, 0.5),
  ('Honda', 'City', 2021, NULL, 'gasoline', 16, 20, 1130, 0.5),
  ('Honda', 'Civic', 2016, 2021, 'gasoline', 13.5, 17.5, 1315, 0.6),
  ('Honda', 'Civic', 2022, NULL, 'gasoline', 14, 18, 1335, 0.6),
  ('Honda', 'Mobilio', 2017, 2021, 'gasoline', 13, 16.5, 1230, 0.7),
  ('Honda', 'CR-V', 2017, 2022, 'gasoline', 11.5, 15, 1550, 0.8),
  ('Honda', 'Click 125i', 2018, NULL, 'gasoline', 45, 50, 105, 0.2),
  ('Honda', 'Beat', 2020, NULL, 'gasoline', 48, 53, 95, 0.15),
  ('Honda', 'PCX 160', 2021, NULL, 'gasoline', 40, 45, 130, 0.2),

  -- Suzuki
  ('Suzuki', 'Celerio', 2019, 2022, 'gasoline', 20, 24, 875, 0.4),
  ('Suzuki', 'Celerio', 2023, NULL, 'gasoline', 20.5, 24.5, 885, 0.4),
  ('Suzuki', 'Swift', 2019, NULL, 'gasoline', 17, 21, 970, 0.5),
  ('Suzuki', 'Dzire', 2019, NULL, 'gasoline', 18, 22, 940, 0.4),
  ('Suzuki', 'Ertiga', 2019, NULL, 'gasoline', 14, 18, 1180, 0.7),
  ('Suzuki', 'APV', 2018, NULL, 'gasoline', 10, 13, 1495, 0.8),
  ('Suzuki', 'Raider 150', 2019, NULL, 'gasoline', 35, 40, 115, 0.2),

  -- Hyundai
  ('Hyundai', 'Reina', 2018, 2022, 'gasoline', 17, 21, 985, 0.4),
  ('Hyundai', 'Accent', 2018, 2022, 'gasoline', 15.5, 19.5, 1130, 0.5),
  ('Hyundai', 'Accent', 2023, NULL, 'gasoline', 16, 20, 1150, 0.5),
  ('Hyundai', 'Tucson', 2016, 2020, 'gasoline', 11, 14.5, 1550, 0.8),

  -- Kia
  ('Kia', 'Soluto', 2019, 2022, 'gasoline', 17, 21, 1035, 0.4),
  ('Kia', 'Soluto', 2023, NULL, 'gasoline', 17.5, 21.5, 1045, 0.4),
  ('Kia', 'Rio', 2018, 2021, 'gasoline', 16, 20, 1090, 0.5),
  ('Kia', 'Seltos', 2020, NULL, 'gasoline', 12, 15.5, 1350, 0.7),

  -- Nissan
  ('Nissan', 'Almera', 2019, 2022, 'gasoline', 16, 20, 1105, 0.5),
  ('Nissan', 'Almera', 2023, NULL, 'gasoline', 16.5, 20.5, 1115, 0.5),
  ('Nissan', 'Navara', 2015, 2021, 'diesel', 10.5, 13.5, 1930, 1.0),
  ('Nissan', 'Terra', 2018, NULL, 'diesel', 10.5, 13.5, 2100, 1.0),
  ('Nissan', 'Urvan', 2019, NULL, 'diesel', 8, 10.5, 2050, 1.2),

  -- Ford
  ('Ford', 'Ranger', 2015, 2022, 'diesel', 10.5, 13.5, 2075, 1.0),
  ('Ford', 'Everest', 2016, 2021, 'diesel', 10, 13, 2340, 1.1),

  -- Isuzu
  ('Isuzu', 'D-Max', 2019, 2022, 'diesel', 11, 14, 1900, 0.9),

  -- Newer entrants
  ('Geely', 'Coolray', 2020, NULL, 'gasoline', 12.5, 16, 1345, 0.7),
  ('Geely', 'Emgrand', 2020, 2023, 'gasoline', 15, 19, 1250, 0.5),
  ('MG', 'MG5', 2021, 2023, 'gasoline', 14.5, 18.5, 1270, 0.5),
  ('MG', 'ZS', 2020, 2023, 'gasoline', 12.5, 16, 1330, 0.7),
  ('Chery', 'Tiggo 7 Pro', 2021, 2023, 'gasoline', 12, 15.5, 1430, 0.7),

  -- Yamaha motorcycles
  ('Yamaha', 'Mio Sporty', 2019, 2023, 'gasoline', 42, 47, 98, 0.15),
  ('Yamaha', 'NMAX', 2020, 2023, 'gasoline', 38, 43, 125, 0.2);

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
