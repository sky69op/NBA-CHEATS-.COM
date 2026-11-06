# MW4 template architecture

Source audit and Part 4.1 verification: 2026-10-30. This describes the current repository and conversion-only workflows, not verified vendor facts. Start with root `AGENTS.md`; use `conversion.example.json` for future intake and `template-defects.md` for follow-up issues. Current evidence and residual live-verification risks are in [part41-report.md](part41-report.md).

## Framework and shared UI

Astro 7 static output (no SSR adapter), TypeScript, Tailwind 4 via Vite, Starwind UI and local public assets. `astro.config.mjs` owns site origin, i18n fallback rewrites, sitemap integration, and build hooks. `src/layouts/BaseLayout.astro` owns the HTML document, canonical/alternate/meta tags, JSON-LD insertion, fonts, shared header/footer, analytics and script loading.

| Responsibility | Source |
| --- | --- |
| Origin, brand name, support email, public product paths | `src/config/site-url.mjs`, `src/config/site.ts` |
| Game name, short name, publisher, anti-cheat, official URL, main product name | `src/config/game.ts` |
| Logo paths, version and alt | `src/config/brand.ts`; `src/components/BrandLogo.astro`, `BrandWordmark.astro` |
| Colors, global styles, theme behavior | `src/styles/global.css`, `starwind.css`, `fonts.css`; `src/config/theme.ts`; `src/scripts/theme.ts` |
| Navigation/footer/locale switch | `src/components/Header.astro`, `Footer.astro`, `LanguageSwitcher.astro` |
| Homepage | `src/pages/index.astro`; `HeroSection`, `FeaturesSection`, `ProductsSection`, `WhySetupSection`, `ContentSections` in `src/components/` |
| Product composition | `src/components/ProductDetail.astro`, `src/components/product/*` (checkout, mobile bar, features, media, cross-sells, related content) |
| Shared primitives/icons | `src/components/starwind/*`, `src/components/icons/*` |
| Client behavior | `src/scripts/site.ts`, `deferred-boot.ts`, `deferred-starwind.ts`, slider, reveal, blog-index and forum-votes scripts |

## Route ownership

| Public route | Source |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/products/` catalog | `src/pages/products/index.astro`; `src/data/catalog.ts`, `catalogCopy.ts` |
| `/cheats/` main product | `src/pages/cheats/index.astro` |
| `/hwid-spoofer/`, `/ugc/`, `/skin-changer/` | `src/pages/[utility]/index.astro` -> `src/components/product/UtilityProductPage.astro`; static paths from enabled utilities in `src/config/catalog.ts` |
| `/blog/`, `/blog/<slug>/` | `src/pages/blog/index.astro`, `[slug].astro` |
| `/forum/`, `/forum/<slug>/` | `src/pages/forum/index.astro`, `[slug].astro` |
| `/about/`, `/support/`, `/faq/`, `/privacy/`, `/terms/` | Matching `src/pages/*.astro`; shared `LegalPage.astro`, FAQ/support components |
| `/404.html`, localized error documents | `src/pages/404.astro`; status enforcement in production handlers |
| `/rss.xml` | `src/pages/rss.xml.ts`, `src/utils/rss.ts` |
| `/go/<checkout-slug>/` | Generated `public/go/*/index.html` plus server redirects; no Astro checkout page route |

`src/utils/path.ts` owns `ROUTES`, `productPath`, `blogPostPath`, trailing-slash helpers and a legacy map. `scripts/redirects.mjs` owns server path redirects. They are related maps, not one automatically synchronized source.

## Commercial products and facts

These are current configured values. Confirm them with the owner/vendor before a future conversion.

| Product | Data key | Detail / checkout | Monthly USD / duration | Lifetime USD |
| --- | --- | --- | --- | --- |
| Modern Warfare 4 Cheats | `elite` | `/cheats/` / `/go/mw4-cheats/` | 35 / 30 days | 150 |
| HWID Spoofer | `hwid-spoofer` | `/hwid-spoofer/` / `/go/hwid-spoofer/` | 50 / 30 days | 150 |
| UGC (Unban & Governance Control) | `ugc` | `/ugc/` / `/go/ugc/` | 35 / 30 days | 150 |
| Skin Changer | `skin-changer` | `/skin-changer/` / `/go/skin-changer/` | 35 / 30 days | 150 |

`src/data/productPricing.ts` defines plan types, recommended lifetime plan, formatting and `checkoutUrlWithPlan`. Its type also permits weekly/onetime, but current products expose monthly/lifetime. `src/data/catalog.ts` derives displayed prices from these plans. Product schema uses the featured plan and includes that plan in the offer URL; the current schema price is lifetime, while catalog from-price is monthly.

`src/data/products.ts` defines `ProductPage`, English descriptions, features, requirements, acquisition steps, limitations, galleries and related blog/forum slugs. Main marketing copy also comes from `src/i18n/en.ts` (`cheats` and product sections). Long-form localization is assembled using `src/data/products/exportCopy.ts` and `src/data/products/locales/{es,de,fr}.json`; catalog copy uses `src/data/catalogCopy/locales/`; FAQs use `src/data/faq.ts`, `faq/locale.ts`, `faq/locales/`.

Current utility copy specifies Windows 10/11 64-bit, HVCI/Core Isolation enabled and TPM/Secure Boot enabled. HWID additionally states administrator rights and internet for activation/updates; UGC requires internet for its appeal client; Skin Changer requires internet and loader access. UGC concerns appeals, not hardware changes or guaranteed recovery; Skin Changer describes local cosmetics, not inventory ownership. Main-product requirements currently only mention game-version/patch checks; do not infer a complete specification from utility requirements. Features and compatibility statements are content claims requiring confirmation, not facts established by this audit.

## Checkout and affiliate routing

- `src/config/checkout.ts`: `CHECKOUT_SLUGS`, visible internal paths, product-to-checkout helpers and legacy href normalization. Historical key `wardogs` means the current main product; it is not a fifth product.
- `src/config/checkout-redirects.mjs`: four external destinations, currently `https://zadeyo.com/go/BASIT?to=%2Fproducts%2F...`, plus internal path aliases. Main target ends in `mw4-cheats`; utilities use their slugs. Referral code, partner origin and encoded `to` destination must be supplied for each conversion.
- `ProductCheckoutPanel.astro` and `ProductMobileBuyBar.astro` consume plan helpers. Intended flow: `/go/mw4-cheats/?plan=monthly` -> HTTP 302 to the configured affiliate URL with `&plan=monthly`; lifetime works the same way. Preserve the encoded `to` value and existing query parameters.
- Dev middleware, Node server and Worker append checkout queries; `resolveCheckoutPathRedirect` also accepts localized checkout paths. Canonical visible links remain unprefixed. Static `_redirects` and generated noindex HTML are fallback mechanisms with host-dependent behavior (see defects).
- `scripts/generate-static-redirects.mjs` rewrites `public/_redirects`, `public/robots.txt`, and fallback checkout HTML on each full build. Edit its hardcoded MW4 fallback text during a future conversion. Do not hand-edit generated files as the sole fix.

