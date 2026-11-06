import {
  ALL_UTILITY_PRODUCT_SLUGS,
  CHEAT_PRODUCT_SLUGS,
  CHEATS_PRIMARY_SLUG,
  HWID_SPOOFER_SLUG,
  CLOUD_DMA_SLUG,
  UGC_SLUG,
  UTILITY_PRODUCT_PATHS,
  UTILITY_PRODUCT_SLUGS,
  type UtilityProductSlug,
} from '../config/catalog';
import { PRODUCT_BASE } from '../config/site';
import { CHEAT_PRODUCT_NAME } from '../config/game';
import { getTranslations } from '../i18n';
import { deepApplySiteTokens } from '../i18n/brandTokens';
import type { SiteLocale } from '../i18n/locales';
import type { Translations } from '../i18n/types';
import { checkoutForSlug } from '../config/checkout';
import { SHOWCASE_GALLERY_KEYS } from '../config/gameplayMedia';
import { HWID_GALLERY_KEYS } from '../config/hwidMedia';
import type { IconName } from '../components/icons/types';
import { getProductCopyBundle, registerProductCopyBundle, type ProductCopyBundle } from './products/exportCopy';
import esProductCopy from './products/locales/es.json';
import deProductCopy from './products/locales/de.json';
import frProductCopy from './products/locales/fr.json';

export interface ProductSlide {
  /** Still image, or the poster frame when `videoSrc` is set. */
  src: string;
  alt: string;
  caption: string;
  captionDesc: string;
  width?: number;
  height?: number;
  /** `image` unless a clip is attached. */
  kind?: 'image' | 'video';
  /** MP4 or WebM. The slider shows this instead of the still; `src` stays the poster. */
  videoSrc?: string;
}

export interface ProductOverview {
  title: string;
  paragraphs: string[];
}

export interface AcquisitionStep {
  num: string;
  title: string;
  desc: string;
}

export interface ProductAcquisition {
  title: string;
  steps: AcquisitionStep[];
}

export interface SystemRequirement {
  icon: IconName;
  text: string;
}

export interface ProductPage {
  slug: string;
  kind: 'tier' | 'utility';
  badge: string;
  category?: string;
  tier?: string;
  name: string;
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  more: number;
  variant?: 'essential' | 'popular' | 'limited';
  buyUrl: string;
  images: ProductSlide[];
  overview: ProductOverview;
  acquisition: ProductAcquisition;
  goodToKnow: string;
  limitations: string;
  fullFeatures: string[];
  systemRequirements: SystemRequirement[];
  about?: { type: 'h2' | 'p'; text: string }[];
  body: { type: 'h2' | 'p'; text: string }[];
  relatedBlogSlugs: string[];
  relatedForumSlugs: string[];
}

/** Guides paired with each product detail page */
export const productRelatedBlogSlugs: Record<string, string[]> = {
  elite: [
    'nba-2k27-auto-green-cheats-explained',
    'nba-2k27-cheat-menu-features-guide',
    'nba-2k27-attribute-changer-claims',
    'nba-2k27-esp-and-visibility-cheat-terms',
    'nba-2k27-cheats-monthly-vs-lifetime',
    'nba-2k27-cheat-provider-checklist',
    'nba-2k27-official-sources-before-cheats-research',
  ],
  'hwid-spoofer': [
    'nba-2k27-hwid-spoofer-questions',
    'nba-2k27-hwid-ban-vs-account-ban',
    'nba-2k27-cheat-safety-claims',
  ],
  ugc: [
    'ugc-nba-2k27-account-appeal-guide',
    'ugc-nba-2k27-appeal-evidence-checklist',
  ],
  'cloud-dma': [
    'cloud-dma-nba-2k27-product-questions',
    'cloud-dma-vs-hwid-spoofer-nba-2k27',
  ],
};

