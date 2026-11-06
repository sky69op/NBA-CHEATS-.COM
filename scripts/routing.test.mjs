import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../workers/site.js';
import { SITE_URL } from '../src/config/site-url.mjs';
import { CHECKOUT_PATH_REDIRECTS } from '../src/config/checkout-redirects.mjs';
import { PATH_REDIRECTS } from './redirects.mjs';
import { resolveStaticFile } from './static-path.mjs';
import path from 'node:path';

test('malformed/escaping static paths cannot crash Node preview or read outside dist', () => {
  const root = path.resolve('dist');
  assert.equal(resolveStaticFile(root, '/%ZZ'), null);
  assert.equal(resolveStaticFile(root, '/%00'), null);
  assert.equal(resolveStaticFile(root, '/..%2fdist-private/secret.txt'), null);
  assert.equal(resolveStaticFile(root, '/cheats/'), path.join(root, 'cheats/index.html'));
});

test('Worker forwards every configured checkout destination and plan without external requests', async () => {
  globalThis.caches = { default: { match: async () => undefined } };
  for (const [pathname, target] of CHECKOUT_PATH_REDIRECTS) for (const prefix of ['', '/en', '/es', '/de', '/fr']) for (const plan of ['monthly', 'lifetime']) {
    const response = await worker.fetch(new Request(`${SITE_URL}${prefix}${pathname}?plan=${plan}&campaign=local-test`), {}, {});
    assert.equal(response.status, 302, pathname);
    assert.equal(response.headers.get('Location'), target + `&plan=${plan}&campaign=local-test`);
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, follow');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
});

test('cached documents cannot bypass host or forum-query canonicalization', async () => {
  globalThis.caches = { default: { match: async () => new Response('cached') } };
  for (const prefix of ['', '/es', '/de', '/fr']) {
    const response = await worker.fetch(new Request(`${SITE_URL}${prefix}/forum/?category=test&campaign=keep`), {}, {});
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('Location'), `${prefix}/forum/?campaign=keep`);
  }
  const response = await worker.fetch(new Request(SITE_URL.replace('https://', 'http://') + '/'), {}, {});
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('Location'), SITE_URL + '/');
});

test('legacy redirects and English normalization resolve directly to final paths', async () => {
  globalThis.caches = { default: { match: async () => undefined } };
  for (const [from, to] of PATH_REDIRECTS) {
    const response = await worker.fetch(new Request(SITE_URL + from + '?campaign=keep'), { ASSETS: { fetch: async () => new Response('', { status: 404 }) } }, {});
    assert.equal(response.status, 301, from);
    assert.equal(response.headers.get('Location'), to + '?campaign=keep', from);
  }
  const response = await worker.fetch(new Request(SITE_URL + '/en/products?campaign=keep'), {}, {});
  assert.equal(response.headers.get('Location'), '/products/?campaign=keep');
});

test('Worker gives actual 404 status/noindex for missing and nested-locale paths', async () => {
  globalThis.caches = { default: { match: async () => undefined } };
  const env = { ASSETS: { fetch: async (request) => new Response('<html>Missing</html>', { status: new URL(request.url).pathname === '/404' ? 200 : 404, headers: { 'Content-Type': 'text/html' } }) } };
  for (const route of ['/not-a-real-page/', '/es/fr/about/', '/404.html', '/es/404/', '/%ZZ/']) {
    const response = await worker.fetch(new Request(SITE_URL + route), env, {});
    assert.equal(response.status, 404, route);
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, follow');
  }
});

test('Worker lets the asset binding resolve page URLs and preserves the custom 404 body', async () => {
  globalThis.caches = { default: { match: async () => undefined } };
  const env = { ASSETS: { fetch: async request => {
    const path = new URL(request.url).pathname;
    // Cloudflare auto-trailing-slash canonicalizes physical HTML paths.
    if (path.endsWith('/index.html')) return new Response(null, { status: 307, headers: { Location: path.slice(0, -10) } });
    if (path === '/404.html') return new Response(null, { status: 307, headers: { Location: '/404' } });
    return new Response(path === '/404' ? '<h1>Custom missing page</h1>' : '<h1>Page</h1>', {
      status: path === '/missing/' ? 404 : 200, headers: { 'Content-Type': 'text/html' },
    });
  } } };
  for (const path of ['/', '/cheats/', '/es/ugc/']) {
    const response = await worker.fetch(new Request(SITE_URL + path), env, {});
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), /<h1>Page/);
  }
  const missing = await worker.fetch(new Request(SITE_URL + '/missing/'), env, {});
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /Custom missing page/);
});
