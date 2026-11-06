/** Bump when replacing `public/images/brand/brand-logo.webp` so browsers refetch variants. */
export const BRAND_LOGO_ASSET_VERSION = 9;

/** Site logo paths under `public/images/brand/` (generated from supplied brand artwork). */
export const BRAND_LOGO_MASTER = `/images/brand/brand-logo.webp?v=${BRAND_LOGO_ASSET_VERSION}`;

/** Used in Organization / publisher schema (≥112px recommended). */
export const BRAND_LOGO_SCHEMA = `/images/brand/brand-logo-512.webp?v=${BRAND_LOGO_ASSET_VERSION}`;

/** Describes the artwork only, no store or vendor name. */
export const BRAND_LOGO_ALT =
  'Original violet basketball-orbit emblem with an abstract 27 motif on a transparent background.';
