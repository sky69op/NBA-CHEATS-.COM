# Part 5 — approved release and rollback reference

Release preparation: 2026-10-30. The owner explicitly authorized committing and normally pushing Parts 1–4.1 plus the commercial game-cheats positioning instructions to the existing live repository. Automatic Cloudflare deployment may follow the GitHub push; live Cloudflare and external checkout checks are deferred until after deployment by the owner's instruction. This approval applies to this release, not future conversions.

- Remote: `https://github.com/novaxbasit/mw4-cheat-.net.git` (`origin`, fetch and push).
- Existing branch/upstream: `main` → `origin/main`; GitHub's symbolic HEAD is `refs/heads/main`.
- Verified pre-release remote commit / **rollback reference**: `a5e9ee9cdf6cfdb1fa3e5d13d6d9ba00d37d56f8`. It matched local HEAD and the tracking ref before this release, with no unexpected remote changes.
- Approved commit message: `Improve MW4 cheats website and reusable Codex template`.
- The commit containing this file is the prepared release. Its parent is the rollback reference; do not infer deployment success from the commit or push. A later rollback requires a separately authorized normal revert/redeployment, not a force-push or history rewrite.

Pre-push verification rerun successfully: production build; all 57 tests; Astro typecheck (220 files, zero errors/warnings, 19 hints); output validator (145 HTML documents / 128 sitemap URLs, zero errors/warnings); 380 local Node HTTP checks; all 20 historical protected-media hashes; full npm audit (zero vulnerabilities); JSON/documentation links and whitespace checks. Scoped private-key/token and unintended-file/deletion checks found no issue. No environment credentials, ignored drafts, build output, browser captures, local runtime state or dependencies belong in this release.

Original identity, pricing, referral configuration, editorial data and public artwork comparisons pass. Existing URLs and the four-product architecture remain intact. The expected favicon container, SEO/schema/checkout/routing fixes are documented in the defect register. Comparing the 145 rendered pages with the Part 4.1 pre-update snapshot found no additional content/metadata/link/schema semantic changes. The latest commercial-positioning update changes instructions/intake documentation only.

The previously successful Part 4.1 browser suite (60 page/viewport cases, 192 plan checks, 60 navigation clicks, 48 intercepted purchase clicks) and real local Cloudflare suite (459 checks) are retained evidence for the unchanged application/Worker code. Recent changes are documentation only; those longer suites were not unnecessarily repeated during Part 5. See [Part 4.1 evidence](part41-report.md) and the [defect register](template-defects.md).

Cloudflare target configuration is unchanged: `wrangler.toml` points to `workers/site.js`, `dist`, the ASSETS binding, the existing compatibility date and mw4cheat.net/www custom domains. No active Git hooks or alternate hooks path were found. Ordinary build/validation has no IndexNow, Git-write or deployment command. No Cloudflare environment setting was modified. Direct Wrangler deployment, DNS changes and IndexNow submission remain outside this release task.

Live dashboard/CI configuration, environment values, DNS/TLS, edge-cache rollout and affiliate-side plan processing/fulfillment have not been certified. Search Console, Seobility and live deployment URLs were not tested during this pre-push preparation. The GitHub push result and resulting commit hash are reported separately after execution.
