# Part 2 change report

The safe local implementation is complete. Browser visual QA, live Cloudflare verification, vendor fact confirmation and Search Console status are not signed off. See [template-defects.md](template-defects.md) for exact findings and evidence, and [validation.md](validation.md) for reusable commands/coverage.

All existing MW4 page URLs, four commercial product data keys, configured prices/durations and four affiliate destination values were preserved. Protected utility media retains its original 20 hashes. No commit, push, deployment or indexing submission was made.

Final checks: production build passed; 28 tests passed; output validation passed 145 HTML documents/128 sitemap URLs with zero errors/warnings; runtime validation passed 380 local HTTP checks with zero external requests; historical MW4 regression/protected-media check passed.

## Files changed in Part 2

Paths are repository-relative; grouped files perform the same responsibility.

- Workflow/docs: `AGENTS.md`, `README.md`, `docs/architecture.md`, `docs/conversion.example.json`, `docs/template-defects.md`; new `docs/validation.md` and this report.
- Build/commands: `package.json`, `package-lock.json`, `astro.config.mjs`.
- Validation policy: new `src/config/validation.ts`, `src/config/protected-media.json`.
- Reusable validation/runtime helpers: new `scripts/validate.mjs`, `scripts/html.mjs`, `scripts/source-fingerprint.mjs`, `scripts/static-path.mjs`, `scripts/runtime-smoke.mjs`.
- Tests: new `scripts/validate.test.mjs`, `scripts/routing.test.mjs`, `scripts/commerce.test.mjs`, `scripts/i18n.test.mjs`, `scripts/brand-assets.test.mjs`.
- Host/generators/regression checks: `workers/site.js`, `scripts/serve.mjs`, `scripts/generate-static-redirects.mjs`, `scripts/generate-brand-assets.mjs`, `scripts/part15-verify.mjs`.
- SEO/schema/checkout: `src/config/seo.ts`, `src/config/sitemap.ts`, `src/config/checkout.ts`, `src/config/pageKeywordAlt.ts`, `src/utils/schema.ts`, `src/components/JsonLd.astro`.
- Product UI: `src/components/product/ProductCheckoutPanel.astro`, `ProductMobileBuyBar.astro`, `UtilityProductPage.astro` in the same directory.
- Metadata copy: `src/i18n/en.ts`, `src/i18n/dictionaries/fr.json`, `src/i18n/pageSeo/fr.json`.
- Routes (locale/schema propagation): `src/pages/404.astro`, `about.astro`, `support.astro`, `faq.astro`, `privacy.astro`, `terms.astro`; `src/pages/cheats/index.astro`, `products/index.astro`, `blog/index.astro`, `blog/[slug].astro`, `forum/index.astro`, `forum/[slug].astro`.
- Generated public output: `public/go/{mw4-cheats,wardogs,hwid-spoofer,skin-changer,ugc}/index.html` (noscript fallback change only), `public/favicon.ico` (valid container around existing PNG payload). Redirect/robots values and gameplay images have no substantive changes.

The original installed five workflow skills were reused, not reinstalled or modified. The generic workflow remains in those skills; project policy and validation configuration remain here.