## SEO, schema and localization

- `src/config/seo.ts`: absolute asset/canonical helpers, SEO resolution and optional analytics/social environment inputs. `src/config/pageSeo.ts` reads English `pageSeo` from `src/i18n/en.ts` and overrides in `src/i18n/pageSeo/{es,de,fr}.json`. `keywords.ts` and `pageKeywordAlt.ts` contain additional route copy.
- `src/utils/schema.ts` provides Organization, WebSite, product/offer, breadcrumb, FAQ, article, collection and discussion builders; `src/components/JsonLd.astro` serializes the page-provided data. Product offers derive prices from pricing helpers; check availability/claims against actual facts.
- `src/config/hreflang.ts` owns alternate links and indexable-path filtering. Current exclusions include `/go/`, error documents, `/en/`, RSS, privacy and terms. Legal routes explicitly use noindex. Do not infer indexing policy from robots alone.
- `src/config/sitemap.ts` enumerates translated static/product/blog/forum URLs and serializes metadata. `@astrojs/sitemap` produces the initial output; `scripts/finalize-sitemap.mjs` produces `dist/sitemap.xml` and adds `public/sitemap.xsl`. Finalization runs in an Astro hook and again in the build chain (idempotent).
- English is unprefixed; Spanish/German/French use `/es/`, `/de/`, `/fr/`. `astro.config.mjs` uses English fallback rewrites, so there are no duplicate physical locale page directories. Slugs are shared between languages.
- `src/i18n/index.ts`, `types.ts`, `locales.ts`, `paths.ts`, `routing.ts`, `localeTags.ts` handle dictionary selection, path localization and language tags. `src/config/locale-routing.mjs` shares normalization with Node/Worker, including `/en/` removal, nested-locale rejection and forum query normalization.
- `src/i18n/dictionaries/{es,de,fr}.json` are UI translations. `brandTokens.ts` interpolates `{siteDomain}`, `{siteName}`, `{siteUrl}`, `{supportEmail}`, `{gameName}`, `{gameShort}`, `{gamePublisher}`, `{antiCheat}`, `{cheatProduct}`. `{game}` is reserved for the footer trademark link. Tokens do not rewrite embedded game-specific prose automatically.

## Blog and forum

