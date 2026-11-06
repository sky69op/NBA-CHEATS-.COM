# mw4cheat.net

Static site for [mw4cheat.net](https://mw4cheat.net): Astro 7, multilingual (en, es, de, fr), Cloudflare Workers deploy.

Conversion workflow: start with [AGENTS.md](AGENTS.md), the [architecture reference](docs/architecture.md), [example conversion intake](docs/conversion.example.json), and [follow-up defects](docs/template-defects.md). The example is documentation only; changing it does not change the website.

Every authorized new-site conversion includes the [content workflow](docs/content-workflow.md): Codex plans/writes commercial copy, articles and disclosed editorial forum starters in all four languages. The npm commands prepare/check/install the generated data; ordinary MW4 builds never generate or replace copy.

## Develop

```bash
npm ci
npm run dev
```

## Production build

`npm run build` is local-only: it never deploys or submits URLs. Run `npm run typecheck`, then build, `npm test`, `npm run validate` and `npm run validate:runtime`. See [validation coverage and clone setup](docs/validation.md) and [current pre-push review](docs/part41-report.md). IndexNow is an explicit `npm run indexnow:submit` action requiring separate authorization.

Pre-push verification also includes `npm run validate:browser` (installed Chrome required) and `npm run validate:cloudflare` (local Worker/assets runtime). Neither command deploys or follows checkout to the affiliate. Current readiness and remaining live-verification risks are in [Part 4.1](docs/part41-report.md); dependency remediation is recorded in [dependency-review.md](docs/dependency-review.md).

```bash
npm run build
npm start
```

# SEO-Team-3-Zadeyo-Template
