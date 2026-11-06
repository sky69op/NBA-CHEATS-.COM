import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { resolvePathRedirect } from './redirects.mjs';
import { isLocalPreviewHost, parseHostname } from './local-preview-host.mjs';
import { resolveCheckoutPathRedirect } from '../src/config/checkout-redirects.mjs';
import { isErrorDocumentPath, resolveForumQueryRedirect, resolveLocaleRoutingRedirect } from '../src/config/locale-routing.mjs';

import { SITE_DOMAIN as CANONICAL_HOST } from '../src/config/site-url.mjs';
import { resolveStaticFile } from './static-path.mjs';
const distDir = path.resolve('dist');
/** 4173 avoids Chrome's cached 301 from older local previews on port 3000. Production still uses PORT. */
const port = Number(process.env.PORT) || 4173;

function envFlag(name) {
  const value = process.env[name];
  return value === '1' || value === 'true' || value === 'yes';
}

/**
 * Host canonicalization (www/http → https://SITE_DOMAIN) is opt-in for production only.
 * Never key this off NODE_ENV: local `npm start` often runs with NODE_ENV=production.
 */
const canonicalRedirectsEnabled = envFlag('ENABLE_CANONICAL_REDIRECT');

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com; font-src 'self'; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'",
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

const COMPRESSIBLE = new Set([
  '.html',
  '.css',
  '.js',
  '.mjs',
  '.json',
  '.svg',
  '.xml',
  '.txt',
  '.webmanifest',
]);

if (!fs.existsSync(distDir)) {
  console.error('Missing dist/ folder. Run npm run build before starting the server.');
  process.exit(1);
}

function getDirectRequestHost(req) {
  return parseHostname(req.headers.host ?? '');
}

function getRequestHost(req) {
  return parseHostname(req.headers['x-forwarded-host'] ?? req.headers.host ?? '');
}

function getCanonicalRedirect(req) {
  if (!canonicalRedirectsEnabled) return null;
  if (isLocalPreviewHost(getDirectRequestHost(req))) return null;
  const host = getRequestHost(req);
  if (!host || isLocalPreviewHost(host)) return null;
  const forwardedProto = (req.headers['x-forwarded-proto'] ?? '').split(',')[0].trim().toLowerCase();
  const needsHttps = forwardedProto === 'http';
  const needsWwwStrip = host === `www.${CANONICAL_HOST}`;
  const needsHostFix = host !== CANONICAL_HOST && !needsWwwStrip;

  if (needsHttps || needsWwwStrip || needsHostFix) {
    return `https://${CANONICAL_HOST}${req.url ?? '/'}`;
  }

  return null;
}

function splitUrl(url) {
  const [pathPart, hash = ''] = (url ?? '/').split('#');
  const [pathname, search = ''] = pathPart.split('?');
  const query = search ? `?${search}` : '';
  const fragment = hash ? `#${hash}` : '';
  return { pathname: pathname || '/', query, fragment };
}

function resolveFile(pathname) {
  return resolveStaticFile(distDir, pathname);
}

function getCacheControl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);

  if (/_\w{6,}\./.test(basename) || basename.startsWith('_astro/')) {
    return 'public, max-age=31536000, immutable';
  }

  if (['.webp', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff2'].includes(ext)) {
    return 'public, max-age=31536000, immutable';
  }

  if (['.js', '.css'].includes(ext)) {
    return 'public, max-age=31536000, immutable';
  }

  if (ext === '.html') {
    return canonicalRedirectsEnabled
      ? 'public, max-age=3600, must-revalidate'
      : 'no-store';
  }

  if (ext === '.webmanifest' || ext === '.xml') {
    return 'public, max-age=86400';
  }

  return 'public, max-age=86400';
}

function pickEncoding(acceptEncoding = '') {
  const ae = acceptEncoding.toLowerCase();
  if (ae.includes('br')) return 'br';
  if (ae.includes('gzip')) return 'gzip';
  return null;
}

/** Precompressed bodies so the first byte is not waiting on the compressor. */
const compressed = new Map();

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function storeCompressed(filePath, raw, mtimeMs) {
  compressed.set(filePath, {
    mtimeMs,
    raw,
    br: zlib.brotliCompressSync(raw, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 },
    }),
    gzip: zlib.gzipSync(raw, { level: 6 }),
  });
  return compressed.get(filePath);
}

function warmCompressed() {
  const files = walkFiles(distDir).filter((filePath) =>
    COMPRESSIBLE.has(path.extname(filePath).toLowerCase()),
  );
  for (const filePath of files) {
    const stat = fs.statSync(filePath);
    storeCompressed(filePath, fs.readFileSync(filePath), stat.mtimeMs);
  }
  return files.length;
}

