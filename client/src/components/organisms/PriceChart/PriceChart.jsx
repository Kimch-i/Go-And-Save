import { useEffect, useRef, useState } from 'react';
import { capitalize, formatPeso, formatWeek } from '../../../lib/format.js';
import styles from './PriceChart.module.css';

const HEIGHT = 184;

// How many x-axis date labels fit without crowding, by chart width. Phones
// get a handful of labels (enough to place the month), wider screens get more.
function pickLabelIndices(total, width) {
  const maxLabels = width < 420 ? 3 : width < 640 ? 5 : width < 900 ? 7 : 9;
  if (total <= maxLabels) return [...Array(total).keys()];

  const step = (total - 1) / (maxLabels - 1);
  const indices = new Set();
  for (let i = 0; i < maxLabels; i++) indices.add(Math.round(i * step));
  return [...indices].sort((a, b) => a - b);
}

// Twelve weeks of prices as a plain SVG line, no chart library.
export default function PriceChart({ history, fuelType }) {
  const boxRef = useRef(null);
  const svgRef = useRef(null);
  const [width, setWidth] = useState(600);
  const [hoverIndex, setHoverIndex] = useState(null);

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

  // Mouse, pen or finger: find whichever week sits closest to the pointer's
  // x position, so hovering (or dragging a finger across, on a phone) always
  // lands on a real data point instead of needing to hit it exactly.
  function pointToIndex(clientX) {
    const rect = svgRef.current.getBoundingClientRect();
    const localX = ((clientX - rect.left) / rect.width) * width;
    const step = (right - left) / (values.length - 1);
    return Math.min(values.length - 1, Math.max(0, Math.round((localX - left) / step)));
  }

  function handlePointerMove(event) {
    setHoverIndex(pointToIndex(event.clientX));
  }

  const labelIndices = pickLabelIndices(values.length, width);

  const activeIndex = hoverIndex ?? last;
  const activeValue = values[activeIndex];
  const activeX = x(activeIndex);
  const activeY = y(activeValue);

  // Tooltip box: centered over the point, nudged inward so it never runs
  // past the chart's edges, and flipped below the point if there is not
  // enough room above it.
  const tooltipWidth = 92;
  const tooltipHeight = 36;
  const tooltipX = Math.min(Math.max(activeX - tooltipWidth / 2, left), right - tooltipWidth);
  const tooltipAbove = activeY - tooltipHeight - 10 >= top - 6;
  const tooltipY = tooltipAbove ? activeY - tooltipHeight - 10 : activeY + 10;

  return (
    <div className={styles.box}>
      <div ref={boxRef}>
        <svg
          ref={svgRef}
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={`${capitalize(fuelType)} price over ${values.length} weeks, now ${formatPeso(now)} a litre`}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
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

          {labelIndices.map((i) => (
            <text
              key={i}
              x={x(i)}
              y="180"
              textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'}
              className={styles.axis}
            >
              {formatWeek(history[i].weekOf)}
            </text>
          ))}

          {hoverIndex !== null && (
            <line
              x1={activeX} y1={top} x2={activeX} y2={bottom}
              stroke="var(--line-soft)" strokeWidth="1" strokeDasharray="3 3"
            />
          )}
          <circle cx={activeX} cy={activeY} r="5" fill="var(--brand-fill)" stroke="var(--surface)" strokeWidth="1.5" />

          {hoverIndex !== null && (
            <g>
              <rect
                x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight}
                rx="6" fill="var(--surface-hi)" stroke="var(--line-soft)"
              />
              <text x={tooltipX + tooltipWidth / 2} y={tooltipY + 15} textAnchor="middle" className={styles.tooltipDate}>
                {formatWeek(history[activeIndex].weekOf)}
              </text>
              <text x={tooltipX + tooltipWidth / 2} y={tooltipY + 29} textAnchor="middle" className={styles.tooltipPrice}>
                {formatPeso(activeValue)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
