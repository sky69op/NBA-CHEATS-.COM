# Template defect register

Updated 2026-10-30 after Part 4.1. Part 1's hypotheses were investigated against actual source and built output. This register separates fixed defects from remaining uncertainty; it is not a list of rules to preserve in future conversions. Current readiness and residual live-verification risks: [part41-report.md](part41-report.md). [Part 4](part4-report.md) is historical.

## Confirmed and fixed

| Finding | Change and evidence |
| --- | --- |
| Build automatically submitted IndexNow with an environment key | Removed submission from `build`. Added separate `indexnow:submit`, gated by `validate`. Unit test guards against submission/deployment commands reappearing in ordinary build. No submission command was executed. |
| Four historical title assertions failed | They represented two source/test discrepancies, not four independent metadata bugs. Restored correct UGC acronym/context. The old long Skin Changer expectation was clipped by the layout; replaced it with accurate, shorter `Modern Warfare 4 Skin Changer | Local Cosmetic Previews`. Document/social titles now agree and the historical test passes. |
| French homepage metadata began with the stray word `Sur` | Corrected both French page SEO and dictionary fallback title to `Triches Modern Warfare 4 | Aimbot et ESP`. No route/content deletion. |
| Breadcrumb schema used English paths on translated pages | All breadcrumb callers now pass locale. Translated about/support/legal/FAQ WebPage schema also passes locale; about Organization language is localized. Validator checks language, breadcrumb locale and existing targets. |
| Forum schema lacked published date and the supported post-text field | Uses existing `post.published` and post text, removes Markdown link syntax from schema text, and localizes the parent forum URL. No author/date was invented. See Google's [discussion forum requirements](https://developers.google.com/search/docs/appearance/structured-data/discussion-forum). |
| Featured product offer price did not explicitly select its plan | Product schema now has its canonical page URL and an offer URL containing the featured plan parameter. The advertised $150 lifetime offer points to `?plan=lifetime`. Existing prices/durations/destinations are unchanged. |
| Localized sitemap classification/date gaps | Classify by locale-stripped path; look up each locale's actual article date. No build-time fallback dates. Invalid article dates now fail instead of being replaced by today's date. Validator compares blog lastmod with article schema dates. See [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). |
| English 404 canonical referenced `/404/` instead of the generated `/404.html` | Explicit English error-document canonical; file-extension-aware canonical helper drops query/fragment state. Localized errors retain their own paths. Error routes remain noindex and serve HTTP 404. |
| JSON-LD serialization could embed a literal closing script sequence | Escape `<` in serialized JSON-LD before insertion. Values and visible content are preserved. |
| Checkout href normalization dropped plan/query/hash and generically matched a shared partner prefix | Retain selection/options through normalization; match configured partner target parameters instead of treating any shared affiliate-base URL as the main product. Unknown destination remains unchanged. All four partner URL strings are untouched. |
| Mobile purchase link stayed on lifetime after selecting monthly | Client sync updates desktop and mobile checkout links together; keyboard Space/Enter selects the focused plan. VM test executes the actual Astro client script for click, keyboard, total, duration and link behavior. |
| Worker cache could bypass canonical redirects | Host/query/path/locale normalization now precedes document cache lookup. In-process Worker tests explicitly prime a cached response and verify redirects still win. English normalization order matches Node. |
| Malformed encoded paths could crash Node's URI decoding; path boundary check accepted sibling prefixes | Safe static-path resolver rejects invalid encodings/NULs and paths escaping dist. Node/Worker case normalization skips percent-encoded paths. Unit/runtime checks cover malformed paths and actual 404 behavior. |
| Node checkout redirects lacked an explicit no-store policy | Added `Cache-Control: no-store`, matching Worker checkout behavior. |
| Active fallback meta refresh could race query-preserving JS | Meta refresh is now inside `noscript`; active JS remains responsible for forwarding query state. No-JS fallback limitations remain below. |
| Build added artificial hidden `(link 2)` suffixes and keyword prefixes to logo descriptions | Disabled the repeated-anchor transformation and made the shared logo alt describe the same artwork on every route. This removes arbitrary screen-reader text without changing the visible design. |
| Brand generator could overwrite its own input; favicon was PNG bytes in an `.ico` file | Read the source once into memory; write a proper ICO container. Wrapped the existing favicon PNG payload without redrawing/re-encoding artwork. Generator tested in a temporary directory, including master-as-source. Protected utility media and logo assets were not regenerated. |
| No reusable output validator | Added configuration-derived `validate`, source-fingerprint freshness checks, protected-media policy, deliberate-defect fixture tests and local runtime checks. See [validation.md](validation.md). |

## Part 2 evidence (historical)

