# Storefront redesign (from the APPAREL reel)

Reference: an Instagram reel of a menswear storefront. Brand stays **HALDEN** (fictional; never copy
"APPAREL" or its copy word for word). Currency stays USD via `formatPrice` in `src/data/looks.ts`.

Reference crops (1080 px wide, upscaled from a 360 px phone video, so small text is blurry):
`C:/Users/shahr/AppData/Local/Temp/claude/05b826620aa5c4be/4474f2c3-b4a7-4554-b528-4c0ef7e65484/scratchpad/hi/`
- `t0.3.png` hero · `t4.png` Try the Look · `t9.5.png` `t11.5.png` `t12.2.png` Remix Deck
- `t13.6.png` reviews · `t14.5.png` curved carousel · `t15.8.png` drop countdown · `t17.png` footer
- `t18.5.png` `t19.2.png` editorial looks grid · `t20.3.png` `t21.png` checkout
- Contact sheets of the whole reel: `../ff/sheet_01..04.jpg` (sheet_04 has the bag drawer, bottom row 2nd).

## Design system (already in place, use it)

`src/styles/tokens.css` and the primitives at the end of `src/styles/base.css`:
`.h-display` `.h-section` + `.h-grey` / `.h-lime` for the two-tone headline, `.eyebrow` (mono caps label,
e.g. `01 // HEADWEAR`), `.tag` (lime pill), `.btn` / `.btn--lime` / `.btn--ghost` (mono caps pills),
`.pills` + `.pill[aria-pressed]` filters, `.card`, `.panel-dark`, `.wrap` (centred max width),
`.section` (vertical padding), `.reveal` (scroll-in). Fonts: Geist (sans) and Geist Mono. Icons:
`@phosphor-icons/react`. Plain CSS per component (`Foo.tsx` + `Foo.css`), no new dependencies, no
animation library (CSS transitions / keyframes / scroll-driven animations). Respect
`prefers-reduced-motion` (base.css already zeroes durations). Real buttons, labels, focus states,
Esc to close overlays. Phone width (≤767px) must work with no horizontal page scroll.

## Page order (`src/App.tsx`, already wired)

Hero (`#home`) · Try the Look (`#try`) · Remix Deck (`#remix`) · Runway · Rail · Fitting Room · Shoes ·
Bags · Editorial Looks (`#gallery`) · Identity carousel (`#identity`) · Reviews (`#reviews`) ·
Drop (`#drop`) · Footer (`#contact`). Checkout view at `#checkout` (replaces `<main>`).

## Assets

Existing: `public/looks/<id>.webp` (6 full-length cutouts 500x1300, pins + products in `src/data/looks.ts`),
`public/products/` (packshots), `public/fitting/tops|bottoms/<id>.webp` (800x1000 transparent),
`public/fitting/<him|her>/<top>__<bottom>.webp` (outfit photos on #ececea), `public/shoes/<id>.webp`
(1000x640 transparent, toe left), `public/bags/`, `public/rack/`.

New (being generated in Flow; code against these paths, show a neutral placeholder if one fails to load):
- `public/remix/headwear/<id>.webp`, 800x800 transparent, ids: `oatmeal-twill-cap`, `rust-cotton-cap`,
  `charcoal-wool-beanie`, `black-bucket-hat`, `sage-dad-cap`, `cream-knit-beanie`.
- `public/editorial/1.webp` … `8.webp`, 720x960 portrait lifestyle photos.
- `public/hero/hero.mp4` (+ `hero.webm` optional) and `public/hero/poster.webp`: a full-length male model
  in a sage linen overshirt on pure white, small natural movement, 9:16.