Blog posts are typed TS data, not Markdown collections: `src/data/blog/types.ts`, `blog/posts/{en,es,de,fr}-articles.ts`, `blog/posts.ts`, `blog/locale.ts`, and facade `src/data/blog.ts`. Listing, article routes, sidebar, related guides and RSS consume this data. English slugs drive static enumeration and sitemap URLs; retain parity across locales.

Forum data is also static: `src/data/forum/types.ts`, `forum/{en,es,de,fr}-posts.ts`, facade `src/data/forum.ts`, and locale adapter `forum/locale.ts`. Categories originate in the English facade; the page maps translated labels. `src/scripts/forum-votes.ts` stores votes in localStorage. There is no durable posting/authentication backend in this architecture. `category`, `sort`, `page` query filters on forum indexes redirect to the clean listing; preserve unrelated query parameters.

## Conversion-only content generation

Commercial scope: the master prioritizes **Modern Warfare 4 Cheats** search intent. Future sites retain the corresponding target-game cheats positioning and existing four-product composition. General game topics must support product understanding or buying decisions. AGENTS and the content workflow define the relevance review; this clarification does not change current pages or their content.

Root instructions require Codex to run the [content workflow](content-workflow.md) during each authorized new-site conversion, coordinated by the installed converter and technical SEO skills. The user supplies business facts, not article/thread drafts. Codex plans keyword/URL ownership once and writes commercial copy, normally 8–12 articles and 10–15 clearly editorial discussion starters, then completes en/es/de/fr. Unsupported quotas require a recorded shortfall rather than thin pages.

`scripts/content-workflow.mjs` implements `npm run content:prepare`, `content:plan`, `content:check`, and `content:install`. Preparation uses the filled intake's `contentWorkflow` section before the origin changes. It refuses the current master domain, creates resumable ignored `.content/<input-hash>/` drafts and checks evidence/date inputs. Checked plans are hashed; changed plans invalidate draft approval. The model writes original copy; these commands never invoke a remote AI API or publish canned articles.

The checked installer works only after the new origin is configured. It backs up and writes the existing four blog/four forum TS modules, keeping their types/exports and route components. Commercial pack sections are mapped into the existing dictionaries, product/copy bundles and page SEO by Codex using the workflow's source map; there is no new page-rendering layer. New forum rows use `authorType: 'Organization'`, a localized editorial disclosure and zero fabricated activity. The optional author type defaults to Person for legacy MW4 records, preserving current rendered metadata.

`content/policy.json` retains the original template origin. The master builds without a manifest; changing the origin without completing the content workflow fails the build. `content/manifest.json` holds approved provenance, plan/review records, editorial file hashes and expected localized text hashes/metadata. It is outside public/dist and is absent from the MW4 master. The Astro completion hook calls `verifyIntegratedContent` after rendering, before writing the validation manifest; when activated it rejects missing approved copy, fallback translations, missing links/routes, stale product related-content mappings and incorrect editorial author schema. Source fingerprints include the policy and active manifest. Current MW4 content stays unchanged. Builds do not generate copy or submit URLs.

## Images and generated output

`public/images/gameplay/` contains current MW4 masters. `src/config/gameplayMedia.ts` selects homepage/product gallery keys and default OG image; gallery records in `src/data/products.ts` carry dimensions/captions. `scripts/optimize-images.mjs` uses Sharp to create gameplay WebP widths 400/512/640/800/960. `src/utils/responsiveImage.ts` and `src/components/ResponsiveImage.astro` construct responsive URLs; requested variants must exist. Hero preload and slider sources must agree.

Protected supplied media lives in `public/images/hwid-spoofer/`, `public/images/ugc/`, `public/images/skin-changer/`, including 400/640/800/960 variants. `src/config/hwidMedia.ts` selects the two HWID panels. `src/config/protected-media.json` holds hashes for 20 utility files, enforced by the reusable validator; the historical `scripts/part15-verify.mjs` retains its MW4 checks. Preserve these unless the task authorizes replacement. Brand assets in `public/images/brand/` are excluded from routine optimization; `npm run brand:assets -- <source-path>` intentionally regenerates logos and favicon outputs. Update `brand.ts` version and inspect `public/site.webmanifest` icon references separately.

`scripts/prune-dist-images.mjs` deletes the brand master WebP and PNGs >=80KB under `dist/images`; it does not delete public source files. Verify all rendered references survive. Astro hooks patch deferred loader URLs/hashes and prune inline CSS. The artificial repeated-anchor suffix transformation is disabled; `scripts/unique-anchor-texts.mjs` remains an unused legacy utility. Inspect final output when debugging rather than assuming it equals source markup.

## Commands, environment and Cloudflare

