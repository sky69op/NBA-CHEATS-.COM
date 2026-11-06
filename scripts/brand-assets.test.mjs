import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { generateBrandAssets } from './generate-brand-assets.mjs';

test('brand generator supports master-as-source and writes a real ICO', async (t) => {
  // libvips' file cache can retain Windows handles after metadata reads.
  sharp.cache(false);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-assets-test-'));
  t.after(() => {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep + 'brand-assets-test-'));
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  const source = path.join(root, 'public/images/brand/brand-logo.webp');
  fs.mkdirSync(path.dirname(source), { recursive: true });
  await sharp({ create: { width: 32, height: 32, channels: 4, background: '#783acc' } }).webp().toFile(source);
  await generateBrandAssets(source, root);
  const ico = fs.readFileSync(path.join(root, 'public/favicon.ico'));
  assert.equal(ico.subarray(0, 6).toString('hex'), '000001000100');
  assert.equal(ico.readUInt32LE(14), ico.length - 22);
  assert.equal(ico.readUInt32LE(18), 22);
  const meta = await sharp(ico.subarray(22)).metadata();
  assert.equal(meta.width, 32); assert.equal(meta.height, 32);
  for (const size of [32, 64, 128, 512]) assert.equal((await sharp(path.join(root, `public/images/brand/brand-logo-${size}.webp`)).metadata()).width, size);
});