- Production build completed successfully after the final source changes; sitemap contains the same 128 indexable URLs. All 140 configured documents and five checkout fallback documents remain generated.
- `npm test`: 28 passed. Includes original local-host tests, Worker checkout/redirect/cache/404 checks, actual client checkout script behavior, dictionary key completeness, brand generation and deliberately broken validator fixtures on another domain/locale set.
- `npm run validate`: 145 HTML documents, 128 sitemap URLs, zero errors and zero warnings. Includes all four products in all four locales, plan data, schema/canonical/hreflang relationships, links/assets and protected media.
- `npm run validate:runtime`: passed 380 HTTP checks against a temporary local Node server; zero external requests. Sandbox loopback access was blocked on the first attempt; the authorized retry outside the sandbox passed. The script stopped its temporary server afterward.
- `node scripts/part15-verify.mjs`: passed; all 20 original protected-media hashes and historical MW4 checks passed.
- `npm run test:local-hosts`: 3 passed separately as well as in the main test suite.
- Spanish/German/French dictionaries contain all examined English object keys; generated metadata and locale URLs pass. This does not establish translation fluency.
- The only dependency declaration added is the already-installed parse5 version as a direct development dependency; no framework or package version was upgraded.
- No commit, push, deployment, DNS change or indexing submission was performed. No Search Console report was accessed.

## Unresolved / intentionally retained

| Area | Current status and next step |
| --- | --- |
| Vendor facts | Main-product OS/CPU/security requirements and compatibility evidence remain incomplete. `GAME.publisher`/`antiCheat` are empty. Do not infer these from utility requirements or invent facts. |
| Product availability | Product schema still reflects the existing InStock statement; actual availability needs owner/vendor confirmation. Local validation cannot establish it. |
| Repeated commercial prose | Prices/durations occur in prose and translations as well as pricing data. Current main term is 30 days; utility terms are 31. No confirmed numeric inconsistency justified changing them. Future changes must audit all prose. |
| Translation/editorial quality | Key completeness and route/meta consistency passed. Human review of nuanced wording, loanwords, product claims and long-form translations remains useful. |
| No-JS/static-host checkout | Pure HTML fallback cannot read an incoming query without JS. Primary Worker/Node/dev server redirects preserve the plan. Other static hosts' query behavior needs host-specific verification. |
| Deployment parity | Part 4.1 adds a passing real local Wrangler/workerd + ASSETS suite in addition to mocked unit tests. Worker/Node/middleware and optional Pages artifacts remain separate implementations; deployed account/edge/cache behavior is unverified. Pages is not the configured primary target. |
| Image pruning/CSS transforms | Current final references resolve with no missing assets. The broad dist PNG pruning and CSS pruning remain legacy optimization risks for future designs/formats; inspect after conversions. |
| Browser/performance | Earlier UI automation was blocked. Part 4.1's isolated headless Chrome suite now passes all locales at desktop/tablet/mobile widths, including navigation, plans, intercepted checkout, overflow and recorded runtime errors. Other browser engines, exhaustive visual/accessibility checks, Lighthouse and field Core Web Vitals remain unverified. No redesign was made. |
| Dependency security | RESOLVED in Part 4.1: all 11 packages / 30 advisory records investigated and patched; full npm audit reports zero vulnerabilities, including QA tools, after a clean locked install. Refresh advisories over time; details in the dependency review. |
| Live SEO | Source/build checks do not establish actual Google indexation, rankings, rich-result eligibility, live redirects or Search Console health. Deployment and post-deployment smoke checks require a separately authorized task. |

Part 1 history: its first build completed with IndexNow explicitly skipped; three local-host tests and 80 in-process checkout responses passed, while the historical script reported four title assertions. Part 2 replaces that unresolved title state with the fixes and passing evidence above.

## Part 3 — future conversion content workflow

Added a required conversion-agent content stage, local prepare/plan/check/install commands and a new-origin build guard. Details, file inventory and invocation: [content-workflow.md](content-workflow.md) and [part3-report.md](part3-report.md). The five installed skills were reused; no duplicate skill or model API integration was added.

Future packs require a keyword/URL intent map, verified evidence references, normally 8–12 supported articles and 10–15 editorial starters, complete en/es/de/fr inventories, natural contextual links/CTAs and valid dates. Forum starters use the publishing Organization, visible editorial disclosure and zero invented user activity. Approved commercial sections stay in the existing native data structures. Changed plans invalidate draft review; existing drafts/backups are preserved.

Verification: 54 tests (26 content cases), production build and current output validation passed. Current HTML remains 145 documents/128 sitemap URLs; original 20 utility media hashes passed. A pre-edit source snapshot and isolated before/after render comparison found no changes to existing MW4 content, metadata, links, structured data or publication dates. Only optional authorship plumbing changes existing source code; its legacy default is preserved. No master content manifest was activated and no production copy was generated.

Remaining limits: automated checks cannot prove truth, translation fluency, independent global originality or semantic intent separation. Those require a focused agent review against the evidence for each future conversion. Existing vendor-data and live-verification issues above are unchanged. The content workflow never deploys or submits IndexNow.

