import TripRow from '../../molecules/TripRow/TripRow.jsx';
import TripCard from '../../molecules/TripCard/TripCard.jsx';
import { shortPlace } from '../../../lib/format.js';
import styles from './TripTable.module.css';

function routeText(trip) {
  const arrow = trip.roundTrip ? ' ⇄ ' : ' → ';
  return shortPlace(trip.originLabel) + arrow + shortPlace(trip.destLabel);
}

export default function TripTable({ trips, vehicles }) {
  function vehicleName(id) {
    const vehicle = vehicles.find((v) => v.id === id);
    return vehicle ? vehicle.nickname : 'Removed vehicle';
  }

  return (
    <>
      <table className={styles.table}>
        <caption className="sr-only">Saved trips, newest first. Select a route to open it in the planner.</caption>
        <thead>
          <tr>
            <th scope="col">Route</th>
            <th scope="col">Vehicle</th>
            <th scope="col" className={styles.money}>Distance</th>
            <th scope="col" className={styles.money}>Clear road</th>
            <th scope="col" className={styles.money}>Actual</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => (
            <TripRow key={trip.id} trip={trip} routeText={routeText(trip)} vehicleName={vehicleName(trip.vehicleId)} />
          ))}
        </tbody>
      </table>

      <ul className={styles.cards}>
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} routeText={routeText(trip)} vehicleName={vehicleName(trip.vehicleId)} />
        ))}
      </ul>
    </>
  );
}
