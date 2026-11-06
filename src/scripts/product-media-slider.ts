import { createCarousel } from '@starwind-ui/runtime/carousel';

function pauseHiddenVideos(sliderRoot: HTMLElement, carouselRoot: HTMLElement) {
  const instance = createCarousel(carouselRoot);
  const videos = () => [...sliderRoot.querySelectorAll<HTMLVideoElement>('[data-media-video]')];
  if (!videos().length) return;

  const sync = () => {
    const index = instance.selectedSnap();
    videos().forEach((video) => {
      const slide = video.closest('[data-slot="carousel-item"]');
      const slideIndex = slide
        ? [...sliderRoot.querySelectorAll('[data-slot="carousel-item"]')].indexOf(slide)
        : -1;
      if (slideIndex !== index) video.pause();
    });
  };

  instance.api.on('select', sync);
  instance.api.on('reInit', sync);
  sync();
}

function reInitCarousel(carouselRoot: HTMLElement) {
  try {
    createCarousel(carouselRoot).api.reInit();
  } catch {
    /* carousel not ready yet */
  }
}

function watchSliderSize(carouselRoot: HTMLElement) {
  const viewport = carouselRoot.querySelector<HTMLElement>('[data-sw-carousel-viewport]');
  if (!viewport || viewport.dataset.sizeWatch === 'true') return;
  viewport.dataset.sizeWatch = 'true';

  let width = viewport.clientWidth;
  const observer = new ResizeObserver(() => {
    const next = viewport.clientWidth;
    if (next === 0 || next === width) return;
    width = next;
    reInitCarousel(carouselRoot);
  });
  observer.observe(viewport);
}

function reInitCarousels(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-media-slider] [data-sw-carousel]').forEach((carouselRoot) => {
    reInitCarousel(carouselRoot);
  });
}

export function initProductMediaSliders(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-media-slider]').forEach((sliderRoot) => {
    if (sliderRoot.dataset.mediaSliderBound === 'true') return;
    const carouselRoot = sliderRoot.querySelector<HTMLElement>('[data-sw-carousel]');
    if (!carouselRoot) return;

    sliderRoot.dataset.mediaSliderBound = 'true';
    watchSliderSize(carouselRoot);
    pauseHiddenVideos(sliderRoot, carouselRoot);
    requestAnimationFrame(() => reInitCarousel(carouselRoot));
  });
}

let listenersBound = false;

export function setupProductMediaSliders() {
  if (listenersBound) return;
  listenersBound = true;

  const run = () => initProductMediaSliders();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }

  if (document.readyState === 'complete') {
    requestAnimationFrame(() => reInitCarousels(document));
  } else {
    window.addEventListener('load', () => reInitCarousels(document), { once: true });
  }
  document.addEventListener('astro:page-load', run);
  document.addEventListener('astro:after-swap', run);
}
