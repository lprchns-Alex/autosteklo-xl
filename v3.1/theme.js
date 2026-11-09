(() => {
  'use strict';

  const key = 'avtosteklo-v3-theme';
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  let theme = 'dark';

  // Apply the saved choice before styles and page content are rendered.
  try {
    if (localStorage.getItem(key) === 'light') theme = 'light';
  } catch { /* Switching still works when browser storage is unavailable. */ }

  function applyTheme(next, persist = false) {
    theme = next === 'light' ? 'light' : 'dark';
    root.dataset.theme = theme;
    meta?.setAttribute('content', theme === 'light' ? '#f5f6f7' : '#08090b');

    const toggle = document.querySelector('#theme-toggle');
    if (toggle) {
      const label = theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    }

    if (persist) {
      try { localStorage.setItem(key, theme); } catch { /* Keep the current-page choice. */ }
    }
  }

  applyTheme(theme);

  function init() {
    const toggle = document.querySelector('#theme-toggle');
    if (!toggle) return;
    applyTheme(theme);
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      applyTheme(theme === 'dark' ? 'light' : 'dark', true);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) {
      applyTheme(event.newValue === 'light' ? 'light' : 'dark');
    }
  });
})();