Use Node >=22.12.0 and npm with the committed lockfile. `npm ci` installs dependencies; `npm run dev` runs Astro; `npm run test:local-hosts` tests local hostname handling. `npm run typecheck` runs `astro check` using `@astrojs/check`; `tsconfig.json` excludes ignored conversion drafts and dependencies. No lint script is configured. `npm test` runs the Node test suite, including validator defect fixtures, commerce, development middleware, locale keys, routing and brand-generation tests. `node scripts/part15-verify.mjs` is a historical MW4-specific built-output/hash regression check, not universal QA.

Full build sequence: image optimization -> static redirects/robots/checkout generation -> `astro build` with hooks -> dist image pruning -> sitemap finalization. No deployment or indexing request occurs.

Run `npm run typecheck`, `npm run build`, `npm test`, `npm run validate`, then `npm run validate:runtime`. The validator uses `.astro/validation-config.json` generated from the site configuration and rejects output built from different source/assets, including TypeScript configuration. Its policy is `src/config/validation.ts`; see [validation.md](validation.md).

Pre-push commands also include `npm run validate:browser` (pinned playwright-core, separately installed Chrome) and `npm run validate:cloudflare` (pinned Wrangler/workerd). Their isolated local server helper is `scripts/qa-server.mjs`; evidence stays in `.astro/`. The browser suite exercises first-tap mobile navigation, product plans and intercepted purchase clicks at 1440/768/390 pixels in all locales. The Cloudflare suite uses the actual `wrangler.toml`/ASSETS binding, including its ordinary build hook, but only in local mode with remote bindings and telemetry disabled. `.wrangler/` state and `.dev.vars*` are ignored. Neither command deploys.

Deferred interaction loading in `src/scripts/site.ts` uses dynamic import so its promise waits for `deferred-boot.ts` top-level async setup before replaying the first tap. Worker assets must be requested by public page URL: Cloudflare's `auto-trailing-slash` binding resolves HTML and redirects physical `/index.html` paths. The flat error asset is fetched using the binding's `/404` URL and returned with a real 404/noindex status; the public English error-document canonical remains `/404.html`.

IndexNow is separate: `npm run indexnow:submit` first validates the build, then calls `scripts/indexnow.mjs`. It reads process env directly and, with a key, writes a key file in `dist` and POSTs sitemap URLs to IndexNow. This command is never part of ordinary validation; it requires explicit task authorization. It was not run in Parts 1 or 2.

| Environment name | Phase / use |
| --- | --- |
| `PUBLIC_SITE_NAME` | Astro build/dev; optional display-name override |
| `PUBLIC_GA_MEASUREMENT_ID` | Astro build/dev; optional analytics script in rendered pages |
| `PUBLIC_TWITTER_SITE`, `PUBLIC_TWITTER_CREATOR` | Astro build/dev; optional social metadata |
| `PUBLIC_ORG_SAME_AS` | Astro build/dev; comma-separated Organization profile URLs |
| `INDEXNOW_KEY`, `INDEXNOW_HOST` | Explicit IndexNow command only; submission credential and optional host override; ordinary build does not read these for submission |
| `PORT`, `ENABLE_CANONICAL_REDIRECT` | Node server runtime; default 4173; canonical host redirect opt-in (`1`, `true`, `yes`) |
| `ASSETS` | Worker binding, not an Astro environment variable; configured by Wrangler |

Do not copy secret values into docs/configs. Public Astro environment inputs are included in the built site. No required external database or payment credentials were found for the static build. `nixpacks.toml` also sets `HOST`, but `serve.mjs` does not read it.

`npm start` runs `scripts/serve.mjs` against `dist`, including redirects, status handling, headers and compression. `npm run preview` runs Astro preview on all interfaces; use the Node server for local redirect checks. `scripts/local-preview-host.mjs` exempts local hosts from production canonical redirects.

Primary Cloudflare target: `wrangler.toml` -> `workers/site.js`, worker name `mw4cheat-net`, apex/www custom domains, `ASSETS` binding to `dist`, `run_worker_first = true`, 404 handling and automatic trailing slashes. The Worker enforces canonical host/HTTPS, redirects, errors, security headers and document caching. `public/_headers` supplies static asset/header policies. `functions/_middleware.js` and `public/_routes.json` are separate Cloudflare Pages artifacts; they are not the Worker runtime. `nixpacks.toml` is an alternative Node hosting recipe.

`npx wrangler deploy` performs an actual deployment and runs `[build].command = "npm run build"`; never execute it just to validate. A domain conversion must update Wrangler name/routes locally along with origin, manifest, SEO and affiliate destinations. No deployment, DNS change, push, commit or indexing action is part of this setup.
