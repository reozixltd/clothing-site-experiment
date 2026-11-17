# Halden: Shop the Look

A "shop the look" runway page for a clothing brand. Six outfits stand in a
looping line-up on a studio floor. The centre look is in focus, its pieces are
listed on the right, and clicking the model opens a detail view with a numbered
pin on each garment. The models are photoreal studio images made with Google Flow.

Built with Vite, React and TypeScript. three.js is used only by the optional 3D
viewer (see below). Styling
is plain CSS. No animation library: all motion is CSS transitions.

## Run it

```bash
npm install
npm run dev      # local dev server
npm test         # checks the carousel maths
npm run build    # type-check and build to dist/
```

Needs Node 22.18 or newer (`npm test` runs the TypeScript test file directly).

## What it does

| Feature | How to use it |
| --- | --- |
| Looping line-up | Arrow buttons, the progress bar, Left / Right keys, click any model, or drag / swipe the stage sideways |
| Pointer parallax | Move the pointer over the stage. Nearer models shift more than further ones |
| Depth of field | Looks to the left are nearer and blurred, looks to the right are further and smaller |
| Detail view | Click the centre model. The others fade out and three pins appear |
| Turn the model | The City Edit: drag the model in the detail view (or press Left / Right) to turn the real person all the way round. The pins follow and fade when their garment faces away |
| 3D model (optional) | Off by default. A look with `model` set opens a game-style 3D model instead |
| 360° badge | The centre model shows a small spinning "360°" pill when its look can be turned; in the detail view it reads "Drag to turn" |
| Pins | Hover, focus or tap a pin to see the piece and its price. It also highlights the row in the rail |
| Product rail | Lists the three pieces of the centre look, the total, and "Add all to bag" |
| Bag counter | The header bag icon counts added items (there is no checkout) |
| Leave detail | "All looks" button or Escape |
| Phone layout | Three models on stage, rail moves below, nav becomes a scrollable row |
| Fitting Room | Scroll two sliding carousels of tops and bottoms and the model wears the centre pieces; click the model for sizes; "Try it on me" puts your own head on the model |
| Shoes | Scroll a diagonal line of floating shoes; click the front one for a product view with sizes, thumbnails and Add to bag |
| Bags | "One model. Every bag.": a ring of bags counts to 100 the first time you reach it, then you scroll a diagonal line of nine bags behind one model; she carries each in its own pose, with a shimmer as it changes, and each bag shows its type, material, size and strap |

## Folder structure

```
index.html
src/
  main.tsx               entry: fonts, global styles, mounts <App>
  App.tsx                page shell, holds the bag count
  data/
    looks.ts             ALL content: looks, products, prices, pin positions
    rack.ts              the ten pieces on the rail
    fitting.ts           fitting room models, garments, prices, sizes
  lib/
    carousel.ts          slot maths for the looping line-up (pure functions)
    carousel.test.ts     the test for it
    avatar.ts            loads one 3D model and draws it (camera, lights, pose)
    headswap.ts          fitting room paths, Space stream parser, swap queue rule (+ .test.ts)
    swapClient.ts        "Try it on me": prepares the photo, calls the head-swap Space
  components/
    Header.tsx / .css    logo, nav, search, account, bag
    Runway.tsx / .css    the stage, title, progress bar, both modes
    Figure.tsx           one model plus its pins (styled in Runway.css)
    Turntable.tsx        turn a real person: swaps photos from a turntable video
    Model3D.tsx          optional rotatable 3D model (unused, see below)
    LookRail.tsx / .css  "In this look" product list and buy button
    Rack.tsx / .css      the clothes rail section
    FittingRoom.tsx / .css  the fitting room section
    TryOn.tsx            the "Try it on me" photo panel
    Shoes.tsx / .css     the shoe line-up and its product view
    Bags.tsx / .css      "One model. Every bag."
  styles/
    tokens.css           colours, radius, font, timing
    base.css             reset, focus ring, reduced-motion rule
render.html              dev-only page that renders 3D models as line-up images
flow/                    the original Google Flow images and turntable video, sources of public/
  fitting/               fitting room originals; fitting.py turns them into public/fitting/
  shoes/                 shoe packshots; fitting.py turns them into public/shoes/
  bags/                  bag packshots and model/<id>.jpg (the model holding that bag); fitting.py turns them into public/bags/
public/
  looks/                 cutout of each model, used in the line-up and detail view
  products/              product photos (packshots, originals in flow/products/)
  turns/<look id>/       turntable photos 0.webp ... 35.webp
  models/<folder>/       optional 3D models (model.fbx plus textures), currently unused
  fitting/               outfit photos (<model>/<top>__<bottom>.webp) and garment cutouts (tops/, bottoms/)
  shoes/                 shoe cutouts, 1000 x 640, all standing on one ground line
  bags/                  bag cutouts, 800 x 800, and model/<id>.webp, the model cut out, all framed alike
```

