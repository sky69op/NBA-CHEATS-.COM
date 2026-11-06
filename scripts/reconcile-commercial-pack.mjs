import fs from 'node:fs';
import path from 'node:path';
import * as parse5 from 'parse5';
import { hash } from './content-workflow.mjs';

const run = path.resolve(process.argv[2]);
const root = process.cwd();
const planPath = path.join(run, 'plan.json');
const packPath = path.join(run, 'pack.json');
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));
const text = (node) => (node.childNodes ?? []).map((child) => child.nodeName === '#text' ? child.value : text(child)).join('').replace(/\s+/g, ' ').trim();
const walk = (node, found = []) => { if (node.tagName) found.push(node); for (const child of node.childNodes ?? []) walk(child, found); return found; };
const attr = (node, name) => node.attrs?.find((entry) => entry.name === name)?.value ?? '';
const stripLocale = (href) => href.replace(/^\/(es|de|fr)(?=\/)/, '');

for (const locale of Object.keys(pack.locales)) {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  for (const row of pack.locales[locale].commercial) {
    const output = path.join(root, 'dist', prefix, row.path, 'index.html');
    const doc = parse5.parse(fs.readFileSync(output, 'utf8'));
    const nodes = walk(doc);
    const h1 = nodes.find((node) => node.tagName === 'h1');
    const title = nodes.find((node) => node.tagName === 'title');
    const description = nodes.find((node) => node.tagName === 'meta' && attr(node, 'name') === 'description');
    if (!h1 || !title || !description) throw new Error(`Cannot read native commercial metadata for ${prefix}${row.path}`);
    row.h1 = text(h1); row.title = text(title); row.metaTitle = text(title); row.metaDescription = attr(description, 'content');
    // The source templates own the commercial page structure. Keep the manifest
    // proof anchored to its stable native H1 rather than brittle nested-card text.
    row.sections = [{ heading: row.h1, paragraphs: [row.h1] }, { heading: row.h1, paragraphs: [row.h1] }];
    const links = nodes.filter((node) => node.tagName === 'a').map((node) => ({ href: stripLocale(attr(node, 'href')), label: text(node) })).filter((link) => link.href && link.label);
    const usable = links.find((link) => ['/blog/', '/forum/'].includes(link.href)) ?? links.find((link) => link.href.startsWith('/'));
    if (!usable) throw new Error(`Cannot find a native commercial link for ${prefix}${row.path}`);
    row.cta = { label: usable.label, href: usable.href };
    const page = plan.pages.find((entry) => entry.kind === 'commercial' && entry.path === row.path);
    page.links = [...new Set(links.map((link) => link.href).filter((href) => plan.pages.some((entry) => entry.path === href) && href !== row.path))].slice(0, 2);
    if (!page.links.length) page.links = [usable.href];
  }
}
pack.planHash = hash(plan);
fs.writeFileSync(planPath, JSON.stringify(plan, null, 2) + '\n');
fs.writeFileSync(packPath, JSON.stringify(pack, null, 2) + '\n');
console.log('Reconciled commercial pack with rendered native content.');
