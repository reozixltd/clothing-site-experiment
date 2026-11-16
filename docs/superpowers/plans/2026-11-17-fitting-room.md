# Fitting Room + "Try it on me" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `#fitting` section where visitors dress a photoreal man or woman in new tops and bottoms made for it, and can swap their own head onto the model with a free Hugging Face head-swap Space.

**Architecture:** Pre-made Flow photos, one per model × top × bottom, are swapped by a React component. "Try it on me" sends the visitor's photo and the current outfit photo to `hugging-apps/bfs-best-face-swap` with plain `fetch`, and caches one result per outfit in memory. Pure helpers (image paths, event-stream parsing) live in `src/lib/headswap.ts` with a node test.

**Tech Stack:** Vite, React 19, TypeScript, plain CSS, `node --test`, Python + Pillow for asset prep, Google Flow (Nano Banana, 0 credits).

**Spec:** `docs/superpowers/specs/2026-11-17-fitting-room-design.md`

## Global Constraints

- $0 running cost: no paid API, no backend, no new npm dependency.
- Plain CSS with `tokens.css`; no animation library; `prefers-reduced-motion` turns off cross-fade and shimmer.
- Visitor photo: images only, max 15 MB, EXIF-rotated, downscaled to 1024 px long side, JPEG; kept only in memory (object URLs revoked on remove), never `localStorage`.
- Consent copy (exact): "Your photo is sent to a free AI service on Hugging Face (a community-run third-party service, which may keep it) to make the preview. This site does not keep it."
- Busy copy (exact): "The free try-on service is busy. Try again in a minute."
- Progress copy (exact): "Putting you in this outfit… ~30 s"
- Space call: `[face, outfit, 'Turbo · Viggle 6-step', 1024, 6, 1, 42, false, <Space default prompt>]`; result = the **second** image of the `complete` data; timeout 120 s.
- One swap at a time; no background pre-swapping.
- Phones: ≤ 767 px.

## Review Focus

1. Picking several outfits quickly while a swap runs → only the latest pick is queued; the running result lands in the cache; no stale result is shown for the wrong outfit. (Task 4 test: `queue keeps only the latest pick`.)
2. Space returns an `error` event, a non-JSON body, or never completes → the busy message shows and the model photo stays. (Task 2 tests on `parseSwapStream`; Task 4 timeout.)
3. Switching him ↔ her after "Try it on me" → the cache is per model + outfit; her outfits never show his swap. (Task 2 test: `outfitKey differs per model`.)
4. Keyboard: arrow keys and Escape inside the drawer must not move the Runway. (Task 3 capture-phase guard, checked in the browser.)
5. Phone photo sideways (EXIF) or a huge HEIC → rotated correctly or rejected with a clear message. (Task 4 `prepareFace` check in the browser.)

---

### Task 1: Flow images (gate first)

**Files:**
- Create: `flow/fitting/<model>/<top>__<bottom>.jpg` (Flow originals), `flow/fitting/bottoms/<id>.jpg`
- Create: `flow/fitting.py` (prep script)
- Create: `public/fitting/<model>/<top>__<bottom>.webp`, `public/fitting/bottoms/<id>.webp`, `public/fitting/tops/<id>.webp`

**Garments (all new, none from the Rail; fixed here so the data and the images agree):**

| model | tops (id, name, price) | bottoms (id, name, price) |
|---|---|---|
| him | `sage-linen-overshirt` Sage Linen Overshirt 120 · `indigo-chore-coat` Indigo Chore Coat 175 · `charcoal-merino-crew` Charcoal Merino Crew 110 · `cream-cable-knit` Cream Cable Knit 135 | `grey-utility-cargo` Grey Utility Cargo 135 · `stone-pleated-trouser` Stone Pleated Trouser 150 · `black-straight-jean` Black Straight Jean 140 · `ecru-carpenter-pant` Ecru Carpenter Pant 130 |
| her | `ivory-silk-shirt` Ivory Silk Shirt 125 · `black-cropped-blazer` Black Cropped Blazer 190 · `terracotta-rib-cardigan` Terracotta Rib Cardigan 115 · `oatmeal-funnel-knit` Oatmeal Funnel Knit 140 | `cream-wide-trouser` Cream Wide-Leg Trouser 145 · `black-midi-skirt` Black Midi Skirt 120 · `indigo-wide-jean` Indigo Wide Jean 150 · `camel-pleated-trouser` Camel Pleated Trouser 155 |

