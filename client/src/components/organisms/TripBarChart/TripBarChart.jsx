import { useEffect, useRef, useState } from 'react';
import styles from './TripBarChart.module.css';

const HEIGHT = 184;

// One trip total per bar, as a plain SVG bar chart -- same no-library
// approach as PriceChart. Used for both the cost-per-day and the
// distance-per-day view on the Trips page.
export default function TripBarChart({ data, color = 'var(--brand-fill)', valueFormatter, ariaLabel }) {
  const boxRef = useRef(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, []);

  const values = data.map((row) => row.value);
  const max = Math.max(...values, 1) * 1.15; // headroom so the tallest bar isn't flush with the top

  const left = 34;
  const right = width - 12;
  const top = 20;
  const bottom = 152;
  const plotWidth = right - left;
  const slot = plotWidth / values.length;
  const barWidth = Math.min(40, slot * 0.55);

  const barX = (i) => left + i * slot + (slot - barWidth) / 2;
  const barY = (value) => bottom - (value / max) * (bottom - top);
  const barHeight = (value) => bottom - barY(value);

  const showEveryLabel = data.length <= 7;

  return (
    <div className={styles.box}>
      <div ref={boxRef}>
        <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={ariaLabel}>
          <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="var(--line-soft)" strokeWidth="1" />
          {data.map((row, i) => (
            <rect
              key={row.label + i}
              x={barX(i)}
              y={barY(row.value)}
              width={barWidth}
              height={Math.max(barHeight(row.value), 1)}
              rx="3"
              fill={color}
            />
          ))}
          {data.map((row, i) => {
            if (!showEveryLabel && i !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={`label-${row.label}-${i}`}
                x={barX(i) + barWidth / 2}
                y="180"
                textAnchor="middle"
                className={styles.axis}
              >
                {row.label}
              </text>
            );
          })}
          {values.length > 0 && (
            <text x={barX(values.indexOf(Math.max(...values))) + barWidth / 2} y={barY(Math.max(...values)) - 6} textAnchor="middle" className={styles.valueLabel}>
              {valueFormatter(Math.max(...values))}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}
