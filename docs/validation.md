# Validation and daily conversions

Run from the repository root with the locked npm dependencies installed:

```text
npm run typecheck
npm run build
npm test
npm run validate
npm run validate:runtime
node scripts/part15-verify.mjs
```

The first five commands are reusable. The last is a historical MW4-specific regression check; keep its content expectations only while maintaining this MW4 site. `npm run test:local-hosts` remains an alias for its original three tests. `typecheck` uses `@astrojs/check`, not plain `tsc`, so Astro imports/templates are checked correctly. No lint script is installed. Current remediation and browser/Cloudflare evidence are recorded in [part41-report.md](part41-report.md); Part 4 is historical.

`build` never deploys or submits URLs. `validate` is read-only and sends no network requests. `validate:runtime` first validates the output, starts and stops a temporary Node preview, and sends requests only to that local server with redirects disabled. It does not contact affiliate checkout or the production origin. A sandbox may require permission to connect to the temporary loopback port. It does not emulate Cloudflare's asset binding or edge cache.

IndexNow is separate: `npm run indexnow:submit` validates output, then explicitly submits when `INDEXNOW_KEY` is present. Run it only when a task authorizes indexing submission. Never use `npx wrangler deploy` as a check. Neither command was run in Part 2.

## Source of expectations

`astro.config.mjs` writes `.astro/validation-config.json` at build completion from `src/config/validation.ts`. This local manifest imports the site's actual origin, locales, page SEO, blog/forum slugs, enabled catalog products, prices, featured plans, checkout destinations and redirect maps. It is not copied into `dist` or deployed. It contains no secret environment values.

The manifest also records a content fingerprint of source/config/scripts/public assets. `validate` fails if those inputs changed after the build; rerun the build instead of trusting stale HTML. Documentation changes do not invalidate it. File line endings are normalized for the fingerprint.

For each new clone:

1. Fill in `docs/conversion.example.json` as intake; it has no runtime loader. Implement the actual identity/content changes in the paths it maps.
2. Update `validationPolicy.forbiddenReferences` in `src/config/validation.ts` to include the previous site's brand, game-specific phrases and domain. Keep intentional migration aliases in server configuration; do not exempt them from rendered-content checks.
3. Preserve `src/config/protected-media.json` for unchanged utility artwork. Update hashes only for explicitly authorized replacements. Do not regenerate a baseline merely to make failing hashes pass.
4. Add page SEO entries for new static routes; dynamic blog/forum and enabled product expectations derive from their source data. Keep translated slugs complete across configured locales.
5. Rebuild, test and validate. Review warnings as well as errors. Keep production deployment and indexing as separate authorized actions.

## What is checked

| Area | Local checks |
| --- | --- |
| Output inventory | Expected routes exist; unexpected HTML fails; no fixed MW4 page count or brand in the reusable script |
| Links/assets | Local anchors, fragments, image/srcset/preload/poster URLs, linked CSS/scripts/fonts, CSS asset URLs and emitted module imports exist; internal redirect links are reported |
| Metadata | One title/description/H1; expected localized title/description; duplicate titles/descriptions within a locale; matching social metadata; correct HTML language |
| Canonicals | One self-canonical at the configured origin, including file routes; matching `og:url`; schema page URLs agree |
| Sitemap/robots | Every configured indexable page is listed, no noindex/unexpected/redirect URL is listed, no duplicates, robots allows indexable routes and disallows checkout, sitemap origin agrees; blog lastmod agrees with article dates |
| Hreflang | Configured locale/x-default targets, generated/indexable targets, reciprocal HTML links, matching sitemap alternates; no alternates on noindex pages |
| Structured data | JSON syntax/context/typed roots; common article/forum author/date/content fields; breadcrumb order/locale; FAQ questions/answers; product identity/price/currency and offer URL's selected plan |
| Commerce | Correct product checkout path, rendered plan options/prices, featured-plan default link; unit tests exercise actual client click/keyboard code and mobile link synchronization |
| Images/build transforms | Required attributes/dimensions, oversized-image warnings, 20 configured protected-file hashes, missing loader/import URLs and unresolved deferred markers |
| Template leftovers | Configured former-brand phrases and unresolved content tokens in generated HTML |
| Runtime | All configured page statuses, path redirects, locale checkout aliases/plans, forum filter cleanup, real 404/noindex responses and malformed request survival on Node; separate in-process Worker tests cover redirects/cache ordering/404s |

Tests include a passing fixture on a different domain with a different locale set/page count, then deliberately break links, fragments, assets, canonicals, indexability, JSON-LD, language, hreflang, robots, sitemap entries, redirect loops and CSS references. These failures prove the checks detect defects; they are not assertions that merely mirror current MW4 output.

This is a project validator, not a complete schema.org vocabulary validator, Rich Results Test, JavaScript browser test, external-link crawler or accessibility audit. It cannot establish vendor facts, translation fluency, actual checkout delivery, live Cloudflare behavior, Core Web Vitals, rankings or Search Console status. See the defect register for outstanding verification.

## Browser and Cloudflare checks

After the core checks, run `npm run validate:browser` and `npm run validate:cloudflare` for the pre-push suites added in Part 4.1. Both first validate the build. The browser command needs an installed Google Chrome; `QA_BROWSER_CHANNEL=msedge` can select an installed Edge instead. It launches an isolated headless profile, checks homepage/product layouts at 1440/768/390 CSS pixels, clicks localized desktop/mobile navigation, exercises both plans, and checks desktop/sticky mobile purchase clicks. Local checkout responses are fetched with redirects disabled, then intercepted with a local confirmation page. Partner destinations are never contacted. Screenshots/results remain under `.astro/browser-qa/`.

The Cloudflare command uses pinned local Wrangler/workerd with **the existing production config** and real static assets, without remote bindings or telemetry. Its configured build hook runs the ordinary build again. It checks all page statuses, routing, checkout plans, response headers, custom 404 bodies, emitted assets and local cache ordering. Process trees are stopped after success or failure. Loopback/process permissions may require execution outside the sandbox. It never invokes `wrangler deploy`, remote mode or a tunnel. Local compatibility is stronger than a mocked Worker test but cannot certify dashboard settings, DNS/TLS, live cache contents, deployed environment values or affiliate checkout fulfillment.

Use `npm audit --json` for current dependency advisories; see [dependency-review.md](dependency-review.md) for the Part 4.1 applicability assessment and fixed versions. No vulnerability waiver is built into validation. Browser checks are scoped smoke tests, not a full accessibility audit, Lighthouse or field performance measurement.
