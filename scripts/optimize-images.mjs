import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
/** Widths the gameplay pages request (see `src/utils/responsiveImage.ts`). Protected utility masters and the brand logo are not processed. */
const dirs = [
  { dir: 'public/images/nba-2k27', widths: [400, 512, 640, 800, 960], quality: 75, effort: 6 },
];

async function optimizeDir(relativeDir, widths, quality, effort) {
  const dir = path.join(root, relativeDir);
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter((file) => {
    if (/-\d+\.webp$/i.test(file)) return false;
    return /\.png$/i.test(file) || /\.webp$/i.test(file);
  });

  for (const file of files) {
    const input = path.join(dir, file);
    const base = file.replace(/\.(png|webp)$/i, '');

    for (const width of widths) {
      const output = path.join(dir, `${base}-${width}.webp`);
      await sharp(input)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort })
        .toFile(output);
      console.log(`Wrote ${path.relative(root, output)}`);
    }
  }
}

for (const { dir, widths, quality, effort } of dirs) {
  await optimizeDir(dir, widths, quality, effort);
}

// Brand logo and protected utility masters stay as supplied. Do not re-encode them.

console.log('Image optimization complete.');
