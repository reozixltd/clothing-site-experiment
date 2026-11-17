// The shoe line-up. Packshots: public/shoes/<id>.webp, made with flow/fitting.py (see README).
import type { Piece } from './rack';

export const SHOE_SIZES = ['40', '41', '42', '43', '44', '45'];

export const SHOES: Piece[] = [
  { id: 'court-white', name: 'Court Low', price: 135 },
  { id: 'runner-navy', name: 'Relay Runner', price: 150 },
  { id: 'high-black', name: 'Canvas High', price: 95 },
  { id: 'low-sand', name: 'Suede Trainer', price: 140 },
  { id: 'trail-olive', name: 'Ridge Trail', price: 165 },
  { id: 'court-black', name: 'Court Low Black', price: 135 },
];
