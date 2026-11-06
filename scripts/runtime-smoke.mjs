import fs from 'node:fs';
import net from 'node:net';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { once } from 'node:events';

// Local Node host only. Never follow affiliate destinations or contact the production origin.
const config = JSON.parse(fs.readFileSync('.astro/validation-config.json', 'utf8'));
const probe = net.createServer();
probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
const port = probe.address().port;
await new Promise((resolve) => probe.close(resolve));
const child = spawn(process.execPath, ['scripts/serve.mjs'], {
  env: { ...process.env, PORT: String(port), ENABLE_CANONICAL_REDIRECT: '0' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let stderr = '';
child.stderr.on('data', (data) => { stderr += data; });
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview did not start: ' + stderr)), 20000);
    const done = () => clearTimeout(timer);
    child.once('error', (error) => { done(); reject(error); });
    child.once('exit', (code) => { done(); reject(new Error(`Preview exited ${code}: ${stderr}`)); });
    child.stdout.on('data', (data) => { if (data.toString().includes('Serving ')) { done(); resolve(); } });
  });
  const origin = `http://127.0.0.1:${port}`;
  let checks = 0;
  const request = async (route, status, location) => {
    const response = await fetch(origin + route, { redirect: 'manual', signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, status, route);
    if (location) assert.equal(response.headers.get('Location'), location, route);
    checks++;
    await response.arrayBuffer();
    return response;
  };
  for (const route of Object.keys(config.pages)) {
    const errorDocument = route.endsWith('/404/') || route === '/404.html';
    const response = await request(route, errorDocument ? 404 : 200);
    assert.match(response.headers.get('content-type'), /text\/html; charset=utf-8/i, route);
    if (errorDocument) assert.match(response.headers.get('x-robots-tag'), /noindex/, route);
  }
  for (const [route, target] of Object.entries(config.redirects)) await request(route + '?campaign=keep', 301, target + '?campaign=keep');
  for (const [route, target] of Object.entries(config.checkouts)) for (const locale of config.locales) for (const plan of ['monthly', 'lifetime']) {
    const prefix = locale === config.defaultLocale ? '' : '/' + locale;
    const response = await request(`${prefix}${route}?plan=${plan}`, 302, `${target}&plan=${plan}`);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
  for (const locale of config.locales) {
    const prefix = locale === config.defaultLocale ? '' : '/' + locale;
    await request(prefix + '/forum/?category=test&sort=recent&page=2&campaign=keep', 301, prefix + '/forum/?campaign=keep');
  }
  for (const route of ['/not-a-real-page/', '/es/fr/about/', '/%ZZ/', '/..%2fdist-private/secret.txt']) await request(route, 404);
  await request('/', 200); // Malformed requests must not terminate the server.
  for (const route of ['/robots.txt', '/sitemap.xml', '/rss.xml']) await request(route, 200);
  console.log(JSON.stringify({ ok: true, localHttpChecks: checks, externalRequests: 0 }, null, 2));
} finally {
  const exited = child.exitCode === null ? once(child, 'exit') : Promise.resolve();
  child.kill();
  await exited;
}
