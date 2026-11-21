import assert from 'node:assert/strict';
import { test } from 'node:test';
import { totals } from './checkout.ts';

const cart = [{ id: 'a', name: 'A', price: 85, qty: 1 }, { id: 'b', name: 'B', price: 42, qty: 2 }]; // 169

test('no code, express: nothing added', () => {
  assert.deepEqual(totals(cart, { shipping: 'express' }), { subtotal: 169, discount: 0, shipping: 0, total: 169 });
});

test('HALDEN10 takes 10% rounded to whole dollars; other codes do nothing', () => {
  assert.equal(totals(cart, { promo: 'halden10' }).discount, 17);
  assert.equal(totals(cart, { promo: 'NOPE' }).discount, 0);
});

test('same-day adds $18; an empty bag costs nothing', () => {
  assert.equal(totals(cart, { promo: 'HALDEN10', shipping: 'sameday' }).total, 169 - 17 + 18);
  assert.equal(totals([], { shipping: 'sameday' }).total, 0);
});