- [ ] **Step 0:** 16 packshots in Flow: ghost-mannequin front view, solid magenta `#FF00FF` backdrop, no hanger, centred. Save to `flow/fitting/tops/<id>.jpg` and `flow/fitting/bottoms/<id>.jpg`.
- [ ] **Step 1:** In Flow (Nano Banana 2.1, 9:16, Agent off, see memory notes) make the **him** base photo: full-length studio photo of a man, front-facing, arms relaxed at sides, white sneakers, plain light grey seamless backdrop, wearing `sage-linen-overshirt` + `grey-utility-cargo` (both packshots attached). No text or logos.
- [ ] **Step 2:** Make 2 edits from the base: attach base + the `indigo-chore-coat` packshot, "the exact same person, pose, framing, lighting and backdrop; change only the top to the attached one"; same for trousers → `stone-pleated-trouser` packshot.
- [ ] **Step 3: Gate.** Overlay the 3 (difference blend). Pass = person within ~1% of image size, backdrop tone even. View one at section size against `--bg`. If it fails, show the user before making more.
- [ ] **Step 4:** Make the remaining 13 him + 16 her combinations the same way (her base: woman, flat shoes, `ivory-silk-shirt` + `cream-wide-trouser`). Save originals as in Files.
- [ ] **Step 5:** Write `flow/fitting.py`: outfits → 768 × 1376 WebP q86 (crop/scale to 9:16, no cutout); tops and bottoms → `cutout()` imported from `flow/cutout.py`, trimmed to content, centred on a transparent 800 × 1000 canvas. Print the sampled backdrop colour (median of the 40 px top corners) of `him` and `her` base photos.
- [ ] **Step 6:** Run `python flow/fitting.py`; expect 32 + 16 WebPs and two hex colours. Check 3 random ones by eye.
- [ ] **Step 7: Commit** `git add flow/fitting flow/fitting.py public/fitting && git commit -m "Add Flow images for the fitting room"`

### Task 2: Data and pure helpers

**Files:**
- Create: `src/data/fitting.ts`, `src/lib/headswap.ts`, `src/lib/headswap.test.ts`
- Modify: `package.json` (`"test": "node --test src/lib/*.test.ts"`)

**Interfaces:**
- Produces (`src/data/fitting.ts`):
  - `interface Piece { id: string; name: string; price: number }`
  - `interface FitModel { id: 'him' | 'her'; name: string; tops: Piece[]; bottoms: Piece[]; backdrop: string }` (`backdrop` = hex from Task 1 Step 6)
  - `const FIT_MODELS: FitModel[]` (him first); `pieceSrc(kind: 'tops' | 'bottoms', id: string)` → `/fitting/${kind}/${id}.webp` in `headswap.ts`
  - `const TOP_SIZES = ['XS','S','M','L','XL']`, `const BOTTOM_SIZES = ['28','30','32','34','36']`
- Produces (`src/lib/headswap.ts`):
  - `outfitSrc(model: string, top: string, bottom: string): string` → `/fitting/${model}/${top}__${bottom}.webp`
  - `outfitKey(model: string, top: string, bottom: string): string` → `${model}/${top}/${bottom}`
  - `type SwapResult = { ok: true; url: string } | { ok: false; error: string }`
  - `parseSwapStream(text: string): SwapResult | null` (null = no `complete`/`error` event yet)

- [ ] **Step 1: Write the failing tests** in `headswap.test.ts`:

```ts
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
  for (const m of FIT_MODELS) { assert.equal(m.tops.length, 4); assert.equal(m.bottoms.length, 4);
    for (const t of m.tops) assert.ok(!RACK.some((p) => p.id === t.id)); }
  assert.equal(pieceSrc('tops', 'x'), '/fitting/tops/x.webp');
});
```

