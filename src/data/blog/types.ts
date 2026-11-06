import type { BlogPost } from '../../i18n/types';

export type BlogBlock =
  | { type: 'h2' | 'h3' | 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'cta'; title: string; text: string; href: string };

export interface BlogPostFull extends BlogPost {
  featured?: boolean;
  author?: string;
  /** Exact `<title>` / og:title when set (no brand suffix). */
  metaTitle?: string;
  /** Meta description when it differs from card excerpt. */
  metaDescription?: string;
  /** Hero/card/social image alt from editorial package. */
  imageAlt?: string;
  body: BlogBlock[];
}
