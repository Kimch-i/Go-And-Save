import styles from './PillToggle.module.css';

export default function PillToggle({ label, options, value, onChange }) {
  return (
    <div className={styles.row} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.pill}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
