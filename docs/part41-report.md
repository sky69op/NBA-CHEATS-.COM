# Part 4.1 — remaining pre-push blockers

2026-10-30. This supersedes Part 4's dependency/browser/local-Cloudflare blockers while preserving its historical evidence. No commit, push, deployment, remote binding, DNS change, purchase or IndexNow submission was performed. Five existing installed website skills were reused; none was installed again or globally modified.

## Blocker decisions

| Blocker | Status | Evidence / limit |
| --- | --- | --- |
| Dependency remediation/applicability | RESOLVED | Investigated all 11 affected packages / 30 advisory records; targeted updates clear the complete npm audit, including development tools. Clean `npm ci --ignore-scripts --no-audit --no-fund` passes. See [dependency-review.md](dependency-review.md) for every affected package, vectors, exposure assessment and patched version. No forced major framework upgrade or vulnerability waiver. |
| Real-browser checkout/navigation | RESOLVED | Isolated headless installed Chrome: 60 homepage/product page-and-width cases, 192 click/keyboard plan checks, 60 navigation clicks and 48 intercepted purchase clicks; zero recorded application errors. All four locales at 1440/768/390 pixels. |
| Cloudflare production compatibility | RESOLVED locally | Real Wrangler/workerd with the actual `wrangler.toml` and ASSETS binding: 459 local checks pass, including 140 page routes and 78 assets. Existing configured build hook also succeeds. This is not a live deployment/account test. |

**SAFE TO PUSH: conditional YES based on repository/local-runtime evidence; not unconditional live clearance.** All three repository-side blockers are resolved within the tested scope. Before authorizing a push to the live deployment branch, the owner must explicitly accept that dashboard/CI configuration, deployed environment, DNS/TLS, live cache/rollout behavior and the affiliate's own plan acceptance/fulfillment were not verified. Those risks have not been accepted on the owner's behalf. No Google Search Console, Seobility, ranking or indexing claim is made. Existing vendor-fact/availability and native-language editorial uncertainties remain in the defect register; they were not rewritten to make an audit pass.

## Verified production fixes

1. **First mobile-menu tap:** the production loader used a module script `load` event, which could resolve before top-level async widget initialization exposed the replay handler. Chrome reproduced a closed menu after the first tap and an open menu after the second. `src/scripts/site.ts` now uses dynamic import, waiting for module evaluation before replay. A regression exercises an actual delayed module and shared initialization promise. Design and copy are unchanged.
2. **Cloudflare page self-redirects:** real ASSETS routing returned 307 when the Worker requested `/index.html`, redirecting back to the same public page. The Worker now requests public paths and lets the configured binding resolve HTML. Custom error content is fetched from the binding's clean `/404` path rather than its redirecting `/404.html` path; public error canonical and HTTP 404/noindex behavior remain intact. A regression models physical-HTML canonicalization, and the real binding test passes.
3. **Malformed Worker paths:** the real binding tried to escape malformed percent sequences with a redirect. The Worker now rejects invalid encoding, NULs and decoded traversal segments with the custom 404 before asset lookup, matching Node's intended policy. Existing valid routes are preserved.
4. **Dependencies:** Astro 7.1.1 → 7.3.3, Sharp 0.34.5 → 0.35.5, plus compatible patched transitive versions. Sharp's range change is necessary for native-library security fixes. Added pinned development-only playwright-core 1.64.1 and Wrangler 4.156.0 for reproducible local verification. No framework-major migration, overrides or `audit fix --force`.

## Final verification evidence

