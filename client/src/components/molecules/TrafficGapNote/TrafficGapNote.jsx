import { formatPeso, formatPesoRounded } from '../../../lib/format.js';
import styles from './TrafficGapNote.module.css';

// What traffic adds, per trip and per month.
export default function TrafficGapNote({ hasTraffic, extraCost, monthlyCost }) {
  if (!hasTraffic) {
    return <p>Live traffic is unavailable right now, so this is the clear-road cost only.</p>;
  }

  return (
    <p>
      Traffic adds <strong className={`${styles.extra} num`}>{formatPeso(extraCost)}</strong>.
      {monthlyCost !== null && (
        <span className={`${styles.month} num`}>
          Driven daily, about {formatPesoRounded(monthlyCost)} a month.
        </span>
      )}
    </p>
  );
}
