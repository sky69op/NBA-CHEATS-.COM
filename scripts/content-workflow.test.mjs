import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { LOCALES, hash, makeBrief, prepare, checkPlan, checkPack, compilePack, installPack, verifyIntegratedContent } from './content-workflow.mjs';

// Deliberately synthetic, non-published fixture copy. No fixture touches the real site's data.
const TODAY = '2026-10-30', ORIGINAL = 'https://master.example', TARGET = 'https://conversion.example';
function fixture(blogCount = 2, forumCount = 2) {
  const config = {
    approval: { conversionRequested: true }, site: { origin: TARGET, domain: 'conversion.example', brandName: 'Fixture Editorial', locales: LOCALES }, game: { name: 'Fixture Game' },
    contentWorkflow: { enabled: true, publicationDate: TODAY, forumCategories: ['Questions'], sources: [{ id: 'owner', kind: 'owner', reference: 'Synthetic test facts only', verifiedOn: TODAY }] },
    products: ['elite', 'hwid-spoofer', 'ugc', 'skin-changer'].map((id, i) => ({
      dataKey: id, enabled: true, name: 'Fixture product ' + i, pagePath: i === 0 ? '/cheats/' : `/${id}/`, checkoutSlug: 'fixture-' + i,
      currency: 'USD', plans: [{ id: 'monthly', priceUsd: 35, durationDays: 30 }],
      facts: { evidence: ['owner'], features: ['Fixture feature'], requirements: [], limitations: ['Fixture limitation'] },
    })),
  };
  const brief = makeBrief(config, ORIGINAL, TODAY);
  const blogPaths = Array.from({ length: blogCount }, (_, i) => `/blog/guide-${i}/`);
  const forumPaths = Array.from({ length: forumCount }, (_, i) => `/forum/question-${i}/`);
  const pages = [
    ...brief.commercialPaths.map((p) => ({ path: p, kind: 'commercial' })),
    ...blogPaths.map((p) => ({ path: p, kind: 'blog' })),
    ...forumPaths.map((p) => ({ path: p, kind: 'forum' })),
  ].map((p, i) => ({ ...p, primaryKeyword: `fixture keyword ${i}`, intent: p.kind === 'commercial' ? 'commercial' : 'informational', intentKey: 'reader-need-' + i, readerQuestion: 'Fixture reader question ' + i, uniqueValue: 'Fixture distinct answer ' + i, factIds: ['game.identity'], links: p.kind === 'commercial' ? [p.path === '/blog/' ? '/forum/' : '/blog/'] : ['/cheats/', ...(p.kind === 'blog' ? [blogPaths[(blogPaths.indexOf(p.path) + 1) % blogPaths.length]] : [blogPaths[0]])] }));
  const plan = { inputHash: brief.inputHash, pages, shortfalls: { blog: 'Test fixture intentionally uses two distinct topics, without publishing any content.', forum: 'Test fixture intentionally uses two editorial prompts; these never represent real users.' } };
  const pack = { inputHash: brief.inputHash, planHash: hash(plan), reviews: { facts: true, distinctIntents: true, originalWriting: true, translations: Object.fromEntries(LOCALES.map((l) => [l, true])) }, locales: {} };
  for (const l of LOCALES) pack.locales[l] = {
    commercial: brief.commercialPaths.map((p, i) => ({ path: p, title: `${l} fixture commercial ${i}`, h1: `${l} commercial heading ${i}`, metaDescription: `${l} distinct fixture commercial description ${i}`, factIds: ['game.identity'], sections: [{ heading: `${l} section ${i}`, paragraphs: [`${l} fixture useful paragraph ${i}`] }, { heading: `${l} second section ${i}`, paragraphs: [`${l} further useful paragraph ${i}`] }], cta: { label: `${l} browse fixture`, href: '/cheats/' } })),
    blog: blogPaths.map((p, i) => ({ slug: p.split('/')[2], title: `${l} article ${i}`, h1: `${l} article heading ${i}`, metaTitle: `${l} article metadata ${i}`, metaDescription: `${l} unique article description ${i}`, desc: `${l} fixture excerpt ${i}`, tag: `${l} fixture guides`, date: TODAY, readTime: '3 min', image: '/images/fixture.webp', imageAlt: `${l} fixture diagram`, imageWidth: 1024, imageHeight: 576, factIds: ['game.identity'], body: [
      { type: 'h2', text: `${l} first answer ${i}` }, { type: 'p', text: `${l} fixture product explanation ${i} [product](/cheats/)` },
      { type: 'h2', text: `${l} next answer ${i}` }, { type: 'p', text: `${l} fixture related explanation ${i} [related](${blogPaths[(i + 1) % blogPaths.length]})` },
      { type: 'p', text: `${l} fixture further detail ${i}` }, { type: 'cta', title: `${l} product options ${i}`, text: `${l} compare fixture details ${i}`, href: '/cheats/' },
    ] })),
    forum: forumPaths.map((p, i) => ({ slug: p.split('/')[2], category: 'Questions', categoryTone: 'purple', title: `${l} discussion ${i}`, excerpt: `${l} editorial question ${i}`, author: brief.brand, authorType: 'Organization', authorship: 'editorial', age: '', published: TODAY, commentsCount: 0, upvotes: 0, comments: [], factIds: ['game.identity'], body: [brief.disclosures[l], `${l} fixture question ${i} [product](/cheats/) [guide](${blogPaths[0]})`] })),
  };
  return { config, brief, plan, pack };
}
function temp(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-workflow-test-'));
  t.after(() => { assert.ok(root.startsWith(path.join(os.tmpdir(), 'content-workflow-test-'))); fs.rmSync(root, { recursive: true, force: true }); });
  for (const l of LOCALES) for (const p of [`src/data/blog/posts/${l}-articles.ts`, `src/data/forum/${l}-posts.ts`]) {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), 'original fixture source');
  }
  return root;
}

