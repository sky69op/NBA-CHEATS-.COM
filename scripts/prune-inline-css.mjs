import fs from 'node:fs';
import path from 'node:path';

/** Added by scripts after load; never present in the built HTML. */
const RUNTIME_CLASSES = [
  'hidden',
  'dark',
  'open',
  'is-active',
  'is-visible',
  'is-upvoted',
  'blog-card--hidden',
  'js',
  'group',
];

function unescapeClass(token) {
  return token.replace(/\\([0-9a-fA-F]{1,6} ?|.)/g, (_, hex) => {
    if (/^[0-9a-fA-F]/.test(hex.trim())) return String.fromCodePoint(parseInt(hex, 16));
    return hex;
  });
}

function classNames(selector) {
  return [...selector.matchAll(/\.((?:\\.|[^\s~>+,.:#[\](){}])+)/g)].map((match) =>
    unescapeClass(match[1]),
  );
}

function splitSelectorList(prelude) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < prelude.length; i++) {
    const ch = prelude[i];
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(prelude.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(prelude.slice(start));
  return parts;
}

/** Classes outside parentheses, so :not(.x) / :is(.a, .b) never mark a selector unused. */
function requiredClasses(selector) {
  let out = '';
  let depth = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (ch === '\\') {
      if (depth === 0) out += selector.slice(i, i + 2);
      i++;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (depth === 0) out += ch;
  }
  return classNames(out);
}

function selectorListUnused(prelude, classes) {
  return splitSelectorList(prelude).every((selector) =>
    requiredClasses(selector).some((name) => !classes.has(name)),
  );
}

function splitBlocks(css) {
  const blocks = [];
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf('{', i);
    if (at === -1) {
      if (css.slice(i).trim()) blocks.push({ prelude: css.slice(i), body: null, raw: css.slice(i) });
      break;
    }
    let depth = 0;
    let j = at;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    blocks.push({
      prelude: css.slice(i, at),
      body: css.slice(at + 1, j - 1),
      raw: css.slice(i, j),
    });
    i = j;
  }
  return blocks;
}

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function pageClasses(html) {
  const classes = new Set(RUNTIME_CLASSES);
  for (const match of html.matchAll(/class="([^"]*)"/g)) {
    for (const name of decodeEntities(match[1]).split(/\s+/)) if (name) classes.add(name);
  }
  return classes;
}

function pruneCss(css, classes) {
  let dropped = 0;
  const walk = (source) => {
    let out = '';
    for (const block of splitBlocks(source)) {
      const prelude = block.prelude.trim();
      if (block.body == null) {
        out += block.raw;
        continue;
      }
      const nested =
        prelude.startsWith('@layer') ||
        prelude.startsWith('@media') ||
        prelude.startsWith('@supports') ||
        prelude.startsWith('@container');
      if (prelude.startsWith('@') && !nested) {
        out += block.raw;
        continue;
      }
      if (nested) {
        const inner = walk(block.body);
        if (inner.trim()) out += `${block.prelude}{${inner}}`;
        else dropped += block.raw.length;
        continue;
      }
      if (selectorListUnused(prelude, classes)) dropped += block.raw.length;
      else out += block.raw;
    }
    return out;
  };
  const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return { css: walk(cssWithoutComments), dropped };
}

export function pruneHtmlCss(html) {
  const classes = pageClasses(html);
  let dropped = 0;
  const next = html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, (full, attrs, css) => {
    const result = pruneCss(css, classes);
    if (result.css.length < css.length * 0.45) return full;
    dropped += result.dropped;
    return `<style${attrs}>${result.css}</style>`;
  });
  return { html: next, dropped };
}

function htmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function pruneDist(distDir) {
  let files = 0;
  let saved = 0;
  for (const file of htmlFiles(distDir)) {
    const before = fs.readFileSync(file, 'utf8');
    if (!before.includes('<style')) continue;
    const { html, dropped } = pruneHtmlCss(before);
    if (html === before) continue;
    fs.writeFileSync(file, html);
    files += 1;
    saved += dropped;
  }
  return { files, saved };
}

if (import.meta.url === `file://${process.argv[1].replaceAll('\\', '/')}` || process.argv[1]?.endsWith('prune-inline-css.mjs')) {
  const dist = process.argv[2] || 'dist';
  const dry = process.argv.includes('--dry');
  if (dry) {
    const file = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : path.join(dist, 'product/index.html');
    const before = fs.readFileSync(file, 'utf8');
    const { html, dropped } = pruneHtmlCss(before);
    const css = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];
    console.log(JSON.stringify({ file, before: before.length, after: html.length, css: css.length, dropped }));
  } else {
    console.log(pruneDist(dist));
  }
}

export { pruneDist };
