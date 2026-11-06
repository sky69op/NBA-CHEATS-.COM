/** Locales aligned with astro.config.mjs i18n.locales. Language switcher iterates LOCALES + current pathname, no per-URL lists. */
export const DEFAULT_LOCALE = 'en' as const;

export const LOCALES = ['en', 'es', 'de', 'fr'] as const;

export type SiteLocale = (typeof LOCALES)[number];

/** Locales that use a URL prefix (all except default English). */
export const PREFIXED_LOCALES = ['es', 'de', 'fr'] as const;

export type PrefixedLocale = (typeof PREFIXED_LOCALES)[number];

export function isSiteLocale(value: string): value is SiteLocale {
  return (LOCALES as readonly string[]).includes(value);
}

export function isPrefixedLocale(value: string): value is PrefixedLocale {
  return (PREFIXED_LOCALES as readonly string[]).includes(value);
}
