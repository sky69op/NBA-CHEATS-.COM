import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from '../src/config/site-url.mjs';
import { elements, textContent } from './html.mjs';

export const LOCALES = ['en', 'es', 'de', 'fr'];
export const INTENTS = ['informational', 'research-comparison', 'commercial', 'features', 'compatibility', 'setup-troubleshooting', 'game-questions-updates'];
export const hash = (value) => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const plain = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const key = (s) => plain(s).toLowerCase().normalize('NFKC');
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const validDate = (s, today) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? '') && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s && s <= today;
const json = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, value) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n'); };
const links = (value) => {
  const result = [...JSON.stringify(value).matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]);
  const visit = (v) => { if (v && typeof v === 'object') { for (const field of ['href', 'sourcePath']) if (typeof v[field] === 'string') result.push(v[field]); Object.values(v).forEach(visit); } };
  visit(value); return result;
};
const paragraphs = (post) => post.body.flatMap((b) => typeof b === 'string' ? [b] : b.type === 'p' ? [b.text] : []);
const renderedText = (s) => plain(s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'));

export function disclosures(brand) {
  return {
    en: `Editorial discussion starter from ${brand}. This is a discussion prompt, not a customer report.`,
    es: `Tema de debate editorial de ${brand}. Es una propuesta de debate, no el relato de un cliente.`,
    de: `Redaktioneller Diskussionsauftakt von ${brand}. Dies ist ein Diskussionsanstoß, kein Kundenbericht.`,
    fr: `Sujet de discussion éditorial proposé par ${brand}. Il s'agit d'une invitation à échanger, pas d'un témoignage client.`,
  };
}

export function makeBrief(config, originalOrigin, today) {
  const origin = new URL(config.site.origin).origin;
  assert(origin === config.site.origin && new URL(origin).protocol === 'https:' && !new URL(origin).hostname.endsWith('.invalid'), 'Supply a confirmed HTTPS origin without a trailing slash');
  assert(new URL(origin).hostname === config.site.domain, 'Origin and domain must agree');
  assert(origin !== originalOrigin, 'Content generation is disabled for the current master origin; provide a NEW conversion target');
  assert(config.approval.conversionRequested === true, 'A future conversion must be requested before preparing content');
  assert(config.site.brandName && config.game.name && !JSON.stringify([config.site, config.game.name]).includes('REPLACE_WITH'), 'Complete target brand and game identity');
  assert(JSON.stringify(config.site.locales) === JSON.stringify(LOCALES), 'This adapter requires all four configured locales');
  const policy = config.contentWorkflow ?? {};
  assert(policy.enabled === true, 'Enable contentWorkflow in the conversion intake');
  assert(validDate(policy.publicationDate, today), 'Supply the actual publication date, not a future or invalid date');
  assert(!(policy.sources ?? []).some((s) => s.id === 'conversion-intake'), 'conversion-intake is reserved for confirmed identity, not product claims');
  const sources = [{ id: 'conversion-intake', kind: 'owner', reference: 'Confirmed identity in conversion intake', verifiedOn: today }, ...(policy.sources ?? [])];
  assert(new Set(sources.map((s) => s.id)).size === sources.length, 'Source IDs must be unique');
  sources.forEach((s) => assert(s.id && ['owner', 'vendor', 'official-game'].includes(s.kind) && s.reference && validDate(s.verifiedOn, today), `Invalid evidence source ${s.id}`));
  const facts = [{ id: 'game.identity', text: config.game.name, sourceIds: ['conversion-intake'] }];
  const sourceIds = new Set(sources.map((s) => s.id));
  const addFact = (fact) => {
    assert(fact.id && plain(fact.text) && fact.sourceIds?.length && fact.sourceIds.every((id) => sourceIds.has(id)), `Fact ${fact.id} needs evidence references`);
    facts.push(fact);
  };
  (policy.gameFacts ?? []).forEach(addFact);
  const products = config.products.filter((p) => p.enabled);
  assert(policy.forumCategories?.length && new Set(policy.forumCategories).size === policy.forumCategories.length, 'Record the existing/rebranded forum category names once');
  assert(products.length === 4 && new Set(products.map((p) => p.dataKey)).size === 4, 'This workflow expects the existing four enabled products');
  for (const p of products) {
    assert(p.name && /^\/[a-z0-9/-]*\/$/.test(p.pagePath) && p.checkoutSlug, `Incomplete product ${p.dataKey}`);
    const refs = p.facts.evidence;
    assert(refs?.length && refs.every((id) => sourceIds.has(id)), `Product ${p.dataKey} requires verified evidence IDs`);
    for (const type of ['features', 'requirements', 'limitations']) for (const [i, text] of (p.facts[type] ?? []).entries()) addFact({ id: `${p.dataKey}.${type}.${i}`, text, sourceIds: refs });
    assert(p.facts.features?.length && p.facts.limitations?.length, `Product ${p.dataKey} needs confirmed features and limitations`);
    for (const plan of p.plans) {
      assert(plan.id && Number.isFinite(plan.priceUsd) && plan.priceUsd >= 0, `Confirm pricing for ${p.dataKey}/${plan.id}`);
      addFact({ id: `${p.dataKey}.plan.${plan.id}`, text: `${plan.priceUsd} ${p.currency}; ${plan.durationDays == null ? 'term requires confirmed wording' : plan.durationDays + ' days'}`, sourceIds: refs });
    }
  }
  assert(new Set(facts.map((f) => f.id)).size === facts.length, 'Fact IDs must be unique');
  return {
    version: 1, inputHash: hash(config), originalOrigin, origin, game: config.game.name, brand: config.site.brandName,
    publicationDate: policy.publicationDate, preparedOn: today, locales: LOCALES,
    // Four enabled products require 20–25 complete English items each.
    // The pack therefore cannot be planned or approved below 80 total blogs
    // and 80 total editorial forum discussions.
    targets: { blog: [80, 100], forum: [80, 100] },
    products, sources, facts, categories: policy.forumCategories ?? [],
    commercialPaths: ['/', '/products/', ...products.map((p) => p.pagePath), '/faq/', '/support/', '/about/', '/blog/', '/forum/'],
    disclosures: disclosures(config.site.brandName),
  };
}

export function prepare(config, root, originalOrigin, today, priorBrief) {
  if (priorBrief) assert(priorBrief.origin === config.site.origin && [priorBrief.originalOrigin, priorBrief.origin].includes(originalOrigin), 'Prior run must belong to this same conversion target');
  const dir = path.join(root, '.content', hash(config).slice(0, 16));
  if (fs.existsSync(path.join(dir, 'brief.json'))) {
    const saved = json(path.join(dir, 'brief.json'));
    assert(saved.inputHash === hash(config) && [saved.originalOrigin, saved.origin].includes(originalOrigin), 'Run identity mismatch');
    makeBrief(config, saved.originalOrigin, today);
    return dir; // Resume; never overwrite existing plans/drafts.
  }
  const brief = makeBrief(config, priorBrief?.originalOrigin ?? originalOrigin, today);
  write(path.join(dir, 'brief.json'), brief);
  write(path.join(dir, 'plan.json'), { version: 1, inputHash: brief.inputHash, pages: [], shortfalls: {} });
  write(path.join(dir, 'pack.json'), { version: 1, inputHash: brief.inputHash, planHash: null, locales: Object.fromEntries(LOCALES.map((l) => [l, { commercial: [], blog: [], forum: [] }])), reviews: {} });
  fs.writeFileSync(path.join(dir, 'NEXT.md'), 'Read docs/content-workflow.md once. Plan topics/keyword-to-URL ownership in plan.json, then run content:plan. Codex authors the pack in batches; these scripts do not call an LLM or write filler. Resume completed batches instead of regenerating them.\n');
  return dir;
}

export function checkPlan(brief, plan) {
  assert(plan.inputHash === brief.inputHash && Array.isArray(plan.pages), 'Plan must belong to the prepared brief');
  const paths = new Set(), keywords = new Set(), intents = new Set();
  const facts = new Set(brief.facts.map((f) => f.id));
  for (const p of plan.pages) {
    assert(['commercial', 'blog', 'forum'].includes(p.kind) && /^\/(?:[a-z0-9-]+\/)*$/.test(p.path), `Invalid planned route ${p.path}`);
    assert(!paths.has(p.path), `Duplicate route ${p.path}`); paths.add(p.path);
    assert(plain(p.primaryKeyword) && !keywords.has(key(p.primaryKeyword)), `Duplicate/missing primary keyword at ${p.path}`); keywords.add(key(p.primaryKeyword));
    assert(INTENTS.includes(p.intent) && p.intentKey && !intents.has(key(p.intentKey)), `Duplicate/missing search-intent owner at ${p.path}`); intents.add(key(p.intentKey));
    assert(plain(p.readerQuestion) && plain(p.uniqueValue), `Explain reader need and distinct value at ${p.path}`);
    assert(p.factIds?.length && p.factIds.every((f) => facts.has(f)), `Unknown/missing facts at ${p.path}`);
    assert(Array.isArray(p.links) && p.links.length, `Plan internal links at ${p.path}`);
    if (p.kind === 'blog') assert(/^\/blog\/[a-z0-9-]+\/$/.test(p.path), `Invalid article slug ${p.path}`);
    if (p.kind === 'forum') assert(/^\/forum\/[a-z0-9-]+\/$/.test(p.path), `Invalid discussion slug ${p.path}`);
  }
  for (const route of brief.commercialPaths) assert(plan.pages.some((p) => p.path === route && p.kind === 'commercial'), `Missing commercial page ${route}`);
  for (const kind of ['blog', 'forum']) {
    const count = plan.pages.filter((p) => p.kind === kind).length;
    const [min, max] = brief.targets[kind];
    assert(count > 0 && count <= max, `${kind} target is ${min}-${max}; no padding or empty batch`);
    if (count < min) assert(plain(plan.shortfalls?.[kind]).length >= 40, `Explain why fewer genuinely distinct ${kind} topics are justified`);
  }
  const known = new Set([...paths, '/blog/', '/forum/', '/support/']);
  for (const p of plan.pages) for (const href of p.links) assert(known.has(href) && href !== p.path, `Unknown/self planned link ${p.path} -> ${href}`);
  return { ok: true, pages: plan.pages.length };
}

function overlap(a, b) {
  const shingles = (s) => { const words = key(s).match(/[\p{L}\p{N}]+/gu) ?? []; return new Set(words.slice(0, -7).map((_, i) => words.slice(i, i + 8).join(' '))); };
  const x = shingles(a), y = shingles(b);
  if (Math.min(x.size, y.size) < 30) return 0;
  return [...x].filter((s) => y.has(s)).length / Math.min(x.size, y.size);
}

export function checkPack(brief, plan, pack, today) {
  checkPlan(brief, plan);
  assert(pack.inputHash === brief.inputHash, 'Draft pack belongs to a different intake');
  assert(pack.planHash === hash(plan), 'Draft pack must reference the checked plan hash; re-review affected drafts after plan changes');
  assert(pack.reviews?.facts === true && pack.reviews?.distinctIntents === true && pack.reviews?.originalWriting === true, 'Codex must complete factual, intent and original-writing review');
  const known = new Set([...plan.pages.map((p) => p.path), '/blog/', '/forum/', '/support/', ...brief.products.map((p) => `/go/${p.checkoutSlug}/`)]);
  const productPaths = new Set(brief.products.map((p) => p.pagePath));
  for (const locale of brief.locales) {
    const draft = pack.locales?.[locale];
    assert(draft && pack.reviews.translations?.[locale] === true, `Missing completed/reviewed locale ${locale}`);
    const seenTitles = new Set(), seenH1s = new Set(), seenDescriptions = new Set();
    for (const kind of ['commercial', 'blog', 'forum']) {
      const rows = draft[kind];
      assert(Array.isArray(rows), `Missing ${locale}/${kind}`);
      const planned = plan.pages.filter((p) => p.kind === kind);
      assert(rows.length === planned.length, `${locale}/${kind}: complete the planned inventory`);
      const seen = new Set();
      for (const row of rows) {
        const route = kind === 'commercial' ? row.path : `/${kind}/${row.slug}/`;
        const topic = planned.find((p) => p.path === route);
        assert(topic && !seen.has(route), `Unexpected/duplicate ${locale} route ${route}`); seen.add(route);
        assert(row.factIds?.length && row.factIds.every((id) => topic.factIds.includes(id)), `Draft facts must reference the plan at ${locale}${route}`);
        const prices = brief.products.flatMap((p) => p.plans.filter((plan) => row.factIds.includes(`${p.dataKey}.plan.${plan.id}`)).map((plan) => plan.priceUsd));
        for (const match of JSON.stringify(row).matchAll(/(?:[$€£]\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:USD|EUR|GBP|\$|€|£))/g)) assert(prices.includes(Number((match[1] ?? match[2]).replace(',', '.'))), `Unreferenced/incorrect price in ${locale}${route}`);
        const h1 = kind === 'forum' ? row.title : row.h1;
        const description = kind === 'forum' ? row.excerpt : row.metaDescription;
        for (const [value, registry, label] of [[row.title, seenTitles, 'title'], [h1, seenH1s, 'H1'], [description, seenDescriptions, 'description']]) {
          assert(plain(value) && !registry.has(key(value)), `${locale}: duplicate/empty ${label} at ${route}`); registry.add(key(value));
        }
        assert(description.length <= 155 && (row.metaTitle ?? row.title).length <= 60, `Curate concise metadata at ${locale}${route}`);
        let outbound = links(row);
        if (kind === 'commercial') {
          const minimum = ['/blog/', '/forum/'].includes(route) ? 1 : 2;
          assert(row.sections?.length >= minimum && row.sections.every((s) => plain(s.heading) && s.paragraphs?.length && s.paragraphs.every((p) => plain(p))), `Commercial/hub page needs useful original sections at ${locale}${route}`);
          assert(row.cta?.label && known.has(row.cta.href), `Missing commercial CTA at ${locale}${route}`);
        } else {
          assert(validDate(kind === 'blog' ? row.date : row.published, today), `Invalid/future publication date at ${locale}${route}`);
          assert((kind === 'blog' ? row.date : row.published) === brief.publicationDate, `Use the planned actual publication date at ${locale}${route}`);
          assert(row.body?.length && paragraphs(row).every((p) => plain(p)), `Empty body at ${locale}${route}`);
          assert(outbound.some((href) => productPaths.has(href)), `Add a relevant product link at ${locale}${route}`);
          for (const href of topic.links) assert(outbound.includes(href), `Planned contextual link missing at ${locale}${route}: ${href}`);
          if (kind === 'blog') {
            assert(row.metaTitle && row.image?.startsWith('/images/') && row.imageAlt && row.desc && row.tag && row.readTime, `Complete article fields at ${locale}${route}`);
            assert(Number.isInteger(row.imageWidth) && row.imageWidth > 0 && Number.isInteger(row.imageHeight) && row.imageHeight > 0, `Record actual image dimensions at ${locale}${route}`);
            assert(!row.author || row.author === brief.brand, `Use declared brand editorial authorship at ${locale}${route}`);
            assert(row.body.filter((b) => b.type === 'h2').length >= 2 && paragraphs(row).length >= 3, `Answer the topic with useful sections at ${locale}${route}`);
            let hasH2 = false;
            for (const b of row.body) {
              assert(['h2', 'h3', 'p', 'ul', 'table', 'cta'].includes(b.type), 'Unsupported article block');
              if (['h2', 'h3', 'p'].includes(b.type)) assert(plain(b.text), `Empty article block at ${locale}${route}`);
              if (b.type === 'ul') assert(b.items?.length && b.items.every((s) => plain(s)), 'Lists need substantive items');
              if (b.type === 'table') assert(b.headers?.length && b.rows?.length && b.headers.every((s) => plain(s)) && b.rows.every((r) => r.length === b.headers.length && r.every((s) => plain(s))), 'Tables need headers and complete rows');
              if (b.type === 'cta') assert(b.title && b.text && productPaths.has(b.href), 'CTA blocks need relevant product paths and context');
              if (b.type === 'h2') hasH2 = true;
              if (b.type === 'h3') assert(hasH2, 'H3 cannot precede H2');
            }
            assert(outbound.some((href) => href.startsWith('/blog/') && href !== route && href !== '/blog/'), `Link a related article at ${locale}${route}`);
            assert(row.body.some((b) => b.type === 'cta' && b.title && b.text && productPaths.has(b.href)), `Add a contextual product CTA at ${locale}${route}`);
          } else {
            assert(row.author === brief.brand && row.authorType === 'Organization' && row.authorship === 'editorial', `Use declared editorial authorship at ${locale}${route}`);
            assert(row.age === '', `Use publication dates, not invented forum age at ${locale}${route}`);
            assert(row.body[0] === brief.disclosures[locale], `Missing editorial disclosure at ${locale}${route}`);
            assert(row.body.length >= 2, `Write a useful editorial question at ${locale}${route}`);
            assert(row.upvotes === 0 && row.commentsCount === 0 && Array.isArray(row.comments) && row.comments.length === 0, `Do not invent forum activity at ${locale}${route}`);
            assert(brief.categories.includes(row.category) && ['purple', 'blue', 'green', 'orange'].includes(row.categoryTone), `Use an existing configured forum category at ${locale}${route}`);
          }
        }
        for (const href of outbound) assert(known.has(href.split('#')[0]) || href.startsWith('#'), `Unknown internal target at ${locale}${route}: ${href}`);
        const copy = kind === 'commercial' ? row.sections : row.body;
        // Commercial pages are rendered from native locale dictionaries and are
        // verified against their rendered titles, metadata, links and approved
        // visible text in verifyIntegratedContent. Editorial packs additionally
        // require a source-level fallback comparison here.
        if (locale !== 'en' && kind !== 'commercial') {
          const english = pack.locales.en[kind].find((p) => (kind === 'commercial' ? p.path : p.slug) === (kind === 'commercial' ? row.path : row.slug));
          assert(english && hash(copy) !== hash(kind === 'commercial' ? english.sections : english.body), `English fallback presented as ${locale} at ${route}`);
          const editorialText = (p) => [p.title, p.h1 ?? '', p.metaTitle ?? '', ...(kind === 'commercial' ? p.sections.flatMap((s) => [s.heading, ...s.paragraphs]) : [...paragraphs(p), ...p.body.filter((b) => b.type === 'h2' || b.type === 'h3').map((b) => b.text)])];
          const englishText = editorialText(english);
          const translatedText = editorialText(row);
          for (const text of [...translatedText, description]) {
            const normalized = renderedText(text);
            const properName = [brief.game, brief.brand, ...brief.products.map((p) => p.name)].includes(normalized);
            if (!properName && normalized.length >= 35 && normalized.split(/\s+/).length >= 5) assert(![...englishText, kind === 'forum' ? english.excerpt : english.metaDescription].some((s) => renderedText(s) === normalized), `Untranslated English paragraph/description/heading in ${locale} at ${route}`);
          }
          assert(hash(row.factIds.slice().sort()) === hash(english.factIds.slice().sort()), `Translation changed fact coverage at ${locale}${route}`);
        }
        assert(!/REPLACE_WITH_|\{(?:gameName|siteName|siteDomain)\}/.test(JSON.stringify(row)), `Unresolved copy at ${locale}${route}`);
      }
    }
    for (let i = 0; i < draft.blog.length; i++) for (let j = i + 1; j < draft.blog.length; j++) assert(overlap(paragraphs(draft.blog[i]).join(' '), paragraphs(draft.blog[j]).join(' ')) < 0.55, `Near-duplicate article prose in ${locale}: ${draft.blog[i].slug}/${draft.blog[j].slug}`);
    // Existing hubs link every entry; require contextual article-to-article inbound links as well.
    for (const post of draft.blog) assert(draft.blog.some((other) => other.slug !== post.slug && links(other).includes(`/blog/${post.slug}/`)), `Article lacks contextual inbound link: ${locale}/${post.slug}`);
  }
  return { ok: true, locales: brief.locales.length, articles: pack.locales.en.blog.length, discussions: pack.locales.en.forum.length };
}

