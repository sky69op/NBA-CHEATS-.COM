# Content during daily conversions

This is the repository adapter for the installed `website-template-converter` and `technical-seo` skills. Use `website-rebranding` for native commercial-copy integration and the existing QA/readiness skills for final checks. No new skill, model API, API key, scheduled job or publishing integration is needed.

The automatic trigger is an authorized Codex task to convert a clone to a **new** game/site: root `AGENTS.md` makes this stage mandatory. Codex researches/plans/writes; npm commands prepare state, enforce contracts and install typed data. Running `npm run build` alone never requests AI copy. Setup/audits and routine maintenance of mw4cheat.net do not trigger generation.

## Commercial positioning

The master is a commercial **Modern Warfare 4 Cheats** website; that phrase is its primary English keyword. Future conversions retain the commercial game-cheats focus for the confirmed target game, with accurate localized search intent in en/es/de/fr. Preserve the main cheats product plus HWID Spoofer, UGC and Skin Changer architecture, product relationships and verified facts unless an explicit conversion request changes them.

Before approving the keyword-to-URL map, review each planned page's `readerQuestion` and `uniqueValue` for a concrete connection to cheat-product research, features, compatibility, requirements, setup/troubleshooting, selection or purchasing. Give the homepage primary cheats-query ownership and assign distinct supporting intents to the main product, utilities and editorial URLs; do not duplicate the primary keyword target across the entire inventory. Commercial intent guides topic selection without keyword stuffing or unsupported sales claims.

Blog articles and disclosed forum starters must help this audience evaluate or understand the products. General game mechanics, patches, requirements and updates are eligible only when their verified implications help those product decisions. For example, a documented platform requirement can support a compatibility guide; unrelated patch summaries, gameplay walkthroughs and entertainment topics do not qualify. The `game-questions-updates` intent bucket has this same product-relevance restriction and is not a quota for general gaming news. Reduce topic counts with a recorded shortfall when distinct, relevant topics are insufficient.

During the existing intent/editorial review, reject unrelated topics and confirm natural contextual links to the appropriate commercial product and related useful articles. Use descriptive, varied anchors and appropriate CTAs; preserve separate URL intents. This relevance review requires Codex judgment: the scripts check structural contracts and cannot establish commercial relevance from keyword strings alone. The policy does not trigger a rewrite of existing MW4 content.

## Owner's four-part execution order

The owner's 2026-11-05 clarification in the workspace/project `PROJECT_RULES.md`
and `START_HERE.md` governs new conversions. These are execution stages around the
existing pack contract, not permission to bypass it:

1. Domain-named copy and audit, then actually rewrite/integrate English commercial
   fields. Run preparation before changing origin. Ask for game images after the
   commercial text pass; competitor-dependent editorial topics are still provisional.
2. Apply supplied images, then obtain/read competitor URLs and write full original
   English articles plus editorial forum topics and publisher answers. Record completed
   bodies and source references, not just planned titles. Revise/check the plan hash
   when the supplied sources change its topics, routes or facts.
3. Clean old-game material, finalize English slugs and internal links, then translate
   all content and disclosures. Check the complete pack, switch origin and install;
   reconcile earlier native copy edits with that pack. Verify the full bodies render.
4. Preserve layout while fixing light theme, mobile and desktop performance, then
   verify on-page/technical SEO, final multilingual sitemap and actual crawl/audit results.

The baseline code below requires empty comments. The owner now requests substantive,
visibly labeled publisher/editorial answers in the existing comment presentation.
During a future authorized conversion, extend types, pack checks, rendering/schema
and focused regression coverage together. Preserve strict truthfulness, zero invented
votes, visible editorial authorship and accurate editorial-answer counts. Do not
represent written examples as real customers or bypass the all-locale content gate.
This documentation update does not implement that runtime extension in the master.

## Pack sequence and existing contract

1. Reuse the conversion audit and approved scope. Fill the existing conversion intake from supplied business facts; resolve essential unknowns. Obtain game facts from current primary sources where needed, recording URL/document reference and verification date once. Do not ask the user to supply articles or forum text. Set `approval.conversionRequested` and `contentWorkflow.enabled` for this conversion only. Source references are not permission to invent vendor claims.
2. **Before changing the origin**, run `npm run content:prepare -- --config <filled-intake.json>`. It rejects the master origin, placeholder identity, missing evidence/prices and invalid/future dates. It creates `.content/<input-hash>/brief.json`, `plan.json`, `pack.json`, and `NEXT.md`. A repeated call resumes the same run without overwriting drafts, including after the new origin is configured. Changed inputs create a new run; reuse still-valid reviewed batches consciously.
3. Write `plan.json` once. Assign a distinct primary keyword, intent ownership key and reader question/value to each URL before prose. Run `npm run content:plan -- --run <run-directory>`. Use its `planHash` in `pack.json`. Subsequent checks reject prose tied to an outdated plan. Editorial judgment must merge competing intents even if their keyword strings differ.
4. Author English in logical batches: commercial pages; 3–4 articles at a time; 4–5 forum starters at a time. Keep approved completed rows, record sources/fact IDs, and revise only failures or affected facts. Do not fill quotas with interchangeable topics. Normal targets are 8–12 articles and 10–15 starters. If fewer genuinely distinct, supportable topics exist, give a specific reason in `plan.shortfalls.blog`/`forum`; never pad. All counts refer to English topics, translated with the same slugs in each locale.
5. Finish the English factual/editorial pass, then translate the finished rows to Spanish, German and French in batches. Preserve every fact ID, plan/price, condition, limitation, date, slug and link destination. Translate complete paragraphs/headings/metadata; retain proper names/UI labels where appropriate. Do not use English fallback as a completed locale. Review flags record an actual Codex review, not a claim of independent human certification.
6. Run `npm run content:check -- --run <run-directory>`. Correct confirmed failures; do not relax checks merely to pass. Then configure the **new** site origin as part of the authorized conversion and run `npm run content:install -- --run <run-directory>`. Installation refuses the original/master origin. It checks the complete pack again, backs up the prior eight editorial data modules under `.content/backups/`, writes the four blog/four forum TS modules with existing export names/types, and writes the small approved provenance/gate file `content/manifest.json`. Reinstall refuses to overwrite detected manual editorial edits; reconcile them into the reviewed pack first.
7. Integrate commercial rows once into existing native data/components using the map below. The installer deliberately does not regex-rewrite mixed commercial source code. Preserve the current component design and shared config references. Refresh `productRelatedBlogSlugs` and `productRelatedForumSlugs` for every product. Native blog/forum hubs continue enumerating their existing typed arrays; no new routing system is introduced. Preserve/migrate valuable existing URLs if converting an established site rather than a fresh clone.
8. Run `npm run typecheck`, `npm run build`, `npm test`, `npm run validate`, and `npm run validate:runtime`. With a manifest, the build checks approved headings/paragraphs/CTAs, locale route inventories, editorial source hashes and product related-content references in final HTML. Missing translations/integration block the build. The existing validator checks rendered canonical/social metadata, sitemap, schema, hreflang, links/assets and old-template policy. Run the historical `part15-verify.mjs` only for MW4 maintenance; its fixed MW4 expectations are not conversion acceptance criteria. No deployment or indexing action is implied.

If inputs change after switching the origin, prepare the revised intake with `--from-run <prior-run-directory>` so the original master identity remains explicit. This creates a fresh input hash without deleting previous drafts; reuse still-valid copy after reviewing the changed facts. An unrelated prior run cannot authorize the target.

## Brief facts and source contract

