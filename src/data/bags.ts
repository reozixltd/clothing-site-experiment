import type { Piece } from './rack';

export interface Bag extends Piece {
  kind: string;
  note: string;
  /** Material, size, strap: shown under the name. */
  details: [string, string][];
}

// Each bag has a packshot (public/bags/<id>.webp) and a photo of the model carrying it in her own pose (public/bags/model/<id>.webp).
export const BAGS: Bag[] = [
  {
    id: 'quilt-black',
    name: 'The Quilt',
    kind: 'Shoulder bag',
    price: 420,
    note: 'Diamond-quilted leather on a gold chain.',
    details: [['Material', 'Quilted lambskin'], ['Size', '25 × 16 × 7 cm'], ['Strap', 'Chain, 60 cm drop']],
  },
  {
    id: 'bucket-oxblood',
    name: 'The Well',
    kind: 'Bucket bag',
    price: 310,
    note: 'A pebbled drawstring bucket in oxblood.',
    details: [['Material', 'Pebbled calfskin'], ['Size', '22 × 24 × 14 cm'], ['Strap', 'Leather, adjustable']],
  },
  {
    id: 'hobo-cognac',
    name: 'The Slouch',
    kind: 'Hobo',
    price: 280,
    note: 'Soft cognac suede that folds to the shoulder.',
    details: [['Material', 'Suede'], ['Size', '34 × 30 × 8 cm'], ['Strap', 'Shoulder, 24 cm drop']],
  },
  {
    id: 'tote-tan',
    name: 'The Carry',
    kind: 'Tote',
    price: 260,
    note: 'A structured tan tote for the whole day.',
    details: [['Material', 'Grained leather'], ['Size', '32 × 30 × 12 cm'], ['Fits', 'A 13-inch laptop']],
  },
  {
    id: 'clutch-silver',
    name: 'The Pebble',
    kind: 'Clutch',
    price: 190,
    note: 'A gathered silver pouch for the evening.',
    details: [['Material', 'Metallic leather'], ['Size', '28 × 16 × 9 cm'], ['Closure', 'Magnetic frame']],
  },
  {
    id: 'top-green',
    name: 'The Latch',
    kind: 'Top handle',
    price: 340,
    note: 'A small forest-green top handle with a gold clasp.',
    details: [['Material', 'Box calf'], ['Size', '20 × 17 × 9 cm'], ['Closure', 'Gold turn-lock']],
  },
  {
    id: 'weave-raffia',
    name: 'The Weave',
    kind: 'Tote',
    price: 220,
    note: 'Hand-woven raffia trimmed in tan leather.',
    details: [['Material', 'Raffia, leather trim'], ['Size', '36 × 30 × 14 cm'], ['Lining', 'Cotton canvas']],
  },
  {
    id: 'baguette-brown',
    name: 'The Baguette',
    kind: 'Shoulder bag',
    price: 360,
    note: 'Croc-embossed chocolate leather, worn close.',
    details: [['Material', 'Croc-embossed calf'], ['Size', '26 × 14 × 6 cm'], ['Strap', 'Short, 18 cm drop']],
  },
  {
    id: 'moon-white',
    name: 'The Moon',
    kind: 'Shoulder bag',
    price: 295,
    note: 'A white leather crescent on a slim strap.',
    details: [['Material', 'Smooth calfskin'], ['Size', '30 × 15 × 8 cm'], ['Strap', 'Shoulder, 22 cm drop']],
  },
];
