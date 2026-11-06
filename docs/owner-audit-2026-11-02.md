# Owner workflow and template audit

Inspected 2026-11-02, Asia/Karachi. Base revision:
`0804332615be476c070a92247a86c3ae31a7b584`.

The standing owner instructions are in `../../PROJECT_RULES.md`, loaded through
workspace and checkout `AGENTS.md`. The initial request is preparation/audit and
local template fixes; it does not identify a new game/site to convert or publish.

## Scope and evidence

All 330 tracked files were read by an automated inventory: 280 text files scanned
and 50 binary files hashed. File-by-file hashes, sizes, matching lines, blog image
usage and forum inventory are in `../../audit-evidence/template-source-inventory.json`.
This coverage does not mean every line received manual semantic review or that all
game/product claims have been established as true.

Manual review focused on the repository instructions/reports, dependencies and
commands, identity/catalog/pricing/checkout configuration, i18n/token system,
canonical/hreflang/sitemap/schema helpers, primary layouts/routes/components,
blog/forum examples, validation/content tooling, generated fallbacks, routing and
deployment handlers. Representative gameplay, menu and brand images were viewed.
Zadeyo's rendered homepage and computed visible styles were inspected as a design
reference only; none of its marketing copy or artwork was adopted.

## How this template works

- Astro 7 static output, TypeScript, Tailwind 4, Starwind UI, locked npm dependencies;
  Node >=22.12.0. Current environment runs Node 24.13.0.
- Shared components render homepage, catalog, main product, utility pages, blog,
  static forum, FAQ, about/support/legal and errors. The forum has no server-backed
  community or vote persistence; local votes do not establish real engagement.
- English URLs have no locale prefix. Spanish, German and French use `/es/`, `/de/`
  and `/fr/`. Main content has locale data files, not just translated navigation.
- Origin currently is **mw4cheat.net**, not the **mw4cheats.net** named in the prompt.
  This is an observed discrepancy, not authorization to change the current origin.
- Main product key is `elite`, public product path is `/cheats/`, and the historical
  checkout key is `wardogs`. These represent one current main product.
- Other configured products are HWID Spoofer, UGC and Skin Changer. Cloud DMA has
  no product definition, route or supplied artwork in this checkout.
- Purchase anchors use `/go/.../`; the configured target is Zadeyo's `/go/BASIT`
  with an encoded product destination and preserved `plan` query. Dev middleware,
  Node server and Worker implement 302/no-store affiliate redirects. Canonical
  changes use 301. Static-host fallback behavior has separate limitations.
- Build generates redirect/robots/fallback files and image variants, builds Astro,
  then produces one `sitemap.xml`. It does not deploy or submit IndexNow.
- A new origin requires the existing reviewed content-pack workflow; changing
  `site-url.mjs` alone cannot complete a rebrand. Private provenance remains outside
  deployed output. The old-origin policy is not public marketing content.

## Local fixes made

1. Standardized monthly terms at **30 days**. Following the owner's permanent
   correction, **HWID Spoofer is $50 monthly / $150 lifetime**; all other products
   are **$35 monthly / $150 lifetime**. Removed 31-day defaults. Updated matching product prose,
   article price paragraphs and all three translated bundles/dictionaries. No
   product capabilities were inferred from the price instruction.
2. Added `rel="sponsored"` to affiliate purchase anchors produced by the shared
   Button component and sticky mobile buy bar. Existing rel tokens are preserved.
   Ordinary internal page links are unchanged. Affiliate parameters/targets are
   unchanged until new project URLs are supplied. Google's guidance recommends
   qualifying paid links with sponsored:
   https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links
3. Saved owner rules, including confirmed UGC account-appeal meaning, variable
   product lineup, domain/keyword matching, four locales, single sitemap, original
   game-specific writing, preserved utility artwork and Zadeyo visual reference.
   Added a concise always-applied Cursor rule alongside Codex AGENTS guidance.

## Findings to address during the first conversion

### High: content facts need verification, not substitution

`src/data/blog/posts/en-articles.ts:48` and `:448` assert that Cloud DMA is necessary
for the products' full functionality, despite its absence from the catalog. This
is not verified by the repository and must not become a generic requirement on
future sites. Translations contain corresponding claims.

Main product copy includes God Mode/infinite-ammo/speedhack claims; schema hardcodes
InStock, and articles assert specific release dates and anti-cheat behavior.
`GAME.publisher` and `GAME.antiCheat` are empty. A passing code validator cannot
verify any of these business/game facts. Future copy needs current official game
sources and owner/vendor evidence for our particular product. A competitor page
is a research reference, not proof of our capabilities.

### High: old identity survives a config-only rebrand

The scan found current-master references in 57 tracked files and historical
other-game references in 13 files, including documentation/tests. Counts are
matching files, not counts of independently confirmed public defects.

Inspect all language bundles, products, FAQ, blog/forum, keyword maps, default
schema description, media config/assets, brand/manifest/favicon, robots, Wrangler
domains, redirects and generated `/go/` copy. Also inspect the pixels: menu art
actually contains MW4 branding, and gameplay art contains a BETA label. Renaming a
file does not change its content or prove compatibility with a game build.

`resolveCheckoutHref` maps historical Cloud DMA external links to the main cheat
checkout. Reusing it unchanged when adding a real Cloud DMA product risks sending
buyers to the wrong product. `public/go/wardogs/`, hardcoded MW4 fallback copy and
other-game normalizer aliases must be removed/reworked for fresh sites. Preserve
legacy mappings only for an explicitly scoped real migration.

