import { existsSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextJob, queuePick, outfitSrc, outfitKey, parseSwapStream, pieceSrc } from './headswap.ts';
import { FIT_MODELS } from '../data/fitting.ts';
import { RACK } from '../data/rack.ts';

test('outfitSrc and outfitKey', () => {
  assert.equal(outfitSrc('him', 'rust-coach-jacket', 'grey-utility-cargo'), '/fitting/him/rust-coach-jacket__grey-utility-cargo.webp');
  assert.notEqual(outfitKey('him', 'a', 'b'), outfitKey('her', 'a', 'b'));
});

test('complete event gives the second image', () => {
  const t = 'event: heartbeat\ndata: null\n\nevent: complete\ndata: [[{"url":"https://x/in.png"},{"url":"https://x/out.png"}], 42]\n\n';
  assert.deepEqual(parseSwapStream(t), { ok: true, url: 'https://x/out.png' });
});

test('error event and junk', () => {
  assert.equal(parseSwapStream('event: error\ndata: {"error":"Value: 1024 is not in the list"}\n\n')?.ok, false);
  assert.equal(parseSwapStream('event: error\ndata: null\n\n')?.ok, false);
  assert.equal(parseSwapStream('event: complete\ndata: not json\n\n')?.ok, false);
  assert.equal(parseSwapStream('event: heartbeat\ndata: null\n\n'), null);
});

// Seven a row, so the loop always has pieces off stage and never shows its whole length at once.
test('every model has 7 new tops and 7 bottoms, each with a cutout and every outfit photo', () => {
  for (const m of FIT_MODELS) {
    assert.equal(m.tops.length, 7);
    assert.equal(m.bottoms.length, 7);
    for (const t of m.tops) assert.ok(!RACK.some((p) => p.id === t.id));
    for (const p of m.tops) assert.ok(existsSync(`public${pieceSrc('tops', p.id)}`), p.id);
    for (const p of m.bottoms) assert.ok(existsSync(`public${pieceSrc('bottoms', p.id)}`), p.id);
    for (const t of m.tops)
      for (const b of m.bottoms) assert.ok(existsSync(`public${outfitSrc(m.id, t.id, b.id)}`), `${m.id} ${t.id}__${b.id}`);
  }
  assert.equal(pieceSrc('tops', 'x'), '/fitting/tops/x.webp');
});

test('queue keeps only the latest pick', () => {
  assert.deepEqual(nextJob(null, null, 'a', new Set()), { start: 'a', queued: null });
  assert.deepEqual(nextJob('a', null, 'b', new Set()), { start: null, queued: 'b' });
  assert.deepEqual(nextJob('a', 'b', 'c', new Set()), { start: null, queued: 'c' });
  assert.deepEqual(nextJob(null, null, 'a', new Set(['a'])), { start: null, queued: null });
  assert.deepEqual(nextJob('a', 'b', 'a', new Set()), { start: null, queued: null });
});

test('no swap is queued while the visitor is looking at the model', () => {
  const idle = { running: null, queued: null };
  assert.deepEqual(queuePick(idle, 'a', new Set(), false), idle);
  assert.deepEqual(queuePick(idle, 'a', new Set(), true), { running: 'a', queued: null });
  assert.deepEqual(queuePick({ running: 'a', queued: null }, 'b', new Set(), true), { running: 'a', queued: 'b' });
});
