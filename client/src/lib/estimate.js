// The two peso figures: cost if the road were clear, and cost leaving now in traffic.

export const KG_PER_PASSENGER = 65;

export function loadedKmpl(kmpl, passengers, cargoKg) {
  // load penalty: about 1% km/L lost per 45 kg over the driver
  const extraKg = (passengers - 1) * KG_PER_PASSENGER + cargoKg;
  return kmpl * (1 - (extraKg / 45) * 0.01);
}

export function estimate({ km, freeMin, trafficMin, kmpl, idleLph,
                           passengers, cargoKg, price, roundTrip }) {
  const mult = roundTrip ? 2 : 1;

  const extraKg = (passengers - 1) * KG_PER_PASSENGER + cargoKg;
  const effectiveKmpl = loadedKmpl(kmpl, passengers, cargoKg);

  const distance = km * mult;
  const idealLiters = distance / effectiveKmpl;

  // traffic penalty: same distance, the extra minutes are spent idling
  const delayMin = Math.max(0, trafficMin - freeMin) * mult;
  const actualLiters = idealLiters + idleLph * (delayMin / 60);

  return {
    distance,
    effectiveKmpl,
    extraKg,
    freeMin: freeMin * mult,
    trafficMin: trafficMin * mult,
    delayMin,
    idealLiters,
    actualLiters,
    idealCost: idealLiters * price,
    actualCost: actualLiters * price,
  };
}