### High: variable product lineup needs full integration

Catalog flags can disable known utility pages/cards, but the total supported
utility type union currently has only three utilities. Checkout generators still
iterate the full redirect map. Adding Cloud DMA must update types, catalog paths,
data/locales, features/facts/media, checkout keys/targets/generators, navigation,
FAQ/related guides, validation and schema. Merely relabeling Skin Changer is not a
complete change. Remove disabled-product checkout fallbacks too.

### Medium: blog artwork is repeated

There are seven article topics per locale but only three distinct hero images,
all reused gameplay/menu masters. The owner requires fresh appropriate artwork
per new article topic. Translations of one article may share that topic's image.
New game/product assets are still to be supplied; no new MW4 or future-game
artwork was fabricated during this setup.

### Medium: editorial wording and community provenance

The first English buyer guide uses unnatural `Buy Modern:` H1/meta/H2 text.
Other headings shorten the game context awkwardly. Rewrite for natural language,
distinct intent and complete keyword phrases instead of retaining these patterns.

There are 14 forum starters per locale with named Person authors, 429 declared
votes and 70 declared comments in each locale's data. Their authenticity was not
established. Do not copy these identities/counters into another site. The existing
future-content workflow already supports disclosed Organization editorial posts
with zero fabricated engagement. Forum category labels currently remain English
across locales (`getForumCategories` ignores locale); plan translated UI labels
without breaking category identity or editorial contracts.

### Medium: validation does not establish every owner requirement

The output validator is useful and reusable, but its forbidden-reference list must
be updated for every source game/domain. Its current `cloud-dma` literal does not
match every spaced Cloud DMA sentence, nor is Cloud DMA always forbidden on a
future site. Use project-specific old-identity scanning in source, asset names and
deployed output, plus manual factual/visual review. Build a real topic-to-URL map;
graph reachability alone cannot establish intent separation or content quality.

The five conversion/QA skills named in the imported AGENTS file were not found
under the installed skill roots. Current scripts and available skills were used;
do not assume the old author's machine paths exist here.

## Sitemap, languages and internal architecture

The existing build already meets the requested one-file structure: 128 canonical
indexable URLs, 32 for each language, in `dist/sitemap.xml`, with en/es/de/fr and
x-default alternates. Indexable page heads contain the same language relationships.
No separate sitemap index/chunk XML remains in dist. The default locale is English;
the language codes do not themselves specify a country.

Current priorities are homepage 1.0; blog hub 0.9; forum hub/catalog/products 0.8;
articles 0.7; threads 0.6; about/support/FAQ 0.5. Google ignores priority and
changefreq; these values do not choose regional rankings:
https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

Reciprocal language alternatives and self-referencing canonicals matter for
discovering localized equivalents:
https://developers.google.com/search/docs/specialty/international/localized-versions

The current local graph has no unreachable indexable pages from the homepage.
All configured internal target/fragment/asset checks passed. This does not prove
that keyword targeting and contextual relevance are optimal.

Removing stale copy/assets matters for relevance, accurate branding and avoiding
unhelpful duplication. An old game word/image does not automatically mean Google
flags both domains or imposes a duplicate-content penalty. Google explains that
ordinary duplication generally is not a spam-policy violation:
https://developers.google.com/search/help/crawling-index-faq

## Verification and limits

Final current-run checks after the pricing and affiliate-annotation changes:

- `npm run typecheck`: 220 files, zero errors/warnings, 19 existing hints.
- `npm run build`: successful; one sitemap, 128 URLs.
- `npm test`: 57 passed, zero failed.
- `npm run validate` (also invoked by runtime): 145 HTML documents, zero
  errors/warnings, 128 sitemap URLs.
- `npm run validate:runtime`: 380 local HTTP checks; zero external requests.
- `node ../tools/check-built-policy.mjs` from the checkout (or
  `node tools/check-built-policy.mjs` from the workspace): all 16 product/locale
  pages follow HWID $50 / other products $35 for 30 days and $150 lifetime; 20 protected utility media
  hashes match; all sitemap entries have five alternates; no unreachable indexable
  pages; zero unqualified affiliate purchase anchors (168 before the fix).
- `git diff --check`: clean. Build regenerated tracked public files; Git's
  content diff shows no substantive public-asset changes. No utility image changed.

Machine-readable additional policy evidence is
`../../audit-evidence/built-policy-check.json`. The earlier template reports
describe their author's earlier environment, not new evidence from this machine.

The local in-app browser timed out on the sandbox preview. After the preview was
started outside the sandbox, binding to its existing error tab was blocked by
the Browser Use URL policy. No local visual/mobile/browser certification is
claimed. The temporary preview processes were stopped. Local HTTP tests required
an approved retry outside the Windows sandbox and did not follow affiliate URLs.

No live Cloudflare/DNS/cache test, Search Console access, ranking measurement,
external fulfillment/plan-acceptance check, purchase, new-game conversion, commit,
push, deployment or indexing submission was performed. No claim of current
dependency vulnerability status is made from historical reports.

## Future chat handoff

Start the next chat in this workspace and ask it to read `PROJECT_RULES.md` and
this checkout's `AGENTS.md`. Provide the new game, exact domain, primary keyword,
referral URL(s), applicable products, competitor URLs and new game assets. Prices,
duration, locales, UGC meaning and palette are already recorded.

For a separate workspace, copy the owner rules and relevant reference/evidence
files and add an AGENTS pointer there. These are durable project instructions,
not account-wide memory or model retraining. Official OpenAI documentation
describes AGENTS.md as persistent repository guidance:
https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex
