// node --test netlify/functions/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPaidEbookTransaction } from './ebook-download.mjs';

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
