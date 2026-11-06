import { THEME_CONTROLLER_OPTIONS } from '../config/theme';

function applyResolved(theme: 'dark' | 'light') {
  document.documentElement.classList.toggle(THEME_CONTROLLER_OPTIONS.className, theme === 'dark');
  try {
    localStorage.setItem(THEME_CONTROLLER_OPTIONS.storageKey, theme);
  } catch {
    /* private mode */
  }
  document.querySelectorAll<HTMLInputElement>('[data-sw-theme-control]').forEach((input) => {
    if (input.type === 'checkbox') input.checked = theme === 'dark';
  });
}

function bindNativeThemeControls() {
  document.querySelectorAll<HTMLInputElement>('[data-sw-theme-control]').forEach((input) => {
    if (input.dataset.themeBound === '1' || input.type !== 'checkbox') return;
    input.dataset.themeBound = '1';
    input.addEventListener('change', () => {
      applyResolved(input.checked ? 'dark' : 'light');
    });
  });
}

export function setupTheme() {
  const dark = document.documentElement.classList.contains(THEME_CONTROLLER_OPTIONS.className);
  document.querySelectorAll<HTMLInputElement>('[data-sw-theme-control]').forEach((input) => {
    if (input.type === 'checkbox') input.checked = dark;
  });
  bindNativeThemeControls();
}
