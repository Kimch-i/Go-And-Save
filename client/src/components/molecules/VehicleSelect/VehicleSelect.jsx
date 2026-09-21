import { Link } from 'react-router';
import Select from '../../atoms/Select/Select.jsx';

export default function VehicleSelect({ vehicles, loading, value, onChange }) {
  if (loading) {
    return (
      <Select label="Vehicle" id="vehicle" value="" onChange={() => {}} disabled>
        <option value="">Loading your vehicles…</option>
      </Select>
    );
  }

  if (vehicles.length === 0) {
    return (
      <Select
        label="Vehicle"
        id="vehicle"
        value=""
        onChange={() => {}}
        disabled
        hint={<><Link to="/vehicles/add?from=planner">Add your car</Link> to use your real fuel economy.</>}
      >
        <option value="">No vehicles yet</option>
      </Select>
    );
  }

  return (
    <Select label="Vehicle" id="vehicle" value={value} onChange={(id) => onChange(Number(id))}>
      {vehicles.map((vehicle) => (
        <option key={vehicle.id} value={vehicle.id}>
          {vehicle.nickname}, {vehicle.kmPerLiter} km/L
        </option>
      ))}
    </Select>
  );
}
