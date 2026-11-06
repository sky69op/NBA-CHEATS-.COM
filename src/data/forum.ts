export type { ForumComment, ForumPost } from './forum/types';
import type { ForumPost } from './forum/types';
import { enForumPosts } from './forum/en-posts';

export const forumCategories = [
  { name: 'Product Research', tone: 'purple', icon: 'layers' },
  { name: 'Feature Terms', tone: 'blue', icon: 'tag' },
  { name: 'Game Context', tone: 'blue', icon: 'tag' },
  { name: 'Setup & Support', tone: 'green', icon: 'headphones' },
  { name: 'Rules & Risk', tone: 'orange', icon: 'shieldCheck' },
  { name: 'Game Updates', tone: 'orange', icon: 'refresh' },
  { name: 'Cloud DMA', tone: 'purple', icon: 'layers' },
  { name: 'UGC', tone: 'green', icon: 'shieldCheck' },
  { name: 'Account Questions', tone: 'green', icon: 'shieldCheck' },
] as const;

export const forumPosts: ForumPost[] = enForumPosts;

export function getForumPost(slug: string): ForumPost | undefined {
  return forumPosts.find((post) => post.slug === slug);
}
