export {
  stripEnglishLocalePrefix,
  stripPrefixedLocaleFromGo,
  hasNestedLocalePrefix,
  isPrefixedLocale,
  PREFIXED_LOCALES,
} from '../config/locale-routing.mjs';

import { DEFAULT_LOCALE, PREFIXED_LOCALES, isPrefixedLocale } from './locales';

const prefixedPattern = new RegExp(`^/(${PREFIXED_LOCALES.join('|')})(/|$)`);

export function localeFromPathname(pathname: string): typeof DEFAULT_LOCALE | (typeof PREFIXED_LOCALES)[number] {
  const match = pathname.match(prefixedPattern);
  if (match && isPrefixedLocale(match[1])) return match[1] as (typeof PREFIXED_LOCALES)[number];
  return DEFAULT_LOCALE;
}
