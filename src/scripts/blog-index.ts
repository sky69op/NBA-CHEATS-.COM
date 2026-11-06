/** Blog index topic filters (toolbar + grid). */
export function initBlogIndexFilters() {
  const toolbar = document.getElementById('blog-topic-filters');
  const grid = document.getElementById('blog-grid');
  const emptyEl = document.getElementById('blog-empty');
  if (!toolbar || !grid) return;

  const emptyMessage = grid.dataset.emptyMessage ?? '';

  const cards = () => [...grid.querySelectorAll<HTMLElement>('[data-blog-card]')];

  const activeTag = () =>
    toolbar.querySelector<HTMLButtonElement>('[data-blog-filter][aria-pressed="true"]')?.getAttribute(
      'data-blog-filter',
    ) ?? 'all';

  const setActiveButton = (btn: HTMLButtonElement) => {
    toolbar.querySelectorAll<HTMLButtonElement>('[data-blog-filter]').forEach((b) => {
      const active = b === btn;
      b.setAttribute('aria-pressed', String(active));
      b.classList.toggle('is-active', active);
    });
  };

  const apply = () => {
    const tag = activeTag();
    let visibleCount = 0;
    cards().forEach((el) => {
      const match = tag === 'all' || el.getAttribute('data-tag') === tag;
      el.classList.toggle('blog-card--hidden', !match);
      if (match) visibleCount += 1;
    });

    if (emptyEl) {
      emptyEl.classList.toggle('hidden', visibleCount > 0);
      emptyEl.textContent = emptyMessage;
    }
  };

  if (toolbar.dataset.blogFiltersBound === 'true') {
    apply();
    return;
  }
  toolbar.dataset.blogFiltersBound = 'true';

  toolbar.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-blog-filter]');
    if (!btn || !toolbar.contains(btn)) return;
    setActiveButton(btn);
    apply();
  });

  const initial = toolbar.querySelector<HTMLButtonElement>('[data-blog-filter][aria-pressed="true"]');
  if (initial) initial.classList.add('is-active');

  apply();
}
