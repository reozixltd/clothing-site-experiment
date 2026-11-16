# Fitting Room + "Try it on me" — design

Piece 1 of 4 (then: "One model. Every bag.", the shoe line-up, the 360° badge on the runway).

## Intent

A visitor builds an outfit on a photoreal model by clicking jackets and trousers, as in the reference
video (`AQNpGt…mp4`, 0:12–0:20). Then they upload a photo of themselves and the model becomes them,
so they can see how the outfit would look on them. **$0 running cost**: no paid API, no backend.

## Goals

- A Fitting Room section that feels like the reference: one model centre stage, tops on the upper row,
  bottoms on the lower row, split on both sides; click a piece and the model is wearing it.
- Two base models, him and her, switchable.
- "Try it on me": the visitor's whole head (face **and hair**) replaces the model's, photoreal.
- Outfit switching on the model is instant. After "Try it on me", each new outfit takes one head swap
  (~30 s) the first time, then is instant (cached).
- Product drawer with sizes and Add to bag, wired to the existing bag counter.

## Non-goals

- Garments on the visitor's own body (tested: the 2D warp looked bad; the free AI try-on does tops only
  and takes ~27 s per garment). Possible later "on your real body" button.
- Checkout, real stock, saving a visitor's look between visits.
- A paid or self-hosted AI service.

## Anti-goals (fails even if it works)

- Anything that looks pasted on or like a sticker. The visitor must recognise themselves.
- The section looking broken when the free AI service is busy or down.
- Keeping or sending the visitor's photo anywhere without them agreeing first.

## Constraints

- Static Vite + React + TS site, plain CSS, no animation library (README). One scrolling page.
- Flow images: Nano Banana stills are free (0 credits). Videos cost credits; none needed here.
- The head swap runs on a free community Hugging Face Space, called straight from the visitor's browser.
  It can be slow, queued, asleep or gone. Licences: the BFS LoRA is MIT; the base model Qwen-Image-2.1
  and the Viggle turbo have custom ("other") licences, not yet read. Fine for this experiment; read them
  before any real sales.

## Approaches considered (tested 2026-11-17, screenshots in the conversation)

| Approach | Result | Verdict |
|---|---|---|
| 2D warp: pose landmarks in the browser (MediaPipe) stretch garment cutouts onto the visitor's photo | Their clothes show through, rigid trousers, flat sticker look | Rejected by the user ("looks very bad") |
| Free AI try-on on their body (IDM-VTON Space) | Photoreal, 27 s, **tops only** | Parked as a later extra |
| Face-only swap (inswapper Space) | Keeps the model's hair and skin; the woman test barely changed | Rejected |
| **Whole-head swap (BFS Space, `hugging-apps/bfs-best-face-swap`)** | Photoreal, hair + face + skin tone carried over, 26–33 s | **Chosen** |

## How it works

### The section

`#fitting`, after the Rail. Header gets a "Fitting Room" link; the section observer in `Header.tsx`
(today it hardcodes `runway` / `rail` with a ternary) becomes a list of `{ id, label }`.

```
 Fitting Room                       [ Him | Her ]          [ Try it on me ]
   [jkt] [jkt]         ( model )         [jkt] [jkt]
   [trs] [trs]         ( model )         [trs] [trs]
                 Jacket: Rust Coach · Trouser: Olive Cargo
```

- 4 tops × 4 bottoms per model. Pieces stay in the grid when worn and get a selected ring
  (the video removes the worn piece; with 4 per row that would leave an odd 3, so we keep 2 + 2).
- Click a piece: the model image cross-fades to that combination. Click the worn piece again (or its
  caption name): the drawer opens.
- Drawer (right side, like the video): product shot, name, price, size chips (jackets XS–XL like the
  Rail, trousers 28–36), Add to bag (disabled until a size is picked) → `onAddToBag(1)`.
  Escape / X closes; focus moves in and back; arrow keys are caught in the capture phase, as
  `Rack.tsx` does, so the Runway does not also react.
- Phones (≤ 767 px): model on top, then two sideways-swipe rows (tops, bottoms), drawer as a bottom sheet.

### Content

`src/data/fitting.ts`:

```ts
interface FitModel { id: 'him' | 'her'; name: string; tops: string[]; bottoms: string[] }
interface Bottom { id: string; name: string; price: number }
```

- **Tops reuse the Rail**: 4 pieces from `RACK` per model (ids, names, prices from `rack.ts`, grid
  image = the existing `/rack/<id>-front.webp`). Unisex outerwear, so both models can share some.
  Any Rail piece works (every outfit gets its own swap); favour the six jackets for variety.
