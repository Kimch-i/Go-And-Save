// Applies 'light', 'dark' or 'system' by setting data-theme on <html>.
export function resolveTheme(choice) {
  if (choice === 'light' || choice === 'dark') return choice;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(choice) {
  const theme = resolveTheme(choice);
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}
