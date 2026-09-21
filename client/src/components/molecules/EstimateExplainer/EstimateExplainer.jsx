import styles from './EstimateExplainer.module.css';

export default function EstimateExplainer() {
  return (
    <details className={styles.explainer}>
      <summary>How we work this out</summary>
      <p>
        Clear road is the distance divided by your car's km/L. Each passenger after the driver
        counts as 65 kg, and every 45 kg of extra weight takes about 1% off your km/L.
      </p>
      <p>
        Leaving now adds the fuel your engine burns while stuck. We take the extra minutes live
        traffic adds and multiply by your car's idle rate, 0.2 to 1.0 litres an hour depending on
        engine size. Traffic changes the time, not the distance.
      </p>
      <p>Both are rules of thumb, not measurements, so treat the figures as a guide.</p>
    </details>
  );
}