- **Bottoms are new**: 4 per model, packshots `/fitting/bottoms/<id>.webp` (transparent).
- Outfit photos: `/fitting/<model>/<top>__<bottom>.webp`, full Flow photo (backdrop kept, no cutout),
  768 × 1376. The section background is the Flow backdrop colour and the image edges fade with a CSS
  `mask-image`, so no cutouts are needed and the head swap works on the plain photo. A studio photo has
  a backdrop gradient and floor shadow, so check this at the first-3 gate below, inside the section.

### Making the images (Flow, Nano Banana, free)

1. Per model, one base photo: full length, front facing, arms relaxed, plain light grey backdrop,
   wearing top 1 + bottom 1 (the Rail jacket's 2K front shot attached as reference).
2. The other 15 combinations: attach the base photo and the garment shot, "the exact same person, pose,
   framing, lighting and backdrop; change only the jacket / trousers to the attached one".
3. **Check after the first 3**: overlay them; the model must stay put (within ~1% of the image) so the
   cross-fade between outfits does not jump. If it drifts, align each image to the base on the face
   position before saving. Also view one inside the section to check the backdrop blends.
4. Bottom packshots: magenta backdrop, cut out with the `cutout()` function from `flow/cutout.py`.
5. Originals go in `flow/fitting/`, as with the other Flow sources.

Total: 32 outfit stills + 8 bottom packshots, 0 credits.

### "Try it on me"

1. Button opens a small panel: what makes a good photo (head and shoulders, facing the camera, no hat
   or sunglasses, good light) and a consent tick box: "Your photo is sent to a free AI service on
   Hugging Face (a community-run third-party service, which may keep it) to make the preview. This site
   does not keep it." The upload button stays disabled until ticked.
   `<input type="file" accept="image/*">` (phones offer the camera themselves).
2. In the browser: reject non-images and files over 15 MB; decode with
   `createImageBitmap(file, { imageOrientation: 'from-image' })`; downscale to 1024 px on the long side;
   re-encode as JPEG.
3. Call the Space with plain `fetch` (tested, no client library): `POST /gradio_api/upload` for the
   visitor photo and the current outfit photo, then `POST /gradio_api/call/face_swap` with
   `[face, outfit, 'Turbo · Viggle 6-step', 1024, 6, 1, 42, false, <default prompt>]`, then read the
   event stream `GET /gradio_api/call/face_swap/<event_id>` until `complete` or `error`.
   The `complete` data is `[[original, result], seed]`: **the second image is the swap** (the first is the
   unchanged input, for a before/after slider). The Space id and parameters live in one constant at the
   top of the module. The visitor's uploaded file path is reused for later outfits (re-upload if the
   Space says it is gone).
4. While it runs (~30 s): the model with a slow scanning shimmer and a "Making you… ~30 s" label;
   Cancel aborts the request. Timeout at 120 s.
5. Result: the swapped photo replaces the model photo for that outfit and is cached (per model + outfit,
   in memory). Switching to an outfit not yet swapped shows it on the model at once with the shimmer and
   "Putting you in this outfit… ~30 s", then cross-fades to the visitor when ready. Only one swap runs at
   a time; picking another outfit mid-swap lets the running one finish into the cache and queues only the
   latest pick. No background pre-swapping (it would burn the visitor's free quota).

   *Rejected, tested 2026-11-17:* swapping once and carrying the swapped head onto other outfits with a
   feathered oval or a difference mask. The swap re-tones neck, arms and hands to the visitor and
   re-renders the whole picture slightly, so the carried head sat on the model's skin tone and brought
   the first outfit's collar with it: the pasted-on look this design must avoid.
6. "On me / On the model" toggle; "Remove my photo" clears everything. The photo and result live only
   in memory (object URLs, revoked on remove), never `localStorage`, never our server.
7. Errors (Space busy, asleep, error event, timeout, network): a one-line message, "The free try-on
   service is busy. Try again in a minute.", and the model stays as it was.

### Accessibility

Pieces are buttons with name + price labels and `aria-pressed`; the current outfit is announced in a
live region; the drawer is a labelled dialog; the progress label is `aria-live`; reduced motion turns
off the cross-fade and shimmer.

## Testing

- `npm test`: add a small test for the pure parts (outfit image path; parsing the event-stream text
  into the result URL, i.e. the second image, or an error).
- In the browser: every combination loads for both models; drawer + bag; keyboard only; phone width;
  "Try it on me" with one of our AI look photos as the visitor (no real person), then switch all
  outfits; force an error (bad Space id) and check the fallback message.

## Left to the builder

- Which 4 Rail jackets and which 4 bottoms per model (aim for variety of colour).
- Cross-fade timing, shimmer look, exact layout spacing; use `tokens.css`.

## Later upgrades (not now)

- "On your real body" button using the free IDM-VTON Space (tops only).
- If the free Space disappears: swap the constant for another BFS/head-swap Space.
