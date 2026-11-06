import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { withLocalServer } from './qa-server.mjs';

const config = JSON.parse(fs.readFileSync('.astro/validation-config.json', 'utf8'));
const results = { pages: 0, selections: 0, navigationClicks: 0, checkoutClicks: 0, errors: [], blockedExternal: [] };
fs.mkdirSync('.astro/browser-qa', { recursive: true });
process.on('uncaughtExceptionMonitor', () => {
  fs.writeFileSync('.astro/browser-qa/results.json', JSON.stringify(results, null, 2));
});

await withLocalServer(() => ['scripts/serve.mjs'], { ENABLE_CANONICAL_REDIRECT: '0' }, async origin => {
  // A fresh temporary profile; never attach to the user's personal Chrome session.
  const browser = await chromium.launch({ channel: process.env.QA_BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    for (const width of [1440, 768, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) {
          results.blockedExternal.push(url.origin);
          return route.abort();
        }
        if (url.pathname.startsWith('/go/')) {
          // Exercise the real clicked local redirect, but never send a request to its external checkout target.
          const response = await route.fetch({ maxRedirects: 0 });
          assert.equal(response.status(), 302);
          const target = new URL(config.checkouts[url.pathname]);
          for (const [key, value] of url.searchParams) target.searchParams.append(key, value);
          assert.equal(response.headers().location, target.href);
          assert.equal(response.headers()['cache-control'], 'no-store');
          results.checkoutClicks++;
          return route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Local checkout redirect verified; external host was not contacted.</h1>' });
        }
        return route.continue();
      });
      const page = await context.newPage();
      page.on('pageerror', error => results.errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error' && !message.text().includes('ERR_FAILED')) results.errors.push(message.text()); });
      page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) results.errors.push(`${response.status()} ${response.url()}`); });
      const visit = async path => {
        const response = await page.goto(origin + path, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200, path);
        assert.equal(await page.locator('h1').count(), 1, path);
        assert.ok(await page.locator('h1').innerText(), path);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Horizontal overflow: ${path} @ ${width}`);
      };
      for (const locale of config.locales) {
        const prefix = locale === config.defaultLocale ? '' : '/' + locale;
        const home = prefix + '/';
        await visit(home); results.pages++;
        const nav = width < 1024 ? page.locator('nav[aria-label="Mobile"]') : page.locator('nav[aria-label="Primary"]');
        const hrefs = await nav.locator('a[data-nav-link]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
        for (const href of hrefs) {
          await visit(home);
          if (width < 1024) {
            await page.locator('[data-slot="sheet-trigger"]').click();
            await page.locator('[data-slot="sheet-content"][open]').waitFor({ state: 'visible' });
          }
          await nav.locator(`a[href=${JSON.stringify(href)}]`).click();
          await page.waitForURL(origin + href);
          assert.ok(await page.locator('#main-content').innerText());
          results.navigationClicks++;
        }
        for (const [path, product] of Object.entries(config.products).filter(([path]) => config.pages[path].locale === locale)) {
          await visit(path); results.pages++;
          await page.locator('[data-product-checkout][data-checkout-bound]').waitFor();
          const plans = JSON.parse(await page.locator('[data-product-checkout]').getAttribute('data-plans'));
          for (const plan of plans) {
            const radio = page.locator(`[data-sw-radio][data-value="${plan.id}"]`);
            await radio.click();
            assert.equal(await radio.getAttribute('aria-checked'), 'true');
            assert.equal(await page.locator('[data-checkout-total]').innerText(), '$' + plan.priceUsd);
            assert.equal(await page.locator('[data-checkout-note]').innerText(), plan.priceNote);
            for (const selector of ['[data-checkout-buy]', '[data-checkout-buy-mobile]']) {
              assert.equal(new URL(await page.locator(selector).getAttribute('href'), origin).href, origin + product.checkoutPath + '?plan=' + plan.id);
            }
            await radio.focus(); await page.keyboard.press('Space');
            assert.equal(await radio.getAttribute('aria-checked'), 'true');
            results.selections += 2;
          }
          // Monthly on mobile; lifetime on desktop/tablet. Both forwarded for every product/locale.
          const selected = width === 390 ? 'monthly' : 'lifetime';
          await page.locator(`[data-sw-radio][data-value="${selected}"]`).click();
          await page.screenshot({ path: `.astro/browser-qa/${width}-${locale}-${product.sku}.png`, fullPage: true });
          if (width === 390) {
            // The sticky buy bar intentionally appears only after scrolling past checkout.
            await page.locator('[data-product-checkout]').evaluate(node => {
              window.scrollTo(0, node.getBoundingClientRect().bottom + window.scrollY + 100);
            });
            await page.locator('[data-product-buy-bar].is-visible').waitFor();
            await page.screenshot({ path: `.astro/browser-qa/${width}-${locale}-${product.sku}-bar.png` });
          }
          await page.locator(width === 390 ? '[data-checkout-buy-mobile]' : '[data-checkout-buy]').click();
          await page.waitForURL(url => url.pathname.startsWith('/go/'));
          assert.match(await page.locator('h1').innerText(), /Local checkout redirect verified/);
        }
      }
      await context.close();
    }
  } finally { await browser.close(); }
});
results.blockedExternal = [...new Set(results.blockedExternal)];
fs.writeFileSync('.astro/browser-qa/results.json', JSON.stringify(results, null, 2));
assert.deepEqual(results.errors, []);
console.log(JSON.stringify({ ok: true, ...results }, null, 2));