function getCompressed(filePath) {
  const stat = fs.statSync(filePath);
  const hit = compressed.get(filePath);
  if (hit && hit.mtimeMs === stat.mtimeMs) return hit;
  return storeCompressed(filePath, fs.readFileSync(filePath), stat.mtimeMs);
}

function sendFile(req, res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    ...SECURITY_HEADERS,
    'Content-Type': MIME[ext] ?? 'application/octet-stream',
    'Cache-Control': getCacheControl(filePath),
    Vary: 'Accept-Encoding',
  };
  if (statusCode === 404) {
    headers['X-Robots-Tag'] = 'noindex, follow';
    headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
  }

  if (!COMPRESSIBLE.has(ext)) {
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (res.headersSent) return;
      res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    });
    res.writeHead(statusCode, headers);
    stream.pipe(res);
    return;
  }

  let body;
  try {
    body = getCompressed(filePath);
  } catch {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const encoding = pickEncoding(req.headers['accept-encoding'] ?? '');
  let payload = body.raw;
  if (encoding === 'br' && body.br) {
    headers['Content-Encoding'] = 'br';
    payload = body.br;
  } else if (encoding === 'gzip' && body.gzip) {
    headers['Content-Encoding'] = 'gzip';
    payload = body.gzip;
  }

  headers['Content-Length'] = payload.length;
  res.writeHead(statusCode, headers);
  res.end(payload);
}

const server = http.createServer((req, res) => {
  const canonicalRedirect = getCanonicalRedirect(req);
  if (canonicalRedirect) {
    res.writeHead(301, {
      ...SECURITY_HEADERS,
      Location: canonicalRedirect,
      'Cache-Control': 'private, no-store',
    });
    res.end();
    return;
  }

  const { pathname, query, fragment } = splitUrl(req.url);
  const checkoutRedirect = resolveCheckoutPathRedirect(pathname);
  if (checkoutRedirect) {
    const location =
      query && checkoutRedirect.includes('?')
        ? `${checkoutRedirect}${query.replace('?', '&')}`
        : `${checkoutRedirect}${query}`;
    res.writeHead(302, {
      ...SECURITY_HEADERS,
      Location: location,
      'X-Robots-Tag': 'noindex, follow',
      'Cache-Control': 'no-store',
    });
    res.end();
    return;
  }

  const forumQuery = resolveForumQueryRedirect(pathname, query);
  if (forumQuery) {
    res.writeHead(301, { ...SECURITY_HEADERS, Location: `${forumQuery}${fragment}` });
    res.end();
    return;
  }

  const localeRoute = resolveLocaleRoutingRedirect(pathname);
  if (localeRoute?.status === 301) {
    res.writeHead(301, { ...SECURITY_HEADERS, Location: `${localeRoute.location}${query}${fragment}` });
    res.end();
    return;
  }
  if (localeRoute?.status === 404) {
    const fallback = path.join(distDir, '404.html');
    if (fs.existsSync(fallback)) {
      sendFile(req, res, fallback, 404);
      return;
    }
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const pathRedirect = resolvePathRedirect(pathname);
  if (pathRedirect && pathRedirect !== pathname) {
    res.writeHead(301, { ...SECURITY_HEADERS, Location: `${pathRedirect}${query}${fragment}` });
    res.end();
    return;
  }

  const cleanPagePath = pathname.endsWith('/index.html')
    ? pathname.slice(0, -'index.html'.length)
    : !path.extname(pathname) && !pathname.includes('%') && pathname !== pathname.toLowerCase()
      ? `${pathname.toLowerCase().replace(/\/?$/, '/')}`
      : null;
  if (cleanPagePath) {
    res.writeHead(301, { ...SECURITY_HEADERS, Location: `${cleanPagePath}${query}${fragment}` });
    res.end();
    return;
  }

  const filePath = resolveFile(pathname);
  if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(req, res, filePath, isErrorDocumentPath(pathname) ? 404 : 200);
    return;
  }

  const fallback = path.join(distDir, '404.html');
  if (fs.existsSync(fallback)) {
    sendFile(req, res, fallback, 404);
    return;
  }

  res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

const warmed = warmCompressed();

server.listen(port, '0.0.0.0', () => {
  const redirectNote = canonicalRedirectsEnabled
    ? `canonical redirects to https://${CANONICAL_HOST}`
    : 'canonical redirects disabled (set ENABLE_CANONICAL_REDIRECT=1 in production)';
  console.log(`Serving ${distDir} on http://127.0.0.1:${port} (${warmed} files precompressed, ${redirectNote})`);
  console.log(`Open http://127.0.0.1:${port}/  (Chrome may still send http://localhost:3000/ to the live domain from a cached 301)`);
});