/** Community threads paired with each product detail page */
export const productRelatedForumSlugs: Record<string, string[]> = {
  elite: [
    'nba-2k27-auto-green-meaning',
    'nba-2k27-cheat-menu-question',
    'nba-2k27-esp-meaning',
    'nba-2k27-patch-status-question',
  ],
  'hwid-spoofer': ['nba-2k27-hwid-error-question', 'nba-2k27-hwid-account-question'],
  ugc: ['ugc-nba-2k27-appeal-question', 'ugc-evidence-question'],
  'cloud-dma': [
    'cloud-dma-nba-2k27-question',
    'cloud-dma-vs-hwid-question',
  ],
};

const productBase = PRODUCT_BASE;

const hwidAcquisitionSteps: AcquisitionStep[] = [
  {
    num: '01',
    title: 'Check the current scope',
    desc: 'No NBA 2K27 applicability, hardware requirement, or supported-environment evidence was supplied for HWID Spoofer. Ask support for current written details before purchase.',
  },
  {
    num: '02',
    title: 'Pick a stated plan',
    desc: 'Monthly is $50 for 30 days. Lifetime is $150. Confirm what the lifetime label includes with support; price alone does not establish updates or future support.',
  },
  {
    num: '03',
    title: 'Confirm requirements first',
    desc: 'Do not assume that Windows settings, hardware, or game platform requirements from another product apply here. Obtain current requirements from support.',
  },
  {
    num: '04',
    title: 'Use product documentation',
    desc: 'Follow only the our current documentation if you choose to proceed. This page does not promise a result for an account, device, or NBA 2K27 session.',
  },
];

const ugcAcquisitionSteps: AcquisitionStep[] = [
  {
    num: '01',
    title: 'Understand UGC’s purpose',
    desc: 'UGC means Unban & Governance Control. It is an account-appeal product, not a hardware-ID product and not a diagnosis of a particular restriction.',
  },
  {
    num: '02',
    title: 'Select a stated plan',
    desc: 'Monthly is $35 for 30 days. Lifetime is $150. Confirm the current plan terms before payment.',
  },
  {
    num: '03',
    title: 'Prepare accurate records',
    desc: 'Keep the account notice, relevant dates, and any documentation requested by the platform or support. The supplied intake does not establish a software requirement.',
  },
  {
    num: '04',
    title: 'Confirm the appeal process',
    desc: 'The relevant platform decides any appeal. UGC is not presented as a guarantee of account recovery or a bypass of platform controls.',
  },
];

const cloudDmaAcquisitionSteps: AcquisitionStep[] = [
  {
    num: '01',
    title: 'Request current requirements',
    desc: 'No Cloud DMA reference or NBA 2K27 applicability evidence was supplied. Request the our current requirements before checkout.',
  },
  {
    num: '02',
    title: 'Choose a term',
    desc: 'Monthly access is $35 for 30 days. Lifetime access is $150. Confirm the current checkout terms and what lifetime access covers before purchase.',
  },
  {
    num: '03',
    title: 'Do not infer a setup',
    desc: 'This site does not state a platform, Windows version, virtualization setting, or hardware requirement for Cloud DMA. Use current product documentation only.',
  },
  {
    num: '04',
    title: 'Use the current product instructions',
    desc: 'Cloud DMA is not represented here as a guarantee of compatibility, access, or policy compliance. Review the current product documentation before proceeding.',
  },
];

const defaultAcquisitionSteps: AcquisitionStep[] = [
  {
    num: '01',
    title: 'Read current product details',
    desc: 'Read the listing before payment and revisit it after any NBA 2K27 or product update.',
  },
  {
    num: '02',
    title: 'Choose the matching product',
    desc: 'Choose NBA2K27 CHEATS or a separate utility only after reading its stated scope and limitations. Do not treat different products as interchangeable.',
  },
  {
    num: '03',
    title: 'Contact the team',
    desc: 'Write to support with the order email ready if you need availability, Windows setup, or payment details confirmed.',
  },
  {
    num: '04',
    title: 'Follow guided setup',
    desc: 'Follow the our current documentation after payment. Ask support to clarify missing setup, compatibility, or availability details.',
  },
];

function acquisitionFor(productName: string): ProductAcquisition {
  return {
    title: `How to get ${productName}`,
    steps: defaultAcquisitionSteps,
  };
}