## The model images

The six people are AI-generated studio photos, made with
[Google Flow](https://flow.google.com) (Nano Banana Pro image model). They are
not real people and not real Halden products. The originals are in `flow/`.

Each image in `public/looks/` is a cutout of a Flow image: background removed,
scaled so the men stand at full height and the women at 94%, feet on the bottom
edge of a transparent 500 x 1300 frame. Product names, categories and colours
describe what each model wears. Prices are sample data.

The product photos in `public/products/` are packshots made in Flow with Nano
Banana Pro from each look photo (ghost mannequin, shoes as a pair, light grey
backdrop). The 1024 x 1024 originals are in `flow/products/`. For the rail they
are scaled to 240 x 240 and the backdrop is stretched top and bottom to fill
240 x 304, so `object-fit: cover` never crops the product.

Tip for new images: ask Flow for a backdrop that contrasts with the clothes. A
pale grey floor makes white sneakers hard to cut out cleanly (The City Edit was
re-rendered on charcoal for that reason).

### Replacing a look

1. Generate a full-length, front-facing studio photo (9:16, plain backdrop).
2. Remove the background and save it to `public/looks/<look id>.webp` at
   500 x 1300, transparent, feet on the bottom edge.
3. Set the pins in `src/data/looks.ts`. `pin: { x, y, z }`: x and y are percent
   of the look image from its top left corner. z only matters for a 3D model
   (how far the spot sits in front of the body, in percent of the image width:
   about 15 for a chest, 12 for a thigh).

## The Rail (`#rail`)

One page, two sections: the runway first, the rail below it. Scroll down (the runway fades and blurs
back as it leaves, a scroll-driven animation) or use "Runway" / "Rail" in the sticky header, which glides
there and marks the section you are on. The rail is `src/components/Rack.tsx` and `Rack.css`; the code says "rack" because
`.rail` is the look rail's class. Its ten pieces are in `src/data/rack.ts`.

- Each piece hangs side-on, shown by a real side photo. Scrolling the rail into view swings the pieces
  in on their hooks one after another (`animation-timeline: view()`, skipped where unsupported).
- Hover or focus a piece: the side photo spins edge-on and the front photo spins in from edge-on and grows
  (`--spin` in `Rack.css`, 170 ms per half turn). The caption shows its name and price.
- Click: the rail blurs out and the piece opens on its own. You get Front / Back (a 180° spin on
  the hook), sizes, and an add-to-bag button that stays disabled until you pick a size. Prev / next arrows
  and Left / Right keys move along the rail. Escape or the X goes back.
- `--w` at the top of `Rack.css` sets the size of a hanger shot; everything scales off it.
- Phones (767px and narrower): bigger pieces on a rail you swipe sideways; tap a piece to open it,
  and swipe the open piece left / right to move along the rail.

### Hanger shots

`public/rack/<id>-front.webp`, `-side.webp` and `-back.webp`: 800 x 1000, transparent, the hook top centre,
every view scaled to the front's garment height so they line up. Made in Google Flow with Nano Banana 2.1, 3:4
(0 credits, downloaded as 2K Upscaled). The 2K originals are in `flow/rack/`.

1. **Front** (text only): "Straight-on studio product photograph … Subject: *the garment*, hanging from a
   slim natural wood clothes hanger with a polished chrome hook at the top centre … front facing the
   camera … Backdrop: one completely flat, uniform, solid pure magenta colour (#FF00FF) … no shadow,
   no magenta reflection on the garment … no text, no logo".
2. **Back:** attach the 2K front and ask for "the exact same garment on the exact same hanger … turned
   around 180 degrees so the BACK of the garment faces the camera. Keep the identical size, position in
   frame …", same backdrop.
3. **Side** (text only, same garment description): "… photographed in exact side profile, as if on a shop
   rail seen from the end of the rail: the hanger is seen edge-on as a thin vertical line … only its left
   sleeve is visible … the front edge of the garment faces the right-hand side of the picture … Static and
   sharp, no motion blur, no duplicate garment". Attaching the front and asking Flow to *turn* it gives
   motion-blur ghosts and double garments on jackets (hoodies were fine).
4. **Cut out:** `python flow/cutout.py <id> [<id> …]` reads the three JPGs from `flow/rack/` and writes the
   three WebPs. It keys the magenta out of the whole image relative to each image's own backdrop (Flow's
   magenta drifts towards pink), so gaps inside the hanger and under the arms come out clean as well.
   Don't use magenta for a pink or purple garment; pick a backdrop colour the garment doesn't have and
   change the key in `cutout.py`.

## Turning a real person

Every look has `turn: 36` in `src/data/looks.ts`. In the detail view,
`Turntable.tsx` swaps between 36 photos in `public/turns/<look id>/`, one every
10 degrees, so you can drag the model round either way. The photos load only
when the look is opened (about 1.5 MB per look), and the still stays until all
of them are ready.

The photos come from a 4 second turntable video per look, made with Omni 1.2
Flash in Google Flow (12 credits each) from the look's photo as the first
frame. The videos are in `flow/<look id>-turn.mp4`. Video models turn a person
from the front to the back and then stop or turn back the same way; they do
not do a clean full circle. So only the front-to-back half is used:

- photos 0 to 18 (0 to 180 degrees) are evenly spaced video frames from the
  first frame to the first frame where the model shows their back
- photos 19 to 35 (190 to 350 degrees) are photos 17 to 1 flipped left to right

The flip means anything one-sided (a chest print, a single pocket) swaps sides
on the far half of the turn. On plain clothes it is invisible.

To make one for a new look:

1. In Flow, start a 9:16 Omni video from the look's photo with a prompt like:
   "Turntable shot: the model slowly and evenly turns to their left in place,
   front, then side profile, until their back faces the camera at the end, then
   holds still. Feet planted, arms down. Locked-off static camera, same framing
   and backdrop." Check the model faces the left of the picture halfway, which
   is the direction the pins assume.
2. Find the first frame where the back faces the camera. Take 19 evenly spaced
   frames from frame 0 to it, cut each out with one fixed crop (the camera does
   not move) scaled so frame 0 lines up with the still in `public/looks/`, and
   add the 17 flipped ones. Save them as `public/turns/<look id>/0.webp` ...
   `35.webp` (500 x 1300).
3. Add `turn: 36` to the look.

Pins turn using `z` (how far the spot sits in front of the body's centre line).
The angle assumes an even turn speed, so pins can drift a little on a video
that speeds up or slows down.

## The optional 3D viewer

`src/components/Model3D.tsx` and `src/lib/avatar.ts` can show a 3D model you
can turn, with the pins following it. A look uses it only when its `model`
field names a folder in `public/models/`. No look sets it now, because the 3D
models are different people from the photos, and the detail view should show
the person you clicked.

The folders in `public/models/` hold free
[Microsoft Rocketbox](https://github.com/microsoft/Microsoft-Rocketbox) avatars
(MIT licence), game-style characters: `city-edit` (`Male_Adult_04`),
`gallery-opening` (`Female_Party_02`), `record-run` (`Male_Adult_17`),
`studio-day` (`Female_Adult_12`), `late-train` (`Male_Adult_12`),
`sunday-reset` (`Female_Adult_17`). They are copied into the build (about 6 MB)
but never loaded unless a look sets `model`. Delete the folder if you will not use it.

To use a 3D model, its line-up image must be a render of the same model: set
`model`, run `npm run dev`, open `/render.html` and save each picture as the
look's image. The code expects a Rocketbox-style model: centimetres, facing +Z,
materials ending `_body` / `_head` / `_opacity`, arm bones named
`... UpperArm` and `... Forearm`. three.js is only downloaded when such a look
is opened. Without WebGL the image stays and the pins still work.

## How the line-up works

Each look has a **slot**: its distance from the centre. Slot 0 is the centre,
-1 and -2 are to the left, 1 and 2 to the right. Slot 3 or -3 is off stage.

`slotOf()` in `src/lib/carousel.ts` works out the slot for each look. React
writes it to a `data-slot` attribute, and `Runway.css` maps each slot to a
position, size, blur and opacity. A CSS transition does the rest, so changing
look is only a number changing.

To restyle the line-up, edit the `.figure[data-slot='…']` rows in `Runway.css`.
There is a second set of rows for small screens at the bottom of that file.

One special case: when the line-up loops, one look has to get from one end to
the other. Instead of sliding across the stage it gets a `data-enter` attribute
and walks in from off stage (`@keyframes walk-in`).

## The Fitting Room (`#fitting`)

The third section. One model stands centre stage on the colour of their own studio wall. Two looping
carousels run across them: five tops at chest height and five bottoms at leg height, two showing each side;
the centre piece is the one being worn. Scroll (wheel or trackpad) over a row, swipe it, press the arrow
keys, or click a piece and the row slides one step. The pieces float at about body scale with no cards,
and fade the further they are from the model. The incoming piece slides into the model and dissolves
while the photo cross-fades (with a blur) to that outfit; the piece she was wearing slides back out.
Him / Her switches model; each keeps their own outfit. Click the model (or a piece's name under them) for
sizes and Add to bag. Escape or the X closes it.

**No virtual try-on model runs for this.** Every combination is its own Flow photo: 5 tops x 5 bottoms
= 25 photos per model, made with Nano Banana in Google Flow (0 credits) by attaching the base outfit photo
and asking for the same person, pose, framing and backdrop wearing the new pieces. The garment cutouts are
Flow packshots on magenta. `python flow/fitting.py` turns `flow/fitting/` into `public/fitting/` (outfits
768 x 1376 WebP, cutouts 800 x 1000 transparent) and prints each model's wall colour for `backdrop` in
`src/data/fitting.ts`.

To add a garment: one packshot, plus one outfit photo for every piece it can be worn with (a new top for
one model = 5 photos), named `<top>__<bottom>.jpg`. Check the head lines up with the base photo, or the
cross-fade jumps.

### Try it on me

"Try it on me" puts the visitor's whole head (face and hair) onto the model, using the free community
Hugging Face Space [`hugging-apps/bfs-best-face-swap`](https://huggingface.co/spaces/hugging-apps/bfs-best-face-swap)
(BFS head swap), called straight from the browser. No backend, no key, $0.

- The photo is checked (images only, up to 15 MB), turned upright from its EXIF data, shrunk to 1024 px and
  kept only in memory. "Remove my photo" drops it and every result.
- One swap at a time, about 30 s each, and only the outfit you are looking at. Pick several outfits while
  one runs and only the last one waits. Results are kept, so going back is instant.
- **Limits.** A free Space can be asleep, busy, changed or deleted at any time, and Hugging Face gives each
  anonymous visitor (per IP address) a small daily ZeroGPU quota, a handful of swaps. When it fails the
  visitor sees "The free try-on service is busy" and keeps the model photo. The Space address is the
  `SPACE` constant in `src/lib/swapClient.ts`.
- **Licences.** The BFS LoRA is MIT. The base models it runs on (Qwen-Image-2.1, the Viggle turbo) have
  their own custom licences: read them before using this commercially.
- **Privacy.** The visitor ticks a consent box first: their photo goes to a third-party service, which may
  keep it. This site never stores it.

## Shoes (`#shoes`)

The fourth section. Six shoes float on a diagonal line; the front one is named top left. Scroll over the
line, swipe it, press the arrow keys or click a shoe further along and the line slides one step with a
short motion blur. The wheel stops at the first and last shoe so the page can scroll on; arrows and clicks
loop. Click the front shoe (or "View shoe") and the same line becomes a product view: that shoe large on
the left, sizes and Add to bag on the right, thumbnails along the bottom. Escape or the X goes back.

The carousel moves (wheel, swipe, keys) are shared with the fitting room in `src/lib/useCarousel.ts`.

To add a shoe: one Flow packshot on magenta, side view with the toe pointing left, saved as
`flow/shoes/<id>.jpg`; run `python flow/fitting.py`; add a row to `src/data/shoes.ts`.

## Bags (`#bags`)

The fifth section. The headline "One model. Every bag." sits behind one model; small bags hang on a
diagonal line behind her, each with its name under it. Bottom left: number and type, name, note,
material / size / strap, price and Add to bag. Top right: a card with the bag, its name and price.
Each scroll step (or swipe, arrow key, arrow button, or click on a bag in the line) slides the line one
bag on. Her old pose dissolves into light and the new one comes into focus, while a band of warm light
and a scatter of glints run up her, cut to her silhouette (`.bags__magic`, masked with the new photo). It
uses the same `useCarousel` as the shoes, so the wheel lets the page go at the first and last bag.

The first time the section is half on screen, an intro covers it: the bags fly out of the middle into a
turning ring while a counter runs 000 to 100, then it fades (about 3 s). It plays once, never blocks the
page scroll, and is skipped under reduced motion.

Every model photo was made in Flow from the first one ("the exact same photo, only change the bag and
her pose") with that bag's packshot attached, so her head and the framing stay put (checked to the
pixel) and only her arms and the bag change.

To add a bag: a Flow packshot on magenta saved as `flow/bags/<id>.jpg`; a photo of her holding it, made
the same way, saved as `flow/bags/model/<id>.jpg`; run `python flow/fitting.py`; add a row to
`src/data/bags.ts`.

## Design tokens

Everything visual is set in `src/styles/tokens.css`:

- `--bg`, `--surface`, `--ink`, `--muted`, `--line`: the neutral palette
- `--accent`: the one accent colour, used only for pins and the bag counter
- `--radius` and `--pill`: controls are pills, images and rows use `--radius`
- `--slide`: how long a look takes to move one slot

## Accessibility

- Every model, pin and progress step is a real button with a label.
- Left / Right change look. In the detail view they turn the model if it can turn, and Escape leaves.
- Off-stage models are hidden from screen readers and from the tab order.
- Look changes are announced through a live region.
- `prefers-reduced-motion` turns the transitions off.

## Not included

- The other nav pages. Runway, Rail, Fitting Room, Shoes and Bags are sections of the one page; the other links go nowhere.
- "See availability" from the reference rail design (no stock data).
- Search, account, cart contents and checkout. The buttons are there, the features are not.
- A dark theme.
- Prices are sample data.