- Clean locked dependency installation and full `npm audit --json`: pass, zero reported vulnerabilities. This is advisory coverage at audit time, not a perpetual security guarantee.
- `npm run build`: pass after the clean install; 145 generated HTML documents / 128 sitemap URLs. Ordinary build does not invoke IndexNow, Git writes or deployment. Command/hook review and the regression guard passed; no submission was executed.
- `npm test`: 57 passed, none failed/skipped. Includes original local-host tests, deliberate validator defects, content-generation fixtures, client checkout logic, delayed-loader readiness and asset-binding regression.
- `npm run typecheck`: 220 files, zero errors/warnings, 19 hints (existing unused/deprecated code).
- `npm run validate`: 145 HTML / 128 sitemap URLs, zero errors/warnings. Includes local links/assets, metadata, canonicals, robots/sitemap/indexability, project JSON-LD requirements and hreflang.
- `npm run validate:runtime`: 380 local HTTP checks, zero external requests. Every configured page, redirect, checkout alias/plan, malformed path and actual error status checked.
- `npm run validate:cloudflare`: pass after the clean install; 459 local real-runtime checks; 140 configured page routes, all 78 emitted JS/CSS/font/image/icon assets, redirect/plan forwarding, security/content/cache headers, nonempty custom 404 content and query normalization after priming cache. No partner destination followed. Node unit tests additionally cover host/HTTPS canonicalization and cache precedence; live ingress/DNS/TLS are outside this local test.
- `npm run validate:browser`: pass in installed headless Chrome. All 60 homepage/product page-and-width cases passed across en/es/de/fr at 1440/768/390 pixels; no detected horizontal overflow on those pages. Passed 192 click/keyboard plan checks, 60 navigation clicks (including first-tap mobile menus) and 48 actual desktop/sticky mobile purchase clicks. The sticky bar is tested after scrolling beyond checkout, matching its intended visibility rule. Zero recorded page errors, local 4xx/5xx responses or non-interception console errors. The partner was not contacted; payment delivery is not tested. Representative screenshots inspected; no claim of exhaustive visual review or other browser-engine coverage.
- `node scripts/part15-verify.mjs`: pass, including all 20 protected utility hashes and MW4 checks.
- Preservation: compared all 275 source/public files with the pre-update snapshot; only the intended `src/scripts/site.ts` loader fix changed. All public image bytes, editorial/product/pricing/locale data and identity files remained unchanged. Compared 145 before/after generated pages: zero changes to the sampled headings/prose/links/meta/canonical/hreflang/JSON-LD semantics. A separate original-HEAD check passed 77 core content/config/asset comparisons, identical emitted product data and unchanged favicon artwork payload. No deleted tracked files or routes, no active content manifest, no current-site content generation.
- Scoped secret/temporary-file review: 329 tracked/nonignored candidate files; no matched private-key/service-token signatures or tracked build/draft/dependency/env directories. Environment-file variants, Wrangler dev variables/state and all QA evidence are ignored. This is not an exhaustive secret-detection guarantee. `git diff --check`, six JSON syntax checks and 29 local documentation links pass. The original local-host alias also passes its three tests separately.
- Final persistent local preview restarted on `http://127.0.0.1:4173/`; independent Windows HTTP request returned 200. Temporary test servers/browser profiles were stopped; this preview is intentionally left running for the owner.

## Files and repeatable checks

Production changes are limited to `package.json`, `package-lock.json`, `src/scripts/site.ts`, `workers/site.js` and ignore rules. Added `scripts/qa-server.mjs`, `browser-smoke.mjs`, `cloudflare-smoke.mjs`, `deferred.test.mjs`, and extended `routing.test.mjs`. Updated AGENTS, architecture/validation instructions, README and defect register; added this report and the dependency review.

After `npm run typecheck`, build, test and validate, use:

```text
npm run validate:runtime
npm run validate:browser
npm run validate:cloudflare
node scripts/part15-verify.mjs
```

Browser QA uses a fresh temporary Chrome profile, never the user's existing browser tabs. `QA_BROWSER_CHANNEL` may select another supported installed Chromium channel. Requests are restricted to loopback; actual clicked checkout responses are inspected with redirect following disabled and replaced with a local confirmation. Screenshots/results are ignored under `.astro/browser-qa/`. No external checkout is contacted. This is scoped Chrome smoke testing, not exhaustive cross-browser, accessibility, Lighthouse or Core Web Vitals certification.

Wrangler runs `dev --local` with the production config, remote bindings disabled, telemetry disabled and state under `.astro/`. It never uses deploy, remote mode or a tunnel. Its existing build hook runs again; temporary process trees stop after success/failure. Evidence is under ignored `.astro/part41-*.log/json`. Local tests do not require Cloudflare credentials; the static Worker needs ASSETS, not an Astro SSR adapter or Node compatibility flag. The pinned tool/runtime recognizes the existing compatibility date and asset settings. Actual Cloudflare dashboard/GitHub build environment values were not accessed; local build used Node 24.19.0, with declared minimum >=22.12.0 retained.
