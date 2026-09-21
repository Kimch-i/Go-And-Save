// Porac to Angeles City in a 15 km/L Vios, gasoline at ₱64.00, 24 min clear vs 42 min now.

import { describe, it, expect } from 'vitest';
import { estimate, loadedKmpl } from './estimate.js';

const poracToAngeles = {
  km: 16.2,
  freeMin: 24,
  trafficMin: 42,
  kmpl: 15,
  idleLph: 0.7,
  passengers: 1,
  cargoKg: 0,
  price: 64,
  roundTrip: false,
};

describe('estimate', () => {
  it('works out the clear-road cost from distance and km/L', () => {
    const e = estimate(poracToAngeles);
    expect(e.idealLiters).toBeCloseTo(1.08, 2);    // 16.2 / 15
    expect(e.idealCost).toBeCloseTo(69.12, 2);     // 1.08 × 64
  });

  it('adds idle fuel for the traffic delay, not extra distance', () => {
    const e = estimate(poracToAngeles);
    expect(e.distance).toBe(16.2);                 // traffic does not add km
    expect(e.delayMin).toBe(18);                   // 42 − 24
    expect(e.actualLiters).toBeCloseTo(1.29, 2);   // 1.08 + 0.7 × 18/60
    expect(e.actualCost).toBeCloseTo(82.56, 2);
  });

  it('doubles distance, time and cost for a round trip', () => {
    const one = estimate(poracToAngeles);
    const both = estimate({ ...poracToAngeles, roundTrip: true });
    expect(both.distance).toBeCloseTo(32.4, 5);
    expect(both.delayMin).toBe(36);
    expect(both.idealCost).toBeCloseTo(one.idealCost * 2, 5);
    expect(both.actualCost).toBeCloseTo(one.actualCost * 2, 5);
  });

  it('gives the same figure twice when there is no delay', () => {
    const e = estimate({ ...poracToAngeles, trafficMin: 24 });
    expect(e.delayMin).toBe(0);
    expect(e.actualCost).toBeCloseTo(e.idealCost, 5);
  });

  it('never counts a negative delay when traffic beats the free-flow time', () => {
    const e = estimate({ ...poracToAngeles, trafficMin: 20 });
    expect(e.delayMin).toBe(0);
    expect(e.actualLiters).toBeCloseTo(e.idealLiters, 5);
  });

  it('costs more with a full car than with the driver alone', () => {
    const alone = estimate(poracToAngeles);
    const family = estimate({ ...poracToAngeles, passengers: 5 });
    expect(family.extraKg).toBe(260);              // 4 × 65
    expect(family.idealCost).toBeGreaterThan(alone.idealCost);
  });
});

describe('loadedKmpl', () => {
  it('takes about 1% off per 45 kg of extra weight', () => {
    expect(loadedKmpl(15, 1, 45)).toBeCloseTo(14.85, 5);
  });

  it('does not count the driver as extra weight', () => {
    expect(loadedKmpl(15, 1, 0)).toBe(15);
  });
});
