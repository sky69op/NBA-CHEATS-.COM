import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const brandDir = path.join(root, 'public/images/brand');

function resolveSource(argvPath) {
  if (argvPath && fs.existsSync(argvPath)) return path.resolve(argvPath);
  const png = path.join(brandDir, 'brand-logo-source.png');
  if (fs.existsSync(png)) return png;
  const webp = path.join(brandDir, 'brand-logo.webp');
  if (fs.existsSync(webp)) return webp;
  throw new Error('Pass a source image path or add public/images/brand/brand-logo-source.png');
}

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

function resizeSquare(input, size) {
  return sharp(input).resize(size, size, { fit: 'contain', background: transparent });
}

/** ICO entry containing PNG image data (supported by modern browsers and Windows). */
export function pngToIco(png, size = 32) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header[6] = size === 256 ? 0 : size;
  header[7] = size === 256 ? 0 : size;
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

export async function generateBrandAssets(sourcePath, outputRoot = root) {
  // Read once: the fallback source may be the master path that we overwrite below.
  const source = fs.readFileSync(sourcePath);
  const brandDir = path.join(outputRoot, 'public/images/brand');
  const publicDir = path.join(outputRoot, 'public');
  fs.mkdirSync(brandDir, { recursive: true });

  const masterWebp = path.join(brandDir, 'brand-logo.webp');
  await resizeSquare(source, 512).webp({ quality: 88, effort: 4 }).toFile(masterWebp);
  console.log(`Wrote ${path.relative(root, masterWebp)}`);

  for (const width of [32, 64, 128, 512]) {
    const output = path.join(brandDir, `brand-logo-${width}.webp`);
    await resizeSquare(source, width).webp({ quality: 85, effort: 4 }).toFile(output);
    console.log(`Wrote ${path.relative(root, output)}`);
  }

  await resizeSquare(source, 32).png().toFile(path.join(publicDir, 'favicon-32.png'));
  await resizeSquare(source, 16).png().toFile(path.join(publicDir, 'favicon-16.png'));
  await resizeSquare(source, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pngToIco(await resizeSquare(source, 32).png().toBuffer()));

  console.log('Brand logo and favicon assets updated.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateBrandAssets(resolveSource(process.argv[2])).catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