const sharedGoodToKnow =
  'NBA 2K27 and listing details can change. Read the current listing on {siteDomain} before payment; this page does not assert current compatibility or status.';

const sharedLimitations =
  'Third-party software can carry account or platform risk. This site does not promise safety, detection resistance, compatibility, availability, or a particular account outcome.';

const mainProductSystemRequirements: SystemRequirement[] = [
  { icon: 'reqWindows', text: 'Confirm current listed requirements before purchase.' },
  { icon: 'reqSettings', text: 'Confirm NBA 2K27 applicability and product status with support.' },
];

const galleryRaw = {
  gpCombatMenu: {
    width: 1330,
    height: 840,
    src: '/images/nba-2k27/nba2k27-main.webp',
    alt: 'Supplied NBA 2K27 product visual showing a Main panel.',
    caption: 'Supplied Main panel',
    captionDesc: 'Owner-supplied product visual. It is not independent evidence that any displayed option is currently available or compatible.',
  },
  gpVisualsMenu: {
    width: 1330,
    height: 840,
    src: '/images/nba-2k27/nba2k27-attributes.webp',
    alt: 'Supplied NBA 2K27 product visual showing an Attributes panel.',
    caption: 'Supplied Attributes panel',
    captionDesc: 'Owner-supplied product visual. Confirm current functionality, availability, and game applicability with support.',
  },
  gpAimMenu: {
    width: 1330,
    height: 840,
    src: '/images/nba-2k27/nba2k27-misc.webp',
    alt: 'Supplied NBA 2K27 product visual showing a Misc panel.',
    caption: 'Supplied Misc panel',
    captionDesc: 'Owner-supplied product visual. The image does not establish a safety, compatibility, or account-outcome claim.',
  },
} satisfies Record<
  string,
  {
    src: string;
    alt: string;
    caption: string;
    captionDesc: string;
    width: number;
    height: number;
    videoSrc?: string;
  }
>;

type GalleryKey = keyof typeof galleryRaw;

function slide(...keys: GalleryKey[]): ProductSlide[] {
  return keys.map((key) => {
    const item: ProductSlide = galleryRaw[key];
    if (!item) throw new Error(`Missing gallery key: ${String(key)}`);
    const { src, alt, caption, captionDesc, width, height, videoSrc } = item;
    return {
      src,
      alt,
      caption,
      captionDesc,
      width,
      height,
      ...(videoSrc ? { videoSrc, kind: 'video' as const } : {}),
    };
  });
}

const showcaseSlides = slide(...SHOWCASE_GALLERY_KEYS);

/** Product-detail/catalog-only image. It is deliberately not part of the homepage hero slider. */
const eliteProductSlides: ProductSlide[] = [
  {
    src: '/images/nba-2k27/nba2k27-main-product-card.png',
    width: 1672,
    height: 941,
    alt: 'Original violet basketball and hoop illustration for NBA2K27 Cheats.',
    caption: 'NBA2K27 Cheats',
    captionDesc: 'Original illustrative product artwork; it does not represent a game screen or product functionality.',
  },
  ...showcaseSlides,
];

const hwidGalleryRaw = {
  hwidSerialCheck: {
    src: '/images/hwid-spoofer/hwid-spoofer-serial-check-panel.webp',
    width: 1024,
    height: 576,
    alt: 'Device window listing DISK, MOBO, Display, UUID, GPU, and Network as changed or unchanged.',
    caption: 'Serial check rows',
    captionDesc: 'After a spoof cycle, each row says whether that hardware value changed.',
  },
  hwidUefiSpoof: {
    src: '/images/hwid-spoofer/hwid-spoofer-uefi-spoof-panel.webp',
    width: 1024,
    height: 576,
    alt: 'Device window with Permanent Spoof, GPU spoof on, ethernet spoof off, and a seed field.',
    caption: 'Firmware controls',
    captionDesc: 'From this firmware screen you can switch GPU or ethernet spoofing, type a seed, and apply a permanent change.',
  },
} satisfies Record<
  string,
  { src: string; alt: string; caption: string; captionDesc: string; width: number; height: number; videoSrc?: string }
