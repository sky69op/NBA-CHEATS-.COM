# NBA2K27 Cheats — project status

Updated: 2026-11-06 (Asia/Karachi)  
Stage: Part 3 — English inventory baseline installed; origin switched to `nbacheats.com`; legacy War Thunder / MW4 deployable references removed from live wiring. Commercial UI strings for es/de/fr regenerated from `_commercial-en.json` after fixing the Part 3 translation mask bug. **Site FAQ Q&A** for es/de/fr now merge from `src/data/faq/locales/` (aligned to NBA 2K27 English source); blog/forum/product copy parity remains to spot-check over time.

## Confirmed intake

- Domain: `nbacheats.com`; target origin: `https://nbacheats.com` (recorded in the prepared content run; source origin intentionally remains the template origin until Part 3).
- Brand / primary keyword / hero H1: **NBA2K27 Cheats**.
- Game: NBA 2K27. Official 2K research records Visual Concepts as developer, 2K as publisher, and PC via Steam among listed platforms.
- Support destination: `https://zadeyo.com/go/SKY?to=%2Fshop`.
- Products: NBA2K27 CHEATS, HWID SPOOFER, UGC, CLOUD DMA.
- Referral destinations: exactly the owner-supplied `SKY` URLs. Main checkout path is now `/go/nba-2k27/`; selected `monthly`/`lifetime` plans continue through redirects.
- Pricing: main/UGC/Cloud DMA = $35 for 30 days or $150 lifetime; HWID = $50 for 30 days or $150 lifetime.

## Template audit

- Layout baseline retained: Astro shared header/footer, hero, feature grid, product cards, sliders, product-detail composition, FAQ, blog/forum hubs, responsive components, dark-purple palette, and en/es/de/fr routing.
- Current source contains legacy War Thunder content, former `war-thunder` checkout paths, old article/forum data, legacy gameplay and conceptual Cloud DMA artwork, old localized copy, and old output (not copied into this worktree).
- The four-locale content gate is active. `content:prepare` created resumable run `.content/69ebc81c5b13ebeb/` before any origin switch. Full pack check/install remains correctly deferred to Part 3.

## English work completed in real source fields

- `src/i18n/en.ts`: rewritten homepage hero, feature grid, comparison/setup context, main-product card, utility cards, product page presentation text, hub introductions, and commercial page metadata around NBA 2K27 and verified limits.
- `src/data/products.ts`: rewritten English product overview, plan, acquisition, requirement, limitation, and detail-page prose to remove inherited vendor/functionality claims; UGC is accurately defined as Unban & Governance Control and explicitly non-guaranteed.
- `src/data/catalogCopy.ts`: rewritten English catalog selection/comparison/CTA copy with distinct product purpose and no assumed delivery, platform, or technical requirements.
- `src/config/game.ts`, `src/config/site.ts`, `src/config/checkout*.ts`: NBA 2K27 identity, brand name, and supplied product referral destinations integrated. Target origin and Cloudflare routes remain intentionally unchanged until Part 3.

## Keyword / route purpose map

| Route | English primary purpose |
| --- | --- |
| `/` | NBA2K27 Cheats overview and product research |
| `/cheats/` | NBA2K27 CHEATS plans, limits, and current-listing checks |
| `/products/` | Separate product / plan comparison |
| `/hwid-spoofer/` | HWID scope and requirements to confirm |
| `/ugc/` | UGC account-appeal context and limits |
| `/cloud-dma/` | Cloud DMA requirements and applicability to confirm |
| `/faq/` | pre-purchase terms, risk, and support questions |
| `/about/` | editorial identity and disclosed referral model |
| `/support/` | support / ticket route |
| `/blog/`, `/forum/` | provisional hubs pending Part 2 research and authored editorial bodies |

## Evidence and unresolved facts

- Official game source: 2K Newsroom, “Ball Over Everything in NBA 2K27 Now Available Worldwide,” verified 2026-11-06.
- No vendor facts were provided for main-product features, supported modes/platforms, compatibility, anti-cheat status, availability, HWID scope/requirements, or Cloud DMA functionality/applicability. This pass deliberately makes none of those claims.
- New NBA 2K27 game imagery, a replacement OG/social image, and any brand artwork are still required. Inherited game visuals must not ship for this conversion.

## Part 2 imagery and research

