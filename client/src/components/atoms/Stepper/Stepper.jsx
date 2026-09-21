import styles from './Stepper.module.css';

export default function Stepper({
  label, id, value, min, max, step = 1, onChange, decreaseLabel, increaseLabel,
}) {
  function change(by) {
    const next = Math.min(max, Math.max(min, value + by));
    onChange(next);
  }

  return (
    <div>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.stepper}>
        <button
          type="button"
          onClick={() => change(-step)}
          disabled={value <= min}
          aria-label={decreaseLabel || `Less ${label.toLowerCase()}`}
        >
          −
        </button>
        <output id={id} className="num">{value}</output>
        <button
          type="button"
          onClick={() => change(step)}
          disabled={value >= max}
          aria-label={increaseLabel || `More ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
