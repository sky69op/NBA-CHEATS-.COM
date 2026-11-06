/**
 * Hostnames that must never 301 to SITE_DOMAIN.
 * Local npm start, wrangler, Pages previews, and tunnels all hit this list.
 */

const PREVIEW_SUFFIXES = [
  '.localhost',
  '.local',
  '.pages.dev',
  '.workers.dev',
  '.trycloudflare.com',
  '.ngrok.io',
  '.ngrok-free.app',
  '.loca.lt',
];

export function parseHostname(raw) {
  let value = String(raw ?? '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');
  if (!value) return '';

  if (value.startsWith('[')) {
    const end = value.indexOf(']');
    if (end !== -1) return value.slice(1, end).replace(/\.$/, '');
  }

  const colonCount = (value.match(/:/g) || []).length;
  if (colonCount === 1) return value.split(':')[0];
  return value;
}

function isPrivateIpv4(host) {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return false;
  const parts = host.split('.').map(Number);
  if (parts.some((n) => n > 255)) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

export function isLocalPreviewHost(host) {
  const hostname = parseHostname(host);
  if (!hostname) return false;
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '::' ||
    hostname === '::ffff:127.0.0.1'
  ) {
    return true;
  }
  if (hostname.startsWith('::ffff:') && isPrivateIpv4(hostname.slice(7))) return true;
  if (PREVIEW_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) return true;
  return isPrivateIpv4(hostname);
}
