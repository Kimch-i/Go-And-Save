import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { shortPlace } from '../../../lib/format.js';
import styles from './RouteMap.module.css';

const PAMPANGA = [15.07, 120.62];

// Leaflet cannot read CSS variables, so pass it the colour itself
function cssColor(role) {
  return getComputedStyle(document.documentElement).getPropertyValue(role).trim();
}

// The Leaflet map. The only component that touches Leaflet's own DOM.
export default function RouteMap({ origin, destination, route, theme }) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    const map = L.map(boxRef.current, { scrollWheelZoom: false }).setView(PAMPANGA, 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map) return;

    layer.clearLayers();
    const points = [];

    if (route) {
      L.polyline(route.geometry, { color: cssColor('--brand-fill'), weight: 5, opacity: 0.95 }).addTo(layer);
      points.push(...route.geometry);
    }

    if (origin) {
      L.circleMarker([origin.lat, origin.lon], {
        radius: 7, color: cssColor('--surface'), weight: 2, fillColor: cssColor('--good'), fillOpacity: 1,
      }).addTo(layer);
      points.push([origin.lat, origin.lon]);
    }

    if (destination) {
      L.circleMarker([destination.lat, destination.lon], {
        radius: 7, color: cssColor('--surface'), weight: 2, fillColor: cssColor('--brand-fill'), fillOpacity: 1,
      }).addTo(layer);
      points.push([destination.lat, destination.lon]);
    }

    if (points.length > 1) map.fitBounds(points, { padding: [28, 28] });
    if (points.length === 1) map.setView(points[0], 12);
  }, [origin, destination, route, theme]);

  let summary = 'No places chosen yet.';
  if (origin && destination && route) {
    summary = `Route from ${shortPlace(origin.label)} to ${shortPlace(destination.label)}, ${route.distanceKm} km.`;
  } else if (origin) {
    summary = `Starting from ${shortPlace(origin.label)}.`;
  }

  return (
    <figure className={styles.figure}>
      <div ref={boxRef} className={styles.map} />
      <figcaption className={styles.caption}>{summary}</figcaption>
    </figure>
  );
}
