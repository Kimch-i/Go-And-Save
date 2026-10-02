import { Link } from 'react-router';
import Button from '../../atoms/Button/Button.jsx';
import { formatPeso } from '../../../lib/format.js';
import { plannerLinkForTrip } from '../../../lib/tripLink.js';
import styles from './TripRow.module.css';

export default function TripRow({ trip, routeText, vehicleName, onRemove }) {
  return (
    <tr className={styles.row}>
      <td><Link to={plannerLinkForTrip(trip)}>{routeText}</Link></td>
      <td className="muted">{vehicleName}</td>
      <td className={`${styles.money} num muted`}>{trip.distanceKm} km</td>
      <td className={`${styles.money} num muted`}>{formatPeso(trip.idealCost)}</td>
      <td className={`${styles.money} num`}>{formatPeso(trip.actualCost)}</td>
      <td className={styles.remove}>
        <Button variant="link" onClick={() => onRemove(trip.id)} aria-label={`Remove trip ${routeText}`}>
          Remove
        </Button>
      </td>
    </tr>
  );
}
