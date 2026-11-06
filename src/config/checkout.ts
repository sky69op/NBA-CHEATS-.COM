import { CHECKOUT_URLS } from './checkout-redirects.mjs';

/**
 * External checkout destinations live in `checkout-redirects.mjs`.
 * Visible buy links stay on `/go/…` so the status bar does not show the external URL.
 * Click → server 302 (and static `_redirects` / fallback HTML) to the configured URL.
 */
export const CHECKOUT = CHECKOUT_URLS;

export type CheckoutProduct = keyof typeof CHECKOUT;

/** URL slug for /go/[slug]/ checkout redirect pages. */
export const CHECKOUT_SLUGS: Record<CheckoutProduct, string> = {
  wardogs: 'nba-2k27',
  hwidSpoofer: 'hwid-spoofer',
  cloudDma: 'cloud-dma',
  ugc: 'ugc',
  partnerShop: 'shop',
};

export const CHECKOUT_SLUG_TO_PRODUCT = Object.fromEntries(
  Object.entries(CHECKOUT_SLUGS).map(([product, slug]) => [slug, product as CheckoutProduct]),
) as Record<string, CheckoutProduct>;

/** Internal path shown on hover. Redirect target is `CHECKOUT[product]`. */
export function checkoutPath(product: CheckoutProduct): string {
  return `/go/${CHECKOUT_SLUGS[product]}/`;
}

/** Default main-product buy URL (header, hero CTAs, support). */
export const PRIMARY_CHECKOUT_PATH = checkoutPath('wardogs');

/** HWID Spoofer buy URL. Hover shows this path; click 302s to the configured external URL. */
export const HWID_CHECKOUT_PATH = checkoutPath('hwidSpoofer');

export const CLOUD_DMA_CHECKOUT_PATH = checkoutPath('cloudDma');

export const UGC_CHECKOUT_PATH = checkoutPath('ugc');

/** Map internal product slugs to cloaked checkout paths. */
export function checkoutForSlug(slug: string): string {
  const product = CHECKOUT_SLUG_TO_PRODUCT[slug];
  return checkoutPath(product ?? 'wardogs');
}

/** Blog / legacy hrefs → cloaked `/go/…` paths (never the bare external URL). */
export function resolveCheckoutHref(href: string): string {
  const suffix = href.match(/[?#].*$/)?.[0] ?? '';
  const withOptions = (product: CheckoutProduct): string => {
    const incoming = new URL(href);
    incoming.searchParams.delete('to');
    const query = incoming.searchParams.toString();
    return checkoutPath(product) + (query ? `?${query}` : '') + incoming.hash;
  };
  if (!href.startsWith('http')) {
    const normalized = href.startsWith('/') ? href : `/${href}`;
    const goMatch = normalized.match(/^\/go\/([^/?#]+)\/?/);
    if (goMatch) {
      const slug = goMatch[1];
      if (
        slug === 'wardogs' || slug === 'nba-2k27'
      ) {
        return checkoutPath('wardogs') + suffix;
      }
      const product = CHECKOUT_SLUG_TO_PRODUCT[slug];
      if (product) return checkoutPath(product) + suffix;
    }
    return normalized;
  }

  if (href.startsWith('http')) {
    try {
      const u = new URL(href);
      const to = u.searchParams.get('to') ?? '';
      if (to.includes('hwid-spoofer')) return withOptions('hwidSpoofer');
      if (to.endsWith('/shop') || to === '/shop') return withOptions('partnerShop');
    } catch {
      /* fall through */
    }
  }

  if (href.includes('%2Fproducts%2Fhwid-spoofer') || href.includes('/products/hwid-spoofer')) {
    return withOptions('hwidSpoofer');
  }

  if (href.includes('%2Fshop') && href.includes('to=')) {
    return withOptions('partnerShop');
  }

  if (href.includes('%2Fproducts%2Fcloud-dma') || href.includes('/products/cloud-dma')) {
    return withOptions('cloudDma');
  }

  if (href.includes('%2Fproducts%2Fugc') || href.includes('/products/ugc')) {
    return withOptions('ugc');
  }

  if (
    href.includes('%2Fproducts%2Fnba-2k27') ||
    href.includes('/products/nba-2k27')
  ) {
    return withOptions('wardogs');
  }

  for (const [product, url] of Object.entries(CHECKOUT) as [CheckoutProduct, string][]) {
    const target = new URL(url);
    let incoming: URL;
    try { incoming = new URL(href); } catch { return href; }
    if (incoming.origin === target.origin && incoming.pathname === target.pathname &&
      [...target.searchParams].every(([key, value]) => incoming.searchParams.get(key) === value)) {
      for (const key of target.searchParams.keys()) incoming.searchParams.delete(key);
      const query = incoming.searchParams.toString();
      return checkoutPath(product) + (query ? `?${query}` : '') + incoming.hash;
    }
  }

  return href;
}

/** Shop / tickets entry (cloaked); use in support UI instead of bare external URLs. */
export const SUPPORT_CHECKOUT_PATH = checkoutPath('partnerShop');
