import type { SiteLocale } from './locales';

/** BCP 47 tags for HTML `lang`, Open Graph, and JSON-LD `inLanguage`. */
export const LOCALE_LANGUAGE_TAGS: Record<SiteLocale, string> = {
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
  fr: 'fr-FR',
};

export function schemaLanguage(locale: SiteLocale | string | undefined): string {
  if (locale && locale in LOCALE_LANGUAGE_TAGS) {
    return LOCALE_LANGUAGE_TAGS[locale as SiteLocale];
  }
  return LOCALE_LANGUAGE_TAGS.en;
}