test('content preparation protects master origin, creates resumable drafts and never rewrites them', (t) => {
  const { config } = fixture(), root = temp(t);
  assert.throws(() => makeBrief(config, TARGET, TODAY), /current master origin/);
  const run = prepare(config, root, ORIGINAL, TODAY);
  fs.writeFileSync(path.join(run, 'plan.json'), 'preserved draft');
  assert.equal(prepare(config, root, TARGET, TODAY), run);
  assert.equal(fs.readFileSync(path.join(run, 'plan.json'), 'utf8'), 'preserved draft');
  assert.equal(fs.existsSync(path.join(root, 'content/manifest.json')), false);
});

test('evidence, approval and actual dates are required before generation', () => {
  for (const mutate of [c => c.approval.conversionRequested = false, c => c.products[0].facts.evidence = [], c => c.contentWorkflow.publicationDate = '2026-02-31', c => c.contentWorkflow.publicationDate = '2026-11-01']) {
    const { config } = fixture(); mutate(config); assert.throws(() => makeBrief(config, ORIGINAL, TODAY));
  }
});

test('changed inputs after the origin switch require an explicit prior run and preserve earlier drafts', (t) => {
  const { config, brief } = fixture(), root = temp(t);
  const first = prepare(config, root, ORIGINAL, TODAY);
  config.products[0].plans[0].priceUsd = 40;
  assert.throws(() => prepare(config, root, TARGET, TODAY), /current master origin/);
  const next = prepare(config, root, TARGET, TODAY, brief);
  assert.notEqual(next, first);
  assert.ok(fs.existsSync(path.join(first, 'pack.json')));
  assert.equal(JSON.parse(fs.readFileSync(path.join(next, 'brief.json'), 'utf8')).originalOrigin, ORIGINAL);
});

test('complete four-locale fixture compiles to existing typed blog/forum exports', () => {
  const { brief, plan, pack } = fixture();
  assert.deepEqual(checkPack(brief, plan, pack, TODAY), { ok: true, locales: 4, articles: 2, discussions: 2 });
  const result = compilePack(brief, plan, pack, TODAY);
  assert.equal(Object.keys(result.files).length, 8);
  for (const [file, code] of Object.entries(result.files)) {
    assert.equal(ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true).parseDiagnostics.length, 0);
    assert.ok(!code.includes('factIds')); assert.ok(!code.includes('authorship'));
  }
});