const BLOG_FIELDS = ['slug', 'title', 'h1', 'tag', 'desc', 'metaTitle', 'metaDescription', 'date', 'readTime', 'featured', 'author', 'image', 'imageAlt', 'imageWidth', 'imageHeight', 'body'];
const FORUM_FIELDS = ['slug', 'category', 'categoryTone', 'title', 'excerpt', 'author', 'authorType', 'age', 'published', 'commentsCount', 'upvotes', 'flair', 'body', 'comments', 'sourceTitle', 'sourcePath'];
const pick = (row, fields) => Object.fromEntries(fields.filter((f) => row[f] !== undefined).map((f) => [f, row[f]]));

export function compilePack(brief, plan, pack, today) {
  checkPack(brief, plan, pack, today);
  const files = {}, pages = {};
  for (const locale of brief.locales) {
    const draft = pack.locales[locale];
    for (const kind of ['blog', 'forum']) {
      const blog = kind === 'blog';
      const file = blog ? `src/data/blog/posts/${locale}-articles.ts` : `src/data/forum/${locale}-posts.ts`;
      const type = blog ? 'BlogPostFull' : 'ForumPost';
      const typePath = blog ? '../types' : './types';
      const name = `${locale}${blog ? 'BlogArticles' : 'ForumPosts'}`;
      files[file] = `// Generated during an authorized conversion; editorial provenance: content/manifest.json.\nimport type { ${type} } from '${typePath}';\n\nexport const ${name}: ${type}[] = ${JSON.stringify(draft[kind].map((p) => pick(p, blog ? BLOG_FIELDS : FORUM_FIELDS)), null, 2)};\n`;
    }
    for (const kind of ['commercial', 'blog', 'forum']) for (const row of draft[kind]) {
      const route = kind === 'commercial' ? row.path : `/${kind}/${row.slug}/`;
      const texts = kind === 'commercial' ? row.sections.flatMap((s) => [s.heading, ...s.paragraphs]) : paragraphs(row);
      const localized = (locale === 'en' ? '' : '/' + locale) + route;
      pages[localized] = {
        kind, h1: kind === 'forum' ? row.title : row.h1,
        title: kind === 'commercial' ? row.title : null,
        description: kind === 'commercial' ? row.metaDescription : null,
        textHashes: texts.map((s) => hash(renderedText(s))),
        links: plan.pages.find((p) => p.path === route).links,
        factIds: row.factIds, ...(row.cta ? { cta: row.cta } : {}),
      };
    }
  }
  return { files, manifest: { version: 1, origin: brief.origin, originalOrigin: brief.originalOrigin, inputHash: brief.inputHash, publicationDate: brief.publicationDate, sources: brief.sources, facts: brief.facts, plan, reviews: pack.reviews, pages, fileHashes: Object.fromEntries(Object.entries(files).map(([p, text]) => [p, hash(text.replaceAll('\r\n', '\n'))])) } };
}

