import { resolveCheckoutHref } from '../config/checkout';
import { normalizeInternalPath } from './path';

/** Markdown `[label](path)` → internal anchor. External checkout URLs stay on `/go/…`. */
export function linkifyMarkdown(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, href: string) => {
    const normalized = normalizeInternalPath(resolveCheckoutHref(href));
    return `<a href="${normalized}">${label}</a>`;
  });
}
