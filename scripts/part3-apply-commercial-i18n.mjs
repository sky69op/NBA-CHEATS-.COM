/**
 * Part 3: read content/part3/translations/commercial-{es,de,fr}.json and write
 * src/i18n/dictionaries/{es,de,fr}.json (Translations shape without pageSeo).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const LOCALES = ['es', 'de', 'fr'];

for (const locale of LOCALES) {
  const src = join(root, 'content/part3/translations', `commercial-${locale}.json`);
  const raw = JSON.parse(readFileSync(src, 'utf8'));
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Invalid JSON: ${src}`);
  }
  const { pageSeo: _omit, ...dictionary } = raw;
  const out = join(root, 'src/i18n/dictionaries', `${locale}.json`);
  writeFileSync(out, JSON.stringify(dictionary, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${out}`);
}
