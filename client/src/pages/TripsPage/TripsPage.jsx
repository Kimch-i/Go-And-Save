import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import TripTable from '../../components/organisms/TripTable/TripTable.jsx';
import EmptyState from '../../components/molecules/EmptyState/EmptyState.jsx';
import Spinner from '../../components/atoms/Spinner/Spinner.jsx';
import { listTrips } from '../../api/index.js';
import { formatPesoRounded } from '../../lib/format.js';
import styles from './TripsPage.module.css';

function isThisMonth(isoDate) {
  const date = new Date(isoDate);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

// Saved trips, this month's totals, and how much was lost to traffic.
export default function TripsPage({ vehicles, session }) {
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listTrips()
      .then(setTrips)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <>
        <h1>Saved trips</h1>
        <EmptyState variant="error" title="Your trips could not be loaded." message={error} />
      </>
    );
  }

  if (trips === null) {
    return (
      <>
        <h1>Saved trips</h1>
        <p className="small muted"><Spinner /> Loading your trips…</p>
      </>
    );
  }

  if (trips.length === 0) {
    return (
      <>
        <h1>Saved trips</h1>
        <EmptyState
          message="No saved trips yet. Estimate a trip and save it to track what your driving costs."
          actionLabel="Plan a trip"
          actionTo="/"
        />
      </>
    );
  }

  const thisMonth = trips.filter((trip) => isThisMonth(trip.createdAt));
  const spent = thisMonth.reduce((sum, trip) => sum + trip.actualCost, 0);
  const lost = thisMonth.reduce((sum, trip) => sum + (trip.actualCost - trip.idealCost), 0);
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <>
      <h1>Saved trips</h1>

      <div className={styles.stats}>
        <div>
          <p className="small muted">Spent in {monthName}</p>
          <p className={`${styles.value} num`}>{formatPesoRounded(spent)}</p>
        </div>
        <div>
          <p className="small muted">Trips</p>
          <p className={`${styles.value} num`}>{thisMonth.length}</p>
        </div>
        <div>
          <p className="small muted">Lost to traffic</p>
          <p className={`${styles.value} ${styles.lost} num`}>{formatPesoRounded(lost)}</p>
        </div>
      </div>

      <TripTable trips={trips} vehicles={vehicles} />

      {!session && (
        <p className={`${styles.guestNote} small muted`}>
          These trips are saved on this device. <Link to="/auth?tab=signup">Sign up</Link> to keep them on your account.
        </p>
      )}
    </>
  );
}
