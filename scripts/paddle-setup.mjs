#!/usr/bin/env node
/**
 * Creates (or finds) the e-book product and its one-time price ($4.99) in Paddle, then:
 *  - fills js/store-links.js (environment, client token, price id: public values used by the buy button);
 *  - writes PADDLE_EBOOK_PRICE into .env (also to set in Netlify for the download function).
 * Safe to run again: nothing is duplicated.
 *
 *   node scripts/paddle-setup.mjs
 *
 * Reads PADDLE_API_KEY and PADDLE_CLIENT_TOKEN from .env (never committed). Sandbox keys
 * (pdl_sdbx_..., test_...) use the test account, live keys (pdl_live_..., live_...) the real one.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');
const storeLinksPath = path.join(root, 'js', 'store-links.js');

const readEnv = () => {
  const values = {};
  if (!fs.existsSync(envPath)) return values;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return values;
};

const writeEnv = (key, value) => {
  const text = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^\\s*#?\\s*${key}\\s*=.*$`, 'm');
  fs.writeFileSync(envPath, pattern.test(text) ? text.replace(pattern, line) : `${text.replace(/\s*$/, '')}\n${line}\n`);
};

const env = { ...readEnv(), ...process.env };
const apiKey = env.PADDLE_API_KEY || '';
const clientToken = env.PADDLE_CLIENT_TOKEN || '';
if (!apiKey || !clientToken) {
  console.error('PADDLE_API_KEY and PADDLE_CLIENT_TOKEN must be set in .env');
  process.exit(1);
}
const live = apiKey.startsWith('pdl_live_');
const api = live ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';
const PRODUCT_KEY = 'ebook-breathing-relaxation';

const paddle = async (pathname, { method = 'GET', body } = {}) => {
  const response = await fetch(`${api}${pathname}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${method} ${pathname} failed (${response.status}): ${json?.error?.detail || JSON.stringify(json).slice(0, 300)}`);
  }
  return json.data;
};

const findOrCreateProduct = async () => {
  const products = await paddle('/products?status=active&per_page=200');
  const existing = products.find((p) => p.custom_data?.key === PRODUCT_KEY);
  if (existing) {
    console.log(`Product found: ${existing.id}`);
    return existing.id;
  }
  const base = {
    name: 'Breathing and Relaxation (e-book, 2nd edition)',
    description: 'E-book by Mohamed Hassan Bouazzaoui, PDF and EPUB.',
    custom_data: { key: PRODUCT_KEY },
  };
  let product;
  for (const taxCategory of ['ebooks', 'digital-goods', 'standard']) {
    try {
      product = await paddle('/products', { method: 'POST', body: { ...base, tax_category: taxCategory } });
      console.log(`Product created (${taxCategory}): ${product.id}`);
      break;
    } catch (error) {
      console.warn(`Tax category "${taxCategory}" refused: ${error.message}`);
    }
  }
  if (!product) throw new Error('Could not create the product.');
  return product.id;
};

const findOrCreatePrice = async (productId) => {
  const prices = await paddle(`/prices?product_id=${productId}&status=active&per_page=200`);
  const existing = prices.find((p) => p.custom_data?.plan === 'ebook');
  if (existing) {
    console.log(`Price found: ${existing.id}`);
    return existing.id;
  }
  // No billing_cycle: a one-time purchase.
  const price = await paddle('/prices', {
    method: 'POST',
    body: {
      product_id: productId,
      name: 'E-book',
      description: 'Breathing and Relaxation, PDF + EPUB',
      unit_price: { amount: '499', currency_code: 'USD' },
      custom_data: { plan: 'ebook' },
    },
  });
  console.log(`Price created: ${price.id}`);
  return price.id;
};

const setStoreLink = (text, key, value) =>
  text.replace(new RegExp(`(${key}:\\s*)'[^']*'`), `$1'${value}'`);

console.log(`Paddle ${live ? 'LIVE' : 'sandbox'} account`);
const priceId = await findOrCreatePrice(await findOrCreateProduct());
writeEnv('PADDLE_EBOOK_PRICE', priceId);

let storeLinks = fs.readFileSync(storeLinksPath, 'utf8');
storeLinks = setStoreLink(storeLinks, 'environment', live ? 'production' : 'sandbox');
storeLinks = setStoreLink(storeLinks, 'clientToken', clientToken);
storeLinks = setStoreLink(storeLinks, 'priceId', priceId);
fs.writeFileSync(storeLinksPath, storeLinks);
console.log('js/store-links.js updated. In Netlify, set PADDLE_API_KEY and PADDLE_EBOOK_PRICE (see .env).');
