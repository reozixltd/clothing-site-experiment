import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { SHOES } from '../data/shoes.ts';

test('every shoe has its packshot', () => {
  for (const s of SHOES) assert.ok(existsSync(`public/shoes/${s.id}.webp`), s.id);
});
