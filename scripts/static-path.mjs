import path from 'node:path';

export function resolveStaticFile(distDir, pathname) {
  let normalized;
  try { normalized = decodeURIComponent(pathname); } catch { return null; }
  if (normalized.includes('\0')) return null;
  if (normalized.endsWith('/')) normalized += 'index.html';
  if (!path.extname(normalized)) normalized += '.html';
  const root = path.resolve(distDir);
  const file = path.resolve(root, '.' + normalized);
  return file.startsWith(root + path.sep) ? file : null;
}
