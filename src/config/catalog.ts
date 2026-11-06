/**
 * Product lineup and routing. Converting the template to another game:
 *
 * 1. Set the game in `src/config/game.ts` and the brand/domain in `src/config/site.ts` / `site-url.mjs`.
 * 2. Pick the utilities this site sells in `UTILITY_PRODUCT_SLUGS` below. Removing a slug drops its
 *    page, menu and footer links, cards, comparison column, FAQs and sitemap URL.
 * 3. Point checkout links at the right destinations in `src/config/checkout-redirects.mjs`.
 * 4. Rewrite the game-specific copy: cheat product (`src/i18n/en.ts` `cheats`, `src/data/products.ts`
 *    `elite`), homepage sections, page SEO, blog and forum posts, plus their es/de/fr JSON files.
 *    Utility copy is game-neutral and reads the game name from `src/config/game.ts`.
 */
import { CLOUD_DMA_PATH, PRODUCT_BASE, HWID_SPOOFER_PATH, PRODUCTS_HUB_PATH, UGC_PATH } from './site';

export { CLOUD_DMA_PATH, PRODUCT_BASE, HWID_SPOOFER_PATH, PRODUCTS_HUB_PATH, UGC_PATH };

/** Primary cheat product served at `PRODUCT_BASE` (store page). */
export const CHEATS_PRIMARY_SLUG = 'elite' as const;

/** Cheat slugs referenced in copy and checkout, only the store slug is a public page. */
export const CHEAT_PRODUCT_SLUGS = [CHEATS_PRIMARY_SLUG] as const;

/** @deprecated Use `CHEAT_PRODUCT_SLUGS`, kept for scripts that expect `PRODUCT_SLUGS`. */
export const PRODUCT_SLUGS = CHEAT_PRODUCT_SLUGS;

export const HWID_SPOOFER_SLUG = 'hwid-spoofer';
export const UGC_SLUG = 'ugc';
export const CLOUD_DMA_SLUG = 'cloud-dma';

/** Every utility the template has copy for. */
export const ALL_UTILITY_PRODUCT_SLUGS = [HWID_SPOOFER_SLUG, CLOUD_DMA_SLUG, UGC_SLUG] as const;
export type UtilityProductSlug = (typeof ALL_UTILITY_PRODUCT_SLUGS)[number];

/** Utilities this site sells, in display order. */
export const UTILITY_PRODUCT_SLUGS: readonly UtilityProductSlug[] = [HWID_SPOOFER_SLUG, CLOUD_DMA_SLUG, UGC_SLUG];

export const UTILITY_PRODUCT_PATHS: Record<UtilityProductSlug, string> = {
  [HWID_SPOOFER_SLUG]: HWID_SPOOFER_PATH,
  [UGC_SLUG]: UGC_PATH,
  [CLOUD_DMA_SLUG]: CLOUD_DMA_PATH,
};

export function isUtilityEnabled(slug: string): boolean {
  return (UTILITY_PRODUCT_SLUGS as readonly string[]).includes(slug);
}

function stripLocale(path: string): string {
  return path.replace(/^\/(es|de|fr)(?=\/)/, '');
}

/** False for links to a utility page or checkout that this site does not sell. */
export function isProductHrefEnabled(href: string): boolean {
  const path = stripLocale(href.split(/[?#]/)[0]);
  for (const slug of ALL_UTILITY_PRODUCT_SLUGS) {
    if (isUtilityEnabled(slug)) continue;
    const page = UTILITY_PRODUCT_PATHS[slug];
    if (path === page || path === page.replace(/\/$/, '') || path.startsWith(`/go/${slug}`)) return false;
  }
  return true;
}
