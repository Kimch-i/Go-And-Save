import { Link } from 'react-router';
import { formatPeso } from '../../../lib/format.js';
import { plannerLinkForTrip } from '../../../lib/tripLink.js';
import styles from './TripRow.module.css';

export default function TripRow({ trip, routeText, vehicleName }) {
  return (
    <tr className={styles.row}>
      <td><Link to={plannerLinkForTrip(trip)}>{routeText}</Link></td>
      <td className="muted">{vehicleName}</td>
      <td className={`${styles.money} num muted`}>{trip.distanceKm} km</td>
      <td className={`${styles.money} num muted`}>{formatPeso(trip.idealCost)}</td>
      <td className={`${styles.money} num`}>{formatPeso(trip.actualCost)}</td>
    </tr>
  );
}
