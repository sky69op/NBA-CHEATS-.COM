# Part 3 content workflow report

Configured 2026-10-30 for future authorized new-site conversions. Existing MW4 copy is unchanged and no new MW4 content pack was installed.

## Daily invocation

Ask Codex to convert a clone as usual. Root `AGENTS.md` makes the content workflow mandatory under the existing converter and technical SEO skills. Codex fills the intake from confirmed business inputs, runs `content:prepare`, plans keyword/URL ownership once, writes commercial/support/hub copy plus normally 8–12 articles and 10–15 disclosed editorial discussion starters, completes en/es/de/fr, then runs plan/draft checks and installs the typed blog/forum data. Codex maps commercial wording into the existing native copy fields and runs build/QA.

The user supplies or confirms business facts, not article/thread drafts. Missing essential facts remain questions, not invented claims. Reuse approved unchanged utility facts and completed batches. If genuinely distinct supported topics are fewer than the target, record why instead of padding.

`content/policy.json` retains the template origin. A changed origin without an approved `content/manifest.json` blocks the build. With a manifest, the build verifies approved copy, translated routes, links, source hashes, related-product blocks and Organization authorship for new forum starters. The current master needs no manifest and does not activate generation.

The npm commands are local orchestration/validation/install tools. Codex is the writer; an ordinary build never calls an AI service or silently rewrites pages. No API key, daily scheduler or separate per-article prompts are needed.

## Skills

Reused the installed `website-template-converter` and `technical-seo` as coordinators, `website-rebranding` for native content/identity integration, and `website-quality-assurance`/`deployment-readiness` for verification and side-effect boundaries. None was reinstalled or globally changed. No duplicate content skill was created; the repository adapter and data contracts are sufficient.

## Part 3 files

- Added `scripts/content-workflow.mjs`: evidence-based brief, resumable draft state, checked plan hashes, draft/locale/price/counter checks, typed data installer with backups/manual-edit protection, and optional integrated-output gate.
- Added `scripts/content-workflow.test.mjs`: temporary fixtures for normal quotas, four-language inventory, master/new-origin guards, resumed/changed inputs, typed exports, incomplete/duplicated content, pricing, disclosures/counters, links, installation protection and final rendered-copy checks.
- Added `content/policy.json` and `docs/content-workflow.md`.
- Updated `package.json`, `.gitignore`, `astro.config.mjs`, `scripts/source-fingerprint.mjs` to wire commands, draft exclusions, build gating and manifest/policy freshness checks. No dependencies added.
- Extended `src/data/forum/types.ts`, `src/utils/schema.ts`, `src/pages/forum/[slug].astro` with optional Organization authorship for new editorial starters. The default remains the previous Person type for all existing MW4 records.
- Updated `AGENTS.md`, `README.md`, `docs/architecture.md`, `docs/conversion.example.json`, `docs/template-defects.md`, and this report. The example workflow remains disabled with unresolved business inputs; it cannot activate content on the master.

## Verification and boundaries

- All 54 tests passed, including 26 content-workflow cases; production build passed.
- Current production-output validation passed 145 HTML documents and 128 sitemap URLs with zero errors/warnings. Historical MW4 regression check passed, including all 20 protected-media hashes.
- Snapshotted 275 pre-existing src/public files before work. Only the three declared optional authorship code files changed; current product/article/forum/translation content and public asset files remained unchanged.
- Built an isolated baseline with the three optional authorship changes and content hook removed. Compared all 145 current HTML documents: zero differences in text, headings, anchor targets, document language, titles, metadata, canonical/hreflang links, JSON-LD or publication dates. Raw HTML asset-reference hashes may differ after a rebuild; no byte-identical HTML claim is made.
- No active content manifest, generated production articles or forum starters were created on the master. Test copy is synthetic and confined to temporary fixtures; render-baseline files and draft/backups are under ignored `.content/`, outside public/dist.
- No commit, push, deployment or IndexNow submission occurred.

Structural checks cannot certify factual truth, global originality, semantic search-intent separation or translation fluency. Codex must review those against the recorded evidence during the future conversion. Existing unresolved vendor facts/live-site verification in the defect register remain unresolved. This setup does not assert rankings or Search Console status.