- [ ] **Step 2:** `npm test` → FAIL (module not found).
- [ ] **Step 3:** Implement the two files with the values from Task 1's table.
- [ ] **Step 4:** `npm test` → all pass (carousel tests too).
- [ ] **Step 5: Commit** `feat: fitting room data and head-swap stream parser`

### Task 3: The Fitting Room section (no try-on yet)

**Files:**
- Create: `src/components/FittingRoom.tsx`, `src/components/FittingRoom.css`
- Modify: `src/App.tsx` (render `<FittingRoom onAddToBag={add} />` after `<Rack>`), `src/components/Header.tsx` (nav)

**Interfaces:**
- Consumes: `FIT_MODELS`, `TOP_SIZES`, `BOTTOM_SIZES`, `formatPrice`, `outfitSrc`, `pieceSrc`.
- Produces: `FittingRoom({ onAddToBag }: { onAddToBag: (items: number) => void })`; inside it, a `photoFor(key)` seam that Task 4 overrides (state `swapped: Map<string, string>`; shown image = `swapped.get(outfitKey(...)) ?? outfitSrc(...)`).

- [ ] **Step 1:** Header: replace `NAV`/`HREF`/observer ternary with one list `SECTIONS = [{ id: 'runway', label: 'Runway' }, { id: 'rail', label: 'Rail' }, { id: 'fitting', label: 'Fitting Room' }]`; nav order `Home, Runway, Rail, Fitting Room, Denim, Atelier`; observer observes every `SECTIONS` id and sets the matching label.
- [ ] **Step 2:** Section `<section className="fit" id="fitting" aria-label="Fitting room" style={{ '--backdrop': model.backdrop }}>`, height like `.rack` (`100dvh - var(--header-h)`, min 560px), background `var(--backdrop)`. Title "Fitting Room" top-left, `Him | Her` pill toggle (`aria-pressed`), "Try it on me" button top-right (Task 4 wires it).
- [ ] **Step 3:** Layout per the spec sketch: grid of 3 columns; left and right columns each hold 2 tops (top row) and 2 bottoms (row below); centre holds the model `<img>` (aspect 768/1376, height ≈ section height − 120px) with edges faded by `mask-image: linear-gradient(...)` on all four sides. Pieces are `<button aria-pressed aria-label="name, price">` with the piece's packshot; worn ones get a ring.
- [ ] **Step 4:** Clicking a non-worn piece wears it; the model image cross-fades (two stacked `<img>`, opacity transition 350ms, preload next with `new Image()` + `decode()` before swapping). Clicking the worn piece opens the drawer. Caption under the model: "Jacket: <name> · Trouser: <name>" (names are buttons that open the drawer); a visually hidden `aria-live="polite"` region announces outfit changes.
- [ ] **Step 5:** Drawer: right-side panel `role="dialog" aria-modal aria-label={name}`, product image, name, price, size chips (`TOP_SIZES` or `BOTTOM_SIZES`), CTA copy exactly like the Rail ("Select a size" / "Add to bag, M" / "Added to bag") calling `onAddToBag(1)`. Focus to the close button on open, back to the piece on close. Escape/Left/Right handled in a capture-phase `keydown` listener with `stopImmediatePropagation` while open (copy the Rack pattern).
- [ ] **Step 6:** Phones (≤ 767px): model first, then the tops row and bottoms row as horizontal scroll strips (`overflow-x: auto; scroll-snap-type: x mandatory`), drawer as a bottom sheet.
- [ ] **Step 7:** `npm run build` → passes. `npm run dev`, check in the browser: all 16 outfits per model load; him ↔ her; drawer + bag count; keyboard only (Tab, Enter, Escape, arrows do not move the Runway while the drawer is open); 390 px width. Screenshot desktop + phone.
- [ ] **Step 8: Commit** `feat: fitting room section`

### Task 4: "Try it on me"

**Files:**
- Create: `src/lib/swapClient.ts`, `src/components/TryOn.tsx`
- Modify: `src/lib/headswap.ts` (+ queue helper), `src/lib/headswap.test.ts`, `src/components/FittingRoom.tsx`, `FittingRoom.css`

**Interfaces:**
- Consumes: `parseSwapStream`, `outfitKey`, `outfitSrc`.
- Produces:
  - `prepareFace(file: File): Promise<Blob>` in `swapClient.ts` (throws `Error` with a user-facing message for non-image / > 15 MB / undecodable)
  - `headSwap(face: Blob, outfitUrl: string, signal: AbortSignal): Promise<string>` in `swapClient.ts` (resolves the result URL; uploads via `POST {SPACE}/gradio_api/upload`, calls `/gradio_api/call/face_swap`, reads the stream, `parseSwapStream`; rejects on error/abort; 120 s timeout via `AbortSignal.any([signal, AbortSignal.timeout(120_000)])`). Fetches the default prompt once from `/gradio_api/info` (`named_endpoints['/face_swap'].parameters[8].parameter_default`).
  - `nextJob(running: string | null, queued: string | null, pick: string, done: Set<string>): { start: string | null; queued: string | null }` in `headswap.ts` (pure queue rule).
  - `TryOn` panel component: `{ onPhoto: (face: Blob) => void; onClose: () => void }`.

- [ ] **Step 1: Write failing tests** for `nextJob`:

```ts
test('queue keeps only the latest pick', () => {
  assert.deepEqual(nextJob(null, null, 'a', new Set()), { start: 'a', queued: null });
  assert.deepEqual(nextJob('a', null, 'b', new Set()), { start: null, queued: 'b' });
  assert.deepEqual(nextJob('a', 'b', 'c', new Set()), { start: null, queued: 'c' });
  assert.deepEqual(nextJob(null, null, 'a', new Set(['a'])), { start: null, queued: null });
  assert.deepEqual(nextJob('a', 'b', 'a', new Set()), { start: null, queued: null });
});
```

- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** implement `nextJob`. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** `swapClient.ts` as in Interfaces. `prepareFace` uses `createImageBitmap(file, { imageOrientation: 'from-image' })` and an `OffscreenCanvas` → `convertToBlob({ type: 'image/jpeg', quality: 0.9 })`. Space id constant: `const SPACE = 'https://hugging-apps-bfs-best-face-swap.hf.space'`.
- [ ] **Step 6:** `TryOn` panel (dialog): photo tips (head and shoulders, facing the camera, no hat or sunglasses, good light), consent checkbox with the exact copy, file input disabled until ticked, inline error text for `prepareFace` errors.
- [ ] **Step 7:** Wire into `FittingRoom`: after a photo, state `face`, `swapped` map, `running`, `queued`; on photo and on every outfit change call `nextJob` with the current key; when a job starts, call `headSwap` with the outfit's absolute URL (`location.origin + outfitSrc(...)`); on success store the URL in `swapped` and start `queued`; on failure show the busy copy for 6 s. Shown image: `swapped` hit → visitor; miss while `face` is set → model photo with shimmer (`::after` gradient sweep) and the progress copy in an `aria-live` label; Cancel aborts. Toggle "On me / On the model"; "Remove my photo" aborts, clears state, revokes object URLs. Switching him ↔ her keeps `face` and swaps per that model.
- [ ] **Step 8:** `npm run build` → passes. In the browser with `flow/gallery-opening.jpg` as the visitor: swap lands on her outfit in ≤ 60 s; switch 3 outfits quickly, only the last is queued, earlier result cached; switch back = instant; set `SPACE` to a bad host temporarily → busy message, model stays; a rotated test photo comes out upright. Screenshot.
- [ ] **Step 9: Commit** `feat: try it on me head swap`

### Task 5: README and final check

**Files:** Modify `README.md`

- [ ] **Step 1:** README: Fitting Room row in the feature table, folder structure lines (`FittingRoom.tsx/.css`, `TryOn.tsx`, `lib/headswap.ts`, `lib/swapClient.ts`, `data/fitting.ts`, `public/fitting/`, `flow/fitting/`), a "The Fitting Room" section (how images are made, how to add a garment = 4 new stills per model, the Space and its limits, licences: BFS LoRA MIT; Qwen-Image-2.1 and Viggle turbo custom, read before sales; privacy note), remove "Only Runway and Rail exist" wording.
- [ ] **Step 2:** `npm test && npm run build` → both pass.
- [ ] **Step 3: Commit** `docs: fitting room`
