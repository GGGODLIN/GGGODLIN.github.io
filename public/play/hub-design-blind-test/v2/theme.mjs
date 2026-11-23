const root = document.documentElement;
const toggle = document.getElementById('theme-toggle');
const media = window.matchMedia('(prefers-color-scheme: dark)');

const apply = (mode) => {
  root.setAttribute('data-mode', mode);
  if (toggle) {
    toggle.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
};

const readSaved = () => {
  try {
    return localStorage.getItem('blind-test-mode');
  } catch {
    return null;
  }
};

const saved = readSaved();
apply((saved ?? (media.matches ? 'dark' : 'light')) === 'dark' ? 'dark' : 'light');

toggle?.addEventListener('click', () => {
  const next = root.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
  apply(next);
  try {
    localStorage.setItem('blind-test-mode', next);
  } catch {
    // Ignore storage errors in private browsing contexts.
  }
});

const onSystemChange = (event) => {
  if (!readSaved()) {
    apply(event.matches ? 'dark' : 'light');
  }
};
if (typeof media.addEventListener === 'function') {
  media.addEventListener('change', onSystemChange);
} else if (typeof media.addListener === 'function') {
  media.addListener(onSystemChange);
}

const menu = document.querySelector('details.menu');
if (menu) {
  const summary = menu.querySelector('summary');
  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('.menu-panel a')) {
      menu.open = false;
    }
  });
  document.addEventListener('click', (event) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) {
      menu.open = false;
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      if (summary instanceof HTMLElement) summary.focus();
    }
  });
}
