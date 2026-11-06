import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { CHECKOUT_URLS } from '../src/config/checkout-redirects.mjs';

const source = fs.readFileSync(new URL('../src/config/checkout.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
  .replace("'./checkout-redirects.mjs'", JSON.stringify(new URL('../src/config/checkout-redirects.mjs', import.meta.url).href));
const checkout = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

test('ordinary build cannot invoke submission or deployment commands', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.doesNotMatch(pkg.scripts.build, /indexnow|wrangler|deploy|submit/);
  assert.match(pkg.scripts['indexnow:submit'], /npm run validate && node scripts\/indexnow.mjs/);
});

test('checkout normalization retains plan/query/hash for every configured product', () => {
  for (const [key, url] of Object.entries(CHECKOUT_URLS)) {
    const expected = checkout.checkoutPath(key);
    for (const plan of ['monthly', 'lifetime']) {
      assert.equal(checkout.resolveCheckoutHref(url + `&plan=${plan}#checkout`), expected + `?plan=${plan}#checkout`);
      assert.equal(checkout.resolveCheckoutHref(expected + `?plan=${plan}#checkout`), expected + `?plan=${plan}#checkout`);
    }
  }
  assert.equal(checkout.resolveCheckoutHref('/go/wardogs/?plan=monthly'), checkout.PRIMARY_CHECKOUT_PATH + '?plan=monthly');
  assert.equal(
    checkout.resolveCheckoutHref('https://partner.example/go/REF?to=%2Fproducts%2Funknown&plan=monthly'),
    'https://partner.example/go/REF?to=%2Fproducts%2Funknown&plan=monthly',
  );
});

test('click and keyboard plan selection update desktop/mobile checkout, total and duration', () => {
  // Exercise the actual Astro client script, with only the DOM surfaces it uses stubbed.
  class Element {
    constructor(attrs = {}) { this.attrs = attrs; this.handlers = {}; this.textContent = ''; }
    hasAttribute(name) { return name in this.attrs; }
    setAttribute(name, value) { this.attrs[name] = value; }
    getAttribute(name) { return this.attrs[name] ?? null; }
    toggleAttribute(name, on) { if (on) this.attrs[name] = ''; else delete this.attrs[name]; }
    addEventListener(name, fn) { this.handlers[name] = fn; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    closest() { return this; }
    focus() {}
  }
  class KeyboardEvent {
    constructor(key, target) { this.key = key; this.target = target; }
    preventDefault() {}
  }
  const radios = ['monthly', 'lifetime'].map((id) => new Element({ 'data-value': id, 'aria-checked': id === 'lifetime' ? 'true' : 'false' }));
  const group = new Element({ 'data-value': 'lifetime' }); group.querySelectorAll = () => radios;
  const total = new Element(), note = new Element(), buy = new Element(), mobile = new Element();
  const root = new Element({ 'data-buy-url': '/go/example/', 'data-plans': JSON.stringify([
    { id: 'monthly', priceUsd: 35, priceNote: '30 days' }, { id: 'lifetime', priceUsd: 150, priceNote: 'Unlimited access', recommended: true },
  ]) });
  root.querySelector = (s) => ({ '[data-sw-radio-group]': group, '[data-checkout-total]': total, '[data-checkout-note]': note, '[data-checkout-buy]': buy })[s];
  const document = { querySelectorAll: (s) => s === '[data-product-checkout]' ? [root] : [mobile], addEventListener() {} };
  const astro = fs.readFileSync(new URL('../src/components/product/ProductCheckoutPanel.astro', import.meta.url), 'utf8');
  const script = astro.match(/<script>([\s\S]*?)<\/script>/)[1];
  const js = ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
  vm.runInNewContext(js, { document, Element, HTMLElement: Element, KeyboardEvent });
  group.handlers.click({ target: radios[0] });
  assert.equal(buy.href, '/go/example/?plan=monthly'); assert.equal(mobile.href, buy.href);
  assert.equal(total.textContent, '$35'); assert.equal(note.textContent, '30 days');
  group.handlers.keydown(new KeyboardEvent(' ', radios[1]));
  assert.equal(buy.href, '/go/example/?plan=lifetime'); assert.equal(mobile.href, buy.href);
  assert.equal(total.textContent, '$150');
  group.handlers.keydown(new KeyboardEvent('ArrowRight', radios[1]));
  assert.equal(buy.href, '/go/example/?plan=monthly');
});
