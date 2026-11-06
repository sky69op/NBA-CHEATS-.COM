import { createCarousel } from '@starwind-ui/runtime/carousel';

const HERO_DESKTOP_MQ = '(min-width: 1024px)';

const AUTOPLAY_MS = 3000;
const RESUME_AFTER_INTERACTION_MS = AUTOPLAY_MS;
const FILL_ANIMATION = 'hero-slider-dot-progress';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function bindHeroSlider(rootEl: HTMLElement) {
  if (rootEl.dataset.heroSliderBound === 'true') return;

  const carouselRoot = rootEl.querySelector<HTMLElement>('[data-sw-carousel]');
  const slideCount = Number(rootEl.dataset.slides ?? '0');
  if (!carouselRoot || slideCount < 2) return;

  rootEl.dataset.heroSliderBound = 'true';
  rootEl.dataset.heroTimerReady = 'true';
  rootEl.style.setProperty('--hero-autoplay', `${AUTOPLAY_MS}ms`);

  const instance = createCarousel(carouselRoot);
  const dots = [...rootEl.querySelectorAll<HTMLElement>('[data-hero-dot]')];
  const panels = [...rootEl.querySelectorAll<HTMLElement>('[data-hero-panel]')];

  const fills = dots.map((dot) => dot.querySelector<HTMLElement>('.hero-slider__dot-fill'));

  let activeIndex = 0;
  let autoplayEnabled = true;
  let hovered = false;
  let resumeTimer: ReturnType<typeof setTimeout> | null = null;
  let reducedMotionTimer: ReturnType<typeof setInterval> | null = null;

  const resetFill = (fill: HTMLElement | null) => {
    if (!fill) return;
    fill.style.animation = 'none';
    fill.style.transform = 'scaleX(0)';
  };

  const restartFill = (fill: HTMLElement | null) => {
    if (!fill) return;
    resetFill(fill);
    void fill.offsetWidth;
    fill.style.transform = '';
    fill.style.animation = `${FILL_ANIMATION} ${AUTOPLAY_MS}ms linear forwards`;
  };

  // One listener per fill for the slider's lifetime: only the active dot's fill may advance the slide.
  fills.forEach((fill, i) => {
    fill?.addEventListener('animationend', (event) => {
      if (event.target !== fill || !event.animationName.includes(FILL_ANIMATION)) return;
      if (i !== activeIndex || !autoplayEnabled) return;
      instance.scrollNext();
    });
  });

  const setActiveDot = (index: number) => {
    activeIndex = ((index % slideCount) + slideCount) % slideCount;
    dots.forEach((dot, i) => {
      const isActive = i === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      dot.tabIndex = isActive ? 0 : -1;
      resetFill(fills[i] ?? null);
    });

    panels.forEach((panel, i) => {
      const isActive = i === activeIndex;
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      panel.tabIndex = isActive ? 0 : -1;
    });

    if (autoplayEnabled && !prefersReducedMotion()) restartFill(fills[activeIndex] ?? null);
  };

  const clearTimers = () => {
    if (reducedMotionTimer) {
      clearInterval(reducedMotionTimer);
      reducedMotionTimer = null;
    }
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  };

  const stopAutoplay = () => {
    autoplayEnabled = false;
    clearTimers();
    const fill = fills[activeIndex];
    if (fill) fill.style.animationPlayState = 'paused';
  };

  const startAutoplay = () => {
    if (hovered) return;
    clearTimers();
    autoplayEnabled = true;
    if (prefersReducedMotion()) {
      reducedMotionTimer = setInterval(() => instance.scrollNext(), AUTOPLAY_MS);
      return;
    }
    const fill = fills[activeIndex];
    if (!fill) return;
    if (fill.style.animation.includes(FILL_ANIMATION)) {
      fill.style.animationPlayState = 'running';
    } else {
      restartFill(fill);
    }
  };

  const scheduleAutoplayResume = () => {
    stopAutoplay();
    if (prefersReducedMotion()) return;
    resumeTimer = setTimeout(startAutoplay, RESUME_AFTER_INTERACTION_MS);
  };

  instance.api.on('select', () => setActiveDot(instance.selectedSnap()));
  instance.api.on('reInit', () => setActiveDot(instance.selectedSnap()));
  setActiveDot(instance.selectedSnap());

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.heroDot);
      if (!Number.isFinite(index)) return;
      stopAutoplay();
      instance.scrollTo(index);
      scheduleAutoplayResume();
    });
  });

  rootEl.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    stopAutoplay();
  });
  rootEl.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    hovered = false;
    startAutoplay();
  });
  rootEl.addEventListener('focusin', (event) => {
    if ((event.target as HTMLElement).matches(':focus-visible')) stopAutoplay();
  });
  rootEl.addEventListener('focusout', (event) => {
    if (!rootEl.contains(event.relatedTarget as Node | null)) startAutoplay();
  });

  instance.api.on('pointerDown', stopAutoplay);
  instance.api.on('pointerUp', scheduleAutoplayResume);

  startAutoplay();
}

export function initHeroSliders(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-hero-slider]').forEach(bindHeroSlider);
}

let listenersBound = false;

export function setupHeroSliders() {
  const desktop = window.matchMedia(HERO_DESKTOP_MQ);

  const run = () => {
    if (!desktop.matches) return;
    initHeroSliders();
  };

  if (listenersBound) {
    run();
    return;
  }
  listenersBound = true;

  desktop.addEventListener('change', run);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }

  document.addEventListener('astro:page-load', run);
}
