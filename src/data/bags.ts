// "One model. Every bag." Packshots: public/bags/<id>.webp; the model holding each bag:
// public/bags/model/<id>.webp. Both made with flow/fitting.py (see README).
import type { Piece } from './rack';

export interface Bag extends Piece {
  note: string;
}

export const BAGS: Bag[] = [
  { id: 'quilt-black', name: 'The Quilt', price: 420, note: 'Diamond-quilted leather on a gold chain.' },
  { id: 'bucket-oxblood', name: 'The Well', price: 310, note: 'A pebbled drawstring bucket in oxblood.' },
  { id: 'hobo-cognac', name: 'The Slouch', price: 280, note: 'Soft cognac suede that folds to the shoulder.' },
  { id: 'tote-tan', name: 'The Carry', price: 260, note: 'A structured tan tote for the whole day.' },
  { id: 'clutch-silver', name: 'The Pebble', price: 190, note: 'A gathered silver pouch for the evening.' },
  { id: 'top-green', name: 'The Latch', price: 340, note: 'A small forest-green top handle with a gold clasp.' },
];
