/** Static path redirects (301). Keys are pathname without query/hash. */
const LOCALES = ['es', 'de', 'fr'];
const PRODUCT_HOME = '/cheats/';

function addLocaleRedirects(map, fromPath, toPath) {
  map.set(fromPath, toPath);
  for (const locale of LOCALES) {
    map.set(`/${locale}${fromPath}`, `/${locale}${toPath}`);
  }
}

export const PATH_REDIRECTS = new Map([
  ['/blog', '/blog/'],
  ['/about', '/about/'],
  ['/contact', '/support/'],
  ['/contact/', '/support/'],
  ['/support', '/support/'],
  ['/privacy', '/privacy/'],
  ['/terms', '/terms/'],
  ['/faq', '/faq/'],
  ['/product', PRODUCT_HOME],
  ['/product/', PRODUCT_HOME],
  ['/cheats/compare', '/blog/'],
  ['/cheats/compare/', '/blog/'],
  ['/product/compare', '/blog/'],
  ['/product/compare/', '/blog/'],
  ['/cheats/lite', PRODUCT_HOME],
  ['/cheats/lite/', PRODUCT_HOME],
  ['/cheats/pro', PRODUCT_HOME],
  ['/cheats/pro/', PRODUCT_HOME],
  ['/cheats/elite', PRODUCT_HOME],
  ['/cheats/elite/', PRODUCT_HOME],
  ['/product/lite', PRODUCT_HOME],
  ['/product/lite/', PRODUCT_HOME],
  ['/product/pro', PRODUCT_HOME],
  ['/product/pro/', PRODUCT_HOME],
  ['/product/elite', PRODUCT_HOME],
  ['/product/elite/', PRODUCT_HOME],
  ['/sitemap-index.xml', '/sitemap.xml'],
  ['/sitemap-0.xml', '/sitemap.xml'],
]);

for (const [from, to] of [...PATH_REDIRECTS.entries()]) {
  if (from.startsWith('/es/') || from.startsWith('/de/') || from.startsWith('/fr/') || from.startsWith('/en/')) continue;
  if (to === '/sitemap.xml') {
    PATH_REDIRECTS.set(from, to);
    for (const locale of LOCALES) PATH_REDIRECTS.set(`/${locale}${from}`, '/sitemap.xml');
  } else {
    addLocaleRedirects(PATH_REDIRECTS, from, to);
  }
  // /en/ is not a locale prefix. Send it to the final URL in one hop, including the slashed form.
  PATH_REDIRECTS.set(`/en${from}`, to);
  if (!from.endsWith('/')) PATH_REDIRECTS.set(`/en${from}/`, to);
}

/** Paths that should not receive a forced trailing slash. */
export const TRAILING_SLASH_SKIP = /\.[a-z0-9]+$/i;

export function resolvePathRedirect(pathname) {
  const direct = PATH_REDIRECTS.get(pathname);
  if (direct) return direct;

  if (pathname.length > 1 && pathname.endsWith('/')) {
    const unsuffixed = PATH_REDIRECTS.get(pathname.slice(0, -1));
    if (unsuffixed) return unsuffixed;
  }

  if (pathname !== '/' && !pathname.endsWith('/') && !TRAILING_SLASH_SKIP.test(pathname)) {
    return `${pathname}/`;
  }

  return null;
}
