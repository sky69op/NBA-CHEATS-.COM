import { getTranslations } from '../i18n';
import {
  DEFAULT_OG_GAMEPLAY_ALT,
  DEFAULT_OG_GAMEPLAY_HEIGHT,
  DEFAULT_OG_GAMEPLAY_IMAGE,
  DEFAULT_OG_GAMEPLAY_WIDTH,
} from './gameplayMedia';
import { SITE_DOMAIN as INDEXNOW_HOST_NAME, SITE_URL } from './site';
import { getPageSeoEntry } from './pageSeo';

export const SITE_ORIGIN = SITE_URL;

export const DEFAULT_OG_IMAGE = DEFAULT_OG_GAMEPLAY_IMAGE;

export const DEFAULT_OG_IMAGE_ALT = DEFAULT_OG_GAMEPLAY_ALT;

export const GA_MEASUREMENT_ID = import.meta.env.PUBLIC_GA_MEASUREMENT_ID as string | undefined;

/** @example @handle */
export const TWITTER_SITE = import.meta.env.PUBLIC_TWITTER_SITE as string | undefined;

export const TWITTER_CREATOR = import.meta.env.PUBLIC_TWITTER_CREATOR as string | undefined;

/** Comma-separated profile URLs (X, YouTube, etc.) for Organization sameAs. */
export function getOrganizationSameAs(): string[] {
  const raw = import.meta.env.PUBLIC_ORG_SAME_AS as string | undefined;
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function canonicalUrl(pathname: string): string {
  const url = new URL(pathname || '/', SITE_ORIGIN);
  const path = url.pathname.replace(/(\/[^/]+\.[^/]+)\/$/, '$1');
  // Queries/fragments are not canonical identities; file routes must retain their extension.
  url.pathname = path.endsWith('/') || /\.[^/]+$/.test(path) ? path : `${path}/`;
  url.search = '';
  url.hash = '';
  return url.href;
}

export function absoluteAssetUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}

export function resolvePageSeo(pathname: string, locale?: string): { title: string; description: string } {
  const entry = getPageSeoEntry(pathname, locale);
  if (entry) return entry;
  const t = getTranslations(locale);
  return { title: t.site.title, description: t.site.description };
}

const TITLE_MAX = 60;
const TITLE_MIN = 30;
const META_MAX = 155;
const META_MIN = 70;
const META_PX = 985;
const NARROW = new Set([...'ijltfIftr.,:;' + "'|!"]);
const WIDE = new Set([...'mwMW@']);

const DANGLING_WORD =
  /[\s,;:.·|&-]+$|\s+(a|an|the|and|or|of|for|to|in|on|with|is|it|be|without|after|de|del|al|el|la|los|las|y|o|en|con|para|un|una|es|sin|der|die|das|und|oder|mit|für|von|im|ein|eine|ist|ob|ohne|nach|le|les|et|ou|du|des|à|au|pour|avec|sur|sans|après|est)$/iu;

/** Skill title_meta.py px_width (~20px Arial-like). */
export function pxWidth(text: string): number {
  let w = 0;
  for (const ch of text) {
    w += NARROW.has(ch) ? 5 : WIDE.has(ch) ? 12 : ch === ch.toUpperCase() && ch !== ch.toLowerCase() ? 7.5 : 7;
  }
  return Math.round(w);
}

function dropLastWord(text: string): string {
  const boundary = text.lastIndexOf(' ');
  return (boundary > 0 ? text.slice(0, boundary) : text).trim();
}

/** Trim at a word boundary. Used so visible excerpts stay intact while meta stays in budget. */
export function clipAtWord(text: string, max = META_MAX, min = META_MIN, maxPx = META_PX): string {
  const cleaned = text.replace(/\s+/g, ' ').replace(/"/g, "'").trim();
  let trimmed = cleaned;
  if (trimmed.length > max) {
    const cut = trimmed.slice(0, max + 1);
    const boundary = cut.lastIndexOf(' ');
    trimmed = (boundary >= min ? cut.slice(0, boundary) : cut.slice(0, max)).trim();
  }
  while (DANGLING_WORD.test(trimmed) && trimmed.length > min) {
    trimmed = trimmed.replace(DANGLING_WORD, '').trim();
  }
  while (pxWidth(trimmed) > maxPx && trimmed.length > min) {
    const next = dropLastWord(trimmed);
    if (next.length < min || next === trimmed) break;
    trimmed = next;
    while (DANGLING_WORD.test(trimmed) && trimmed.length > min) {
      trimmed = trimmed.replace(DANGLING_WORD, '').trim();
    }
  }
  return trimmed;
}

export function pageTitle(keyword: string, brand?: string, locale?: string): string {
  const t = getTranslations(locale);
  const brandName = brand ?? t.site.name;
  const suffix = ` | ${brandName}`;
  if (`${keyword}${suffix}`.length <= TITLE_MAX) return `${keyword}${suffix}`;
  if (keyword.length <= TITLE_MAX) return keyword;
  const cut = keyword.slice(0, TITLE_MAX + 1);
  const boundary = cut.lastIndexOf(' ');
  let trimmed = (boundary >= TITLE_MIN ? cut.slice(0, boundary) : keyword.slice(0, TITLE_MAX)).trim();
  while (DANGLING_WORD.test(trimmed) && trimmed.length > TITLE_MIN) {
    trimmed = trimmed.replace(DANGLING_WORD, '').trim();
  }
  if (trimmed.length < TITLE_MIN) {
    trimmed = (boundary >= TITLE_MIN ? cut.slice(0, boundary) : keyword.slice(0, TITLE_MAX)).trim();
  }
  if (trimmed.length > TITLE_MAX) {
    const cut = trimmed.slice(0, TITLE_MAX + 1);
    const boundary = cut.lastIndexOf(' ');
    trimmed = (boundary >= TITLE_MIN ? cut.slice(0, boundary) : trimmed.slice(0, TITLE_MAX)).trim();
  }
  return trimmed;
}

/** Drop a site-name suffix first, then trim at a word boundary to 60 chars / 561px. */
export function clipTitle(text: string, max = TITLE_MAX, min = TITLE_MIN, maxPx = 561): string {
  let trimmed = text.replace(/\s+/g, ' ').replace(/"/g, "'").trim();
  const pipe = trimmed.lastIndexOf(' | ');
  if ((trimmed.length > max || pxWidth(trimmed) > maxPx) && pipe >= min) {
    const without = trimmed.slice(0, pipe).trim();
    if (without.length >= min) trimmed = without;
  }
  while ((trimmed.length > max || pxWidth(trimmed) > maxPx) && trimmed.length > min) {
    const next = dropLastWord(trimmed);
    if (next === trimmed || next.length < min) break;
    trimmed = next;
    while (DANGLING_WORD.test(trimmed) && trimmed.length > min) {
      trimmed = trimmed.replace(DANGLING_WORD, '').trim();
    }
  }
  if (trimmed.length > max) {
    const cut = trimmed.slice(0, max + 1);
    const boundary = cut.lastIndexOf(' ');
    trimmed = (boundary >= min ? cut.slice(0, boundary) : trimmed.slice(0, max)).trim();
  }
  return trimmed;
}

export const DEFAULT_OG_IMAGE_WIDTH = DEFAULT_OG_GAMEPLAY_WIDTH;
export const DEFAULT_OG_IMAGE_HEIGHT = DEFAULT_OG_GAMEPLAY_HEIGHT;

export const RSS_FEED_PATH = '/rss.xml';

/** Used by IndexNow postbuild script. */
export const INDEXNOW_HOST = INDEXNOW_HOST_NAME;
