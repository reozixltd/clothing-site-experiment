import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bundle, byGender, keepOrFirst, randomOther } from './remix.ts';

test('the per-piece prices always add up to the bundle total', () => {
  for (const prices of [[45, 120, 135, 135], [38, 95, 120, 95], [55, 190, 210, 165], [41, 33, 27, 19]]) {
    const b = bundle(prices);
    assert.equal(b.items.reduce((a, c) => a + c, 0), b.total);
    assert.equal(b.total, Math.round(b.sum * 0.9));
    assert.equal(b.save, b.sum - b.total);
    for (const [i, p] of prices.entries()) assert.ok(Math.abs(b.items[i] - p * 0.9) <= 1.5);
  }
  assert.deepEqual(bundle([100, 100, 100, 100]).items, [90, 90, 90, 90]);
});

test('gender filter keeps unisex pieces; the current pick survives if still in the pool', () => {
  const xs = [{ id: 'a', gender: 'men' as const }, { id: 'b', gender: 'women' as const }, { id: 'c', gender: 'all' as const }];
  assert.deepEqual(byGender(xs, 'men').map((x) => x.id), ['a', 'c']);
  assert.equal(byGender(xs, 'all').length, 3);
  assert.equal(keepOrFirst(byGender(xs, 'men'), 'c')?.id, 'c');
  assert.equal(keepOrFirst(byGender(xs, 'men'), 'b')?.id, 'a');
});

test('shuffle picks a different piece when it can', () => {
  const pool = [{ id: 'a' }, { id: 'b' }];
  assert.equal(randomOther(pool, 'a', () => 0.99).id, 'b');
  assert.equal(randomOther([{ id: 'a' }], 'a').id, 'a');
});
