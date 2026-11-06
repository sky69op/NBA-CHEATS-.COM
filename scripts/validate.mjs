import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { elements, textContent } from './html.mjs';
import { sourceFingerprint } from './source-fingerprint.mjs';
import crypto from 'node:crypto';

export function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

function routeFor(file) {
  const route = `/${file.replaceAll('\\', '/')}`;
  return route.endsWith('/index.html') ? route.slice(0, -10) : route;
}

export function validateSite(distDir, config) {
  const errors = [], warnings = [];
  const error = (route, message) => errors.push(`${route}: ${message}`);
  const warn = (route, message) => warnings.push(`${route}: ${message}`);
  const files = walk(distDir);
  for (const [relative, expected] of Object.entries(config.protectedMedia ?? {})) {
    const file = path.join(distDir, relative);
    if (!fs.existsSync(file) || crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase() !== expected) error(relative, 'protected media missing or changed');
  }
  const pages = new Map();
  for (const file of files.filter((p) => p.endsWith('.html'))) {
    const html = fs.readFileSync(file, 'utf8');
    const nodes = elements(html);
    const route = routeFor(path.relative(distDir, file));
    const meta = (key) => nodes.filter((n) => n.tagName === 'meta' && (n.attr.name === key || n.attr.property === key)).map((n) => n.attr.content);
    const links = (rel) => nodes.filter((n) => n.tagName === 'link' && n.attr.rel?.split(/\s+/).includes(rel));
    pages.set(route, { html, nodes, meta, links, ids: new Set(nodes.map((n) => n.attr.id).filter(Boolean)) });
  }
  const resolve = (raw, base) => {
    try { return new URL(raw, config.origin + base); } catch { error(base, `invalid URL ${raw}`); return null; }
  };
  const localFile = (pathname) => {
    let decoded;
    try { decoded = decodeURIComponent(pathname); } catch { return null; }
    const target = path.resolve(distDir, '.' + decoded);
    if (!target.startsWith(path.resolve(distDir) + path.sep) && target !== path.resolve(distDir)) return null;
    return [target, path.join(target, 'index.html')].find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
  };
  const follow = (pathname) => {
    const seen = new Set();
    while (config.redirects[pathname]) {
      if (seen.has(pathname)) return null;
      seen.add(pathname); pathname = config.redirects[pathname];
    }
    return pathname;
  };
  const checkUrl = (raw, route, { fragment = false, asset = false } = {}) => {
    if (!raw || /^(data:|mailto:|tel:|sms:)/i.test(raw)) return;
    const url = resolve(raw, route);
    if (!url) return;
    if (!['http:', 'https:'].includes(url.protocol)) { error(route, `unsafe URL ${raw}`); return; }
    if (url.origin !== config.origin) return;
    if (config.checkouts[url.pathname]) return;
    const destination = follow(url.pathname);
    if (!destination || !localFile(destination)) { error(route, `missing ${asset ? 'asset' : 'link target'} ${raw}`); return; }
    if (config.redirects[url.pathname] && !asset) warn(route, `internal link redirects: ${raw}`);
    if (fragment && url.hash && pages.has(destination)) {
      let id; try { id = decodeURIComponent(url.hash.slice(1)); } catch { id = url.hash.slice(1); }
      if (id && !pages.get(destination).ids.has(id)) error(route, `missing fragment ${raw}`);
    }
  };
  const titles = new Map(), descriptions = new Map();
  for (const [route, page] of pages) {
    const { nodes, meta, links, html } = page;
    const checkout = !!config.checkouts[route];
    const expected = config.pages[route];
    if (!checkout && !expected) error(route, 'unexpected generated page; add it to site validation config');
    const titleNodes = nodes.filter((n) => n.tagName === 'title');
    const title = titleNodes[0] ? textContent(titleNodes[0]) : '';
    if (titleNodes.length !== 1 || !title.trim()) error(route, 'requires one nonempty title');
    const singleMeta = (key) => {
      const values = meta(key);
      if (values.length !== 1 || !values[0]?.trim()) error(route, `requires one nonempty ${key}`);
      return values[0];
    };
    const description = singleMeta('description');
    const noindex = meta('robots').some((v) => /\bnoindex\b/i.test(v));
    if (expected && noindex === expected.indexable) error(route, 'robots/indexability disagrees with site config');
    if (checkout && !noindex) error(route, 'checkout must be noindex');
    const h1 = nodes.filter((n) => n.tagName === 'h1');
    if (h1.length !== 1 || !textContent(h1[0]).trim()) error(route, 'requires one nonempty H1');
    if (expected) {
      if (title !== expected.title) error(route, `title differs from site data: ${title}`);
      if (description !== expected.description) error(route, 'description differs from site data');
      if (nodes.find((n) => n.tagName === 'html')?.attr.lang !== expected.locale) error(route, 'wrong HTML language');
      if (expected.indexable) {
        for (const [value, registry, label] of [[title, titles, 'title'], [description, descriptions, 'description']]) {
          const key = expected.locale + ':' + value;
          if (registry.has(key)) error(route, `duplicate ${label} with ${registry.get(key)}`);
          registry.set(key, route);
        }
      }
    }
    if (!checkout) {
      const canonical = config.origin + route;
      if (links('canonical').length !== 1 || links('canonical')[0]?.attr.href !== canonical) error(route, 'incorrect or duplicate canonical');
      for (const key of ['og:title', 'twitter:title']) if (singleMeta(key) !== title) error(route, `${key} differs from title`);
      for (const key of ['og:description', 'twitter:description']) if (singleMeta(key) !== description) error(route, `${key} differs from description`);
      if (singleMeta('og:url') !== canonical) error(route, 'og:url differs from canonical');
      checkUrl(singleMeta('og:image'), route, { asset: true });
      checkUrl(singleMeta('twitter:image'), route, { asset: true });
      const alternates = links('alternate').filter((n) => n.attr.hreflang);
      if (expected?.indexable) {
        const prefix = expected.locale === config.defaultLocale ? '' : '/' + expected.locale;
        const base = route.slice(prefix.length) || '/';
        const tags = [...config.locales, 'x-default'];
        if (alternates.length !== tags.length) error(route, 'incorrect hreflang count');
        for (const locale of tags) {
          const code = locale === 'x-default' ? config.defaultLocale : locale;
          const target = (code === config.defaultLocale ? '' : '/' + code) + base;
          const href = config.origin + target;
          const matches = alternates.filter((n) => n.attr.hreflang === locale);
          if (matches.length !== 1 || matches[0]?.attr.href !== href) error(route, `incorrect ${locale} hreflang`);
          if (!config.pages[target]?.indexable || !pages.has(target)) error(route, `hreflang target missing/noindex ${target}`);
          else if (!pages.get(target).links('alternate').some((n) => n.attr.hreflang === expected.locale && n.attr.href === canonical)) error(route, `nonreciprocal hreflang ${target}`);
        }
      } else if (alternates.length) error(route, 'noindex page advertises hreflang');
    }
    for (const n of nodes) {
      if (n.tagName === 'a') checkUrl(n.attr.href, route, { fragment: true });
      if (['img', 'source', 'script', 'video', 'audio', 'iframe'].includes(n.tagName)) checkUrl(n.attr.src, route, { asset: true });
      if (n.attr.poster) checkUrl(n.attr.poster, route, { asset: true });
      for (const key of ['srcset', 'imagesrcset']) if (n.attr[key] && !n.attr[key].startsWith('data:')) {
        for (const item of n.attr[key].split(',')) checkUrl(item.trim().split(/\s+/)[0], route, { asset: true });
      }
      if (n.tagName === 'link' && !n.attr.hreflang && n.attr.rel !== 'canonical') checkUrl(n.attr.href, route, { asset: true });
      if (n.tagName === 'img') {
        if (!('alt' in n.attr)) error(route, 'image missing alt attribute');
        if (!n.attr.width || !n.attr.height) warn(route, `image missing dimensions ${n.attr.src}`);
      }
    }
    const readable = nodes.filter((n) => n.tagName === 'body').map(textContent).join(' ') + ' ' + html;
    for (const phrase of config.forbiddenReferences ?? []) if (readable.toLowerCase().includes(phrase.toLowerCase())) error(route, `old-template reference: ${phrase}`);
    if (/\{(?:siteDomain|siteName|gameName|gameShort|supportEmail|cheatProduct|antiCheat|gamePublisher)\}|REPLACE_WITH_|__DEFERRED_BOOT_URL__/.test(html)) error(route, 'unresolved content/build token');
    const schemas = nodes.filter((n) => n.tagName === 'script' && n.attr.type === 'application/ld+json');
    if (!checkout && expected?.indexable && !schemas.length) error(route, 'missing structured data');
    const entities = [];
    const topEntities = [];
    const inspectSchema = (value) => {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach(inspectSchema); return; }
      if (value['@type']) entities.push(value);
      for (const [key, val] of Object.entries(value)) {
        if (['url', '@id', 'item', 'image', 'logo'].includes(key) && typeof val === 'string' && /^https?:/.test(val)) checkUrl(val, route, { asset: ['image', 'logo'].includes(key) });
        if (key === 'inLanguage' && expected && val !== config.languageTags[expected.locale]) error(route, `schema language mismatch ${val}`);
        inspectSchema(val);
      }
    };
    for (const script of schemas) {
      try {
        const data = JSON.parse(textContent(script));
        if (data['@context'] !== 'https://schema.org') error(route, 'missing schema.org context');
        const roots = data['@graph'] ?? [data];
        if (!Array.isArray(roots) || !roots.length || roots.some((entry) => !entry?.['@type'])) error(route, 'structured data requires typed root entities');
        else topEntities.push(...roots);
        inspectSchema(data);
      } catch (e) { error(route, `invalid JSON-LD: ${e.message}`); }
    }
    for (const e of topEntities) if (['WebPage', 'CollectionPage', 'Product', 'BlogPosting', 'DiscussionForumPosting'].includes(e['@type']) && e.url !== config.origin + route) error(route, 'schema page URL differs from canonical');
    for (const e of entities) {
      if (e['@type'] === 'BreadcrumbList') for (const [i, item] of (e.itemListElement ?? []).entries()) {
        if (item.position !== i + 1 || !item.name || !item.item) error(route, 'invalid breadcrumb item');
        if (expected?.locale !== config.defaultLocale && !resolve(item.item, route)?.pathname.startsWith('/' + expected.locale + '/')) error(route, 'breadcrumb points outside active locale');
      }
      if (['BlogPosting', 'DiscussionForumPosting'].includes(e['@type'])) {
        if (!e.headline || !e.author?.name || !e.datePublished || Number.isNaN(Date.parse(e.datePublished))) error(route, 'article/discussion missing headline, author or valid published date');
        if (e['@type'] === 'DiscussionForumPosting' && !e.text && !e.image && !e.video) error(route, 'discussion missing text/media');
      }
      if (e['@type'] === 'FAQPage' && (!e.mainEntity?.length || e.mainEntity.some((q) => !q.name || !q.acceptedAnswer?.text))) error(route, 'FAQ requires questions and answers');
      if (e['@type'] === 'Product') {
        const product = config.products[route];
        if (!product || e.sku !== product.sku || !e.name || !e.image) error(route, 'product identity/image mismatch');
        const offer = e.offers;
        const plan = product?.plans.find((p) => p.id === product.featuredPlan);
        if (!offer || offer.priceCurrency !== 'USD' || Number(offer.price) !== plan?.priceUsd) error(route, 'product offer price/currency mismatch');
        if (offer && resolve(offer.url, route)?.pathname !== product?.checkoutPath) error(route, 'product offer checkout mismatch');
        if (offer && resolve(offer.url, route)?.searchParams.get('plan') !== product?.featuredPlan) error(route, 'offer URL does not select the priced plan');
      }
    }
    const product = config.products[route];
    if (product) {
      const panel = nodes.find((n) => 'data-product-checkout' in n.attr);
      let renderedPlans = [];
      try { renderedPlans = JSON.parse(panel?.attr['data-plans'] ?? '[]'); } catch { error(route, 'invalid checkout plan data'); }
      if (panel?.attr['data-buy-url'] !== product.checkoutPath) error(route, 'checkout panel destination mismatch');
      for (const plan of product.plans) {
        const rendered = renderedPlans.find((p) => p.id === plan.id);
        if (!rendered || rendered.priceUsd !== plan.priceUsd || !nodes.some((n) => n.attr.role === 'radio' && n.attr['data-value'] === plan.id)) error(route, `missing/incorrect ${plan.id} plan option`);
      }
      if (!nodes.some((n) => n.tagName === 'a' && n.attr.href === product.checkoutPath + '?plan=' + product.featuredPlan)) error(route, 'default checkout link does not select featured plan');
    }
  }
  for (const route of Object.keys(config.pages)) if (!pages.has(route)) error(route, 'configured page not generated');
  const sitemapFile = path.join(distDir, 'sitemap.xml');
  const xml = fs.existsSync(sitemapFile) ? fs.readFileSync(sitemapFile, 'utf8') : '';
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!xml.includes('http://www.sitemaps.org/schemas/sitemap/0.9') || !locations.length) error('/sitemap.xml', 'missing/invalid sitemap');
  if (new Set(locations).size !== locations.length) error('/sitemap.xml', 'duplicate URLs');
  const indexable = Object.entries(config.pages).filter(([, v]) => v.indexable).map(([p]) => config.origin + p);
  for (const url of locations) if (!indexable.includes(url)) error('/sitemap.xml', `noncanonical, unexpected or noindex URL ${url}`);
  for (const url of indexable) if (!locations.includes(url)) error('/sitemap.xml', `missing indexable URL ${url}`);
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const url = block[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
    const page = url && pages.get(new URL(url).pathname);
    if (!page) continue;
    const lastmod = block[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (lastmod) {
      const article = page.nodes.filter((n) => n.tagName === 'script' && n.attr.type === 'application/ld+json').flatMap((n) => {
        try { const data = JSON.parse(textContent(n)); return data['@graph'] ?? [data]; } catch { return []; }
      }).find((e) => e['@type'] === 'BlogPosting');
      if (Number.isNaN(Date.parse(lastmod)) || (article && lastmod !== (article.dateModified ?? article.datePublished)?.slice(0, 10))) error('/sitemap.xml', `lastmod differs from article date ${url}`);
    }
    const alternates = [...block[1].matchAll(/<xhtml:link\b([^>]+)\/?\s*>/g)].map((m) => Object.fromEntries([...m[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]])));
    const htmlLinks = page.links('alternate').filter((n) => n.attr.hreflang).map((n) => n.attr);
    if (alternates.length !== htmlLinks.length || htmlLinks.some((h) => !alternates.some((x) => x.hreflang === h.hreflang && x.href === h.href))) error('/sitemap.xml', `hreflang differs from HTML ${url}`);
  }
  const robotsFile = path.join(distDir, 'robots.txt');
  const robots = fs.existsSync(robotsFile) ? fs.readFileSync(robotsFile, 'utf8') : '';
  if (!robots.includes(`Sitemap: ${config.origin}/sitemap.xml`)) error('/robots.txt', 'sitemap origin mismatch');
  // Evaluate wildcard/Googlebot groups including longest Allow/Disallow match.
  const groups = []; let group = null;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.split('#')[0].trim(); const colon = line.indexOf(':'); if (colon < 0) continue;
    const key = line.slice(0, colon).toLowerCase(), value = line.slice(colon + 1).trim();
    if (key === 'user-agent') {
      if (!group || group.rules.length) { group = { agents: [], rules: [] }; groups.push(group); }
      group.agents.push(value.toLowerCase());
    } else if (group && ['allow', 'disallow'].includes(key) && value) group.rules.push({ allow: key === 'allow', value });
  }
  const selected = groups.filter((g) => g.agents.includes('googlebot'));
  const rules = (selected.length ? selected : groups.filter((g) => g.agents.includes('*'))).flatMap((g) => g.rules);
  const blocked = (p) => {
    const matches = rules.filter((r) => new RegExp('^' + r.value.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')).test(p));
    matches.sort((a, b) => b.value.length - a.value.length || Number(b.allow) - Number(a.allow));
    return matches[0] && !matches[0].allow;
  };
  for (const url of indexable) if (blocked(new URL(url).pathname)) error('/robots.txt', `blocks indexable page ${url}`);
  for (const route of Object.keys(config.checkouts)) if (!blocked(route)) error('/robots.txt', `checkout not disallowed ${route}`);
  for (const [from, to] of Object.entries(config.redirects)) {
    const destination = follow(from);
    if (!destination) error(from, 'redirect loop');
    else if (!localFile(destination) && !config.checkouts[destination]) error(from, `redirect target missing ${to}`);
    else if (destination !== to) error(from, `redirect chain via ${to}`);
  }
  for (const file of files) {
    if (/\.(css|js)$/.test(file)) {
      const content = fs.readFileSync(file, 'utf8');
      for (const match of content.matchAll(/(?:url\(\s*["']?([^\s)"']+)|["'](\.?\.?\/[^"']+\.(?:js|css|woff2|webp))["'])/g)) {
        checkUrl(match[1] ?? match[2], '/' + path.relative(distDir, file).replaceAll('\\', '/'), { asset: true });
      }
      if (content.includes('__DEFERRED_BOOT_URL__')) error(file, 'unresolved deferred loader');
    }
    if (/\.(webp|png|jpe?g)$/.test(file) && fs.statSync(file).size > config.maxImageBytes) warn(path.relative(distDir, file), 'large raster asset');
  }
  return { ok: errors.length === 0, pages: pages.size, sitemapUrls: locations.length, errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const config = JSON.parse(fs.readFileSync('.astro/validation-config.json', 'utf8'));
    if (config.sourceFingerprint !== sourceFingerprint()) throw new Error('Source/config/assets changed since the production build');
    const result = validateSite(path.resolve('dist'), config);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  } catch (e) {
    console.error(`Validation could not run: ${e.message}. Run npm run build first.`);
    process.exitCode = 1;
  }
}
