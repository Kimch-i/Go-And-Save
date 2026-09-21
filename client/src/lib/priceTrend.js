// Fill up now or wait: compares the last four weeks of prices with the four before.
export const TREND_THRESHOLD = 0.30;

function average(numbers) {
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

export function priceHistory(fuelPrices, fuelType) {
  return fuelPrices
    .filter((row) => row.fuelType === fuelType)
    .sort((a, b) => a.weekOf.localeCompare(b.weekOf));
}

export function latestPrice(fuelPrices, fuelType) {
  const history = priceHistory(fuelPrices, fuelType);
  return history.length ? history[history.length - 1] : null;
}

export function priceTrend(history) {
  const values = history.map((row) => row.pricePerLiter);
  const now = values[values.length - 1];
  const lastWeek = values[values.length - 2];

  const recentAverage = average(values.slice(-4));       // the last four weeks
  const previousAverage = average(values.slice(-8, -4)); // the four before that
  const change = recentAverage - previousAverage;

  let reading = 'flat';
  if (change > TREND_THRESHOLD) reading = 'up';
  if (change < -TREND_THRESHOLD) reading = 'down';

  return { now, weekChange: now - lastWeek, change, reading };
}
