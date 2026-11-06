import type { BlogBlock } from './types';

const paragraphs: Record<string, string[]> = {};

export function getSeoArticleAdditions(slug: string, locale: string): BlogBlock[] {
  return locale === 'en' ? (paragraphs[slug] ?? []).map((text) => ({ type: 'p', text })) : [];
}

export function getSeoArticleModifiedDate(_slug: string, _locale: string): string | undefined {
  return undefined;
}
