import assert from 'node:assert/strict';
import { test } from 'node:test';
import { didWrap, mod, slotOf } from './carousel.ts';

const slots = (active: number, dir: 1 | -1, count = 6) =>
  Array.from({ length: count }, (_, i) => slotOf(i, active, dir, count));

test('mod stays positive', () => {
  assert.equal(mod(-1, 6), 5);
  assert.equal(mod(6, 6), 0);
});

test('active look is always slot 0 and every slot is unique', () => {
  for (const dir of [1, -1] as const) {
    for (let active = 0; active < 6; active++) {
      const s = slots(active, dir);
      assert.equal(s[active], 0);
      assert.equal(new Set(s).size, 6);
    }
  }
});

test('the spare look parks on the exit side', () => {
  assert.deepEqual(slots(0, 1), [0, 1, 2, -3, -2, -1]);
  assert.deepEqual(slots(0, -1), [0, 1, 2, 3, -2, -1]);
});

test('one step forward moves every look one slot left, except a single wrap', () => {
  const before = slots(0, 1);
  const after = slots(1, 1);
  const wrapped = before.filter((from, i) => didWrap(from, after[i], 1));
  assert.equal(wrapped.length, 1);
  before.forEach((from, i) => {
    if (!didWrap(from, after[i], 1)) assert.equal(after[i], from - 1);
  });
});

test('reversing direction never wraps a look', () => {
  const before = slots(1, 1); // just moved forward
  const after = slots(0, -1); // now step back
  before.forEach((from, i) => assert.equal(didWrap(from, after[i], -1), false));
});

test('jumping two looks ahead slides the on-stage looks instead of wrapping them', () => {
  const before = slots(0, 1);
  const after = slots(2, 1);
  [0, 1, 2].forEach((i) => assert.equal(didWrap(before[i], after[i], 1), false));
});
