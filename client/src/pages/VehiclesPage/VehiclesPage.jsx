import Button from '../../components/atoms/Button/Button.jsx';
import Spinner from '../../components/atoms/Spinner/Spinner.jsx';
import VehicleList from '../../components/organisms/VehicleList/VehicleList.jsx';
import * as storage from '../../services/storage.js';
import styles from './VehiclesPage.module.css';

export default function VehiclesPage({ vehicles, vehiclesLoading, onRemoveVehicle }) {
  const defaultVehicleId = storage.getPrefs().defaultVehicleId;
  const hasVehicles = !vehiclesLoading && vehicles.length > 0;

  return (
    <>
      <div className={styles.headRow}>
        <h1>Your vehicles</h1>
        {hasVehicles && (
          <Button variant="ghost" to="/vehicles/add" className={styles.addTop}>Add a vehicle</Button>
        )}
      </div>

      {vehiclesLoading ? (
        <p className="small muted"><Spinner /> Loading your vehicles…</p>
      ) : (
        <VehicleList vehicles={vehicles} defaultVehicleId={defaultVehicleId} onRemove={onRemoveVehicle} />
      )}

      {hasVehicles && (
        <div className={styles.addBelow}>
          <Button to="/vehicles/add">Add a vehicle</Button>
        </div>
      )}
    </>
  );
}
