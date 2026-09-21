import { useEffect, useState } from 'react';
import TextInput from '../../atoms/TextInput/TextInput.jsx';
import SuggestionList from '../SuggestionList/SuggestionList.jsx';
import { searchPlaces } from '../../../api/index.js';

// wait for typing to pause, so the place search is not called on every key
const SEARCH_DELAY_MS = 300;

// Place search with suggestions. Used for Starting from and Going to.
export default function LocationSearch({ label, id, place, placeholder, onSelect, onClear }) {
  const [text, setText] = useState(place ? place.label : '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const query = text.trim();
  const listId = `${id}-suggestions`;
  const showList = isOpen && query.length >= 2 && suggestions.length > 0;

  useEffect(() => {
    if (!isOpen || query.length < 2) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const places = await searchPlaces(query);
      if (!cancelled) setSuggestions(places);
    }, SEARCH_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  function handleType(value) {
    setText(value);
    setIsOpen(true);
    onClear();
  }

  function handlePick(picked) {
    setText(picked.label);
    setIsOpen(false);
    onSelect(picked);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') setIsOpen(false);
    if (event.key === 'ArrowDown' && showList) {
      event.preventDefault();
      document.querySelector(`#${listId} button`).focus();
    }
  }

  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  }

  return (
    <div onBlur={handleBlur}>
      <TextInput
        label={label}
        id={id}
        value={text}
        onChange={handleType}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
      >
        {showList && <SuggestionList id={listId} places={suggestions} onPick={handlePick} />}
      </TextInput>
    </div>
  );
}