>;

type HwidGalleryKey = keyof typeof hwidGalleryRaw;

function hwidSlide(...keys: HwidGalleryKey[]): ProductSlide[] {
  return keys.map((key) => {
    const item: ProductSlide = hwidGalleryRaw[key];
    const { src, alt, caption, captionDesc, width, height, videoSrc } = item;
    return {
      src,
      alt,
      caption,
      captionDesc,
      width,
      height,
      ...(videoSrc ? { videoSrc, kind: 'video' as const } : {}),
    };
  });
}

const hwidShowcaseSlides = hwidSlide(...HWID_GALLERY_KEYS);

const ugcShowcaseSlides: ProductSlide[] = [
  {
    src: '/images/ugc/ugc.webp',
    width: 960,
    height: 540,
    alt: 'UGC product mark: a crimson gear, a clock face, and speed lines.',
    caption: 'UGC mark',
    captionDesc: 'The mark stands in for the template library and the dispute runners used on limited profiles.',
  },
];

const cloudDmaShowcaseSlides: ProductSlide[] = [
  {
    src: '/images/nba-2k27/cloud-dma-concept-v2.png',
    width: 1672,
    height: 941,
    alt: 'Conceptual purple cloud infrastructure illustration above a single desktop computer.',
    caption: 'Conceptual Cloud DMA illustration',
    captionDesc: 'AI-generated illustrative infrastructure artwork, not a product screen or evidence of functionality.',
  },
];

