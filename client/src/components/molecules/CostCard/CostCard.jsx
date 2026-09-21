import { formatPeso } from '../../../lib/format.js';
import styles from './CostCard.module.css';

// One peso figure. emphasis makes it the big filled 'Leaving now' card.
export default function CostCard({ label, amount, meta, emphasis = false }) {
  return (
    <div className={emphasis ? `${styles.card} ${styles.emphasis}` : styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={`${styles.amount} num`}>{formatPeso(amount)}</p>
      <p className={`${styles.meta} num`}>{meta}</p>
    </div>
  );
}
