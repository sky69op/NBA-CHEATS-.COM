import { SITE_DOMAIN as SITE_DOMAIN_VALUE } from './site-url.mjs';

export const SITE_DOMAIN = SITE_DOMAIN_VALUE;
export const SITE_URL = `https://${SITE_DOMAIN}`;
/** Public brand string (header, legal, schema). Override via env when re-skinning the template. */
const publicSiteName =
  typeof import.meta !== 'undefined'
    ? (import.meta.env?.PUBLIC_SITE_NAME as string | undefined)
    : undefined;

export const SITE_NAME = publicSiteName?.trim() || 'NBA2K27 Cheats';
export const PRODUCT_BASE = '/cheats/';
export const HWID_SPOOFER_PATH = '/hwid-spoofer/';
export const UGC_PATH = '/ugc/';
export const CLOUD_DMA_PATH = '/cloud-dma/';
/** Catalog page listing every product; each card links to its detail page. */
export const PRODUCTS_HUB_PATH = '/products/';
/** Cloaked shop path for tickets/orders (must match `partnerShop` in checkout-redirects / checkout.ts). */
export const SUPPORT_CHECKOUT_PATH = '/go/shop/';
/** Absolute URL for schema or rare raw links; prefer internal cloaked path in visible UI. */
export const SUPPORT_SHOP_URL = `${SITE_URL}${SUPPORT_CHECKOUT_PATH}`;
/** Empty by design: ticketing uses the shop portal, not a claimed email address on this domain. */
export const SUPPORT_EMAIL = '';
