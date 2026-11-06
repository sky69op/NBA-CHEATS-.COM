import type { SiteLocale } from '../i18n/locales';

/** Blog/forum titles and descriptions live on each post; optional overrides can be added here later. */
export function editorialSeo(_slug: string, _locale: SiteLocale): { title: string; description: string } | undefined {
  return undefined;
}
