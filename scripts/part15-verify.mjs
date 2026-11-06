/**
 * Optional regression check after `npm run build`: protected media hashes, robots/RSS/sitemap hygiene,
 * NBA 2K27 core page metadata, and visible `/go/` checkout links (not raw external checkout URLs in page HTML).
 * Historical MW4/skin-changer expectations were removed; use `npm run validate` as the primary gate.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { SITE_URL } from '../src/config/site-url.mjs';
import { CHECKOUT_URLS } from '../src/config/checkout-redirects.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const failures = [];

const PROTECTED = {
  'public/images/hwid-spoofer/hwid-spoofer-uefi-spoof-panel.webp':
    '4EA9DC578017E6E7AEA6D5F4630877D4D8DB743A45064E632BD497E0981EF1F5',
  'public/images/hwid-spoofer/hwid-spoofer-uefi-spoof-panel-400.webp':
    'AB1EFC0D66DAB171E7C6E8414F3F8C5B0120723646366B4F706F32D969DA7F8D',
  'public/images/hwid-spoofer/hwid-spoofer-uefi-spoof-panel-640.webp':
    '43EB8F69897CD1528083A70F66AEFA47AAFDBEE8895AF5842AC486D63C74D19A',
  'public/images/hwid-spoofer/hwid-spoofer-uefi-spoof-panel-800.webp':
    'A00C73B6F90E7E697227B9BEECEC11EFFD6B2C78D84693BE16BE8BFA460BA395',
  'public/images/hwid-spoofer/hwid-spoofer-uefi-spoof-panel-960.webp':
    '670A74B6A005221E5C8FBD434B575D740FFBF2AC3DB7BD6E67E894C491D4EEC0',
  'public/images/hwid-spoofer/hwid-spoofer-serial-check-panel.webp':
    '917253BE3D72A5A4C637CCF0A3DE6C8CBAC4314EC30BACD19D0262736D94FEC7',
  'public/images/hwid-spoofer/hwid-spoofer-serial-check-panel-400.webp':
    '5D43315B4A729CF3311BC499EFFA2944C55E2227E365083FDAFC8B044DFB9367',
  'public/images/hwid-spoofer/hwid-spoofer-serial-check-panel-640.webp':
    'BCBA00E91BB3F3EE89359888F0CC4C35BF29FE329F03EC7796C5FBF5DA538002',
  'public/images/hwid-spoofer/hwid-spoofer-serial-check-panel-800.webp':
    '0F51C129AA2FB8F22E29BC9116CFAD26F0816CBCC2C7AF2EA57A86A71CC7360D',
  'public/images/hwid-spoofer/hwid-spoofer-serial-check-panel-960.webp':
    'C89E68B3BA42B4A592A3750872117A60C4DA7D1D71DEBF742EFE04F4AB8DA77F',
  'public/images/ugc/ugc.webp': '27B6464780686530B0DDED9F540306799E7E8C5D182CF1DF9F7B52D499F7CB5E',
  'public/images/ugc/ugc-400.webp': 'C5E4909955DD9039CFD9D2E0FF8690A46BD8E5F51412A481963051C0ADD2FD36',
  'public/images/ugc/ugc-640.webp': 'B0C4EC638D9F1A0E6D641D40927EC1BE030FE8B1E2457CB276A3214A8FDA157B',
  'public/images/ugc/ugc-800.webp': '929846E8EEB9ECEBB385E773B08827EE8A2393DAB8BC7062F7801374DBC24410',
  'public/images/ugc/ugc-960.webp': '9DCE826F808D179F855F64A79C94FBE57C4D55C0859CBDCD8E0F681EC9812D35',
};

for (const [rel, expected] of Object.entries(PROTECTED)) {
  const file = path.join(root, rel.replace(/\//g, path.sep));
  if (!fs.existsSync(file)) {
    failures.push(`MISSING protected media: ${rel}`);
    continue;
  }
  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
  if (hash !== expected) failures.push(`CHECKSUM ${rel}: got ${hash}`);
}

const utilityPhrases = [
  'The Isle HWID Spoofer',
  'Fly Hack & God Mode',
  'Evrima',
  'eft-esp-menu-jungle',
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (/\.html$/i.test(e.name)) files.push(p);
  }
  return files;
}

if (!fs.existsSync(dist)) {
  console.log(JSON.stringify({ ok: false, failures: ['dist/ missing; run npm run build first'], protectedChecked: Object.keys(PROTECTED).length }, null, 2));
  process.exit(1);
}

const srcText = walk(dist)
  .map((f) => fs.readFileSync(f, 'utf8'))
  .join('\n');

for (const phrase of utilityPhrases) {
  if (srcText.includes(phrase)) failures.push(`UTILITY ORIGINAL SURVIVOR: ${phrase.slice(0, 60)}...`);
}

const robots = fs.readFileSync(path.join(root, 'public/robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) {
  failures.push('robots.txt sitemap line wrong');
}
if (/\bDisallow:\s*\/go\/?/i.test(robots)) failures.push('robots.txt should not disallow /go/ (audit tools expect full allowlist)');

const rss = fs.readFileSync(path.join(dist, 'rss.xml'), 'utf8');
if (!rss.includes(SITE_URL)) failures.push('RSS missing site URL');

const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
if (sm.includes('/go/')) {
  failures.push('sitemap contains checkout URL');
}
const smCount = (sm.match(/<loc>/g) ?? []).length;

const vendorHost = new URL(CHECKOUT_URLS.wardogs).host;

function decodeHtml(s) {
  return (s ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function readHtml(rel) {
  const file = path.join(dist, rel.replace(/^\//, '').replace(/\/$/, ''), 'index.html');
  const alt = path.join(dist, rel.replace(/^\//, ''));
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  if (fs.existsSync(alt)) return fs.readFileSync(alt, 'utf8');
  return '';
}

/** Titles and hero/detail H1 substrings for English dist (see `src/i18n/en.ts` page SEO + product cards). */
const corePages = [
  { path: '/', title: 'Undetected NBA 2K27 Aimbot & ESP | Buy Private Loader', h1: 'NBA2K27 Cheats' },
  {
    path: '/cheats/',
    title: 'NBA2K27 Cheats | Plans & Product Information',
    h1: 'NBA2K27 Cheats: Plans and Current Product Details',
  },
  {
    path: '/hwid-spoofer/',
    title: 'HWID Spoofer | Plan Terms & Scope Questions',
    h1: 'HWID Spoofer',
  },
  {
    path: '/ugc/',
    title: 'UGC Account Appeals | Plans & Limits',
    h1: 'UGC',
  },
  {
    path: '/cloud-dma/',
    title: 'Cloud DMA | Requirements to Confirm',
    h1: 'Cloud DMA',
  },
];

