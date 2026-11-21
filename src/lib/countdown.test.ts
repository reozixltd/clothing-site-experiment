import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextDrop, parts } from './countdown.ts';

test('nextDrop is always a Friday 18:00 within the next week', () => {
  for (let day = 1; day <= 14; day++) {
    for (const hour of [0, 12, 17, 18, 23]) {
      const now = new Date(2026, 10, day, hour, 0, 0);
      const d = nextDrop(now);
      assert.equal(d.getDay(), 5);
      assert.equal(d.getHours(), 18);
      assert.ok(d > now);
      assert.ok(d.getTime() - now.getTime() <= 7 * 86400000 + 3600000);
    }
  }
});

test('Friday 17:00 drops today, Friday 18:00 sharp waits a week', () => {
  assert.equal(nextDrop(new Date(2026, 10, 20, 17)).getDate(), 20);
  assert.equal(nextDrop(new Date(2026, 10, 20, 18)).getDate(), 27);
});

test('parts splits and clamps', () => {
  assert.deepEqual(parts(3 * 86400000 + 14 * 3600000 + 26 * 60000 + 41000), { days: 3, hours: 14, minutes: 26, seconds: 41 });
  assert.deepEqual(parts(-5), { days: 0, hours: 0, minutes: 0, seconds: 0 });
});
