export type { BlogBlock, BlogPostFull } from './blog/types';
export { blogPosts } from './blog/posts';

import type { SiteLocale } from '../i18n/locales';
import { getBlogPost as getBlogPostLocale, getBlogPostsForLocale } from './blog/locale';

export function getBlogPosts(locale: SiteLocale = 'en') {
  return getBlogPostsForLocale(locale);
}

export function getBlogPost(slug: string, locale: SiteLocale = 'en') {
  return getBlogPostLocale(slug, locale);
}

export function getAllBlogSlugs() {
  return getBlogPostsForLocale('en').map((p) => p.slug);
}

export function getFeaturedBlogPost(locale: SiteLocale = 'en') {
  const posts = getBlogPostsForLocale(locale);
  return posts.find((p) => p.featured) ?? posts[0];
}

export function getNonFeaturedBlogPosts(locale: SiteLocale = 'en') {
  const featured = getFeaturedBlogPost(locale);
  return getBlogPostsForLocale(locale).filter((p) => p.slug !== featured?.slug);
}

export function getRelatedBlogPosts(slug: string, limit = 3, locale: SiteLocale = 'en') {
  const posts = getBlogPostsForLocale(locale);
  const current = getBlogPostLocale(slug, locale);
  if (!current) return [];

  const sameTag = posts.filter((p) => p.slug !== slug && p.tag === current.tag);
  const others = posts.filter((p) => p.slug !== slug && p.tag !== current.tag);
  return [...sameTag, ...others].slice(0, limit);
}

export function getBlogPostsBySlugs(slugs: string[], locale: SiteLocale = 'en') {
  const posts = getBlogPostsForLocale(locale);
  return slugs
    .map((slug) => posts.find((p) => p.slug === slug))
    .filter((post): post is NonNullable<typeof post> => post != null);
}

export function getBlogTags(locale: SiteLocale = 'en') {
  return [...new Set(getBlogPostsForLocale(locale).map((p) => p.tag))].sort((a, b) => a.localeCompare(b));
}

export function getBlogPostTimestamp(date: string) {
  return new Date(date).getTime();
}

export function getBlogReadMinutes(readTime: string) {
  const match = readTime.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}
