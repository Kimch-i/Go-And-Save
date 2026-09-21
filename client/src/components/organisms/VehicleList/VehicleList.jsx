import VehicleRow from '../../molecules/VehicleRow/VehicleRow.jsx';
import EmptyState from '../../molecules/EmptyState/EmptyState.jsx';
import styles from './VehicleList.module.css';

export default function VehicleList({ vehicles, defaultVehicleId, onRemove }) {
  if (vehicles.length === 0) {
    return (
      <EmptyState
        message="No vehicles yet. Add your car so estimates use your real fuel economy."
        actionLabel="Add a vehicle"
        actionTo="/vehicles/add"
      />
    );
  }

  return (
    <ul className={styles.list}>
      {vehicles.map((vehicle) => (
        <VehicleRow
          key={vehicle.id}
          vehicle={vehicle}
          isDefault={vehicle.id === defaultVehicleId}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
