import type { IconName } from '../components/icons/types';
import { CHEATS_PRIMARY_SLUG, CLOUD_DMA_SLUG, HWID_SPOOFER_SLUG, UGC_SLUG } from '../config/catalog';
import { CHEAT_PRODUCT_NAME } from '../config/game';
import type { SiteLocale } from '../i18n/locales';
import { productPath } from '../utils/path';
import { getProductPages, type ProductPage } from './products';
import { getProductPlans } from './productPricing';

export interface CatalogEntry {
  slug: string;
  path: string;
  icon: IconName;
  /** Compact name for menus and comparison headers. */
  shortName: string;
  page: ProductPage;
  fromPriceUsd: number;
  lifetimePriceUsd?: number;
}

const catalogMeta: Record<string, { icon: IconName; shortName: string }> = {
  [CHEATS_PRIMARY_SLUG]: { icon: 'tierElite', shortName: CHEAT_PRODUCT_NAME },
  [HWID_SPOOFER_SLUG]: { icon: 'systemUtility', shortName: 'HWID Spoofer' },
  [UGC_SLUG]: { icon: 'accountRecovery', shortName: 'UGC' },
  [CLOUD_DMA_SLUG]: { icon: 'dmaHardware', shortName: 'Cloud DMA' },
};

export function getCatalog(locale: SiteLocale): CatalogEntry[] {
  return getProductPages(locale).map((page) => {
    const plans = getProductPlans(page.slug);
    const meta = catalogMeta[page.slug] ?? { icon: 'package' as IconName, shortName: page.title };
    return {
      slug: page.slug,
      path: productPath(page.slug),
      icon: meta.icon,
      shortName: meta.shortName,
      page,
      fromPriceUsd:
        plans.find((plan) => plan.id === 'monthly')?.priceUsd ??
        Math.min(...plans.map((plan) => plan.priceUsd)),
      lifetimePriceUsd: plans.find((plan) => plan.id === 'lifetime')?.priceUsd,
    };
  });
}
