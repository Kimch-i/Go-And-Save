import { useState } from 'react';
import Stepper from '../../atoms/Stepper/Stepper.jsx';
import { loadedKmpl } from '../../../lib/estimate.js';
import styles from './LoadPanel.module.css';

// Passengers and cargo steppers, and what the load does to km/L.
export default function LoadPanel({ load, onChange, baseKmpl }) {
  const [open, setOpen] = useState(load.passengers > 1 || load.cargoKg > 0);

  return (
    <details className={styles.panel} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className={styles.summary}>Passengers and cargo</summary>

      <div className={styles.grid}>
        <Stepper
          label="Passengers"
          id="passengers"
          value={load.passengers}
          min={1}
          max={8}
          onChange={(passengers) => onChange({ ...load, passengers })}
          decreaseLabel="Fewer passengers"
          increaseLabel="More passengers"
        />
        <Stepper
          label="Cargo in kg"
          id="cargo"
          value={load.cargoKg}
          min={0}
          max={300}
          step={10}
          onChange={(cargoKg) => onChange({ ...load, cargoKg })}
          decreaseLabel="Less cargo"
          increaseLabel="More cargo"
        />
      </div>

      {baseKmpl && (
        <p className={`${styles.note} small muted num`}>
          {baseKmpl.toFixed(1)} km/L becomes {loadedKmpl(baseKmpl, load.passengers, load.cargoKg).toFixed(1)} carrying this load.
        </p>
      )}
    </details>
  );
}