test('normal conversion targets accept eight articles and ten editorial starters per locale', () => {
  const { brief, plan, pack } = fixture(8, 10);
  assert.deepEqual(checkPack(brief, plan, pack, TODAY), { ok: true, locales: 4, articles: 8, discussions: 10 });
});

const failures = [
  ['duplicate intent', (f) => f.plan.pages[1].intentKey = f.plan.pages[0].intentKey],
  ['duplicate keyword', (f) => f.plan.pages[1].primaryKeyword = f.plan.pages[0].primaryKeyword],
  ['unexplained topic shortfall', (f) => f.plan.shortfalls = {}],
  ['missing locale', (f) => delete f.pack.locales.fr],
  ['English fallback', (f) => f.pack.locales.fr.blog[0].body = structuredClone(f.pack.locales.en.blog[0].body)],
  ['one untranslated paragraph', (f) => { f.pack.locales.en.blog[0].body[1].text = 'This deliberately long English fixture paragraph must be translated for readers [product](/cheats/)'; f.pack.locales.fr.blog[0].body[1].text = f.pack.locales.en.blog[0].body[1].text; }],
  ['invented user votes', (f) => f.pack.locales.en.forum[0].upvotes = 5],
  ['invented user identity', (f) => f.pack.locales.en.forum[0].author = 'PretendBuyer'],
  ['missing disclosure', (f) => f.pack.locales.en.forum[0].body.shift()],
  ['future article date', (f) => f.pack.locales.en.blog[0].date = '2026-11-01'],
  ['unsupported price', (f) => f.pack.locales.en.blog[0].body[1].text += ' costs $999'],
  ['unmapped fact', (f) => f.pack.locales.en.blog[0].factIds = ['made-up-feature']],
  ['missing contextual CTA', (f) => f.pack.locales.en.blog[0].body.pop()],
  ['broken internal target', (f) => f.pack.locales.en.blog[0].body[1].text += ' [bad](/missing/)'],
  ['missing translated fact coverage', (f) => f.pack.locales.fr.blog[0].factIds = []],
];
const messages = [/search-intent owner/, /primary keyword/, /Explain why/, /Missing completed/, /English fallback/, /Untranslated English/, /forum activity/, /editorial authorship/, /editorial disclosure/, /Invalid\/future/, /incorrect price/, /Draft facts/, /contextual product CTA/, /Unknown internal target/, /Draft facts/];
for (const [i, [name, mutate]] of failures.entries()) test(`content check rejects ${name}`, () => { const f = fixture(); mutate(f); assert.throws(() => checkPack(f.brief, f.plan, f.pack, TODAY), messages[i]); });

test('changed topic plans invalidate reviewed drafts; referenced prices remain consistent in translation', () => {
  const f = fixture(); f.plan.pages[0].readerQuestion += ' changed';
  assert.throws(() => checkPack(f.brief, f.plan, f.pack, TODAY), /checked plan hash/);
  const fact = 'elite.plan.monthly'; f.plan.pages[0].factIds.push(fact); f.pack.planHash = hash(f.plan);
  for (const locale of LOCALES) { f.pack.locales[locale].commercial[0].factIds.push(fact); f.pack.locales[locale].commercial[0].sections[0].paragraphs[0] += ` ${locale}: $35`; }
  assert.equal(checkPack(f.brief, f.plan, f.pack, TODAY).ok, true);
  f.pack.locales.fr.commercial[0].sections[0].paragraphs[0] += ' $50';
  assert.throws(() => checkPack(f.brief, f.plan, f.pack, TODAY), /incorrect price/);
});

test('installation is guarded, backs up originals, emits only eight data modules and protects manual edits', (t) => {
  const root = temp(t), { brief, plan, pack } = fixture();
  assert.throws(() => installPack(brief, plan, pack, root, ORIGINAL, TODAY), /master content is protected/);
  const written = installPack(brief, plan, pack, root, TARGET, TODAY);
  assert.equal(written.length, 8);
  for (const file of written) assert.equal(fs.readFileSync(path.join(root, '.content/backups', brief.inputHash.slice(0, 16), file), 'utf8'), 'original fixture source');
  fs.appendFileSync(path.join(root, written[0]), '\n// manual work');
  assert.throws(() => installPack(brief, plan, pack, root, TARGET, TODAY), /Manual editorial edits/);
});

