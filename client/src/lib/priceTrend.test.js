import { describe, it, expect } from 'vitest';
import { priceTrend, priceHistory, latestPrice } from './priceTrend.js';

function rows(values) {
  return values.map((pricePerLiter, i) => ({
    id: i,
    fuelType: 'gasoline',
    pricePerLiter,
    weekOf: `2026-07-${String(i + 1).padStart(2, '0')}`,
  }));
}

describe('priceTrend', () => {
  it('says up when the last four weeks average more than the four before', () => {
    const t = priceTrend(rows([60, 60, 60, 60, 61, 61, 61, 61]));
    expect(t.reading).toBe('up');
    expect(t.change).toBeCloseTo(1, 5);
  });

  it('says down when prices are falling', () => {
    expect(priceTrend(rows([62, 62, 62, 62, 61, 61, 61, 61])).reading).toBe('down');
  });

  it('says flat when the move is under 30 centavos', () => {
    expect(priceTrend(rows([60, 60, 60, 60, 60.2, 60.2, 60.2, 60.2])).reading).toBe('flat');
  });

  it('reports this week and the change from last week', () => {
    const t = priceTrend(rows([60, 60, 60, 60, 60, 60, 63.2, 64]));
    expect(t.now).toBe(64);
    expect(t.weekChange).toBeCloseTo(0.8, 5);
  });
});

describe('priceHistory and latestPrice', () => {
  const mixed = [
    { id: 1, fuelType: 'diesel',   pricePerLiter: 59.4, weekOf: '2026-08-24' },
    { id: 2, fuelType: 'gasoline', pricePerLiter: 64.0, weekOf: '2026-08-24' },
    { id: 3, fuelType: 'gasoline', pricePerLiter: 63.2, weekOf: '2026-08-17' },
  ];

  it('keeps one fuel, oldest first', () => {
    expect(priceHistory(mixed, 'gasoline').map((r) => r.id)).toEqual([3, 2]);
  });

  it('returns the newest row, or null while prices are loading', () => {
    expect(latestPrice(mixed, 'gasoline').pricePerLiter).toBe(64);
    expect(latestPrice([], 'gasoline')).toBe(null);
  });
});
