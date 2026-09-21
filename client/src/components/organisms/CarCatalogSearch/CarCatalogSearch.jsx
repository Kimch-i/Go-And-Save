import { useEffect, useState } from 'react';
import TextInput from '../../atoms/TextInput/TextInput.jsx';
import { searchCars } from '../../../api/index.js';
import { capitalize, carModelLabel } from '../../../lib/format.js';
import styles from './CarCatalogSearch.module.css';

// Searches the Philippine car catalog so the user doesn't need to know their km/L.
export default function CarCatalogSearch({ onPick, onAddManually }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    if (!hasQuery) return;
    let cancelled = false;
    searchCars(query).then((cars) => {
      if (!cancelled) setResults(cars);
    });
    return () => {
      cancelled = true;
    };
  }, [query, hasQuery]);

  return (
    <>
      <div className={styles.searchBar}>
        <TextInput
          label="Make or model"
          id="catalog-query"
          value={query}
          onChange={setQuery}
          placeholder="Try vios, innova, mirage"
          autoComplete="off"
          autoFocus
        />
      </div>

      {!hasQuery && (
        <p className="small muted">
          Searches the seeded Philippine car list, so you do not need to know your own km/L.
        </p>
      )}

      {hasQuery && (
        <>
          {results.length === 0 && (
            <p className={`${styles.status} small muted`}>Nothing matched “{query.trim()}”.</p>
          )}
          <ul className={styles.results}>
            {results.map((car) => (
              <li key={car.id}>
                <button type="button" onClick={() => onPick(car)}>
                  <span>{carModelLabel(car)}</span>
                  <span className={`${styles.sub} num`}>
                    {capitalize(car.fuelType)}, {car.kmPerLiterCity} km/L in town
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button type="button" className={styles.manual} onClick={() => onAddManually(query.trim())}>
                Can’t find it? Add manually
              </button>
            </li>
          </ul>
        </>
      )}
    </>
  );
}
