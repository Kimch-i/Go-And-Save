import styles from './SuggestionList.module.css';

export default function SuggestionList({ id, places, onPick }) {
  function handleKeyDown(event) {
    const item = event.target.closest('li');
    if (event.key === 'ArrowDown' && item.nextElementSibling) {
      event.preventDefault();
      item.nextElementSibling.querySelector('button').focus();
    }
    if (event.key === 'ArrowUp' && item.previousElementSibling) {
      event.preventDefault();
      item.previousElementSibling.querySelector('button').focus();
    }
  }

  return (
    <ul
      id={id}
      className={styles.list}
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => event.preventDefault()}
    >
      {places.map((place) => (
        <li key={place.label}>
          <button type="button" onClick={() => onPick(place)}>
            {place.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
