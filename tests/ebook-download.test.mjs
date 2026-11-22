// node --test tests/ebook-download.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPaidEbookTransaction, resolveFile, EDITIONS } from '../netlify/functions/ebook-download.mjs';

const PRICE = 'pri_ebook';
const fakePaddle = (status, data) => async () =>
  new Response(JSON.stringify({ data }), { status, headers: { 'Content-Type': 'application/json' } });
const check = (fetchImpl) => isPaidEbookTransaction('txn_01abcdefghijklmnopqrstuvwx', { apiKey: 'pdl_sdbx_test', priceId: PRICE, fetchImpl });

test('a paid transaction for the e-book unlocks the download', async () => {
  assert.equal(await check(fakePaddle(200, { status: 'completed', items: [{ price: { id: PRICE } }] })), true);
  assert.equal(await check(fakePaddle(200, { status: 'paid', items: [{ price_id: PRICE }] })), true);
});

test('unpaid transactions, other products and unknown ids are refused', async () => {
  assert.equal(await check(fakePaddle(200, { status: 'ready', items: [{ price: { id: PRICE } }] })), false);
  assert.equal(await check(fakePaddle(200, { status: 'completed', items: [{ price: { id: 'pri_weightmymeal' } }] })), false);
  assert.equal(await check(fakePaddle(404, null)), false);
});

test('a Paddle outage is reported, not treated as a refusal', async () => {
  await assert.rejects(check(fakePaddle(500, null)));
});

test('every language edition exists in both formats, and unknown values are refused', async () => {
  const { existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  for (const lang of Object.keys(EDITIONS)) {
    for (const format of ['pdf', 'epub']) {
      const file = resolveFile(format, lang);
      assert.ok(existsSync(join(process.cwd(), 'private', 'ebook', file.name)), `missing ${file.name}`);
    }
  }
  assert.equal(resolveFile('pdf', 'de'), null);
  assert.equal(resolveFile('docx', 'en'), null);
  assert.equal(resolveFile('pdf', '../../.env'), null);
  assert.equal(resolveFile('pdf', 'constructor'), null);
  assert.equal(resolveFile('toString', 'en'), null);
});
