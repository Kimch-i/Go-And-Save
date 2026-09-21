import { useState } from 'react';
import PillToggle from '../../components/molecules/PillToggle/PillToggle.jsx';
import PriceChart from '../../components/organisms/PriceChart/PriceChart.jsx';
import Spinner from '../../components/atoms/Spinner/Spinner.jsx';
import { priceHistory, priceTrend } from '../../lib/priceTrend.js';
import { formatPeso } from '../../lib/format.js';
import styles from './PricesPage.module.css';

const FUELS = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
];

const ADVICE = {
  up: {
    title: 'Worth filling up now',
    text: (change) => `The four-week average sits ${formatPeso(change)} above the month before.`,
  },
  down: {
    title: 'You can wait',
    text: (change) => `The four-week average sits ${formatPeso(change)} below the month before.`,
  },
  flat: {
    title: 'No clear direction',
    text: () => 'Prices have moved less than 30 centavos on average.',
  },
};

// DOE prices, the 12-week chart, and whether to fill up now.
export default function PricesPage({ fuelPrices }) {
  const [fuelType, setFuelType] = useState('gasoline');
  const history = priceHistory(fuelPrices, fuelType);

  if (history.length < 8) {
    return (
      <>
        <h1>Fuel prices</h1>
        <p className="small muted"><Spinner /> Loading DOE prices…</p>
      </>
    );
  }

  const trend = priceTrend(history);
  const advice = ADVICE[trend.reading];
  const direction = trend.weekChange >= 0 ? 'up' : 'down';

  return (
    <>
      <h1>Fuel prices</h1>
      <div className={styles.pills}>
        <PillToggle label="Fuel type" options={FUELS} value={fuelType} onChange={setFuelType} />
      </div>

      <div className={styles.wrap}>
        <div className={styles.side} aria-live="polite">
          <div className={styles.now}>
            <p className="small muted">This week</p>
            <p className={`${styles.amount} num`}>{formatPeso(trend.now)}</p>
            <p className="small muted num">
              a litre, {direction} {formatPeso(Math.abs(trend.weekChange))} from last week
            </p>
          </div>

          <div className={styles.advice}>
            <p className={styles.adviceTitle}>{advice.title}</p>
            <p className="small">{advice.text(Math.abs(trend.change))}</p>
          </div>

          <p className={`${styles.note} small muted`}>Based on a four-week moving average, not a forecast.</p>
        </div>

        <div className={styles.chart}>
          <PriceChart history={history} fuelType={fuelType} />
        </div>
      </div>
    </>
  );
}
