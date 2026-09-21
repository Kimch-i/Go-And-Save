import styles from './Checkbox.module.css';

export default function Checkbox({ label, id, checked, onChange }) {
  return (
    <label htmlFor={id} className={styles.check}>
      <input
        id={id}
        type="checkbox"
        className={styles.box}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
