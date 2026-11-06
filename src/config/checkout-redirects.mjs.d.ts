export declare const CHECKOUT_URLS: {
  readonly wardogs: string;
  readonly hwidSpoofer: string;
  readonly cloudDma: string;
  readonly ugc: string;
  readonly partnerShop: string;
};

export declare const CHECKOUT_PATH_REDIRECTS: ReadonlyMap<string, string>;

export declare function resolveCheckoutPathRedirect(pathname: string): string | null;
