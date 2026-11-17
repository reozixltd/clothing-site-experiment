import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addItem, cartCount, lineKey, setQty, subtotal } from './cart.ts';

const tee = { id: 'tee', name: 'Tee', price: 40 };

test('adding the same piece in the same size bumps its quantity; another size is its own line', () => {
  let c = addItem([], { ...tee, size: 'M' });
  c = addItem(c, { ...tee, size: 'M' });
  c = addItem(c, { ...tee, size: 'L' });
  assert.deepEqual(c.map((l) => [l.size, l.qty]), [['M', 2], ['L', 1]]);
  assert.equal(cartCount(c), 3);
  assert.equal(subtotal(c), 120);
});

test('a quantity of zero removes the line', () => {
  const c = addItem(addItem([], tee), { ...tee, id: 'cap', price: 30 });
  const left = setQty(c, lineKey(tee), 0);
  assert.deepEqual(left.map((l) => l.id), ['cap']);
  assert.equal(setQty(c, lineKey(tee), 4)[0].qty, 4);
});
