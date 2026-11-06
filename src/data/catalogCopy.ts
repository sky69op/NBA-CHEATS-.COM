import { CHEATS_PRIMARY_SLUG, CLOUD_DMA_SLUG, HWID_SPOOFER_SLUG, UGC_SLUG } from '../config/catalog';
import type { SiteLocale } from '../i18n/locales';
import { deepApplySiteTokens } from '../i18n/brandTokens';
import es from './catalogCopy/locales/es.json';
import de from './catalogCopy/locales/de.json';
import fr from './catalogCopy/locales/fr.json';

/** UI copy for the /products/ catalog page and the header products menu. */
export interface CatalogCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  trust: string[];
  featuredEyebrow: string;
  from: string;
  priceLabel: string;
  lifetime: string;
  perMonth: string;
  utilitiesEyebrow: string;
  utilitiesTitle: string;
  utilitiesDesc: string;
  chooserEyebrow: string;
  chooserTitle: string;
  chooserDesc: string;
  scenarios: { slug: string; need: string; answer: string }[];
  compareEyebrow: string;
  compareTitle: string;
  compareDesc: string;
  compareRows: { label: string; values: Record<string, string> }[];
  ctaTitle: string;
  ctaDesc: string;
  ctaSupport: string;
  menuHeading: string;
  menuViewAll: string;
  menuTaglines: Record<string, string>;
}

const en: CatalogCopy = {
  eyebrow: 'Store',
  title: 'Products for NBA 2K27: cheats and utilities',
  subtitle:
    'Four products for {gameName}. Compare the stated scope, plans, and requirements before checkout.',
  trust: ['Separate product purposes', 'Monthly or lifetime plans', 'Selected-plan checkout', 'Scope confirmation required'],
  featuredEyebrow: 'Main product',
  from: 'From',
  priceLabel: 'Price',
  lifetime: 'Lifetime',
  perMonth: '/ month',
  utilitiesEyebrow: 'Utilities',
  utilitiesTitle: 'Separate products to review',
  utilitiesDesc: 'Each utility has its own purpose, plan terms, limits, and checkout. Do not infer one product’s requirements from another.',
  chooserEyebrow: 'Not sure?',
  chooserTitle: 'Which product do I need?',
  chooserDesc: 'Start with the product purpose, then confirm the current listing scope before checkout.',
  scenarios: [
    { slug: CHEATS_PRIMARY_SLUG, need: 'I want to review the game-specific NBA2K27 CHEATS listing and current product details.', answer: '{cheatProduct}' },
    { slug: HWID_SPOOFER_SLUG, need: 'I want to review a separate HWID utility, while confirming its actual scope and NBA 2K27 applicability.', answer: 'HWID Spoofer' },
    { slug: UGC_SLUG, need: 'I need an account-appeal product and understand that a platform decides the outcome.', answer: 'UGC' },
    { slug: CLOUD_DMA_SLUG, need: 'I need to confirm current Cloud DMA requirements and functionality on the product page.', answer: 'Cloud DMA' },
  ],
  compareEyebrow: 'Compare',
  compareTitle: 'Compare products side by side',
  compareDesc: 'Compare plan terms and stated purpose. Requirements, delivery, and compatibility must be confirmed from the current product listing.',
  compareRows: [
    {
      label: 'Best for',
      values: {
        [CHEATS_PRIMARY_SLUG]: 'NBA 2K27 product research',
        [HWID_SPOOFER_SLUG]: 'Separate hardware-utility research',
        [UGC_SLUG]: 'Account-appeal product research',
        [CLOUD_DMA_SLUG]: 'Cloud DMA product research',
      },
    },
    {
      label: 'Delivery',
      values: {
        [CHEATS_PRIMARY_SLUG]: 'Confirm at checkout',
        [HWID_SPOOFER_SLUG]: 'Confirm at checkout',
        [UGC_SLUG]: 'Confirm at checkout',
        [CLOUD_DMA_SLUG]: 'Confirm at checkout',
      },
    },
    {
      label: 'Windows',
      values: {
        [CHEATS_PRIMARY_SLUG]: 'Not supplied',
        [HWID_SPOOFER_SLUG]: 'Not supplied',
        [UGC_SLUG]: 'Not supplied',
        [CLOUD_DMA_SLUG]: 'Not supplied',
      },
    },
    {
      label: 'Security settings',
      values: {
        [CHEATS_PRIMARY_SLUG]: 'Confirm at checkout',
        [HWID_SPOOFER_SLUG]: 'Confirm at checkout',
        [UGC_SLUG]: 'Confirm at checkout',
        [CLOUD_DMA_SLUG]: 'Confirm at checkout',
      },
    },
  ],
  ctaTitle: 'Still deciding?',
  ctaDesc: 'Use support to confirm a product’s current scope, requirements, and plan terms before payment.',
  ctaSupport: 'Ask support',
  menuHeading: 'Products',
  menuViewAll: 'Compare all products',
  menuTaglines: {
    [CHEATS_PRIMARY_SLUG]: 'NBA 2K27 plan and product research',
    [HWID_SPOOFER_SLUG]: 'HWID scope to confirm',
    [UGC_SLUG]: 'Account-appeal context',
    [CLOUD_DMA_SLUG]: 'Cloud DMA requirements to confirm',
  },
};

const byLocale: Record<SiteLocale, CatalogCopy> = {
  en,
  es: es as CatalogCopy,
  de: de as CatalogCopy,
  fr: fr as CatalogCopy,
};

const finalized = Object.fromEntries(
  Object.entries(byLocale).map(([locale, copy]) => [locale, deepApplySiteTokens(copy)]),
) as Record<SiteLocale, CatalogCopy>;

export function getCatalogCopy(locale: SiteLocale): CatalogCopy {
  return finalized[locale];
}
