import type { SiteLocale } from '../i18n/locales';
import { localizePath } from '../i18n/paths';
import { applySiteTokens } from '../i18n/brandTokens';
import { normalizeInternalPath } from './path';

/** Rewrites root-relative `href="/.."` in FAQ/legal HTML to the active locale prefix. */
export function localizeInlineHtmlLinks(html: string, locale: SiteLocale): string {
  const withLinks = html.replace(/href="([^"]+)"/g, (full, href: string) => {
 if (!href.startsWith('/') || href.startsWith('/go/')) return full;
 const hashIndex = href.indexOf('#');
 const pathPart = hashIndex >= 0 ? href.slice(0, hashIndex): href;
 const hash = hashIndex >= 0 ? href.slice(hashIndex): '';
 const normalized = normalizeInternalPath(pathPart);
 const localized = localizePath(normalized, locale);
 return `href="${localized}${hash}"`;
 });
 return applySiteTokens(withLinks);
}
