/**
 * Delivers the purchased e-book. Paddle sells it (merchant of record) but does not deliver files, so after
 * payment the thank-you page links here with the Paddle transaction id:
 *   /api/ebook-download?txn=txn_...&format=pdf|epub&lang=en|fr|es|ar
 * One purchase gives access to every language edition.
 * The transaction is checked with the Paddle API (paid, and for the e-book's price) before the file is sent.
 * The files live in private/ebook/, which is never published (see _redirects) and is bundled with this
 * function only (netlify.toml → included_files).
 *
 * Environment (Netlify → Site configuration → Environment variables):
 *   PADDLE_API_KEY      server key (pdl_sdbx_... sandbox, pdl_live_... live)
 *   PADDLE_EBOOK_PRICE  price id of the e-book (pri_...), written to js/store-links.js by scripts/paddle-setup.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';

// File names per language, as written by private/ebook/tools/build.mjs.
export const EDITIONS = {
  en: 'Breathing-And-Relaxation-2nd-Edition-EN',
  fr: 'Respiration-et-Relaxation-2e-Edition-FR',
  es: 'Respiracion-y-Relajacion-2a-Edicion-ES',
  ar: 'Breathing-And-Relaxation-2nd-Edition-AR',
};
const FORMATS = { pdf: 'application/pdf', epub: 'application/epub+zip' };

export const resolveFile = (format = 'pdf', lang = 'en') => {
  if (!Object.hasOwn(EDITIONS, lang) || !Object.hasOwn(FORMATS, format)) return null;
  return { name: `${EDITIONS[lang]}.${format}`, type: FORMATS[format] };
};
const TXN_PATTERN = /^txn_[a-z0-9]{20,40}$/;
const PAID_STATUSES = ['paid', 'completed'];

const text = (status, message) =>
  new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function isPaidEbookTransaction(transactionId, { apiKey, priceId, fetchImpl = fetch }) {
  const api = apiKey.startsWith('pdl_live_') ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';
  const response = await fetchImpl(`${api}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`Paddle responded ${response.status}`);
  const { data } = await response.json();
  return (
    PAID_STATUSES.includes(data?.status) &&
    (data?.items || []).some((item) => (item?.price?.id || item?.price_id) === priceId)
  );
}

export default async (req) => {
  const url = new URL(req.url);
  const txn = url.searchParams.get('txn') || '';
  const file = resolveFile(url.searchParams.get('format') || 'pdf', url.searchParams.get('lang') || 'en');
  const apiKey = process.env.PADDLE_API_KEY || '';
  const priceId = process.env.PADDLE_EBOOK_PRICE || '';

  if (!apiKey || !priceId) return text(503, 'Downloads are not configured yet.');
  if (!TXN_PATTERN.test(txn) || !file) return text(400, 'Invalid download link.');

  try {
    if (!(await isPaidEbookTransaction(txn, { apiKey, priceId }))) {
      return text(403, 'This purchase could not be verified. If you just paid, wait a few seconds and try again.');
    }
  } catch (error) {
    console.error('Paddle check failed:', error.message);
    return text(502, 'The purchase could not be checked right now. Please try again in a minute.');
  }

  const body = await fs.readFile(path.join(process.cwd(), 'private', 'ebook', file.name));
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': file.type,
      'Content-Disposition': `attachment; filename="${file.name}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
};

export const config = { path: '/api/ebook-download' };
