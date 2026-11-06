import { blogPosts } from '../data/blog';
import { RSS_FEED_PATH, SITE_ORIGIN, absoluteAssetUrl, canonicalUrl } from '../config/seo';
import { SITE_DOMAIN, SITE_NAME } from '../config/site';
import { parseBlogDate } from './schema';
import { blogPostPath } from './path';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function buildRssFeed(): string {
 const feedUrl = `${SITE_ORIGIN}${RSS_FEED_PATH}`;
 const items = blogPosts.map((post) => {
 const link = canonicalUrl(blogPostPath(post.slug));
 const pubDate = new Date(parseBlogDate(post.date)).toUTCString();
 return `
 <item>
 <title>${escapeXml(post.title)}</title>
 <link>${link}</link>
 <guid isPermaLink="true">${link}</guid>
 <description>${escapeXml(post.desc)}</description>
 <pubDate>${pubDate}</pubDate>
 <enclosure url="${escapeXml(absoluteAssetUrl(post.image))}" type="image/png" />
 </item>`;
 }).join('');

 return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
 <channel>
 <title>${SITE_NAME} Blog</title>
 <link>${SITE_ORIGIN}/blog/</link>
 <description>NBA 2K27 product research, support notes, and buyer guides from ${SITE_DOMAIN}.</description>
 <language>en-us</language>
 <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
 <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
 ${items}
 </channel>
</rss>`;
}