`docs/conversion.example.json` includes the disabled workflow configuration. A real conversion supplies `contentWorkflow.publicationDate` (actual ISO date, not an inherited master date), `sources`, `gameFacts` and the current/rebranded shared forum category names. For each enabled product, `facts.evidence` contains source IDs; `features`, `requirements`, and `limitations` remain arrays of confirmed strings. Prices/durations are taken from product plans. Unknown requirements remain unknown; skip an unsupported topic or explain what buyers must confirm.

A source is `{ "id": "vendor-sheet", "kind": "vendor", "reference": "URL or supplied document reference", "verifiedOn": "YYYY-MM-DD" }`; kinds are `owner`, `vendor`, `official-game`. Each game fact is `{ "id": "game.platforms", "text": "Confirmed statement", "sourceIds": ["official-game-page"] }`. The script assigns product IDs such as `elite.features.0`, `hwid-spoofer.requirements.0`, and `elite.plan.monthly`. `game.identity` references the reserved confirmed-intake source. Do not use identity as evidence of functionality.

Reuse an unchanged, already approved utility fact sheet across clones when its claims still apply; do not repeat its research each day. Recheck unstable compatibility/status facts and keep game-specific features separate. Missing essential facts can require a short owner question; missing articles/threads never does.

Research unsupported game/version/patch details before asserting them. Questions about status may explain how to confirm status without claiming a product is currently working, undetected or safe. No invented experiences, testimonials, guarantees, reviews, ratings or comparison results. Do not clone the previous site's writing and substitute a game name. Write useful answers with varied structure; remove repetitive introductions, keyword padding and generic filler in one focused final pass.

## Plan and draft shapes

`plan.json` has `inputHash`, `pages`, and optional `shortfalls`. Each page row has:

```json
{
  "path": "/blog/descriptive-game-question/",
  "kind": "blog",
  "primaryKeyword": "specific relevant query",
  "intent": "informational",
  "intentKey": "one-distinct-reader-need",
  "readerQuestion": "The concrete question answered here",
  "uniqueValue": "What this URL adds beyond the commercial page and other articles",
  "factIds": ["game.identity"],
  "links": ["/cheats/", "/blog/another-related-topic/"]
}
```

Kinds: `commercial`, `blog`, `forum`. Intent buckets: `informational`, `research-comparison`, `commercial`, `features`, `compatibility`, `setup-troubleshooting`, `game-questions-updates`. Cover the buckets supported by facts; do not invent a news update to fill a bucket. A product page owns its purchase intent; an article should answer a different buying/setup/feature question. Compare only substantiated differences. Forum starters raise clearly editorial questions instead of duplicating an article as another SEO page.

`pack.json` contains `inputHash`, checked `planHash`, `reviews`, and `locales.en/es/de/fr`. Each locale has complete `commercial`, `blog`, `forum` arrays matching plan routes. Each row has `factIds` referencing its topic's planned facts. Reviews require `facts`, `distinctIntents`, `originalWriting` and `translations.{en,es,de,fr}` all true after review.

| Row | Fields / native adapter |
| --- | --- |
| Commercial/support/hubs | `path`, `title`, `h1`, `metaDescription`, `sections: [{heading, paragraphs: []}]`, `cta: {label, href}`, `factIds`. Include homepage, catalog, all four product pages, FAQ, support, about, blog index and forum index. Two useful sections are a structural minimum for commercial/support pages; index hubs need one existing intro section. This is not a word-count target. Hubs also get distinct keyword/intent ownership. |
| Blog | Existing `BlogPostFull` fields: `slug`, `title`, `h1`, `tag`, `desc`, `metaTitle`, `metaDescription`, `date`, `readTime`, authorized `image`/`imageAlt` and dimensions, `body`, optional `featured`; plus workflow `factIds`. Body uses existing `h2`, `h3`, `p`, `ul`, `table`, `cta` blocks. At least two H2s/three substantive paragraphs; H3 follows H2. Write as much as the answer warrants, without padding. |
| Forum | Existing `ForumPost` fields plus `authorType: "Organization"`, workflow `authorship: "editorial"` and `factIds`. `author` equals the publishing brand; `body[0]` equals the locale's disclosure in `brief.disclosures`. `age` is empty; `published` is actual ISO date; `upvotes`, `commentsCount` are zero and `comments` is empty. Use configured shared categories and existing tone values. No generated replies in this initial workflow. |

