import { test } from 'node:test';
import assert from 'node:assert/strict';
import { outfitSrc, outfitKey, parseSwapStream, pieceSrc } from './headswap.ts';
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

test('every model has 4 new tops and 4 bottoms', () => {
  for (const m of FIT_MODELS) {
    assert.equal(m.tops.length, 4);
    assert.equal(m.bottoms.length, 4);
    for (const t of m.tops) assert.ok(!RACK.some((p) => p.id === t.id));
  }
  assert.equal(pieceSrc('tops', 'x'), '/fitting/tops/x.webp');
});
