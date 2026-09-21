import Tag from '../../atoms/Tag/Tag.jsx';
import { formatPeso, formatWeek } from '../../../lib/format.js';
import styles from './PriceFootnote.module.css';

export default function PriceFootnote({ distance, roundTrip, price, fuelType, extraKg }) {
  return (
    <p className={`${styles.footnote} num`}>
      {distance.toFixed(1)} km{roundTrip ? ' there and back' : ''} at{' '}
      <Tag variant="good">{formatPeso(price.pricePerLiter)}</Tag> a litre for {fuelType},
      DOE week of {formatWeek(price.weekOf)}.
      {extraKg > 0 && ` Includes ${extraKg} kg of load.`} Load and idling figures are estimates.
    </p>
  );
}
