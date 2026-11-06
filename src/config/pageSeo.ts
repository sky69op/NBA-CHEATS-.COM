/**
 * Central titles/descriptions for high-traffic routes.
 * English source: `src/i18n/en.ts` → `pageSeo`. Locales: `src/i18n/pageSeo/{es,de,fr}.json`.
 */

import { getTranslations } from '../i18n';
import { stripLocalePrefix } from '../i18n/paths';

export interface PageSeoEntry {
  title: string;
  description: string;
}

export function normalizeSeoPath(pathname: string): string {
  let path = pathname || '/';
  if (!path.startsWith('/')) path = `/${path}`;
  if (path !== '/' && !path.endsWith('/')) path = `${path}/`;
  return path;
}

export function getPageSeoEntry(pathname: string, locale?: string): PageSeoEntry | undefined {
  const basePath = normalizeSeoPath(stripLocalePrefix(pathname));
  const loc = locale && locale.length ? locale : 'en';
  const localized = getTranslations(loc).pageSeo[basePath];
  if (localized) return localized;
  return getTranslations('en').pageSeo[basePath];
}
