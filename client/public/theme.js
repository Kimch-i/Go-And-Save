// Sets the saved theme before React loads, so the page never flashes the wrong one.
(function () {
  var choice = 'system';
  try {
    choice = localStorage.getItem('gas.theme') || 'system';
  } catch (error) {
  }
  var theme = choice;
  if (choice === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
