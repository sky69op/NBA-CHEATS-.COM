import { setupReveal } from './reveal';
import { setupTheme } from './theme';

const HERO_DESKTOP_MQ = '(min-width: 1024px)';

const DEFERRED_BOOT_URL = '__DEFERRED_BOOT_URL__';

let deferredLoad: Promise<void> | null = null;
let deferredListenersBound = false;
let heroDesktopListenerBound = false;

function loadDeferred(): Promise<void> {
  if (deferredLoad) return deferredLoad;

  // Dynamic import waits for the boot module's top-level await. A module script's
  // load event can fire before async widget setup exposes the first-click handlers.
  const pending = import.meta.env.DEV
    ? import('./deferred-boot')
    : import(/* @vite-ignore */ DEFERRED_BOOT_URL);
  deferredLoad = pending.then(() => {}).catch((error) => {
    deferredLoad = null;
    throw error;
  });
  return deferredLoad;
}

function armDeferred() {
  if (!deferredListenersBound) {
    deferredListenersBound = true;

    document.addEventListener(
      'pointerdown',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest('[data-sw-drawer-trigger]')) return;
        void loadDeferred();
      },
      { capture: true, passive: true },
    );

    document.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const trigger = target.closest<HTMLElement>('[data-sw-drawer-trigger]');
        if (!trigger || document.documentElement.dataset.swDrawerLive === '1') return;
        event.preventDefault();
        event.stopPropagation();
        void loadDeferred().then(() => window.__openDeferredDrawer?.(trigger));
      },
      true,
    );

    document.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const trigger = target.closest<HTMLElement>('[data-sw-accordion] button');
        const root = trigger?.closest('[data-sw-accordion]');
        if (!trigger || !root || root.getAttribute('data-sw-accordion-ready') === '1') return;
        event.preventDefault();
        event.stopPropagation();
        void loadDeferred().then(() => window.__openDeferredAccordion?.(trigger));
      },
      true,
    );

    document.addEventListener(
      'pointerdown',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest('[data-media-slider] button')) return;
        void loadDeferred();
      },
      { capture: true, passive: true },
    );

    document.addEventListener(
      'pointerdown',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest('[data-hero-slider]')) return;
        void loadDeferred();
      },
      { capture: true, passive: true },
    );

    document.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const control = target.closest('button');
        const slider = control?.closest<HTMLElement>('[data-media-slider]');
        if (!control || !slider || slider.dataset.mediaSliderBound === 'true') return;
        if (control.dataset.sliderReplay === '1') return;
        control.dataset.sliderReplay = '1';
        event.preventDefault();
        event.stopPropagation();
        void loadDeferred().then(() => control.click());
      },
      true,
    );
  }

}

function scheduleIdle(fn: () => void, timeoutMs = 2500) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(fn, { timeout: timeoutMs });
  } else {
    window.setTimeout(fn, 1);
  }
}

const LOCALE_PREFIXES = ['es', 'de', 'fr'] as const;

function normalizeNavPath(pathname: string): string {
  const path = pathname.replace(/\/index\.html$/i, '').replace(/\/$/, '') || '/';
  for (const locale of LOCALE_PREFIXES) {
    if (path === `/${locale}`) return '/';
    if (path.startsWith(`/${locale}/`)) {
      const rest = path.slice(`/${locale}`.length);
      return rest.replace(/\/$/, '') || '/';
    }
  }
  return path;
}

function initNavHighlight() {
  const path = normalizeNavPath(window.location.pathname);

  document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href') ?? '';
    const linkPath = normalizeNavPath(href);
    let isActive = false;

    if (linkPath === '/') {
      isActive = path === '/';
    } else {
      isActive = path === linkPath || path.startsWith(`${linkPath}/`);
    }

    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function initInPageScroll() {
  document.querySelectorAll<HTMLElement>('[data-scroll-target]').forEach((el) => {
    el.addEventListener('click', (event) => {
      const id = el.getAttribute('data-scroll-target');
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initSkipLink() {
  document.querySelectorAll<HTMLElement>('[data-skip-to-main]').forEach((button) => {
    button.addEventListener('click', () => {
      const main = document.getElementById('main-content');
      if (!main) return;

      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: false });
      main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initFaqFilters() {
  if (!document.querySelector('[data-faq-filters]')) return;

  document.querySelectorAll('[data-faq-filters]').forEach((container) => {
    const section = container.closest('[data-faq-section]');
    const list = section?.querySelector('[data-faq-list]');
    if (!list) return;

    const items = list.querySelectorAll<HTMLElement>('[data-faq-topic]');
    const chips = container.querySelectorAll<HTMLButtonElement>('[data-faq-filter]');

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const topic = chip.getAttribute('data-faq-filter');
        chips.forEach((c) => c.classList.toggle('is-active', c === chip));
        items.forEach((item) => {
          const itemTopic = item.getAttribute('data-faq-topic');
          const show = topic === 'all' || itemTopic === topic;
          item.toggleAttribute('data-hidden', !show);
        });
      });
    });
  });
}

function initThemeMetaColor() {
  const byId = document.getElementById('sw-theme-color');
  const metaTheme =
    (byId instanceof HTMLMetaElement ? byId : null) ??
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!metaTheme) return;

  const update = () => {
    metaTheme.content = document.documentElement.classList.contains('dark') ? '#0a0614' : '#f4f0fb';
  };

  update();
  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

function bootSite() {
  setupTheme();
  setupReveal();
  armDeferred();
  initNavHighlight();
  initInPageScroll();
  initSkipLink();
  initThemeMetaColor();
  scheduleIdle(() => initFaqFilters(), 1500);
  const heroSlider = document.querySelector('[data-hero-slider]');
  if (!heroSlider) return;

  const desktop = window.matchMedia(HERO_DESKTOP_MQ);
  const armHero = () => {
    if (!desktop.matches) return;
    scheduleIdle(() => void loadDeferred(), 1200);
  };
  armHero();
  if (!heroDesktopListenerBound) {
    heroDesktopListenerBound = true;
    desktop.addEventListener('change', armHero);
  }
}

function bootSiteOnLoad() {
  bootSite();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootSiteOnLoad);
} else {
  bootSiteOnLoad();
}

document.addEventListener('astro:page-load', bootSiteOnLoad);

document.addEventListener('astro:after-swap', () => {
  setupTheme();
  if (document.documentElement.dataset.deferredBoot === '1') {
    window.__reinitDeferred?.();
  }
});
