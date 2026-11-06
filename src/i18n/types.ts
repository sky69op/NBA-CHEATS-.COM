export interface SiteConfig {
  name: string;
  domain: string;
  title: string;
  description: string;
}

export type NavId = 'products' | 'hwidSpoofer' | 'blog' | 'forum' | 'faq' | 'support';

/** Footer and column links; `external` opens in a new tab with noopener. */
export interface FooterLink {
  href: string;
  label: string;
  ariaLabel?: string;
  /** When the target section exists on the path in `href`, scroll instead of full navigation. */
  scrollTarget?: string;
  external?: boolean;
}

export interface NavLink {
  id: NavId;
  href: string;
  label: string;
  /** Shorter label for the desktop header when translations run long. */
  shortLabel?: string;
  /** Mobile sheet menu label; defaults to `label` when omitted. */
  sheetLabel?: string;
  ariaLabel?: string;
  /** When the target section exists on the current page, scroll instead of navigating. */
  scrollTarget?: string;
}

export interface FeatureItem {
  title: string;
  subtitle: string;
  desc: string;
  tags: string[];
  bullets?: string[];
  /** Tailwind classes: sm:col-span-2 stack; lg: explicit col/row start + span */
  bento?: string;
}

export interface TierCard {
  badge: string;
  tier: string;
  name: string;
  title: string;
  desc: string;
  /** Homepage card only. Catalog and schema keep `desc`. */
  homeDesc?: string;
  /** Product page hero blurb; falls back to `desc` when omitted. */
  heroDesc?: string;
  features: string[];
  more: number;
  href: string;
  variant: 'essential' | 'popular' | 'limited';
}

export interface ProductCard {
  badge: string;
  category: string;
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  more: number;
  href: string;
}

/** Section wording for a utility product page (layout is shared with the main product). */
export interface UtilityPageCopy {
  showcaseHeading: string;
  overviewSubtitle: string;
  highlights: { eyebrow: string; title: string; desc: string };
  featuresSection: { eyebrow: string; title: string; desc: string };
  experience: {
    eyebrow: string;
    title: string;
    subtitle: string;
    previewLabel: string;
    accessDividerTop: string;
    accessDividerBottom: string;
  };
  highlightsMore: string;
}