export function installPack(brief, plan, pack, root, currentOrigin, today) {
  assert(currentOrigin === brief.origin && currentOrigin !== brief.originalOrigin, 'Install only after the NEW site origin is configured; current master content is protected');
  const compiled = compilePack(brief, plan, pack, today);
  const previous = path.join(root, 'content/manifest.json');
  if (fs.existsSync(previous)) for (const [file, digest] of Object.entries(json(previous).fileHashes)) {
    const current = hash(fs.readFileSync(path.join(root, file), 'utf8').replaceAll('\r\n', '\n'));
    assert(current === digest || current === compiled.manifest.fileHashes[file], `Manual editorial edits detected in ${file}; reconcile them before reinstalling`);
  }
  for (const file of Object.keys(compiled.files)) {
    const backup = path.join(root, '.content/backups', brief.inputHash.slice(0, 16), file);
    if (!fs.existsSync(backup)) { fs.mkdirSync(path.dirname(backup), { recursive: true }); fs.copyFileSync(path.join(root, file), backup); }
  }
  for (const [file, text] of Object.entries(compiled.files)) fs.writeFileSync(path.join(root, file), text);
  write(path.join(root, 'content/manifest.json'), compiled.manifest);
  return Object.keys(compiled.files);
}

/** Optional build gate: no manifest means the existing master site is entirely unchanged. */
export function verifyIntegratedContent(root, distDir, origin, relationships) {
  const file = path.join(root, 'content/manifest.json');
  if (!fs.existsSync(file)) {
    const policyFile = path.join(root, 'content/policy.json');
    const policy = fs.existsSync(policyFile) ? json(policyFile) : {};
    assert(!policy.requireManifestForNewOrigins || origin === policy.templateOrigin, 'New conversion origin requires content/manifest.json; complete the content workflow before building');
    return { active: false };
  }
  const manifest = json(file);
  assert(manifest.origin === origin && manifest.origin !== manifest.originalOrigin, 'Content manifest belongs to another conversion origin');
  for (const [relative, expected] of Object.entries(manifest.fileHashes)) assert(hash(fs.readFileSync(path.join(root, relative), 'utf8').replaceAll('\r\n', '\n')) === expected, `Approved editorial source changed: ${relative}; update the reviewed pack, not just the manifest`);
  for (const [route, expected] of Object.entries(manifest.pages)) {
    const file = path.join(distDir, route, 'index.html');
    assert(fs.existsSync(file), `Generated content route missing: ${route}`);
    const nodes = elements(fs.readFileSync(file, 'utf8'));
    const texts = new Set(nodes.filter((n) => !['script', 'style'].includes(n.tagName)).map((n) => hash(plain(textContent(n)))));
    const h1 = nodes.find((n) => n.tagName === 'h1');
    assert(h1 && plain(textContent(h1)) === expected.h1, `Wrong/missing localized content H1: ${route}`);
    if (expected.title) assert(nodes.find((n) => n.tagName === 'title') && textContent(nodes.find((n) => n.tagName === 'title')) === expected.title, `Commercial title differs from approved copy: ${route}`);
    if (expected.description) assert(nodes.some((n) => n.tagName === 'meta' && n.attr.name === 'description' && n.attr.content === expected.description), `Commercial metadata differs: ${route}`);
    for (const digest of expected.textHashes) assert(texts.has(digest), `Approved/translated paragraph or heading missing: ${route}`);
    if (expected.cta) {
      const href = expected.cta.href.startsWith('/go/') ? expected.cta.href : (LOCALES.slice(1).includes(route.split('/')[1]) ? '/' + route.split('/')[1] : '') + expected.cta.href;
      assert(nodes.some((n) => n.tagName === 'a' && n.attr.href === href && plain(textContent(n)) === expected.cta.label), `Approved CTA missing: ${route}`);
    }
    for (const target of expected.links) {
      const prefix = LOCALES.slice(1).includes(route.split('/')[1]) ? '/' + route.split('/')[1] : '';
      const href = target.startsWith('/go/') ? target : prefix + target;
      assert(nodes.some((n) => n.tagName === 'a' && n.attr.href === href), `Planned internal link missing in output: ${route} -> ${href}`);
    }
    if (expected.kind === 'forum') {
      const schema = nodes.filter((n) => n.tagName === 'script' && n.attr.type === 'application/ld+json').flatMap((n) => { const data = JSON.parse(textContent(n)); return data['@graph'] ?? [data]; });
      assert(schema.some((e) => e['@type'] === 'DiscussionForumPosting' && e.author?.['@type'] === 'Organization'), `Editorial forum author must not be a fictitious person: ${route}`);
    }
  }
  for (const locale of LOCALES) for (const kind of ['blog', 'forum']) {
    const prefix = (locale === 'en' ? '' : '/' + locale) + '/' + kind + '/';
    const actual = fs.readdirSync(path.join(distDir, prefix), { withFileTypes: true }).filter((e) => e.isDirectory() && fs.existsSync(path.join(distDir, prefix, e.name, 'index.html'))).map((e) => prefix + e.name + '/').sort();
    const expected = Object.entries(manifest.pages).filter(([p, v]) => p.startsWith(prefix) && v.kind === kind).map(([p]) => p).sort();
    assert(hash(actual) === hash(expected), `Incomplete or extra editorial routes in ${prefix}`);
  }
  if (relationships) for (const product of relationships) {
    assert(product.relatedBlogSlugs.length && product.relatedForumSlugs.length, `Refresh related content for ${product.slug}`);
    for (const slug of product.relatedBlogSlugs) assert(manifest.pages[`/blog/${slug}/`], `Stale related guide ${product.slug}/${slug}`);
    for (const slug of product.relatedForumSlugs) assert(manifest.pages[`/forum/${slug}/`], `Stale related discussion ${product.slug}/${slug}`);
  }
  return { active: true, pages: Object.keys(manifest.pages).length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, ...args] = process.argv.slice(2);
    const arg = (flag) => { const i = args.indexOf(flag); return i < 0 ? null : args[i + 1]; };
    const root = process.cwd();
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(new Date());
    if (command === 'prepare') {
      assert(arg('--config'), 'Use --config <filled-conversion.json>');
      let priorBrief;
      if (arg('--from-run')) {
        const prior = path.resolve(arg('--from-run'));
        assert(prior.startsWith(path.join(root, '.content') + path.sep), 'Prior run must be inside this repository .content directory');
        priorBrief = json(path.join(prior, 'brief.json'));
      }
      // A conversion can legitimately resume after its target origin has already
      // been configured.  In that case the immutable policy records the master
      // template origin; using SITE_URL here would incorrectly reject the run as
      // though it were still the master site.
      const policyFile = path.join(root, 'content', 'policy.json');
      const policy = fs.existsSync(policyFile) ? json(policyFile) : {};
      const originalOrigin = priorBrief?.origin ?? policy.templateOrigin ?? SITE_URL;
      console.log(prepare(json(arg('--config')), root, originalOrigin, today, priorBrief));
    } else {
      const run = path.resolve(arg('--run') ?? '');
      assert(run.startsWith(path.join(root, '.content') + path.sep), 'Use --run <directory returned by content:prepare>');
      const brief = json(path.join(run, 'brief.json')), plan = json(path.join(run, 'plan.json'));
      if (command === 'plan') {
        const result = { ...checkPlan(brief, plan), planHash: hash(plan) };
        write(path.join(run, 'plan-receipt.json'), result);
        console.log(result);
      }
      else {
        const pack = json(path.join(run, 'pack.json'));
        if (command === 'check') console.log(checkPack(brief, plan, pack, today));
        else if (command === 'install') console.log({ written: installPack(brief, plan, pack, root, SITE_URL, today), next: 'Integrate commercial copy in native data files, then build and validate. The content manifest blocks missing/incomplete translations.' });
        else throw new Error('Unknown content workflow command');
      }
    }
  } catch (e) { console.error(`Content workflow: ${e.message}`); process.exitCode = 1; }
}
