/**
 * Regenerates commercial-{es,de,fr}.json from _commercial-en.json
 * using google-translate-api-x (batch endpoint, less rate-limited).
 */
import translate from 'google-translate-api-x';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const enPath = join(root, 'content/part3/translations/_commercial-en.json');

/**
 * Protect brand names, product labels, domains, placeholders, and USD amounts only.
 * Do not mask full English clauses ("30 days", "lifetime") — those should localize.
 */
const PROTECTED_FRAGMENTS = [
  'Unban & Governance Control',
  'NBA2K27 CHEATS',
  'NBA2K27 Cheats',
  'NBA2K27 ',
  'NBA 2K27',
  'NBA2K27',
  'Terms & Conditions',
  'Privacy Policy',
  'Google Analytics',
  'Visual Concepts',
  'HWID Spoofer',
  'Cloud DMA',
  'Cheats',
  'MyCAREER',
  'Auto Green',
  'Unlock All',
  'ESP',
  'configs',
  'nbacheats.com',
  '$35/mo',
  '$150',
  '$50',
  '$35',
  '2K',
  'Steam',
  'UGC',
  '{cheatProduct}',
  '{siteName}',
  '{siteDomain}',
  '{gameName}',
  '{game}',
  '{count}',
].sort((a, b) => b.length - a.length);

function maskProtected(str) {
  let out = str;
  const slots = [];
  /** Unique tokens — never reuse __PT0__ etc., or unmask corrupts overlapping subs (shows as "0" in locales). */
  for (const frag of PROTECTED_FRAGMENTS) {
    if (!out.includes(frag)) continue;
    const token = `__PT${slots.length}_PH__`;
    slots.push(frag);
    out = out.split(frag).join(token);
  }
  return { masked: out, slots };
}

function unmaskProtected(str, slots) {
  let out = str;
  for (let i = 0; i < slots.length; i += 1) {
    out = out.split(`__PT${i}_PH__`).join(slots[i]);
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function shouldSkipPath(path, value) {
  if (path.endsWith('.href')) return true;
  if (path.endsWith('.id')) return true;
  if (path.endsWith('.icon')) return true;
  if (path.endsWith('.variant')) return true;
  if (path.endsWith('.bento')) return true;
  if (path.endsWith('.scrollTarget')) return true;
  if (path.endsWith('.domain')) return true;
  if (typeof value === 'string' && /^\d+$/.test(value)) return true;
  return false;
}

function flattenStrings(obj, prefix = '', out = []) {
  if (typeof obj === 'string') {
    out.push([prefix, obj]);
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flattenStrings(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      const p = prefix ? `${prefix}.${k}` : k;
      flattenStrings(obj[k], p, out);
    }
  }
  return out;
}

function setAtPath(rootObj, path, value) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur = rootObj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const p = parts[i];
    const next = parts[i + 1];
    if (!(p in cur)) throw new Error(`Missing ${p} at ${path}`);
    if (/^\d+$/.test(next) && !Array.isArray(cur[p])) {
      throw new Error(`Expected array at ${path}`);
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

async function translateOne(text, to) {
  const res = await translate(text, { from: 'en', to, forceBatch: true });
  return res.text;
}

async function translateMany(texts, to) {
  return translate(texts, { from: 'en', to, forceBatch: true });
}

async function translateSlice(slice, to) {
  const masked = slice.map(({ path, str }) => {
    const m = maskProtected(str);
    return { path, str, masked: m.masked, slots: m.slots };
  });
  const inputs = masked.map((m) => m.masked);
  try {
    const res = await translateMany(inputs, to);
    for (let i = 0; i < masked.length; i += 1) {
      const r = res[i];
      const txt = r && typeof r.text === 'string' ? r.text : null;
      if (!txt) throw new Error('missing segment');
      masked[i].translated = unmaskProtected(txt, masked[i].slots);
    }
    return masked;
  } catch {
    if (inputs.length === 1) {
      const t = await translateOne(inputs[0], to);
      masked[0].translated = unmaskProtected(t, masked[0].slots);
      return masked;
    }
    const mid = Math.ceil(slice.length / 2);
    const a = await translateSlice(slice.slice(0, mid), to);
    const b = await translateSlice(slice.slice(mid), to);
    return [...a, ...b];
  }
}

async function buildLocale(enObj, to) {
  const flat = flattenStrings(enObj).filter(([p, v]) => !shouldSkipPath(p, v));
  const entries = flat.map(([path, str]) => ({ path, str }));
  const map = new Map();
  const BATCH = 12;

  for (let i = 0; i < entries.length; i += BATCH) {
    const slice = entries.slice(i, i + BATCH);
    const done = await translateSlice(slice, to);
    for (const row of done) {
      map.set(row.path, row.translated ?? row.str);
    }
    await sleep(700);
    if ((i / BATCH) % 10 === 0 && i > 0) {
      console.error(`  ... ${to} ${Math.min(i + BATCH, entries.length)}/${entries.length}`);
    }
  }

  const clone = structuredClone(enObj);
  for (const [path, val] of map) {
    setAtPath(clone, path, val);
  }
  if (enObj.hero?.titleLead != null) clone.hero.titleLead = enObj.hero.titleLead;
  return clone;
}

const en = JSON.parse(readFileSync(enPath, 'utf8'));

console.error('Translating ES...');
writeFileSync(
  join(root, 'content/part3/translations/commercial-es.json'),
  JSON.stringify(await buildLocale(en, 'es'), null, 2) + '\n',
  'utf8',
);
console.error('Wrote commercial-es.json');

console.error('Translating DE...');
writeFileSync(
  join(root, 'content/part3/translations/commercial-de.json'),
  JSON.stringify(await buildLocale(en, 'de'), null, 2) + '\n',
  'utf8',
);
console.error('Wrote commercial-de.json');

console.error('Translating FR...');
writeFileSync(
  join(root, 'content/part3/translations/commercial-fr.json'),
  JSON.stringify(await buildLocale(en, 'fr'), null, 2) + '\n',
  'utf8',
);
console.error('Wrote commercial-fr.json');
