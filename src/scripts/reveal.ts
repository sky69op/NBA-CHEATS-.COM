const SELECTOR = [
  'main :is(section:not(#hero, #workflow, .product-detail-hero), article) :is(.section-header, [data-reveal]:not([data-reveal-stagger]), [data-reveal-stagger] > *, .why-compare-feature-row, .why-compare-card, .desc-wrap, .product-experience__header, .product-experience__column-head, .product-experience__callout, .product-experience__step, .deployment-step-marker, .deployment-step-title, .blog-article__prose > *, #blog-grid > *, .blog-topic-filters, .support-section__cards > li, .support-section__tips, .prose > section)',
  'footer [data-reveal-stagger] > *',
].join(', ');

const WORKFLOW_SELECTOR =
  '#workflow :is(.section-header, .workflow-section__badge, .workflow-section__cta-row, .workflow-step)';
const DESKTOP_MQ = '(min-width: 1024px)';

const DURATION = 520;
const STAGGER_MS = 16;
const MAX_STAGGER_MS = 48;

const animating = new WeakSet<HTMLElement>();
const finishTimers = new WeakMap<HTMLElement, number>();
let primeObserver: IntersectionObserver | null = null;
let playObserver: IntersectionObserver | null = null;
let listening = false;
let reduceMotion = false;

function workflowTargets(root: ParentNode): HTMLElement[] {
  if (window.matchMedia(DESKTOP_MQ).matches) return [];
  return [...root.querySelectorAll<HTMLElement>(WORKFLOW_SELECTOR)];
}

function targets(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(SELECTOR), ...workflowTargets(root)].filter(
    (el) =>
      el.dataset.scrollDone !== '1' &&
      !el.closest('#hero, header.fixed, .product-detail-hero, [data-sw-carousel]'),
  );
}

function clearMotion(el: HTMLElement) {
  const timer = finishTimers.get(el);
  if (timer) window.clearTimeout(timer);
  finishTimers.delete(el);
  el.removeAttribute('data-reveal-primed');
  el.removeAttribute('data-scroll-revealing');
  animating.delete(el);
}

function finish(el: HTMLElement) {
  clearMotion(el);
  el.dataset.scrollDone = '1';
}

function staggerDelay(el: HTMLElement) {
  const custom = el.dataset.revealDelay;
  if (custom) {
    const ms = Number(custom);
    return Number.isFinite(ms) ? ms : 0;
  }
  if (el.closest('#workflow')) {
    if (el.classList.contains('workflow-step') && el.parentElement) {
      const index = [...el.parentElement.children].indexOf(el);
      return index < 0 ? 0 : Math.min(MAX_STAGGER_MS, index * STAGGER_MS);
    }
    const lead = ['section-header', 'workflow-section__badge', 'workflow-section__cta-row'];
    const index = lead.findIndex((name) => el.classList.contains(name));
    return index < 0 ? 0 : index * STAGGER_MS;
  }

  const group = el.parentElement?.closest('[data-reveal-stagger]');
  if (!group) return 0;
  const index = [...group.children].indexOf(el);
  return index < 0 ? 0 : Math.min(MAX_STAGGER_MS, index * STAGGER_MS);
}

function play(el: HTMLElement, delayMs: number) {
  if (animating.has(el) || el.dataset.scrollDone === '1') return;
  primeObserver?.unobserve(el);
  playObserver?.unobserve(el);

  if (reduceMotion || !el.hasAttribute('data-reveal-primed')) {
    finish(el);
    return;
  }

  animating.add(el);
  window.setTimeout(() => {
    requestAnimationFrame(() => {
      if (!el.isConnected || el.dataset.scrollDone === '1') return;
      el.setAttribute('data-scroll-revealing', '');
      finishTimers.set(
        el,
        window.setTimeout(() => finish(el), DURATION + 70),
      );
    });
  }, delayMs);
}

function boot(root: ParentNode = document) {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  primeObserver?.disconnect();
  playObserver?.disconnect();

  const seen = new Set<HTMLElement>();
  const elements = targets(root).filter((el) => {
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      if (seen.has(parent)) return false;
    }
    seen.add(el);
    return true;
  });

  if (reduceMotion) {
    for (const el of elements) finish(el);
    return;
  }

  playObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        play(entry.target as HTMLElement, staggerDelay(entry.target as HTMLElement));
      }
    },
    { root: null, rootMargin: '0px 0px -24px 0px', threshold: 0 },
  );

  primeObserver = new IntersectionObserver(
    (entries) => {
      const vh = window.innerHeight || 800;
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (el.dataset.scrollDone === '1' || el.hasAttribute('data-reveal-primed') || animating.has(el)) {
          primeObserver?.unobserve(el);
          continue;
        }
        if (!entry.isIntersecting) continue;

        const top = entry.boundingClientRect.top;
        if (top >= vh) {
          el.setAttribute('data-reveal-primed', '');
          primeObserver?.unobserve(el);
          playObserver?.observe(el);
          continue;
        }

        primeObserver?.unobserve(el);
        finish(el);
      }
    },
    { root: null, rootMargin: '0px 0px 60% 0px', threshold: 0 },
  );

  for (const el of elements) {
    if (el.hasAttribute('data-reveal-primed')) playObserver.observe(el);
    else primeObserver.observe(el);
  }
}

function resetAll() {
  document.querySelectorAll<HTMLElement>('[data-scroll-done], [data-reveal-primed]').forEach((el) => {
    delete el.dataset.scrollDone;
    clearMotion(el);
  });
}

let started = false;
let width = 0;

function startReveal() {
  if (started) return;
  started = true;
  width = window.innerWidth;
  boot();
}

/* Reading scrollY or layout sizes during load forces a full-page layout,
   so reveal starts from the first scroll event instead. */
export function setupReveal() {
  const onScroll = () => {
    window.removeEventListener('scroll', onScroll);
    startReveal();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  if (listening) return;
  listening = true;

  let resizeTimer = 0;
  window.addEventListener(
    'resize',
    () => {
      if (!started || window.innerWidth === width) return;
      width = window.innerWidth;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (started) boot();
      }, 180);
    },
    { passive: true },
  );

  document.addEventListener('astro:page-load', () => {
    resetAll();
    started = false;
    window.addEventListener('scroll', onScroll, { passive: true });
  });
}
