import LocationSearch from '../../molecules/LocationSearch/LocationSearch.jsx';
import VehicleSelect from '../../molecules/VehicleSelect/VehicleSelect.jsx';
import LoadPanel from '../../molecules/LoadPanel/LoadPanel.jsx';
import Checkbox from '../../atoms/Checkbox/Checkbox.jsx';
import Button from '../../atoms/Button/Button.jsx';
import styles from './TripForm.module.css';

// The planner form. Holds no state; everything comes from TripPlannerPage.
export default function TripForm({
  origin, destination, onOriginSelect, onOriginClear, onDestinationSelect, onDestinationClear,
  vehicles, vehiclesLoading, vehicleId, onVehicleChange, baseKmpl,
  load, onLoadChange, roundTrip, onRoundTripChange,
  onEstimate, busy,
}) {
  return (
    <section className={styles.form} aria-labelledby="planner-title">
      <h1 id="planner-title">Plan a trip</h1>

      <LocationSearch
        label="Starting from"
        id="origin"
        place={origin}
        placeholder="Where are you leaving from?"
        onSelect={onOriginSelect}
        onClear={onOriginClear}
      />

      <LocationSearch
        label="Going to"
        id="destination"
        place={destination}
        placeholder="Where are you going?"
        onSelect={onDestinationSelect}
        onClear={onDestinationClear}
      />

      <VehicleSelect vehicles={vehicles} loading={vehiclesLoading} value={vehicleId ?? ''} onChange={onVehicleChange} />

      <LoadPanel load={load} onChange={onLoadChange} baseKmpl={baseKmpl} />

      <div className={styles.roundTrip}>
        <Checkbox label="Coming back too" id="round-trip" checked={roundTrip} onChange={onRoundTripChange} />
      </div>

      <Button onClick={onEstimate} disabled={busy}>
        {busy ? 'Estimating…' : 'Estimate cost'}
      </Button>
    </section>
  );
}
