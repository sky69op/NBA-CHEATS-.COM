import { BRAND_LOGO_ALT } from './brand';
import type { SiteLocale } from '../i18n/locales';

/** The shared logo depicts the same artwork on every route; route keywords do not describe it. */
export function resolveBrandLogoAlt(pathname: string, _locale: SiteLocale = 'en'): string {
  const path = pathname.replace(/^\/(?:es|de|fr)(?=\/)/, '');
  const keyword = path === '/' ? 'NBA2K27 Cheats'
    : path === '/products/' ? 'Products'
    : path === '/about/' ? 'Notes'
    : path === '/blog/' ? 'Guides'
    : path === '/forum/' ? 'Forum'
    : path === '/faq/' ? 'FAQ'
    : path === '/support/' ? 'Support'
    : path.includes('cloud-dma') ? 'Cloud DMA'
    : path.includes('nba-2k27') ? 'NBA 2K27'
    : '';
  return keyword ? `${keyword} – ${BRAND_LOGO_ALT}` : BRAND_LOGO_ALT;
}
