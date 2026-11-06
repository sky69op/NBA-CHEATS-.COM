import type { FooterLink, NavLink, Translations } from './types';
import { DEFAULT_LOCALE, isSiteLocale, type SiteLocale } from './locales';
import { localizePath } from './paths';
import { finalizeLocaleDictionary } from './brandTokens';
import { en } from './en';
import esDictionary from './dictionaries/es.json';
import deDictionary from './dictionaries/de.json';
import frDictionary from './dictionaries/fr.json';
import esPageSeo from './pageSeo/es.json';
import dePageSeo from './pageSeo/de.json';
import frPageSeo from './pageSeo/fr.json';

/** Support link targets (including checkout) come from `en`, which reads them from config. */
function withEnglishSupportHrefs(dict: Omit<Translations, 'pageSeo'>): Omit<Translations, 'pageSeo'> {
  return {
    ...dict,
    support: {
      ...dict.support,
      channels: dict.support.channels.map((channel, i) => ({
        ...channel,
        href: en.support.channels[i]?.href ?? channel.href,
      })),
    },
  };
}

function mergeFooterLinks(enLinks: FooterLink[], localized: FooterLink[]): FooterLink[] {
  const byHref = new Map(localized.map((link) => [link.href, link]));
  return enLinks.map((link) => {
    const loc = byHref.get(link.href);
    if (!loc) return link;
    return {
      ...link,
      label: loc.label,
      ariaLabel: loc.ariaLabel ?? link.ariaLabel,
      scrollTarget: loc.scrollTarget ?? link.scrollTarget,
      external: loc.external ?? link.external,
    };
  });
}

function mergeExploreNavLinks(enLinks: NavLink[], localized: NavLink[]): NavLink[] {
  const byHref = new Map(localized.map((link) => [link.href, link]));
  return enLinks.map((link) => {
    const loc = byHref.get(link.href);
    if (!loc) return link;
    return {
      ...link,
      label: loc.label,
      ariaLabel: loc.ariaLabel ?? link.ariaLabel,
      scrollTarget: loc.scrollTarget ?? link.scrollTarget,
      shortLabel: loc.shortLabel ?? link.shortLabel,
      sheetLabel: loc.sheetLabel ?? link.sheetLabel,
    };
  });
}

/** Keep footer column links aligned with English routes on every locale (Part 3 defect fix). */
function withSharedFooterExplore(dict: Omit<Translations, 'pageSeo'>): Omit<Translations, 'pageSeo'> {
  const locFooter = dict.footer;
  return {
    ...dict,
    footer: {
      ...locFooter,
      exploreLinks: mergeExploreNavLinks(en.footer.exploreLinks, locFooter.exploreLinks),
      productLinks: mergeFooterLinks(en.footer.productLinks, locFooter.productLinks),
      guideLinks: mergeFooterLinks(en.footer.guideLinks, locFooter.guideLinks),
      helpLinks: mergeFooterLinks(en.footer.helpLinks, locFooter.helpLinks),
      officialLinks: mergeFooterLinks(en.footer.officialLinks, locFooter.officialLinks),
    },
  };
}

function localizedCommercial(
  dict: Omit<Translations, 'pageSeo'>,
  pageSeo: Translations['pageSeo'],
): Translations {
  return finalizeLocaleDictionary({
    ...withSharedFooterExplore(withEnglishSupportHrefs(dict)),
    pageSeo,
  });
}

const dictionaries: Record<SiteLocale, Translations> = {
  en: finalizeLocaleDictionary(en),
  es: localizedCommercial(esDictionary as Omit<Translations, 'pageSeo'>, esPageSeo as Translations['pageSeo']),
  de: localizedCommercial(deDictionary as Omit<Translations, 'pageSeo'>, dePageSeo as Translations['pageSeo']),
  fr: localizedCommercial(frDictionary as Omit<Translations, 'pageSeo'>, frPageSeo as Translations['pageSeo']),
};

export function getTranslations(locale: string | undefined): Translations {
  if (locale && isSiteLocale(locale)) return dictionaries[locale];
  return dictionaries[DEFAULT_LOCALE];
}

/** Locale + dictionary + path localizer for Astro frontmatter. */
export function useLocale(currentLocale: string | undefined) {
  const locale = (currentLocale && isSiteLocale(currentLocale) ? currentLocale : DEFAULT_LOCALE) as SiteLocale;
  const t = getTranslations(locale);
  const lp = (path: string) => localizePath(path, locale);
  return { locale, t, lp };
}

export type { Translations } from './types';
export type { NavId, NavLink } from './types';
export { LOCALES, DEFAULT_LOCALE, type SiteLocale } from './locales';
export { localizePath, stripLocalePrefix, getLocalizedPath, localeFromPathname } from './paths';
