import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import CarCatalogSearch from '../../components/organisms/CarCatalogSearch/CarCatalogSearch.jsx';
import ManualVehicleForm from '../../components/molecules/ManualVehicleForm/ManualVehicleForm.jsx';
import styles from './AddVehiclePage.module.css';

// Add a car from the catalog or by hand, then go back to where the user came from.
export default function AddVehiclePage({ onAddVehicle }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [manualName, setManualName] = useState(null);
  const [error, setError] = useState('');

  const cameFromPlanner = params.get('from') === 'planner';
  const returnTo = cameFromPlanner ? '/' : '/vehicles';

  async function save(input) {
    setError('');
    try {
      await onAddVehicle(input);
      navigate(returnTo);
    } catch (err) {
      setError(`The vehicle was not saved. ${err.message}`);
    }
  }

  return (
    <div className={styles.page}>
      <Link to={returnTo} className="small">
        {cameFromPlanner ? 'Back to the planner' : 'Back to your vehicles'}
      </Link>
      <h1 className={styles.title}>Find your car</h1>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <CarCatalogSearch
        onPick={(car) => save({
          carModelId: car.id,
          nickname: `${car.make} ${car.model}`,
          // A guest's car is stored in the browser, so it needs the specs too.
          // The server ignores these and copies them from the catalog itself.
          fuelType: car.fuelType,
          kmPerLiter: car.kmPerLiterCity,
          idleRateLph: car.idleRateLph,
          kerbWeightKg: car.kerbWeightKg,
        })}
        onAddManually={setManualName}
      />

      {manualName !== null && <ManualVehicleForm key={manualName} initialName={manualName} onSave={save} />}
    </div>
  );
}
