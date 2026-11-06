/**
 * Builds content/part3/translations/{es,de,fr}.json from English source + Google Translate (glossary-safe).
 * Run: node scripts/part3-build-translation-overlays.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const enSource = JSON.parse(
  fs.readFileSync(path.join(root, 'content/part3/translations/_en-source.json'), 'utf8'),
);

const LOCALES = [
  { code: 'es', google: 'es', editorial: 'Editorial', editorialAnswer: 'Respuesta editorial:', author: 'NBA2K27 Cheats — Editorial', blogAuthor: 'Editorial de NBA2K27 Cheats' },
  { code: 'de', google: 'de', editorial: 'Redaktion', editorialAnswer: 'Redaktionelle Antwort:', author: 'NBA2K27 Cheats — Redaktion', blogAuthor: 'NBA2K27 Cheats Redaktion' },
  { code: 'fr', google: 'fr', editorial: 'Éditorial', editorialAnswer: 'Réponse éditoriale :', author: 'NBA2K27 Cheats — Éditorial', blogAuthor: 'NBA2K27 Cheats Éditorial' },
];

const PROTECT = [
  ['__UGC_FULL__', 'Unban & Governance Control'],
  ['__NBA2K27_CHEATS__', 'NBA2K27 CHEATS'],
  ['__NBA2K27__', 'NBA2K27'],
  ['__NBA_2K27__', 'NBA 2K27'],
  ['__HWID__', 'HWID Spoofer'],
  ['__CLOUD_DMA__', 'Cloud DMA'],
  ['__UGC__', 'UGC'],
  ['__PRICE35__', '$35'],
  ['__PRICE50__', '$50'],
  ['__PRICE150__', '$150'],
  ['__30D__', '30 days'],
  ['__STEAM__', 'Steam'],
  ['__VC__', 'Visual Concepts'],
  ['__BRAND__', 'NBA2K27 Cheats'],
];

function shield(text) {
  let out = text;
  for (const [token, value] of PROTECT) {
    out = out.split(value).join(token);
  }
  return out;
}

function unshield(text) {
  let out = text;
  for (const [token, value] of PROTECT) {
    out = out.split(token).join(value);
  }
  return out;
}

async function translateOne(text, targetLang) {
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', targetLang);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', shield(text));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Translate HTTP ${res.status} for ${text.slice(0, 40)}…`);
  const data = await res.json();
  const translated = data[0].map((part) => part[0]).join('');
  return unshield(translated);
}

async function translateAll(uniqueStrings, targetLang) {
  const map = new Map();
  let i = 0;
  for (const text of uniqueStrings) {
    i += 1;
    if (i % 25 === 0) console.log(`  ${i}/${uniqueStrings.length}`);
    map.set(text, await translateOne(text, targetLang));
    await new Promise((r) => setTimeout(r, 120));
  }
  return map;
}

function localizeMarkdownLinks(text, locale) {
  if (!text.includes('](')) return text;
  return text.replace(/\]\(\/(blog|cheats|hwid-spoofer|ugc|cloud-dma|faq|support)(\/[^)]*)?\)/g, (_, seg, rest = '') => `](/${locale}/${seg}${rest})`);
}

function buildBlogBody(enBody, map, locale, localeMeta) {
  return enBody.map((block) => {
    if (block.type === 'ul') {
      return { type: 'ul', items: block.items.map((item) => localizeMarkdownLinks(map.get(item) ?? item, locale)) };
    }
    if (block.type === 'cta') {
      return {
        type: 'cta',
        title: map.get(block.title) ?? block.title,
        text: map.get(block.text) ?? block.text,
        href: block.href,
      };
    }
    const text = localizeMarkdownLinks(map.get(block.text) ?? block.text, locale);
    return { type: block.type, text };
  });
}

function buildOverlay(localeMeta, map) {
  const locale = localeMeta.code;
  const disclosureEn = 'Editorial discussion starter from NBA2K27 Cheats.';
  const forumDisclosure = { [locale]: map.get(disclosureEn) ?? disclosureEn };

  const blog = {};
  for (const b of enSource.blogs) {
    blog[b.slug] = {
      title: map.get(b.title) ?? b.title,
      h1: map.get(b.title) ?? b.title,
      tag: map.get(b.tag) ?? b.tag,
      desc: map.get(b.desc) ?? b.desc,
      metaTitle: map.get(b.title) ?? b.title,
      metaDescription: map.get(b.desc) ?? b.desc,
      imageAlt: map.get(b.imageAlt) ?? b.imageAlt,
      author: localeMeta.blogAuthor,
      body: buildBlogBody(b.body, map, locale, localeMeta),
    };
  }

  const forum = {};
  for (const f of enSource.forums) {
    const secondLine = f.body[1];
    forum[f.slug] = {
      title: map.get(f.title) ?? f.title,
      excerpt: map.get(f.excerpt) ?? f.excerpt,
      category: map.get(f.category) ?? f.category,
      body: [map.get(secondLine) ?? secondLine],
      commentAuthor: localeMeta.author,
      commentBody: map.get(f.comment.body) ?? f.comment.body,
      sourceTitle: map.get(f.sourceTitle) ?? f.sourceTitle,
    };
  }

  return { forumDisclosure, blog, forum };
}

async function main() {
  const strings = JSON.parse(fs.readFileSync(path.join(root, 'content/part3/translations/_strings-en.json'), 'utf8'));
  const outDir = path.join(root, 'content/part3/translations');
  fs.mkdirSync(outDir, { recursive: true });

  for (const localeMeta of LOCALES) {
    console.log(`Translating ${localeMeta.code} (${strings.length} strings)...`);
    const map = await translateAll(strings, localeMeta.google);
    const overlay = buildOverlay(localeMeta, map);
    const file = path.join(outDir, `${localeMeta.code}.json`);
    fs.writeFileSync(file, `${JSON.stringify(overlay, null, 2)}\n`);
    console.log(`Wrote ${file} — blogs: ${Object.keys(overlay.blog).length}, forum: ${Object.keys(overlay.forum).length}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
