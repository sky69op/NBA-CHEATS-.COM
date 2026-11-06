import fs from 'node:fs';
import path from 'node:path';

/** Drop source PNGs from dist — pages and metadata serve WebP only. */
const distImages = path.resolve('dist/images');
let removed = 0;
let bytes = 0;

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (/^brand-logo\.webp$/i.test(entry.name)) {
      const stat = fs.statSync(full);
      bytes += stat.size;
      fs.unlinkSync(full);
      removed += 1;
      continue;
    }
    if (!/\.png$/i.test(entry.name)) continue;
    // Keep brand/favicon-sized assets if any land under images; gameplay/blog sources go.
    const stat = fs.statSync(full);
    if (stat.size < 80_000) continue;
    bytes += stat.size;
    fs.unlinkSync(full);
    removed += 1;
  }
}

walk(distImages);
console.log(
  `Pruned ${removed} source PNG(s) from dist/images (${(bytes / 1024 / 1024).toFixed(1)} MB).`,
);