const titles = new Set();
const descs = new Set();
for (const page of corePages) {
  const html = readHtml(page.path);
  if (!html) {
    failures.push(`missing dist HTML ${page.path}`);
    continue;
  }
  const title = decodeHtml(html.match(/<title>([^<]*)<\/title>/i)?.[1]);
  const desc = decodeHtml(html.match(/<meta name="description" content="([^"]*)"/i)?.[1]);
  const ogT = decodeHtml(html.match(/<meta property="og:title" content="([^"]*)"/i)?.[1]);
  const twT = decodeHtml(html.match(/<meta name="twitter:title" content="([^"]*)"/i)?.[1]);
  const ogD = decodeHtml(html.match(/<meta property="og:description" content="([^"]*)"/i)?.[1]);
  const twD = decodeHtml(html.match(/<meta name="twitter:description" content="([^"]*)"/i)?.[1]);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').trim(),
  );
  if (title !== page.title) failures.push(`${page.path} title mismatch: ${title}`);
  if (ogT !== page.title || twT !== page.title) failures.push(`${page.path} social title mismatch`);
  if (desc !== ogD || desc !== twD) failures.push(`${page.path} description mismatch across tags`);
  if (h1s.length !== 1) failures.push(`${page.path} h1 count ${h1s.length}`);
  else if (!h1s[0].includes(page.h1)) failures.push(`${page.path} h1 text ${h1s[0]}`);
  if (titles.has(title)) failures.push(`duplicate title ${title}`);
  titles.add(title);
  if (descs.has(desc)) failures.push(`duplicate description`);
  descs.add(desc);
  if (html.includes(vendorHost)) {
    const inGo = html.includes('/go/');
    if (!inGo || html.includes(`href="https://${vendorHost}`)) failures.push(`${page.path} referral in visible href`);
  }
}

const buyHtml = [readHtml('/cheats/'), readHtml('/hwid-spoofer/'), readHtml('/ugc/'), readHtml('/cloud-dma/')].join('');
if (!/href="\/go\/nba-2k27\//.test(buyHtml)) failures.push('main product missing /go/nba-2k27/ CTA');
if (!/href="\/go\/hwid-spoofer\//.test(buyHtml)) failures.push('hwid missing /go/hwid-spoofer/ CTA');

const goConfig = fs.readFileSync(path.join(root, 'src/config/checkout-redirects.mjs'), 'utf8');
const expectedUrls = Object.values(CHECKOUT_URLS);
for (const u of expectedUrls) {
  if (!goConfig.includes(u)) failures.push(`checkout config missing ${u}`);
}

const staleGameplay = ['public/images/gameplay/eft-esp-menu-jungle.webp', 'public/images/gameplay/the-isle'];
for (const rel of staleGameplay) {
  const abs = path.join(root, rel);
  if (fs.existsSync(abs)) failures.push(`old gameplay asset remains: ${rel}`);
}

const privacy = readHtml('/privacy/');
if (!/meta name="robots" content="index/i.test(privacy)) failures.push('privacy should use indexable robots meta');

console.log(
  JSON.stringify(
    { ok: failures.length === 0, failures, protectedChecked: Object.keys(PROTECTED).length, sitemapUrls: smCount },
    null,
    2,
  ),
);
process.exit(failures.length ? 1 : 0);