export interface BlogPost {
  tag: string;
  title: string;
  /** Article H1 when it differs from the card title. */
  h1?: string;
  slug: string;
  image: string;
  desc: string;
  date: string;
  readTime: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface FaqItem {
  num: string;
  q: string;
  a: string;
}

export interface StepItem {
  step: string;
  title: string;
  desc: string;
}

export interface WorkflowItem {
  num: string;
  phase: string;
  title: string;
  desc: string;
}

export interface WhyCompareRow {
  title: string;
  desc: string;
}

export interface WhyMetric {
  value: string;
  title: string;
  desc: string;
}

export interface Translations {
  site: SiteConfig;
  nav: NavLink[];
  hero: {
    status: string;
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    ctaPrimary: string;
    metrics: { label: string; strong: string }[];
    statusPills: string[];
  };
  features: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: FeatureItem[];
  };
  whyUs: {
    eyebrow: string;
    title: string;
    subtitle: string;
    usLabel: string;
    otherLabel: string;
    rows: WhyCompareRow[];
    metrics: WhyMetric[];
  };
  setup: {
    eyebrow: string;
    titleLead: string;
    titleHighlight: string;
    intro: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaPrimaryHref: string;
    ctaSecondaryHref: string;
    steps: StepItem[];
  };
  compatibility: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: string[];
  };
  cheats: {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAll: string;
    explore: string;
    items: TierCard[];
  };
  products: {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAll: string;
    get: string;
    explore: string;
    buyNow: string;
    viewDetails: string;
    backToCheats: string;
    showcaseHeading: string;
    experience?: {
      eyebrow: string;
      title: string;
      subtitle: string;
      previewLabel: string;
      accessDividerTop: string;
      accessDividerBottom: string;
    };
    /** HWID utility page section copy (wording only; layout shared with main product). */
    hwidPage?: UtilityPageCopy;
    /** Per-slug section copy for the other utility pages; missing locales fall back to English. */
    utilityPages?: Record<string, UtilityPageCopy>;
    swipeHint: string;
    checkoutEyebrow: string;
    checkoutSelect: string;
    checkoutSingle: string;
    checkoutTotal: string;
    bestValue: string;
    planWeekly: string;
    planWeeklyNote: string;
    planMonthly: string;
    planLifetime: string;
    planOneTime: string;
    planPerMonth: string;
    planOneTimeNote: string;
    items: ProductCard[];
  };
  blog: {
    eyebrow: string;
    title: string;
    subtitle: string;
    latestTitle: string;
    latestSubtitle: string;
    filterAll: string;
    emptyFilter: string;
    emptyArchive: string;
    viewAll: string;
    read: string;
    articleActionsAria: string;
    buyCta: string;
    buyHwidCta: string;
    moreArticles: string;
    sidebarAria: string;
    tocTitle: string;
    relatedTitle: string;
    filterToolbarAria: string;
    items: BlogPost[];
  };
  workflow: {
    eyebrow: string;
    badge: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter?: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
    items: WorkflowItem[];
  };
  support: {
    eyebrow: string;
    title: string;
    subtitle: string;
    channels: {
      icon: string;
      title: string;
      desc: string;
      linkLabel: string;
      href: string;
    }[];
    ticketTitle: string;
    ticketItems: { title: string; desc: string }[];
    pageSections: { heading: string; paragraphs: string[] }[];
  };
  faq: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: FaqItem[];
  };
  footer: {
    homeLink: string;
    tagline: string;
    /** `{game}` is the game name in the trademark line. Footer wraps it with `GAME.officialUrl` when set. */
    trademark: string;
    /** @deprecated Legacy single “explore” column; kept for Part 3 scripts. Prefer column link arrays. */
    explore: string;
    exploreLinks: NavLink[];
    /** @deprecated Split into `helpLinks`; kept for merge fallback. */
    supportLinks: { href: string; label: string; ariaLabel: string }[];
    support: string;
    legal: string;
    privacy: string;
    terms: string;
    about: string;
    products: string;
    guides: string;
    help: string;
    official: string;
    share: string;
    shareDescription: string;
    shareOnX: string;
    shareOnFacebook: string;
    shareOnLinkedIn: string;
    productLinks: FooterLink[];
    guideLinks: FooterLink[];
    helpLinks: FooterLink[];
    officialLinks: FooterLink[];
  };
  legalPages: {
    about: {
      title: string;
      description: string;
      sections: { heading: string; paragraphs: string[] }[];
    };
    privacy: {
      title: string;
      description: string;
      sections: { heading: string; paragraphs: string[] }[];
    };
    terms: {
      title: string;
      description: string;
      sections: { heading: string; paragraphs: string[] }[];
    };
    support: {
      title: string;
      description: string;
    };
  };
  common: {
    breadcrumbHome: string;
    breadcrumbProducts: string;
    breadcrumbBlog: string;
    breadcrumbForum: string;
    breadcrumbFaq: string;
    breadcrumbAbout: string;
    breadcrumbPrivacy: string;
    breadcrumbTerms: string;
    breadcrumbSupport: string;
    contactSupport: string;
  };
  notFound: {
    metaDescription: string;
    title: string;
    documentTitle: string;
    body: string;
    backHome: string;
    viewProducts: string;
    viewElite: string;
  };
  pages: {
    faq: {
      eyebrow: string;
      title: string;
      description: string;
      schemaName: string;
      schemaDescription: string;
    };
    forum: {
      eyebrow: string;
      title: string;
      description: string;
      exploreGuides: string;
      postsAria: string;
      sortAria: string;
      sortPopular: string;
      sortLatest: string;
      sortTop: string;
      filterAria: string;
      filterAll: string;
      resultsCount: string;
      voteAria: string;
      upvoteAria: string;
      downvoteUnavailableAria: string;
      guideTeam: string;
      guideBasedQa: string;
      fromGuide: string;
      comments: string;
      closedThread: string;
      closedBy: string;
      repliesClosed: string;
      readDiscussion: string;
      empty: string;
      emptyArchive: string;
      categoryGeneral: string;
      categoryGuides: string;
      categoryPatch: string;
      categoryCommunity: string;
      categoryLabels?: Record<string, string>;
      paginationAria: string;
      pagePrevious: string;
      pageNext: string;
      sidebarTitle: string;
      sidebarIntro: string;
      statsDiscussions: string;
      statsTopics: string;
      exploreAllGuides: string;
      communitiesHeading: string;
      browseRelated: string;
      browseAllCommunities: string;
      guidelinesHeading: string;
      guideline1: string;
      guideline2: string;
      guideline3: string;
      readFullGuidelines: string;
      sidebarFoot: string;
    };
    utilities: {
      title: string;
      description: string;
      viewDetails: string;
      includes: string;
      schemaName: string;
    };
  };
  pageSeo: Record<string, { title: string; description: string }>;
  ui: {
    skipLink: string;
    /** Compact header CTA (fits navbar beside language + theme). */
    browseCheatsNav: string;
    /** Mobile header CTA. Must differ from `browseCheatsNav` so the two header product links are unique. */
    browseCheatsNavMobile: string;
    homeAria: string;
    menuOpen: string;
    themeLight: string;
    languageSwitcherLabel: string;
    languageNames: {
      en: string;
      es: string;
      de: string;
      fr: string;
    };
  };
}
