import { openAccordionFromTrigger, openDrawerFromTrigger, reinitDeferredStarwind, setupDeferredStarwind } from './deferred-starwind';

async function bootWidgets() {
  setupDeferredStarwind();

  if (document.querySelector('[data-media-slider]')) {
    const mod = await import('./product-media-slider');
    mod.setupProductMediaSliders();
  }

  if (document.querySelector('[data-hero-slider]')) {
    const mod = await import('./hero-auto-slider');
    mod.setupHeroSliders();
  }
}

async function boot() {
  await bootWidgets();
  document.documentElement.dataset.deferredBoot = '1';
  window.__openDeferredDrawer = (trigger) => {
    void openDrawerFromTrigger(trigger);
  };
  window.__openDeferredAccordion = (trigger) => {
    void openAccordionFromTrigger(trigger);
  };
  window.__reinitDeferred = () => {
    reinitDeferredStarwind();
    bootWidgets();
  };
}

await boot();

document.addEventListener('astro:page-load', () => {
  if (document.documentElement.dataset.deferredBoot === '1') bootWidgets();
});

declare global {
  interface Window {
    __openDeferredDrawer?: (trigger: HTMLElement) => void;
    __openDeferredAccordion?: (trigger: HTMLElement) => void;
    __reinitDeferred?: () => void;
  }
}