test('build gate is inactive for existing master and blocks missing approved localized output', (t) => {
  const root = temp(t), { brief, plan, pack } = fixture();
  assert.deepEqual(verifyIntegratedContent(root, path.join(root, 'dist'), ORIGINAL), { active: false });
  installPack(brief, plan, pack, root, TARGET, TODAY);
  assert.throws(() => verifyIntegratedContent(root, path.join(root, 'dist'), TARGET), /route missing/);
});

test('new-domain build cannot silently skip content generation while master remains inactive', (t) => {
  const root = temp(t);fs.mkdirSync(path.join(root,'content'));
  fs.writeFileSync(path.join(root,'content/policy.json'),JSON.stringify({templateOrigin:ORIGINAL,requireManifestForNewOrigins:true}));
  assert.deepEqual(verifyIntegratedContent(root,path.join(root,'dist'),ORIGINAL),{active:false});
  assert.throws(()=>verifyIntegratedContent(root,path.join(root,'dist'),TARGET),/New conversion origin requires/);
});

test('build gate accepts integrated copy and rejects paragraph fallback and stale product links', (t) => {
  const root = temp(t), { brief, plan, pack } = fixture();
  installPack(brief, plan, pack, root, TARGET, TODAY);
  const dist = path.join(root, 'dist');
  const escape = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  const text = (s) => escape(s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'));
  for (const locale of LOCALES) for (const kind of ['commercial', 'blog', 'forum']) for (const row of pack.locales[locale][kind]) {
    const route = (locale === 'en' ? '' : '/' + locale) + (kind === 'commercial' ? row.path : `/${kind}/${row.slug}/`);
    const copy = kind === 'commercial' ? row.sections.map((s) => `<h2>${escape(s.heading)}</h2>${s.paragraphs.map((p) => `<p>${text(p)}</p>`).join('')}`).join('') : row.body.map((b) => typeof b === 'string' ? `<p>${text(b)}</p>` : b.type === 'p' ? `<p>${text(b.text)}</p>` : '').join('');
    const href = row.cta && (row.cta.href.startsWith('/go/') ? row.cta.href : (locale === 'en' ? '' : '/' + locale) + row.cta.href);
    const topic = plan.pages.find((p) => p.path === (kind === 'commercial' ? row.path : `/${kind}/${row.slug}/`));
    const nav = topic.links.map((p) => `<a href="${locale === 'en' ? '' : '/' + locale}${p}">Fixture link</a>`).join('');
    const html = `<html><head><title>${escape(row.title)}</title><meta name="description" content="${escape(row.metaDescription ?? row.excerpt)}"></head><body><h1>${escape(kind === 'forum' ? row.title : row.h1)}</h1>${copy}${nav}${row.cta ? `<a href="${href}">${escape(row.cta.label)}</a>` : ''}${kind === 'forum' ? '<script type="application/ld+json">{"@type":"DiscussionForumPosting","author":{"@type":"Organization"}}</script>' : ''}</body></html>`;
    const file = path.join(dist, route, 'index.html'); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, html);
  }
  const relations = [{ slug: 'elite', relatedBlogSlugs: [pack.locales.en.blog[0].slug], relatedForumSlugs: [pack.locales.en.forum[0].slug] }];
  assert.deepEqual(verifyIntegratedContent(root, dist, TARGET, relations), { active: true, pages: 60 });
  assert.throws(() => verifyIntegratedContent(root, dist, TARGET, [{ ...relations[0], relatedBlogSlugs: ['old-topic'] }]), /Stale related guide/);
  const fr = path.join(dist, 'fr/cheats/index.html'); fs.writeFileSync(fr, fs.readFileSync(fr, 'utf8').replace('fr fixture useful paragraph', 'English fallback text'));
  assert.throws(() => verifyIntegratedContent(root, dist, TARGET), /paragraph or heading missing/);
});

test('plan validator runs before prose generation', () => {
  const { brief, plan } = fixture(); assert.equal(checkPlan(brief, plan).ok, true);
  plan.pages[0].links = ['/not-in-map/']; assert.throws(() => checkPlan(brief, plan), /Unknown\/self planned link/);
});
