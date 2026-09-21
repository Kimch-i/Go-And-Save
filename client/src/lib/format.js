// Display helpers: pesos, dates, place names, plurals.
export function formatPeso(amount) {
  return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPesoRounded(amount) {
  return '₱' + Math.round(amount).toLocaleString('en-PH');
}

export function formatWeek(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function shortPlace(label) {
  return label.split(',')[0];
}

export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function carModelLabel(car) {
  return `${car.make} ${car.model} ${car.yearFrom}–${car.yearTo || ''}`;
}

export function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}
