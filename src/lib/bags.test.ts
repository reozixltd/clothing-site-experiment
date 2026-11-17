import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { BAGS } from '../data/bags.ts';

test('every bag has its packshot and its model photo', () => {
  for (const b of BAGS) {
    assert.ok(existsSync(`public/bags/${b.id}.webp`), b.id);
    assert.ok(existsSync(`public/bags/model/${b.id}.webp`), `model/${b.id}`);
  }
});
