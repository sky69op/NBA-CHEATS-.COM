import fs from 'node:fs';
import path from 'node:path';

/**
 * Seobility flags an internal anchor when the same text is used more than once
 * on a page. Later copies keep the same visible label and get a screen-reader
 * suffix so the anchor text is unique.
 */
function uniqueAnchorTexts(html) {
  const seen = new Set();

  return html.replace(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>)|(<a\b[^>]*>[\s\S]*?<\/a>)/gi, (full, skip) => {
    if (skip) return full;

    const openEnd = full.indexOf('>');
    const attrs = full.slice(2, openEnd);
    const hrefMatch = attrs.match(/\bhref\s*=\s*(["'])([\s\S]*?)\1/i);
    if (!hrefMatch) return full;

    const href = hrefMatch[2].trim();
    if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) || /^(?:mailto|tel|sms):/i.test(href)) return full;

    const inner = full.slice(openEnd + 1, -4);
    const text = inner
      .replace(/<[^>]+>/g, ' ')
      .replace(/&(?:amp|nbsp|#39|quot);/g, ' ')
      .replace(/&#\d+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    if (!text || !seen.has(text)) {
      if (text) seen.add(text);
      return full;
    }

    let n = 2;
    let candidate = `${text} (link ${n})`;
    while (seen.has(candidate)) {
      n += 1;
      candidate = `${text} (link ${n})`;
    }
    seen.add(candidate);
    return `${full.slice(0, -4)}<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0"> (link ${n})</span></a>`;
  });
}

function collectHtml(folder, files = []) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) collectHtml(full, files);
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function uniqueAnchorTextsOutsideChrome(html) {
  const parts = [];
  const protectedHtml = html.replace(/<(header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, (block) => {
    const id = parts.length;
    parts.push(block);
    return `<!--UAT_PROTECT_${id}-->`;
  });
  return uniqueAnchorTexts(protectedHtml).replace(/<!--UAT_PROTECT_(\d+)-->/g, (_, index) => parts[Number(index)]);
}

export function uniqueAnchorTextsInDist(outDir) {
  let files = 0;
  let suffixes = 0;
  for (const file of collectHtml(outDir)) {
    const html = fs.readFileSync(file, 'utf8');
    const next = uniqueAnchorTextsOutsideChrome(html);
    if (next === html) continue;
    suffixes += next.split('> (link ').length - 1;
    fs.writeFileSync(file, next);
    files += 1;
  }
  return { files, suffixes };
}
