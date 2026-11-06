import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** Keep a stale dist from silently passing after source/config/assets change. Docs are excluded. */
export function sourceFingerprint(root = process.cwd()) {
  const hash = crypto.createHash('sha256');
  const visit = (relative) => {
    const file = path.join(root, relative);
    if (fs.statSync(file).isDirectory()) {
      for (const name of fs.readdirSync(file).sort()) visit(path.join(relative, name));
    } else {
      hash.update(relative.replaceAll('\\', '/'));
      // Normalize textual line endings so Git autocrlf does not invalidate equivalent builds.
      const data = fs.readFileSync(file);
      hash.update(/\.(?:ts|js|mjs|astro|json|css|txt|html|toml)$/.test(file) || path.basename(file).startsWith('_')
        ? data.toString('utf8').replaceAll('\r\n', '\n') : data);
    }
  };
  for (const file of ['src', 'scripts', 'public', 'astro.config.mjs', 'tsconfig.json', 'package.json', 'package-lock.json', 'wrangler.toml']) visit(file);
  for (const file of ['content/policy.json', 'content/manifest.json']) if (fs.existsSync(path.join(root, file))) visit(file);
  return hash.digest('hex');
}