Keep metadata concise (at most 60 title characters and 155 description characters), unique within the locale and natural. Existing layout/title helpers remain in use; build verification catches commercial clipping that changes the approved text. For blogs, use varied informative titles/H1s, accurate images/alts, a relevant product link, a related article link and a contextual CTA block. Every article also needs a contextual inbound link from another article; existing hubs ensure listing discovery. Product related-content blocks must point to the new topics.

The model chooses article/forum wording. The scripts do not have a bank of publishable template articles. Initial forum topics can ask about buying considerations, differences, requirements, setup checks and how to confirm status, with varied casual phrasing, without pretending the publisher purchased or used a product. The owner now requests editorial answers for future conversions: extend the baseline contract deliberately with visible labels as described above; do not reuse real-user reply fields as fictional activity.

## Commercial integration map

| Native source | What to place / preserve |
| --- | --- |
| `src/i18n/en.ts`; `src/i18n/dictionaries/{es,de,fr}.json` | Homepage and main/utility marketing sections, catalog cards, shared navigation/support/about/FAQ UI. Keep existing dictionary structure and link helpers. |
| English `pageSeo` in `en.ts`; `src/i18n/pageSeo/{es,de,fr}.json` | Approved unique page metadata for each commercial path. |
| `src/data/products.ts` | English product facts/features/requirements/limitations, overview/body/acquisition copy and related blog/forum mappings. Preserve config keys/media selection; update from verified inputs only. |
| `src/data/products/locales/{es,de,fr}.json`; `src/data/products/exportCopy.ts` contract | Translate all corresponding long-form fields and positional arrays. Use the existing bundle shape. |
| `src/data/catalogCopy.ts`; `src/data/catalogCopy/locales/{es,de,fr}.json` | Product-selection/comparison copy and catalogue CTAs; no unsupported superiority claims. |
| `src/data/faq.ts`, `src/data/faq/locales/{es,de,fr}.json` | Useful buying/compatibility answers consistent with approved facts; preserve contextual FAQ relationships. |
| `src/data/productPricing.ts`, identity/checkout/catalog config | Conversion business inputs remain authoritative. Prose may describe confirmed values, not introduce a separate price or referral system. |

Commercial pack sections are final approved wording to place into suitable existing fields/sections; their paragraph/heading hashes must appear in built HTML. Do not add another generic rendering layer or redesign pages to avoid mapping existing fields. Build checks don't prove visual quality; run scoped browser QA when available.

## Gates, persistence and limits

`.content/` is ignored, outside src/public and contains resumable drafts/backups. `content/policy.json` records the original template origin: keep that value during rebranding. The existing master builds without activating generation, but a changed origin without a content manifest fails the build and points to this workflow. `content/manifest.json` is a small tracked provenance contract with source references, plan, review markers, editorial file hashes and expected localized text hashes/metadata; it is outside public/dist. Preserve it on converted sites. Build/source freshness checks include the policy and active manifest. Do not copy an old site's manifest into a different clone to bypass generation; its target identity is checked.

Automated checks reject incomplete locale inventories, whole English bodies and repeated long English paragraphs/descriptions, duplicate primary keywords/intent keys, duplicate metadata, unsupported price figures, invalid/future dates, invented forum authors/counters, broken planned links, missing contextual CTAs and high local prose overlap. These are checks, not proof of truth, global originality, translation fluency, search demand or semantic intent separation. The agent must review those questions against evidence once per batch. Generic `npm run validate` remains the production-output check; no generation/publishing step is hidden in a build.
