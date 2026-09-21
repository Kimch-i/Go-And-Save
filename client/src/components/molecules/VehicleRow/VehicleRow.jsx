import Button from '../../atoms/Button/Button.jsx';
import Tag from '../../atoms/Tag/Tag.jsx';
import { capitalize } from '../../../lib/format.js';
import styles from './VehicleRow.module.css';

export default function VehicleRow({ vehicle, isDefault, onRemove }) {
  const weight = vehicle.kerbWeightKg
    ? `, ${vehicle.kerbWeightKg.toLocaleString('en-PH')} kg`
    : ', added by hand';

  return (
    <li className={styles.row}>
      <div>
        <p>
          {vehicle.nickname} {isDefault && <Tag>Default</Tag>}
        </p>
        <p className={`${styles.sub} num`}>
          {capitalize(vehicle.fuelType)}, {vehicle.kmPerLiter} km/L in town{weight}
        </p>
      </div>
      <div className={styles.end}>
        <Button variant="link" onClick={() => onRemove(vehicle.id)} aria-label={`Remove ${vehicle.nickname}`}>
          Remove
        </Button>
      </div>
    </li>
  );
}
