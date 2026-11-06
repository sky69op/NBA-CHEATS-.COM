/**
 * The game this site sells cheats for. Change these values when re-using the template for another title.
 *
 * Shared copy (utility products, catalog page, legal footer) reads these through the
 * `{gameName}`, `{gameShort}`, `{gamePublisher}` and `{antiCheat}` tokens. Game-specific
 * marketing copy (homepage, cheat product page, blog, forum) still has to be rewritten per game.
 */
export const GAME = {
  name: 'NBA 2K27',
  shortName: 'NBA 2K27',
  publisher: '2K',
  antiCheat: '',
  officialUrl: 'https://nba.2k.com/2k27/',
  /** Official Steam store listing for PC (verify periodically). */
  steamStoreUrl: 'https://store.steampowered.com/app/4356430/NBA_2K27/',
} as const;

/** Display name of the main cheat product, used in menus, cards and comparison headers. */
export const CHEAT_PRODUCT_NAME = 'NBA2K27 CHEATS';
