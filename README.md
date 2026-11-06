# nbacheats.com

Static Astro 7 site (en, es, de, fr). Production output is **`dist/`** (generated; not committed). Deploy by installing dependencies and running the build on your host (for example Cloudflare Pages: **Build command** `npm run build`, **Output directory** `dist`).

## Develop

```bash
npm ci
npm run dev
```

## Production build

```bash
npm run typecheck
npm run build
```

Preview the build locally:

```bash
npm start
```

Optional QA (not required for hosting):

```bash
npm run validate
npm run validate:runtime
```

`content/policy.json` is required for template/content checks. Internal conversion notes, audits, and Part 3 translation packs are listed in `.gitignore` and stay local only.
