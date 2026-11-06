import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateSite } from './validate.mjs';

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-validator-test-'));
  t.after(() => {
    assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep + 'site-validator-test-'));
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const origin = 'https://a-different-site.example';
  const alternates = [{ locale: 'en', path: '/' }, { locale: 'es', path: '/es/' }, { locale: 'x-default', path: '/' }];
  const config = {
    origin, locales: ['en', 'es'], defaultLocale: 'en', languageTags: { en: 'en-US', es: 'es-ES' },
    pages: {
      '/': { locale: 'en', title: 'Example home', description: 'A real description', indexable: true },
      '/es/': { locale: 'es', title: 'Página de ejemplo', description: 'Una descripción real', indexable: true },
    },
    products: {}, checkouts: {}, redirects: {}, forbiddenReferences: ['old-brand.example'], maxImageBytes: 500000,
  };
  for (const [route, p] of Object.entries(config.pages)) {
    const canonical = origin + route;
    const html = `<!doctype html><html lang="${p.locale}"><head><title>${p.title}</title>
      <meta name="description" content="${p.description}"><meta name="robots" content="index,follow">
      <link rel="canonical" href="${canonical}">${alternates.map((a) => `<link rel="alternate" hreflang="${a.locale}" href="${origin}${a.path}">`).join('')}
      ${['og:title', 'twitter:title'].map((key) => `<meta name="${key}" content="${p.title}">`).join('')}
      ${['og:description', 'twitter:description'].map((key) => `<meta name="${key}" content="${p.description}">`).join('')}
      <meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin}/image.webp"><meta name="twitter:image" content="${origin}/image.webp">
      <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', url: canonical, inLanguage: config.languageTags[p.locale] })}</script>
      </head><body><h1>${p.title}</h1><a href="/es/#content">Español</a><div id="content"></div></body></html>`;
    const file = path.join(dir, route, 'index.html'); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, html);
  }
  fs.writeFileSync(path.join(dir, 'image.webp'), 'fixture');
  fs.writeFileSync(path.join(dir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  fs.writeFileSync(path.join(dir, 'sitemap.xml'), `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${Object.keys(config.pages).map((r) => `<url><loc>${origin}${r}</loc>${alternates.map((a) => `<xhtml:link rel="alternate" hreflang="${a.locale}" href="${origin}${a.path}"/>`).join('')}</url>`).join('')}</urlset>`);
  const change = (from, to, file = 'index.html') => {
    const target = path.join(dir, file); fs.writeFileSync(target, fs.readFileSync(target, 'utf8').replace(from, to));
  };
  return { dir, config, change };
}

test('validator accepts a different configured domain, locale set and route count', (t) => {
  const { dir, config } = fixture(t);
  assert.deepEqual(validateSite(dir, config), { ok: true, pages: 2, sitemapUrls: 2, errors: [], warnings: [] });
});

const cases = [
  ['broken links', (f) => f.change('href="/es/#content"', 'href="/missing/"'), 'missing link target'],
  ['broken fragments', (f) => f.change('#content', '#missing'), 'missing fragment'],
  ['missing social images', (f) => fs.unlinkSync(path.join(f.dir, 'image.webp')), 'missing asset'],
  ['wrong canonical origin', (f) => f.change('rel="canonical" href="https://a-different-site.example/"', 'rel="canonical" href="https://wrong.example/"'), 'canonical'],
  ['noindex sitemap contradictions', (f) => f.change('content="index,follow"', 'content="noindex,follow"'), 'indexability'],
  ['malformed JSON-LD', (f) => f.change('"@context":', 'invalid:'), 'invalid JSON-LD'],
  ['untyped JSON-LD', (f) => f.change('"@type":"WebPage",', ''), 'typed root'],
  ['wrong schema language', (f) => f.change('"inLanguage":"en-US"', '"inLanguage":"fr-FR"'), 'schema language'],
  ['missing reciprocal alternate', (f) => f.change('hreflang="en"', 'hreflang="de"', 'es/index.html'), 'hreflang'],
  ['old template references', (f) => f.change('<h1>', '<p>old-brand.example</p><h1>'), 'old-template'],
  ['robots blocking production', (f) => f.change('Allow: /', 'Disallow: /', 'robots.txt'), 'blocks indexable'],
  ['missing sitemap URL', (f) => f.change('<loc>https://a-different-site.example/</loc>', '<loc>https://a-different-site.example/not-real/</loc>', 'sitemap.xml'), 'missing indexable URL'],
  ['redirect loops', (f) => { f.config.redirects = { '/a/': '/b/', '/b/': '/a/' }; }, 'redirect loop'],
  ['missing CSS font', (f) => fs.writeFileSync(path.join(f.dir, 'style.css'), 'body{src:url(/missing.woff2)}'), 'missing asset'],
];
for (const [name, mutate, message] of cases) test(`validator rejects ${name}`, (t) => {
  const f = fixture(t); mutate(f);
  const result = validateSite(f.dir, f.config);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes(message)), result.errors.join('\n'));
});