## Part 4 — final verification

Confirmed/fixed: added the missing Astro-aware typecheck command/tooling; corrected icon component typing, sitemap enum types and gallery inference; removed an ignored unsupported Breadcrumbs prop; repaired the development checkout redirect API so its headers are applied. Added a regression checking 40 product/locale/plan combinations. Excluded ignored content fixtures from typechecking, fingerprinted tsconfig changes, ignored environment variants and corrected three tooling/mock hints. Product data emits identical JavaScript to HEAD; current content was not rewritten.

Final evidence: build exit 0; typecheck 216 files with zero errors/warnings and 20 hints; 55 tests passed; validator 145 HTML/128 sitemap URLs with zero errors/warnings; 380 local HTTP checks with zero external requests; historical check passed all 20 protected hashes. Separate final checks compared 77 original content/config/asset files, confirmed no deletions and identical favicon payload, and exercised 64 selections using actual rendered plan data across all 16 product/locale pages in a VM. Scoped credential/temp review found no matched secret signatures or tracked output/draft/env directories.

**Production clearance requires review.** npm production dependency audit failed with 11 reported affected packages. Browser responsive/mobile/navigation/console/performance testing remains NOT TESTED because computer use's Windows URL-policy check stopped automation. Live Cloudflare asset/cache behavior and affiliate landing-page plan acceptance are NOT TESTED. No actual checkout purchase, Search Console/Seobility test, new-game conversion, commit, push, deployment or IndexNow submission occurred. See [part4-report.md](part4-report.md) for the full PASS/FAIL/NOT TESTED matrix, findings and next acceptance steps.

## Part 4.1 — blocker remediation

Supersedes the preceding Part 4 blocker state. Fixed a first-tap mobile drawer initialization race by awaiting deferred module evaluation, Cloudflare self-redirects caused by physical `/index.html` asset requests, blank custom 404 risk from the flat error asset's redirect, and malformed-path binding redirects. Added focused regressions and reusable real Chrome / local Cloudflare smoke commands. Existing MW4 copy/data/media remain unchanged; only the deferred loader changed among the 275 snapshotted source/public files. All 145 generated pages retain their compared content/metadata/link/schema semantics.

Evidence: clean `npm ci`; full npm audit zero vulnerabilities; production build; 57 tests; typecheck 220 files with zero errors/warnings and 19 hints; output validator 145 HTML / 128 sitemap URLs with zero errors/warnings; Node 380 HTTP checks; real local Wrangler/workerd 459 checks including 140 routes and 78 assets; Chrome 60 page/viewport cases, 192 selections, 60 navigation clicks, 48 intercepted purchases, zero recorded errors. All 20 protected media hashes pass. Ordinary builds do not submit IndexNow. New tools/state/env ignore rules and scoped secret/deletion review are documented in [part41-report.md](part41-report.md).

Repository-side blockers are resolved locally. A live-branch push remains conditional on explicit owner acceptance of unverified Cloudflare dashboard/CI/env/DNS/TLS/cache rollout and external affiliate plan acceptance/fulfillment. These were not tested or accepted on the owner's behalf. No commit, push, deployment, indexing submission or purchase occurred.

## Post-release audit follow-up — French homepage heading

The supplied 20-page live audit retained an inappropriate `sur` keyword target and requested that it be restored to the French title. Independent live/source review found the actual remaining issue in `hero.titleLead`: the H1 still read `Sur: Modern Warfare 4 Triches`. Corrected the French hero fields to render **Triches Modern Warfare 4**. The already-correct document title, canonical, other locales, shared design and four products are unchanged.

Verified locally after this correction: production build; all 57 tests; reusable validator (145 HTML / 128 sitemap URLs, zero errors/warnings); 380 Node HTTP checks; historical MW4 regression including all 20 protected-media hashes. Isolated Chrome checks at 390/768/1440 pixels confirm one correct H1, unchanged title/canonical, HTTP 200, no detected horizontal overflow and no recorded page errors; representative mobile/desktop captures inspected. No new constant-mirroring unit test was added for this copy-only change.

The audit's repeated failed-link warnings refer to one account-recovery article. The preceding live review fetched that exact URL three times with HTTP 200, its actual article, self-canonical and indexable robots metadata. No link was removed or redirected; the historical fetch failure was not reproduced and its cause remains unknown. Rejected keyword prefixes on the shared logo and mandatory UGC-title repositioning because the supplied evidence does not establish defects. The external auditor's pinned keyword map must be corrected in that tool (homepage: Modern Warfare 4 Cheats; remove the irrelevant French `sur` target); it is not a repository setting. No source changes beyond the French hero fields or new product claims. The owner separately authorized commit/push after local verification; live deployment verification remains pending. No direct deployment or IndexNow submission was performed.
