import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { customSitemapPageUrls, sitemapSerialize } from './src/config/sitemap.ts';
import { pruneDist } from './scripts/prune-inline-css.mjs';
import { SITE_URL } from './src/config/site-url.mjs';
import { finalizeSitemap } from './scripts/finalize-sitemap.mjs';
import { validationConfig } from './src/config/validation.ts';
import { sourceFingerprint } from './scripts/source-fingerprint.mjs';
import { verifyIntegratedContent } from './scripts/content-workflow.mjs';
import { getCatalog } from './src/data/catalog.ts';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function deferredBootUrlIntegration() {
  const marker = '__DEFERRED_BOOT_URL__';
  return {
    name: 'deferred-boot-url',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const outDir = fileURLToPath(dir);
        const astroDir = path.join(outDir, '_astro');
        const bootName = fs
          .readdirSync(astroDir)
          .find((name) => name.startsWith('deferred-boot.') && name.endsWith('.js'));
        if (!bootName) return;
        const url = `/_astro/${bootName}`;

        const textFiles = [];
        const collect = (folder) => {
          for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
            const full = path.join(folder, entry.name);
            if (entry.isDirectory()) collect(full);
            else if (entry.name.endsWith('.html') || entry.name.endsWith('.js')) textFiles.push(full);
          }
        };
        collect(outDir);

        for (const file of textFiles) {
          if (!file.endsWith('.html')) continue;
          const html = fs.readFileSync(file, 'utf8');
          if (html.includes(marker)) fs.writeFileSync(file, html.replaceAll(marker, url));
        }

        // The boot URL is written into loader chunks after Vite has hashed their names, so a loader's
        // file name would not change when only the boot chunk does. `/_astro/*` is cached as immutable,
        // so re-hash those loaders from their final contents and point every reference at the new name.
        for (const name of fs.readdirSync(astroDir)) {
          if (!name.endsWith('.js') || name === bootName) continue;
          const full = path.join(astroDir, name);
          const code = fs.readFileSync(full, 'utf8');
          if (!code.includes(url)) continue;
          const hash = crypto.createHash('sha256').update(code).digest('base64url').slice(0, 8);
          const renamed = name.replace(/\.[\w-]+\.js$/, `.${hash}.js`);
          if (renamed === name) continue;
          const renamedFull = path.join(astroDir, renamed);
          fs.renameSync(full, renamedFull);
          textFiles[textFiles.indexOf(full)] = renamedFull;
          for (const file of textFiles) {
            const text = fs.readFileSync(file, 'utf8');
            if (text.includes(name)) fs.writeFileSync(file, text.replaceAll(name, renamed));
          }
        }
      },
    },
  };
}

function pruneInlineCssIntegration() {
  return {
    name: 'prune-inline-css',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const result = pruneDist(fileURLToPath(dir));
        console.log(
          `[prune-inline-css] removed unused rules from ${result.files} pages (${result.saved} bytes)`,
        );
      },
    },
  };
}

function finalizeSitemapIntegration() {
  return {
    name: 'finalize-sitemap',
    hooks: {
      'astro:build:done': ({ dir }) => {
        finalizeSitemap(fileURLToPath(dir));
        const contentResult = verifyIntegratedContent(projectRoot, fileURLToPath(dir), SITE_URL, getCatalog('en').map((entry) => entry.page));
        if (contentResult.active) console.log(`[content] verified ${contentResult.pages} approved localized pages`);
        // Local audit input derived from the same source data as pages. Never deployed to dist.
        fs.mkdirSync(path.join(projectRoot, '.astro'), { recursive: true });
        fs.writeFileSync(path.join(projectRoot, '.astro/validation-config.json'), JSON.stringify({ ...validationConfig(), sourceFingerprint: sourceFingerprint(projectRoot) }, null, 2));
      },
    },
  };
}

function deferredBootPlugin() {
  const marker = '__DEFERRED_BOOT_URL__';
  let refId = '';
  return {
    name: 'deferred-boot-entry',
    apply: 'build',
    buildStart() {
      refId = this.emitFile({
        type: 'chunk',
        id: path.join(projectRoot, 'src/scripts/deferred-boot.ts'),
        name: 'deferred-boot',
      });
    },
    generateBundle(_options, bundle) {
      if (!refId) return;
      const fileName = this.getFileName(refId).replaceAll('\\', '/');
      const url = fileName.startsWith('/') ? fileName : `/${fileName}`;
      for (const item of Object.values(bundle)) {
        if (item.type === 'chunk' && item.code.includes(marker)) {
          item.code = item.code.replaceAll(marker, url);
        }
      }
    },
  };
}

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  i18n: {
    locales: ['en', 'es', 'de', 'fr'],
    defaultLocale: 'en',
    fallback: {
      es: 'en',
      de: 'en',
      fr: 'en',
    },
    routing: {
      prefixDefaultLocale: false,
      fallbackType: 'rewrite',
    },
  },
  // Path redirects: `src/middleware.ts` (dev) + `scripts/redirects.mjs` (`npm start`).
  // Do not use `redirects` here — Astro serves a static HTML stub that does not 301 in dev.
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [
    deferredBootUrlIntegration(),
    pruneInlineCssIntegration(),
    sitemap({
      customPages: customSitemapPageUrls(),
      filter: (page) => {
        if (page.includes('/404') || page.includes('/go/')) return false;
        if (/\/(es|de|fr)\/404\//.test(page)) return false;
        if (page.includes('/en/') || page.endsWith('/en')) return false;
        if (/\/(es|de|fr)\/go\//.test(page)) return false;
        return true;
      },
      serialize: sitemapSerialize,
    }),
    finalizeSitemapIntegration(),
  ],
  vite: {
    plugins: [deferredBootPlugin(), tailwindcss()],
    build: {
      cssMinify: true,
      minify: 'esbuild',
      target: 'es2022',
      assetsInlineLimit: 8192,
      modulePreload: { polyfill: false },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/embla-carousel') ||
              id.includes('@starwind-ui/runtime/carousel')
            ) {
              return 'carousel';
            }
            if (id.includes('@starwind-ui/runtime/drawer')) return 'drawer';
            if (id.includes('@starwind-ui/runtime/accordion')) return 'accordion';
          },
        },
      },
    },
  },
  build: {
    /** Keep CSS external so HTML stays small for crawlers; prune-inline-css still trims inlined critical chunks. */
    inlineStylesheets: 'auto',
  },
});