- Applied the three owner-supplied NBA 2K27 images only to the shared homepage/main-product slider: `public/images/nba-2k27/nba2k27-main.webp`, `nba2k27-attributes.webp`, and `nba2k27-misc.webp` (all 1330×840). The previous-game slider references were replaced in `src/data/products.ts` and `src/config/gameplayMedia.ts`.
- Preserved the existing HWID Spoofer and UGC utility art. Replaced the previous Cloud DMA concept reference with `public/images/nba-2k27/cloud-dma-concept-v2.png` (1672×941), an AI-generated illustrative concept—not a product screen or functionality evidence.
- Generated and installed an original transparent basketball-orbit / abstract-27 brand mark as the brand image and favicon source. Generated favicon and brand variants are in `public/` and `public/images/brand/`; `BRAND_LOGO_ASSET_VERSION` is now 9.
- Read competitor research: `nba2k27cheats.net` (topic vocabulary only; its claimed features, reviews, pricing, support and status are not evidence) and WeMod’s NBA 2K27 page (states its own product is unsupported for NBA 2K27). The supplied SkyCheats and ChamsCheats URLs were inaccessible through the browser and are recorded as unread, not treated as sources.
- Primary sources read: 2K’s NBA 2K27 launch and NBA 2K HQ announcements. They support game context only: developer/publisher, platform list, MyCAREER/MyNBA/MyTEAM/MyPLAYER context, and online-feature caveats. They do not establish referral-product functionality.
- English batches 1–2 are saved in `.content/69ebc81c5b13ebeb/part2-en-batch-1.md`: 8 complete blog drafts and 10 forum prompts with labeled publisher answers. Blog slugs: `nba-2k27-product-research-checklist`, `nba-2k27-plan-comparison`, `ugc-account-appeal-records`, `hwid-and-account-appeals-different-questions`, `nba-2k27-official-game-context`, `nba-2k27-pc-platform-questions`, `cloud-dma-questions-before-purchase`, and `third-party-software-risk-nba-2k27`.
- Forum slugs: `nba-2k27-product-scope-before-checkout`, `monthly-and-lifetime-plan-questions`, `ugc-account-appeal-boundaries`, `hwid-question-without-diagnosis`, `cloud-dma-requirements-to-confirm`, `nba-2k27-pc-platform-clarification`, `product-images-and-evidence`, `third-party-risk-questions`, `partner-delivery-and-support-questions`, and `nba-2k27-mode-specific-questions`.
- The content-plan JSON and typed source installation remain deferred to Part 3 because the content pack is English-only. Before that stage, each draft needs final artwork mapping and the required es/de/fr translations; `planHash` and final installation are therefore not yet ready.

## Checks

- PASS — source copy created in exact-domain isolated worktree; reusable master preserved.
- PASS — root rules, project rules, start guide, local AGENTS, architecture, defect register, and content workflow read.
- PASS — locked dependencies restored with `npm ci`; `npm run content:prepare -- --config audit-evidence/nba2k27-intake.json` completed; `npm run typecheck` completed with 0 errors (20 pre-existing hints).
- NOT TESTED — typecheck/build/tests/validation/runtime after Part 2 image edits. The site remains intentionally pre-install and English-only; current source still has legacy editorial/localized material and must not claim a complete build.
- NOT TESTED — browser/mobile/desktop, Lighthouse, Seobility, Screaming Frog, final sitemap/hreflang, and redirect-runtime checks; these belong after Part 3/4 content completion.

## English cheat-search editorial batch

- Installed 20 English articles in the live blog source: Auto Green, cheat-menu claims, attribute changer, max badges, Unlock All, ESP/visibility, configs, PC research, patch status, scripts, provider comparison, plans, reviews, safety claims, HWID Spoofer (2), UGC (2), and Cloud DMA (2).
- Installed 20 English forum topics in the live forum source. Each topic has exactly one visible publisher-written editorial answer, an answer count of one, zero fabricated votes, and a contextual guide link.
- Used ranking competitor pages for topic and search-intent discovery only. No competitor prices, copy, testimonials, status labels, or provider-specific functionality claims were copied or adopted.
- Added CONTENT_INVENTORY.json with the stable English slugs, primary product distribution, source paths, and outstanding Part 2/3 work.
- The per-product 20–25 inventory target has not yet been reached. English blogs currently total 20 across all products, not 20 per product. Unique original art per article also remains outstanding.

## Feature terminology pass

- Rewrote the English homepage feature section and the main product card around the researched NBA 2K27 cheat-search vocabulary: Auto Green, attributes, Max Badges, Unlock All, ESP, radar, visibility, soft aim, aimbot, configs, private-cheat language, and status language.
- Replaced stale War Thunder related-blog and forum mappings in the live product data with working NBA 2K27 editorial slugs.
- Added KEYWORD_MAP.md. It maps every supplied main-product, Cloud DMA, UGC, and HWID keyword cluster to a live product or supporting-content intent without presenting a keyword as proof of inclusion.

## Next action

Complete the Part 2 English article/forum batches in `.content/69ebc81c5b13ebeb/`, including disclosed publisher answers, then retain the final locale gate for Part 3. A Cloud DMA vendor reference remains unavailable; Cloud DMA content must stay limited to plan terms and requirements-to-confirm.

## Part 3 gate audit

