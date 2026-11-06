import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STYLESHEET_PI = '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';

function field(block, name) {
  return block.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1] ?? '';
}

function xhtmlLinks(block) {
  return [...block.matchAll(/<xhtml:link\b[^>]*\/?>/g)].map((match) => match[0]);
}

function formatUrlset(xml) {
  const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => {
    const block = match[1];
    const lines = ['  <url>', `    <loc>${field(block, 'loc')}</loc>`];
    const lastmod = field(block, 'lastmod');
    const changefreq = field(block, 'changefreq');
    const priority = field(block, 'priority');
    if (lastmod) lines.push(`    <lastmod>${lastmod.slice(0, 10)}</lastmod>`);
    if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
    if (priority) lines.push(`    <priority>${priority}</priority>`);
    for (const link of xhtmlLinks(block)) {
      lines.push(`    ${link}`);
    }
    lines.push('  </url>');
    return lines.join('\n');
  });

  const hasXhtml = xml.includes('xhtml:link');
  const ns = hasXhtml
    ? 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"'
    : 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

  return `<?xml version="1.0" encoding="UTF-8"?>
${STYLESHEET_PI}
<urlset ${ns}>
${urls.join('\n')}
</urlset>
`;
}

/**
 * Merges Astro's sitemap-0.xml into dist/sitemap.xml and removes the index chunk files.
 * Idempotent when sitemap.xml already exists and chunk files are gone.
 */
export function finalizeSitemap(distDir = path.join(process.cwd(), 'dist')) {
  const source = path.join(distDir, 'sitemap-0.xml');
  const destination = path.join(distDir, 'sitemap.xml');

  if (!fs.existsSync(source)) {
    if (fs.existsSync(destination)) {
      console.log('finalize-sitemap: dist/sitemap.xml already present.');
      return { urlCount: (fs.readFileSync(destination, 'utf8').match(/<url>/g) ?? []).length };
    }
    throw new Error('finalize-sitemap: dist/sitemap-0.xml not found — run astro build first.');
  }

  const raw = fs.readFileSync(source, 'utf8');
  const urlCount = (raw.match(/<url>/g) ?? []).length;

  if (urlCount === 0) {
    throw new Error('finalize-sitemap: sitemap-0.xml contains no URLs.');
  }

  const formatted = formatUrlset(raw);
  fs.writeFileSync(destination, formatted, 'utf8');

  for (const extra of ['sitemap-0.xml', 'sitemap-index.xml']) {
    const extraPath = path.join(distDir, extra);
    if (fs.existsSync(extraPath)) fs.unlinkSync(extraPath);
  }

  console.log(`Sitemap finalized: ${urlCount} URLs → dist/sitemap.xml`);
  return { urlCount };
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isCli) {
  try {
    finalizeSitemap();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
