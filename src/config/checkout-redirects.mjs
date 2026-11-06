/**
 * External checkout destinations (302 targets only).
 * Visible buy buttons use `/go/…` from `checkout.ts`; hover stays on-site.
 */
export const CHECKOUT_URLS = {
  wardogs: 'https://zadeyo.com/go/SKY?to=%2Fproducts%2Fnba-2k27',
  hwidSpoofer: 'https://zadeyo.com/go/SKY?to=%2Fproducts%2Fhwid-spoofer',
  cloudDma: 'https://zadeyo.com/go/SKY?to=%2Fproducts%2Fcloud-dma',
  ugc: 'https://zadeyo.com/go/SKY?to=%2Fproducts%2Fugc',
  partnerShop: 'https://zadeyo.com/go/SKY?to=%2Fshop',
};

const MAIN_CHECKOUT = CHECKOUT_URLS.wardogs;

const PREFIXED_LOCALES = ['es', 'de', 'fr'];

/** Checkout paths → external product URLs (Node serve, Astro middleware, static `_redirects`). */
export const CHECKOUT_PATH_REDIRECTS = new Map([
  ['/go/nba-2k27', MAIN_CHECKOUT],
  ['/go/nba-2k27/', MAIN_CHECKOUT],
  ['/go/hwid-spoofer', CHECKOUT_URLS.hwidSpoofer],
  ['/go/hwid-spoofer/', CHECKOUT_URLS.hwidSpoofer],
  ['/go/cloud-dma', CHECKOUT_URLS.cloudDma],
  ['/go/cloud-dma/', CHECKOUT_URLS.cloudDma],
  ['/go/ugc', CHECKOUT_URLS.ugc],
  ['/go/ugc/', CHECKOUT_URLS.ugc],
  ['/go/shop', CHECKOUT_URLS.partnerShop],
  ['/go/shop/', CHECKOUT_URLS.partnerShop],
]);

function stripLocaleFromCheckoutPath(pathname) {
  for (const locale of PREFIXED_LOCALES) {
    const prefix = `/${locale}`;
    if (pathname === `${prefix}/go` || pathname.startsWith(`${prefix}/go/`)) {
      return pathname.slice(prefix.length);
    }
  }
  if (pathname.startsWith('/en/go/') || pathname === '/en/go') {
    return pathname.slice('/en'.length);
  }
  return pathname;
}

export function resolveCheckoutPathRedirect(pathname) {
  const path = stripLocaleFromCheckoutPath(pathname);
  const direct = CHECKOUT_PATH_REDIRECTS.get(path);
  if (direct) return direct;

  if (path !== '/' && !path.endsWith('/')) {
    return CHECKOUT_PATH_REDIRECTS.get(`${path}/`) ?? null;
  }

  return null;
}
