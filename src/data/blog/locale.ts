import type { SiteLocale } from '../../i18n/locales';
import type { BlogPostFull } from './types';
import { enBlogArticles } from './posts/en-articles';
import { esBlogArticles } from './posts/es-articles';
import { deBlogArticles } from './posts/de-articles';
import { frBlogArticles } from './posts/fr-articles';
import { localeMetaDescriptionOverride } from './metaDescriptions';

function sortBlogPosts(posts: BlogPostFull[]): BlogPostFull[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

const blogPostsByLocale: Record<SiteLocale, BlogPostFull[]> = {
  en: enBlogArticles,
  es: esBlogArticles,
  de: deBlogArticles,
  fr: frBlogArticles,
};

export function getBlogPostsForLocale(locale: SiteLocale): BlogPostFull[] {
  const posts = sortBlogPosts(blogPostsByLocale[locale]);
  if (locale === 'en') return posts;
  return posts.map((p) => {
    const metaDescription = localeMetaDescriptionOverride(p.slug, locale) ?? p.metaDescription;
    return metaDescription === p.metaDescription ? p : { ...p, metaDescription };
  });
}

export function getBlogPost(slug: string, locale: SiteLocale): BlogPostFull | undefined {
  return getBlogPostsForLocale(locale).find((p) => p.slug === slug);
}
