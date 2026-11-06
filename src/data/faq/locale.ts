import type { SiteLocale } from '../../i18n/locales';
import type { SiteFaqItem } from '../faq';
import { localizeInlineHtmlLinks } from '../../utils/localizeHtmlLinks';
import { siteFaqs as siteFaqsEn } from '../faq';
import { getCatalog } from '../catalog';
import { isUtilityEnabled } from '../../config/catalog';
import esFaqRows from './locales/es.json';
import deFaqRows from './locales/de.json';
import frFaqRows from './locales/fr.json';

type FaqLocaleRow = { id: string; q: string; a: string };

const faqOverridesByLocale: Record<Exclude<SiteLocale, 'en'>, FaqLocaleRow[]> = {
  es: esFaqRows as FaqLocaleRow[],
  de: deFaqRows as FaqLocaleRow[],
  fr: frFaqRows as FaqLocaleRow[],
};

function mergeFaqs(locale: SiteLocale): SiteFaqItem[] {
  if (locale === 'en') return siteFaqsEn;
  const rows = faqOverridesByLocale[locale];
  const byId = new Map(rows.map((r) => [r.id, r]));
  return siteFaqsEn.map((item) => {
    const o = byId.get(item.id);
    if (!o) return item;
    return { ...item, q: o.q, a: o.a, aHtml: undefined };
  });
}

function productListHtml(locale: SiteLocale): string {
  const links = getCatalog(locale).map((entry) => `<a href="${entry.path}">${entry.shortName}${locale === 'en' ? ' overview' : ''}</a>`);
  return new Intl.ListFormat(locale, { type: 'conjunction' }).format(links);
}

export function getSiteFaqs(locale: SiteLocale): SiteFaqItem[] {
  const merged = mergeFaqs(locale).filter((item) => (item.requires ?? []).every(isUtilityEnabled));
  const productList = productListHtml(locale);
  return merged.map((item) => ({
    ...item,
    a: localizeInlineHtmlLinks(item.a.replace('{productList}', productList), locale),
  }));
}

export function getLandingFaqs(locale: SiteLocale): SiteFaqItem[] {
  return getSiteFaqs(locale).filter((f) =>
    ['status', 'after-buy', 'ban-risk', 'platforms', 'license-move', 'products-page'].includes(f.id),
  );
}

export function getAllFaqs(locale: SiteLocale): SiteFaqItem[] {
  return getSiteFaqs(locale).filter((f) => f.topic !== 'all');
}

export function getProductFaqs(
  locale: SiteLocale,
  slug: string,
  kind: 'tier' | 'utility',
): SiteFaqItem[] {
  const siteFaqsLocalized = getSiteFaqs(locale);
  // Unscoped items are written for the cheat, so utility pages only show their own scoped FAQs.
  const general = siteFaqsLocalized.filter(
    (f) => kind === 'tier' && !f.scopes && ['setup', 'safety', 'plans', 'esp', 'aim'].includes(f.topic),
  );
  const scoped = siteFaqsLocalized.filter((f) => f.scopes?.includes(slug));
  const tierCompare = siteFaqsLocalized.filter((f) =>
    ['build-status', 'vac-update', 'who-cheats'].includes(f.id),
  );

  const combined =
    kind === 'tier'
      ? [...scoped, ...tierCompare, ...general.slice(0, 8)]
      : [...scoped, ...general.slice(0, 6)];

  const seen = new Set<string>();
  return combined.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
