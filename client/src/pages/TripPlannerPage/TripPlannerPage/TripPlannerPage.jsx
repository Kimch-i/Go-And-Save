import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import TripForm from '../../components/organisms/TripForm/TripForm.jsx';
import RouteMap from '../../components/organisms/RouteMap/RouteMap.jsx';
import EstimateResult from '../../components/organisms/EstimateResult/EstimateResult.jsx';
import { getRoute, createTrip } from '../../api/index.js';
import * as storage from '../../services/storage.js';
import { latestPrice } from '../../lib/priceTrend.js';
import { estimate } from '../../lib/estimate.js';
import { placeFromParams } from '../../lib/tripLink.js';
import styles from './TripPlannerPage.module.css';

// Trip Planner: pick places, vehicle and load, fetch the route, show the two cost figures.
export default function TripPlannerPage({ vehicles, vehiclesLoading, fuelPrices, session, theme }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState(() => placeFromParams(params, 'from') || storage.getPrefs().home);
  const [destination, setDestination] = useState(() => placeFromParams(params, 'to'));
  const [vehicleId, setVehicleId] = useState(() => {
    const prefs = storage.getPrefs();
    return Number(params.get('vehicle')) || prefs.lastVehicleId || prefs.defaultVehicleId || null;
  });
  const [load, setLoad] = useState(() => ({
    passengers: Number(params.get('pax')) || 1,
    cargoKg: Number(params.get('cargo')) || 0,
  }));
  const [roundTrip, setRoundTrip] = useState(params.get('round') === '1');
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(params.get('saved') === '1');
  const [saving, setSaving] = useState(false);

  // ignores a slow answer to an older route request
  const latestRequest = useRef(0);
  const resultRef = useRef(null);
  const autoRan = useRef(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0] || null;
  const price = vehicle ? latestPrice(fuelPrices, vehicle.fuelType) : null;

  function currentEstimate() {
    if (!route || !vehicle || !price) return null;

    const freeMin = route.freeFlowSeconds / 60;
    const hasTraffic = route.trafficSeconds !== null;
    const trafficMin = hasTraffic ? route.trafficSeconds / 60 : freeMin;

    const result = estimate({
      km: route.distanceKm,
      freeMin,
      trafficMin,
      kmpl: vehicle.kmPerLiter,
      idleLph: vehicle.idleRateLph,
      passengers: load.passengers,
      cargoKg: load.cargoKg,
      price: price.pricePerLiter,
      roundTrip,
    });
    return { ...result, hasTraffic, price, fuelType: vehicle.fuelType };
  }

  // worked out every render, never stored, so it cannot go stale
  const tripEstimate = currentEstimate();

  function clearRoute() {
    latestRequest.current += 1;
    setRoute(null);
    setStatus('idle');
    setError(null);
    setSaved(false);
  }

  function showError(message, canRetry) {
    setStatus('error');
    setError({ message, canRetry });
  }

  async function runEstimate() {
    if (!origin || !destination) {
      showError('Pick both places from the suggestions first.', false);
      return;
    }
    if (!vehicle) {
      showError('Add a vehicle first so we know its fuel economy.', false);
      return;
    }

    latestRequest.current += 1;
    const requestId = latestRequest.current;
    setStatus('loading');
    setError(null);

    try {
      const result = await getRoute(origin, destination);
      if (requestId !== latestRequest.current) return;
      setRoute(result);
      setStatus('idle');

      if (window.innerWidth < 768 && resultRef.current) {
        resultRef.current.scrollIntoView({ block: 'start' });
      }
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setRoute(null);
      showError(err.message, true);
    }
  }

  function chooseVehicle(id) {
    setVehicleId(id);
    setSaved(false);
    storage.savePrefs({ lastVehicleId: id });
  }

  async function saveTrip() {
    const trip = {
      originLabel: origin.label,
      originLat: origin.lat,
      originLon: origin.lon,
      destLabel: destination.label,
      destLat: destination.lat,
      destLon: destination.lon,
      distanceKm: Math.round(tripEstimate.distance * 10) / 10,
      vehicleId: vehicle.id,
      passengers: load.passengers,
      cargoKg: load.cargoKg,
      idealLiters: tripEstimate.idealLiters,
      idealCost: tripEstimate.idealCost,
      actualLiters: tripEstimate.actualLiters,
      actualCost: tripEstimate.actualCost,
      delayMinutes: Math.round(tripEstimate.delayMin),   // the table stores whole minutes
      roundTrip,
    };

    if (!session) {
      storage.setPendingTrip(trip);
      navigate('/auth?reason=save');
      return;
    }

    setSaving(true);
    try {
      await createTrip(trip);
      navigate('/trips');
    } catch (err) {
      setSaving(false);
      showError(`The trip was not saved. ${err.message}`, false);
    }
  }

  useEffect(() => {
    if (vehiclesLoading || autoRan.current) return;
    autoRan.current = true;
    if (params.get('from') && params.get('to')) runEstimate();
  }, [vehiclesLoading]);

  return (
    <div className={styles.planner}>
      <div className={styles.rail}>
        <TripForm
          origin={origin}
          destination={destination}
          onOriginSelect={(place) => { setOrigin(place); clearRoute(); }}
          onOriginClear={() => { if (origin) { setOrigin(null); clearRoute(); } }}
          onDestinationSelect={(place) => { setDestination(place); clearRoute(); }}
          onDestinationClear={() => { if (destination) { setDestination(null); clearRoute(); } }}
          vehicles={vehicles}
          vehiclesLoading={vehiclesLoading}
          vehicleId={vehicle ? vehicle.id : null}
          onVehicleChange={chooseVehicle}
          baseKmpl={vehicle ? vehicle.kmPerLiter : null}
          load={load}
          onLoadChange={(next) => { setLoad(next); setSaved(false); }}
          roundTrip={roundTrip}
          onRoundTripChange={(checked) => { setRoundTrip(checked); setSaved(false); }}
          onEstimate={() => { setSaved(false); runEstimate(); }}
          busy={status === 'loading'}
        />
      </div>

      <section className={styles.stage} aria-label="Route and cost">
        <RouteMap origin={origin} destination={destination} route={route} theme={theme} />
        <EstimateResult
          resultRef={resultRef}
          status={status}
          error={error}
          onRetry={runEstimate}
          estimate={tripEstimate}
          roundTrip={roundTrip}
          onSave={saveTrip}
          saving={saving}
          saved={saved}
        />
      </section>
    </div>
  );
}
