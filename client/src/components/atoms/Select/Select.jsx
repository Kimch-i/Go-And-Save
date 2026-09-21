import styles from './Select.module.css';

export default function Select({ label, id, value, onChange, disabled, hint, children }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <select
        id={id}
        className={styles.select}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}
