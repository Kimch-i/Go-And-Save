import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import TripTable from '../../components/organisms/TripTable/TripTable.jsx';
import TripBarChart from '../../components/organisms/TripBarChart/TripBarChart.jsx';
import EmptyState from '../../components/molecules/EmptyState/EmptyState.jsx';
import Spinner from '../../components/atoms/Spinner/Spinner.jsx';
import { listTrips } from '../../api/index.js';
import { formatPesoRounded, formatWeek } from '../../lib/format.js';
import styles from './TripsPage.module.css';

function isThisMonth(isoDate) {
  const date = new Date(isoDate);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

// One row per calendar day a trip was saved, most recent last, capped to the
// most recent 10 days so the chart stays readable once trips add up.
function groupByDay(trips) {
  const byDay = new Map();
  for (const trip of trips) {
    const day = trip.createdAt.slice(0, 10);
    const entry = byDay.get(day) ?? { day, cost: 0, km: 0 };
    entry.cost += trip.actualCost;
    entry.km += trip.distanceKm;
    byDay.set(day, entry);
  }
  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)).slice(-10);
}

// Saved trips, this month's totals, and how much was lost to traffic.
export default function TripsPage({ vehicles, session, onRemoveTrip }) {
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listTrips()
      .then(setTrips)
      .catch((err) => setError(err.message));
  }, []);

  // Removing a trip here, not inside TripTable, so the charts above (which
  // are derived from this same trips state) update right along with the list.
  async function handleRemove(id) {
    if (!window.confirm('Remove this trip? This cannot be undone.')) return;
    await onRemoveTrip(id);
    setTrips((current) => current.filter((trip) => trip.id !== id));
  }

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
  const distance = thisMonth.reduce((sum, trip) => sum + trip.distanceKm, 0);
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  const byDay = groupByDay(trips);
  const costSeries = byDay.map((row) => ({ label: formatWeek(row.day), value: row.cost }));
  const kmSeries = byDay.map((row) => ({ label: formatWeek(row.day), value: row.km }));

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
        <div>
          <p className="small muted">Distance in {monthName}</p>
          <p className={`${styles.value} num`}>{Math.round(distance).toLocaleString('en-PH')} km</p>
        </div>
      </div>

      {byDay.length >= 2 && (
        <div className={styles.charts}>
          <div>
            <p className="small muted">Fuel spend by day</p>
            <TripBarChart
              data={costSeries}
              valueFormatter={formatPesoRounded}
              ariaLabel={`Fuel spend per day over the last ${byDay.length} days with a saved trip, in pesos`}
            />
          </div>
          <div>
            <p className="small muted">Distance driven by day</p>
            <TripBarChart
              data={kmSeries}
              color="var(--text-muted)"
              valueFormatter={(km) => `${Math.round(km)} km`}
              ariaLabel={`Distance driven per day over the last ${byDay.length} days with a saved trip, in kilometres`}
            />
          </div>
        </div>
      )}

      <TripTable trips={trips} vehicles={vehicles} onRemove={handleRemove} />

      {!session && (
        <p className={`${styles.guestNote} small muted`}>
          These trips are saved on this device. <Link to="/auth?tab=signup">Sign up</Link> to keep them on your account.
        </p>
      )}
    </>
  );
}