- OWNER OVERRIDE — The owner explicitly approved the current English inventory as the Part 2 baseline on 2026-11-06. Continue into Part 3 from the reviewed inventory; retain its product ownership in CONTENT_INVENTORY.json and do not reduce it.
- FAIL — Locale source readiness: Spanish, German, and French blog, forum, product, catalog, FAQ, and commercial data still contain prior-game material. Translating the current subset would create a partial, invalid pack.
- PASS — Stale-install prevention: removed the previous-game content manifest. A new manifest must be generated only after a complete all-locale pack passes its checks.
- PASS (deployable) — Old-game cleanup: War Thunder checkout/assets/articles removed; origin/robots/wrangler/keywords/manifest policy aligned to `nbacheats.com`. es/de/fr UI uses English commercial copy until Part 3 translation (legacy JSON files may still exist on disk but are not wired).
- FAIL (Part 3) — Author full es/de/fr blog/forum/product/FAQ translations; remove or replace dormant locale JSON on disk; run content pack check/install.
- Next action: finish the remaining English per-product article and forum inventory, then replace every localized source body and run the content pack check/install sequence.

## Part 3 current run

- Prepared a fresh resumable content run at .content/69ebc81c5b13ebeb after the stale prior-game manifest was removed.
- The run is ready to receive the complete reviewed English inventory and the required Spanish, German, and French replacements. It has not been checked or installed because those locale bodies have not yet been authored.
- **2026-11-06 — Commercial UI locales:** `src/i18n/en.ts` homepage hero pills + features grid rewritten for NBA 2K27 cheat-search vocabulary (no duplicate HWID tile). `content/part3/translations/_commercial-en.json` synced to that copy. `scripts/generate-part3-commercial-de-fr.mjs` fixed: masking used repeating `__PT0__` tokens so unmasking turned protected phrases into `0` (broken DE/FR); script now emits unique `__PT{n}_PH__` tokens, outputs ES+DE+FR, and masks only brands/domains/USD amounts so duration wording can localize. Regenerated `commercial-{es,de,fr}.json` and copied to `src/i18n/dictionaries/` via `part3-apply-commercial-i18n.mjs`. Patched DE product blurbs that still had English sentence prefixes; ES hero metric label + status-pill wording + “30 días” tag typo.

- PASS — `npm run typecheck` after the above (0 errors).

## Part 4 (2026-11-06)

### Content reconciliation

- Sitewide targets met in source: **25** English blog articles (`src/data/blog/posts/en-articles.ts`), **25** English forum topics (`src/data/forum/en-posts.ts`); es/de/fr blog and forum modules regenerated via `node scripts/part3-generate-locale-posts.mjs` (25 each).
- Added English article `nba-2k27-official-sources-before-cheats-research` plus es/de/fr overlays in `content/part3/translations/`. Linked from main product related blog list in `src/data/products.ts`.
- `CONTENT_INVENTORY.json` refreshed to match installed slugs and counts.

### Theme / flash

- `src/layouts/BaseLayout.astro`: removed hard-coded `<html class="dark">`; very small inline head script applies stored or system theme and sets `theme-color` before paint; Starwind `ThemeInitScript` unchanged for persistence and `astro:after-swap`.
- `src/scripts/site.ts`: `initThemeMetaColor` prefers `#sw-theme-color` meta.

### Scripts / tests

- `scripts/part15-verify.mjs` rewritten for NBA 2K27 (Cloud DMA instead of Skin Changer, `/go/nba-2k27/`, dynamic sitemap URL count, 15 protected utility hashes). Optional post-build check; primary gate remains `npm run validate`.
- `scripts/middleware.test.mjs`: checkout path list updated to current `/go/…` slugs.

### Audits (external tools)

- **NOT TESTED** — Seobility (no report URL or credentials in this workspace).
- **NOT TESTED** — Screaming Frog (desktop crawl not run in this session).
- **NOT TESTED** — Lighthouse scores (CLI/UI not invoked in this session; no fabricated 100/100).

### Verification (this session)

- **PASS** — `npm run typecheck` (0 errors; existing hints unchanged).
- **PASS** — `npm run build` → `dist/sitemap.xml` **244** indexable URLs (en/es/de/fr blog, forum, hubs, products; `/go/`, `/privacy/`, `/terms/` excluded per validator).
- **PASS** — `npm run validate` (links, canonicals, hreflang vs sitemap, robots, schema, protected media).
- **PASS** — `npm test` (57/57) including checkout middleware with current `/go/` slugs.
- **PASS** — `npm run validate:runtime` (`scripts/runtime-smoke.mjs`, local HTTP checks, no external requests).
- **PASS** — `node scripts/part15-verify.mjs` (NBA 2K27 core pages, 15 protected utility hashes, sitemap hygiene).
- **WARN** — Validator flags two large kept PNGs under `dist/images/nba-2k27/` (`cloud-dma-concept-v2.png`, `nba2k27-main-product-card.png`); retained intentionally for schema/metadata and `ResponsiveImage` srcset base paths after prune script update.

### Outstanding / backlog

- Per-article distinct artwork beyond shared panels; `src/data/faq/locale.ts` still returns English FAQ rows for es/de/fr (known gap; does not block build if validators pass).
- Run Lighthouse / Seobility / Screaming Frog when tools are available; attach evidence paths to this section.
