import { defineMiddleware } from 'astro:middleware';
import { resolveCheckoutPathRedirect } from './config/checkout-redirects.mjs';
import { resolveForumQueryRedirect, resolveLocaleRoutingRedirect } from './config/locale-routing.mjs';
import { resolvePathRedirect } from '../scripts/redirects.mjs';

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const { pathname, search, hash } = url;

  const checkoutTarget = resolveCheckoutPathRedirect(pathname);
  if (checkoutTarget) {
    const destination = checkoutTarget.includes('?')
      ? `${checkoutTarget}${search.replace('?', '&')}`
      : `${checkoutTarget}${search}`;
    return new Response(null, {
      status: 302,
      headers: { Location: destination, 'X-Robots-Tag': 'noindex, follow', 'Cache-Control': 'no-store' },
    });
  }

  const forumQuery = resolveForumQueryRedirect(pathname, search);
  if (forumQuery) {
    return context.redirect(`${forumQuery}${hash}`, 301);
  }

  const localeRoute = resolveLocaleRoutingRedirect(pathname);
  if (localeRoute?.status === 301) {
    return context.redirect(`${localeRoute.location}${search}${hash}`, 301);
  }
  if (localeRoute?.status === 404) {
    return new Response('Not Found', { status: 404, statusText: 'Not Found' });
  }

  const pathRedirect = resolvePathRedirect(pathname);
  if (pathRedirect && pathRedirect !== pathname) {
    return context.redirect(`${pathRedirect}${search}${hash}`, 301);
  }

  return next();
});
