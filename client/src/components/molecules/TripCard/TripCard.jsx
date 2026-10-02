import { Link } from 'react-router';
import Button from '../../atoms/Button/Button.jsx';
import { formatPeso } from '../../../lib/format.js';
import { plannerLinkForTrip } from '../../../lib/tripLink.js';
import styles from './TripCard.module.css';

export default function TripCard({ trip, routeText, vehicleName, onRemove }) {
  return (
    <li className={styles.card}>
      <Link to={plannerLinkForTrip(trip)}>{routeText}</Link>
      <p className={styles.line}>
        <span>{vehicleName}, {trip.distanceKm} km</span>
      </p>
      <p className={styles.line}>
        <span>Clear road</span>
        <b className="num">{formatPeso(trip.idealCost)}</b>
      </p>
      <p className={styles.line}>
        <span>Actual</span>
        <b className="num">{formatPeso(trip.actualCost)}</b>
      </p>
      <p className={styles.end}>
        <Button variant="link" onClick={() => onRemove(trip)} aria-label={`Remove trip ${routeText}`}>
          Remove
        </Button>
      </p>
    </li>
  );
}