function slugFromHref(href: string): string {
  const normalized = href.replace(/^\//, '').replace(/\/$/, '');
  for (const slug of ALL_UTILITY_PRODUCT_SLUGS) {
    if (normalized === slug || normalized.endsWith(`/${slug}`)) return slug;
  }
  const segment = href.replace(productBase, '').replace(/^\//, '').replace(/\/$/, '');
  if (!segment || segment === 'cheats' || segment === 'product') {
    return CHEATS_PRIMARY_SLUG;
  }
  return segment;
}

const tierAbout: Record<string, ProductPage['about']> = {
  elite: [
    {
      type: 'p',
      text: 'NBA2K27 CHEATS is the supplied game-specific product. This page records confirmed plan terms and directs readers to the current listing for any feature, mode, compatibility, or availability details.',
    },
    { type: 'h2', text: 'What to confirm before checkout' },
    {
      type: 'p',
      text: 'Ask support whether the product currently applies to NBA 2K27, which platforms or modes it covers, what is required, and what the selected plan includes. This site does not infer those answers from an inherited template.',
    },
  ],
};

const tierBodies: Record<string, ProductPage['body']> = {
  elite: [
    { type: 'h2', text: 'Plans and checkout' },
    {
      type: 'p',
      text: 'Monthly access is $35 for 30 days. Lifetime access is $150. The purchase button passes the selected plan through the secure checkout redirect. Confirm delivery, support, and lifetime coverage with support before payment.',
    },
    { type: 'h2', text: 'Compatibility and risk' },
    {
      type: 'p',
      text: 'NBA 2K27, platform rules, and third-party product details can change. This page does not promise a product is compatible, undetected, permitted, or free from account consequences.',
    },
  ],
};

const utilityBodies: Record<string, ProductPage['body']> = {
  'hwid-spoofer': [
    { type: 'h2', text: 'A separate product with unanswered scope questions' },
    {
      type: 'p',
      text: 'HWID Spoofer is not presented as a solution for a particular NBA 2K27 issue. The supplied intake confirms its checkout destination and plan prices, not its current hardware scope, game applicability, supported systems, or outcomes.',
    },
    { type: 'h2', text: 'What this page does not claim' },
    {
      type: 'p',
      text: 'This page does not claim anti-cheat coverage, hardware-identifier changes, trace removal, policy compliance, or that an account action can be reversed or avoided. Request verified details from support before purchase.',
    },
    { type: 'h2', text: 'Plan terms' },
    {
      type: 'p',
      text: 'Monthly access is $50 for 30 days; lifetime access is $150. A lifetime price label does not by itself define future updates, maintenance, availability, or support entitlement.',
    },
    { type: 'h2', text: 'Requirements must be confirmed' },
    {
      type: 'p',
      text: 'No requirements were supplied for this product. Do not rely on prior-game copy or generic Windows advice; ask support for the current requirements and NBA 2K27 applicability.',
    },
  ],
  ugc: [
    { type: 'h2', text: 'UGC is an account-appeal product' },
    {
      type: 'p',
      text: 'UGC means Unban & Governance Control. The confirmed scope is account appeals. It is not described here as a hardware-ID tool, a way around platform controls, or a promise that an appeal will succeed.',
    },
    { type: 'h2', text: 'The platform decides the outcome' },
    {
      type: 'p',
      text: 'A platform’s process and reviewer determine every appeal. Keep the relevant account notices, dates, and supporting records. No recovery, reversal, or NBA 2K27-specific result is guaranteed.',
    },
    { type: 'h2', text: 'Plan terms and requirements' },
    {
      type: 'p',
      text: 'UGC is $35 for 30 days or $150 lifetime. The supplied intake includes no technical requirements or a defined lifetime-service promise; confirm both with support before payment.',
    },
  ],
  'cloud-dma': [
    { type: 'h2', text: 'Cloud DMA is a separate product' },
    { type: 'p', text: 'Cloud DMA is not included with NBA2K27 CHEATS. The supplied intake confirms only the checkout destination and plan pricing, not functionality or NBA 2K27 applicability.' },
    { type: 'h2', text: 'Requirements were not supplied' },
    { type: 'p', text: 'No vendor reference establishes operating-system, hardware, virtualization, dependency, or setup requirements. Ask support for current written requirements before payment.' },
    { type: 'h2', text: 'No implied compatibility or safety promise' },
    { type: 'p', text: 'This page does not claim that Cloud DMA works with NBA 2K27, bypasses anti-cheat, prevents account action, or produces a particular outcome. Confirm current details with support before purchase.' },
  ],
};

const productContent: Record<
  string,
  Pick<ProductPage, 'overview' | 'images' | 'fullFeatures' | 'goodToKnow' | 'limitations' | 'systemRequirements'>
> = {
  elite: {
    images: eliteProductSlides,
    goodToKnow: sharedGoodToKnow,
    limitations: sharedLimitations,
    systemRequirements: mainProductSystemRequirements,
    fullFeatures: [
      'NBA 2K27 product path',
      'Current listing required',
      'Selected-plan secure checkout',
      'Monthly plan: $35 / 30 days',
      'Lifetime plan: $150',
    ],
    overview: {
      title: 'NBA2K27 CHEATS plan and listing',
      paragraphs: [
        'NBA2K27 CHEATS is the supplied game-specific product. Its confirmed commercial details are $35 for 30 days or $150 lifetime, with the selected plan retained through the checkout redirect.',
        'No vendor evidence was supplied for specific features, supported modes, requirements, availability, or compatibility. Verify these directly with support before checkout.',
      ],
    },
  },
  'hwid-spoofer': {
    images: hwidShowcaseSlides,
    goodToKnow:
      'Run the identifier change and the cleaner, in the portal guide order, before you open the game that raised the hardware flag. Read the anti-cheat notes on the status banner again before you pay.',
    limitations:
      'This product is for hardware ID flags. An account sanction that is still active stays active. Spoofing can conflict with publisher terms and can bring new penalties. A vendor update can end a listed anti-cheat note without a warning on this page first.',
    systemRequirements: [
      { icon: 'reqWindows', text: 'Ask support for current operating-system requirements.' },
      { icon: 'reqShieldGuide', text: 'Confirm any required security settings with support.' },
      { icon: 'reqSettings', text: 'Confirm supported hardware and setup requirements.' },
      { icon: 'reqWifi', text: 'Confirm current delivery and connectivity requirements.' },
    ],
    fullFeatures: ['Separate utility product', 'Monthly plan: $50 / 30 days', 'Lifetime plan: $150', 'Scope confirmation required'],
    overview: {
      title: 'HWID Spoofer: scope to confirm with support',
      paragraphs: [
        'HWID Spoofer is a separate utility product. No vendor facts were supplied for NBA 2K27 applicability, feature scope, supported hardware, or requirements.',
        'The confirmed commercial terms are $50 for 30 days and $150 lifetime. It is not presented as a guaranteed solution for an account, device, or game restriction.',
      ],
    },
  },
  ugc: {
    images: ugcShowcaseSlides,
    goodToKnow:
      'Collect proof you own the account, and write a timeline, before filings run on their own. The reviewer on the platform has the last word on each appeal.',
    limitations:
      'An outcome is not promised. A permanent suspension stays in place. UGC does not change hardware IDs. It does not bypass security controls. Thin evidence weakens the case.',
    systemRequirements: [
      { icon: 'reqWindows', text: 'Confirm current technical requirements with support.' },
      { icon: 'reqSettings', text: 'Keep account documentation requested for an appeal.' },
      { icon: 'reqWifi', text: 'Confirm the current order process before purchase.' },
    ],
    fullFeatures: ['Account-appeal purpose', 'Not a hardware-ID product', 'Monthly plan: $35 / 30 days', 'Lifetime plan: $150', 'No recovery guarantee'],
    overview: {
      title: 'UGC: account-appeal context and plan details',
      paragraphs: [
        'UGC means Unban & Governance Control. It is an account-appeal product and is not represented as a hardware-ID product or a way to bypass platform controls.',
        'The platform decides every appeal. Monthly access is $35 for 30 days and lifetime access is $150; neither plan is a guarantee of recovery or a defined promise of future service.',
      ],
    },
  },
  'cloud-dma': {
    images: cloudDmaShowcaseSlides,
    goodToKnow: 'Cloud DMA is a separate product. No Cloud DMA reference or NBA 2K27 applicability evidence was supplied; request current details before purchase.',
    limitations: 'This page does not establish Cloud DMA functionality, requirements, compatibility, availability, a bypass claim, safety claim, or an account outcome.',
    systemRequirements: [
      { icon: 'reqWindows', text: 'No operating-system requirement was supplied.' },
      { icon: 'reqSettings', text: 'No hardware or setup requirement was supplied.' },
      { icon: 'reqWifi', text: 'Request current delivery and connectivity requirements.' },
    ],
    fullFeatures: ['Separate product', 'Monthly plan: $35 / 30 days', 'Lifetime plan: $150', 'Scope confirmation required'],
    overview: {
      title: 'Cloud DMA: requirements to confirm before checkout',
      paragraphs: [
        'Cloud DMA is listed separately from NBA2K27 CHEATS. No vendor reference was supplied to establish technical functionality, requirements, or NBA 2K27 applicability.',
        'The stated plans are $35 for 30 days or $150 lifetime. Review the checkout and current requirements before purchase; no compatibility or account outcome is promised here.',
      ],
    },
  },
};

const utilityAcquisitionSteps: Record<UtilityProductSlug, AcquisitionStep[]> = {
  [HWID_SPOOFER_SLUG]: hwidAcquisitionSteps,
  [UGC_SLUG]: ugcAcquisitionSteps,
  [CLOUD_DMA_SLUG]: cloudDmaAcquisitionSteps,
};

const utilityAcquisitionTitles: Record<UtilityProductSlug, string> = {
  [HWID_SPOOFER_SLUG]: 'Order for this HWID license',
  [UGC_SLUG]: 'Starting the UGC license',
  [CLOUD_DMA_SLUG]: 'Before Cloud DMA setup',
};

function buildTierPages(t: Translations): ProductPage[] {
  return t.cheats.items.map((cheat) => {
    const slug = slugFromHref(cheat.href);
    const content = productContent[slug];
    const displayName = CHEAT_PRODUCT_NAME;
    return {
      slug,
      kind: 'tier',
      badge: cheat.badge,
      tier: cheat.tier,
      name: cheat.name,
      title: cheat.title,
      subtitle: cheat.heroDesc ?? cheat.desc,
      desc: cheat.desc,
      features: cheat.features,
      more: cheat.more,
      variant: cheat.variant,
      buyUrl: checkoutForSlug(slug),
      images: content.images,
      overview: content.overview,
      acquisition: acquisitionFor(displayName),
      goodToKnow: content.goodToKnow,
      limitations: content.limitations,
      fullFeatures: content.fullFeatures,
      systemRequirements: content.systemRequirements,
      about: tierAbout[slug],
      body: tierBodies[slug] ?? [],
      relatedBlogSlugs: productRelatedBlogSlugs[slug] ?? [],
      relatedForumSlugs: productRelatedForumSlugs[slug] ?? [],
    };
  });
}

function findProductCard(t: Translations, slug: UtilityProductSlug) {
  const match = (items: Translations['products']['items']) =>
    items.find((item) => slugFromHref(item.href) === slug);
  return match(t.products.items) ?? match(getTranslations('en').products.items);
}

function buildUtilityPages(t: Translations): ProductPage[] {
  return UTILITY_PRODUCT_SLUGS.flatMap((slug) => {
    const product = findProductCard(t, slug);
    const content = productContent[slug];
    if (!product || !content) return [];

    return [
      {
        slug,
        kind: 'utility' as const,
        badge: product.badge,
        category: product.category,
        name: product.title,
        title: product.title,
        subtitle: product.subtitle,
        desc: product.desc,
        features: product.features,
        more: Math.max(0, content.fullFeatures.length - product.features.length),
        buyUrl: checkoutForSlug(slug),
        images: content.images,
        overview: content.overview,
        acquisition: {
          title: utilityAcquisitionTitles[slug],
          steps: utilityAcquisitionSteps[slug],
        },
        goodToKnow: content.goodToKnow,
        limitations: content.limitations,
        fullFeatures: content.fullFeatures,
        systemRequirements: content.systemRequirements,
        body: utilityBodies[slug] ?? [],
        relatedBlogSlugs: productRelatedBlogSlugs[slug] ?? [],
        relatedForumSlugs: productRelatedForumSlugs[slug] ?? [],
      },
    ];
  });
}

export function getProductPages(locale: SiteLocale): ProductPage[] {
  const t = getTranslations(locale);
  return [...buildTierPages(t), ...buildUtilityPages(t)].map((page) =>
    deepApplySiteTokens(applyProductCopy(page, locale)),
  );
}

export function getCheatPages(locale: SiteLocale) {
  return getProductPages(locale).filter((p) => p.kind === 'tier');
}

export function getProductPage(slug: string, locale: SiteLocale) {
  return getProductPages(locale).find((p) => p.slug === slug);
}

/** Tier slugs for sitemap extras, store lives at `PRODUCT_BASE` only. */
export function getAllProductSlugs(): string[] {
  const slugs = getAllCheatSlugs();
  const catalog = new Set<string>(CHEAT_PRODUCT_SLUGS);
  for (const slug of slugs) {
    if (!catalog.has(slug as (typeof CHEAT_PRODUCT_SLUGS)[number])) {
      throw new Error(`Cheat slug "${slug}" missing from CHEAT_PRODUCT_SLUGS in src/config/catalog.ts`);
    }
  }
  return [];
}

export function getHwidSpooferPage(locale: SiteLocale) {
  return getProductPage(HWID_SPOOFER_SLUG, locale);
}

export function getUtilityPages(locale: SiteLocale) {
  return getProductPages(locale).filter((p) => p.kind === 'utility');
}

export function utilityProductPath(slug: UtilityProductSlug): string {
  return UTILITY_PRODUCT_PATHS[slug];
}

export function getAllCheatSlugs() {
  return getCheatPages('en').map((p) => p.slug);
}

export function getHeroSlides(locale: SiteLocale): ProductSlide[] {
  void locale;
  return showcaseSlides;
}

const productCopyByLocale: Record<Exclude<SiteLocale, 'en'>, ProductCopyBundle> = {
  es: esProductCopy as ProductCopyBundle,
  de: deProductCopy as ProductCopyBundle,
  fr: frProductCopy as ProductCopyBundle,
};

function acquisitionTitleFor(productName: string) {
  return `How to get ${productName}`;
}

function buildEnglishProductCopyBundle(): ProductCopyBundle {
  const tierSlugs = ['elite'] as const;
  const utilitySlugs = ALL_UTILITY_PRODUCT_SLUGS;

  const tiers = Object.fromEntries(
    tierSlugs.map((slug) => {
      const content = productContent[slug];
      const displayName = CHEAT_PRODUCT_NAME;
      return [
        slug,
        {
          about: tierAbout[slug],
          body: tierBodies[slug] ?? [],
          overview: content.overview,
          goodToKnow: content.goodToKnow,
          limitations: content.limitations,
          acquisitionTitle: acquisitionTitleFor(displayName),
        },
      ];
    }),
  ) as ProductCopyBundle['tiers'];

  const utilities = Object.fromEntries(
    utilitySlugs.map((slug) => {
      const content = productContent[slug];
      return [
        slug,
        {
          body: utilityBodies[slug] ?? [],
          overview: content.overview,
          goodToKnow: content.goodToKnow,
          limitations: content.limitations,
          acquisitionTitle: utilityAcquisitionTitles[slug],
          acquisitionSteps: utilityAcquisitionSteps[slug],
          systemRequirements: content.systemRequirements.map((r) => r.text),
        },
      ];
    }),
  ) as ProductCopyBundle['utilities'];

  return {
    sharedGoodToKnow,
    sharedLimitations,
    acquisitionSteps: defaultAcquisitionSteps.map(({ num, title, desc }) => ({ num, title, desc })),
    systemRequirements: mainProductSystemRequirements.map((r) => r.text),
    gallery: Object.values(galleryRaw).map(({ alt, caption, captionDesc }) => ({
      alt,
      caption,
      captionDesc,
    })),
    tiers,
    utilities,
  };
}

registerProductCopyBundle(buildEnglishProductCopyBundle());

export const heroSlides = getHeroSlides('en');

function productCopyFor(locale: SiteLocale): ProductCopyBundle {
  if (locale === 'en') return getProductCopyBundle();
  return productCopyByLocale[locale];
}

function applyProductCopy(page: ProductPage, locale: SiteLocale): ProductPage {
  if (locale === 'en') return page;
  const copy = productCopyFor(locale);
  const bucket = page.kind === 'tier' ? copy.tiers[page.slug] : copy.utilities[page.slug];
  if (!bucket) return page;

  const isTier = page.kind === 'tier';
  const localizedSteps = isTier ? copy.acquisitionSteps : 'acquisitionSteps' in bucket ? bucket.acquisitionSteps : undefined;
  const localizedRequirements = isTier
    ? copy.systemRequirements
    : 'systemRequirements' in bucket
      ? bucket.systemRequirements
      : undefined;

  const acquisition: ProductAcquisition = {
    title: bucket.acquisitionTitle,
    steps: localizedSteps?.map((step) => ({ ...step })) ?? page.acquisition.steps,
  };

  const localizedGallery = isTier ? copy.gallery : 'gallery' in bucket ? bucket.gallery : undefined;
  const images = localizedGallery
    ? page.images.map((slide, index) => {
        const g = localizedGallery[index];
        if (!g) return slide;
        return { ...slide, alt: g.alt, caption: g.caption, captionDesc: g.captionDesc };
      })
    : page.images;
  const fullFeatures =
    'fullFeatures' in bucket && bucket.fullFeatures?.length ? bucket.fullFeatures : page.fullFeatures;

  const systemRequirements = page.systemRequirements.map((req, index) => ({
    ...req,
    text: localizedRequirements?.[index] ?? req.text,
  }));

  return {
    ...page,
    overview: bucket.overview,
    body: bucket.body,
    about: 'about' in bucket ? bucket.about : page.about,
    goodToKnow: bucket.goodToKnow,
    limitations: bucket.limitations,
    acquisition,
    images,
    fullFeatures,
    systemRequirements,
  };
}
