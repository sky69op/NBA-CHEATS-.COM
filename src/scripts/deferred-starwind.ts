const DRAWER_READY = 'data-sw-drawer-ready';
const ACCORDION_READY = 'data-sw-accordion-ready';

let drawerModule: Promise<typeof import('@starwind-ui/runtime/drawer')> | null = null;
let accordionModule: Promise<typeof import('@starwind-ui/runtime/accordion')> | null = null;

function loadDrawerModule() {
  drawerModule ??= import('@starwind-ui/runtime/drawer');
  return drawerModule;
}

function loadAccordionModule() {
  accordionModule ??= import('@starwind-ui/runtime/accordion');
  return accordionModule;
}

async function initDrawers(root: ParentNode = document) {
  const { createDrawer } = await loadDrawerModule();
  root.querySelectorAll<HTMLElement>('[data-sw-drawer]').forEach((el) => {
    if (el.getAttribute(DRAWER_READY) === '1') return;
    el.setAttribute(DRAWER_READY, '1');
    createDrawer(el);
  });
}

async function initAccordions(root: ParentNode = document) {
  const { createAccordion } = await loadAccordionModule();
  root.querySelectorAll<HTMLElement>('[data-sw-accordion]').forEach((el) => {
    if (el.getAttribute(ACCORDION_READY) === '1') return;
    el.setAttribute(ACCORDION_READY, '1');
    createAccordion(el);
  });
}

function bindDrawerTriggers() {
  const boot = () => {
    void initDrawers();
  };

  document.querySelectorAll('[data-sw-drawer-trigger]').forEach((trigger) => {
    trigger.addEventListener('pointerdown', boot, { once: true, passive: true });
    trigger.addEventListener('keydown', boot, { once: true, passive: true });
  });
}

function bindAccordionsWhenVisible() {
  const nodes = document.querySelectorAll('[data-sw-accordion]');
  if (!nodes.length) return;

  const boot = () => {
    void initAccordions();
  };

  if (!('IntersectionObserver' in window)) {
    boot();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      boot();
      io.disconnect();
    },
    { rootMargin: '160px 0px', threshold: 0 },
  );

  nodes.forEach((node) => io.observe(node));
}

function resetDeferredFlags(root: ParentNode = document) {
  root.querySelectorAll(`[${DRAWER_READY}], [${ACCORDION_READY}]`).forEach((el) => {
    el.removeAttribute(DRAWER_READY);
    el.removeAttribute(ACCORDION_READY);
  });
}

export function setupDeferredStarwind() {
  bindDrawerTriggers();
  bindAccordionsWhenVisible();
}

/** First menu tap loads this module, then we open the drawer that was pressed. */
export async function openDrawerFromTrigger(trigger: HTMLElement) {
  await initDrawers();
  document.documentElement.dataset.swDrawerLive = '1';
  trigger.click();
}

export async function openAccordionFromTrigger(trigger: HTMLElement) {
  await initAccordions();
  trigger.click();
}

export function reinitDeferredStarwind() {
  resetDeferredFlags();
  setupDeferredStarwind();
  void initDrawers();
  void initAccordions();
}
