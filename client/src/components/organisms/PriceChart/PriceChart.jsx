import { useEffect, useRef, useState } from 'react';
import { capitalize, formatPeso, formatWeek } from '../../../lib/format.js';
import styles from './PriceChart.module.css';

const HEIGHT = 184;

// Twelve weeks of prices as a plain SVG line, no chart library.
export default function PriceChart({ history, fuelType }) {
  const boxRef = useRef(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, []);

  const values = history.map((row) => row.pricePerLiter);
  const min = Math.min(...values) - 0.8;
  const max = Math.max(...values) + 0.8;

  const left = 34;
  const right = width - 20;
  const top = 32;
  const bottom = 152;
  const x = (i) => left + i * ((right - left) / (values.length - 1));
  const y = (value) => bottom - ((value - min) / (max - min)) * (bottom - top);

  const path = values.map((value, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(value).toFixed(1)}`).join(' ');
  const last = values.length - 1;
  const now = values[last];

  return (
    <div className={styles.box}>
      <div ref={boxRef}>
        <svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={`${capitalize(fuelType)} price over ${values.length} weeks, now ${formatPeso(now)} a litre`}
        >
          <g stroke="var(--line-soft)" strokeWidth="1">
            <line x1={left} y1={top} x2={right} y2={top} />
            <line x1={left} y1={(top + bottom) / 2} x2={right} y2={(top + bottom) / 2} />
            <line x1={left} y1={bottom} x2={right} y2={bottom} />
          </g>
          <text x="0" y={top + 4} className={styles.axis}>{max.toFixed(0)}</text>
          <text x="0" y={bottom + 4} className={styles.axis}>{min.toFixed(0)}</text>
          <path d={path} fill="none" stroke="var(--brand-fill)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={x(last)} cy={y(now)} r="4.5" fill="var(--brand-fill)" />
          <text x={left} y="180" className={styles.axis}>{formatWeek(history[0].weekOf)}</text>
          <text x={right} y="180" textAnchor="end" className={styles.axis}>this week</text>
        </svg>
      </div>
    </div>
  );
}
