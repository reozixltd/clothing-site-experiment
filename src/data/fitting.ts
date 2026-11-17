// The fitting room: two models, each with 5 tops x 5 bottoms (all new, not the Rail's).
// Outfit photos: public/fitting/<model>/<top>__<bottom>.webp; packshots: public/fitting/tops|bottoms/<id>.webp.
// Made with flow/fitting.py (see README).
import type { Piece } from './rack';

export interface FitModel {
  id: 'him' | 'her';
  name: string;
  tops: Piece[];
  bottoms: Piece[];
  /** Wall colour of the outfit photos; the section background, so the faded photo edges disappear. */
  backdrop: string;
}

export const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
export const BOTTOM_SIZES = ['28', '30', '32', '34', '36'];

export const FIT_MODELS: FitModel[] = [
  {
    id: 'him',
    name: 'Him',
    backdrop: '#ececea',
    tops: [
      { id: 'sage-linen-overshirt', name: 'Sage Linen Overshirt', price: 120 },
      { id: 'indigo-chore-coat', name: 'Indigo Chore Coat', price: 175 },
      { id: 'charcoal-merino-crew', name: 'Charcoal Merino Crew', price: 110 },
      { id: 'cream-cable-knit', name: 'Cream Cable Knit', price: 135 },
      { id: 'olive-bomber', name: 'Olive Bomber Jacket', price: 185 },
    ],
    bottoms: [
      { id: 'grey-utility-cargo', name: 'Grey Utility Cargo', price: 135 },
      { id: 'stone-pleated-trouser', name: 'Stone Pleated Trouser', price: 150 },
      { id: 'black-straight-jean', name: 'Black Straight Jean', price: 140 },
      { id: 'ecru-carpenter-pant', name: 'Ecru Carpenter Pant', price: 130 },
      { id: 'navy-chino', name: 'Navy Chino', price: 120 },
    ],
  },
  {
    id: 'her',
    name: 'Her',
    backdrop: '#ececea',
    tops: [
      { id: 'ivory-silk-shirt', name: 'Ivory Silk Shirt', price: 125 },
      { id: 'black-cropped-blazer', name: 'Black Cropped Blazer', price: 190 },
      { id: 'terracotta-rib-cardigan', name: 'Terracotta Rib Cardigan', price: 115 },
      { id: 'oatmeal-funnel-knit', name: 'Oatmeal Funnel Knit', price: 140 },
      { id: 'navy-breton-top', name: 'Navy Breton Top', price: 85 },
    ],
    bottoms: [
      { id: 'cream-wide-trouser', name: 'Cream Wide-Leg Trouser', price: 145 },
      { id: 'black-midi-skirt', name: 'Black Midi Skirt', price: 120 },
      { id: 'indigo-wide-jean', name: 'Indigo Wide Jean', price: 150 },
      { id: 'camel-pleated-trouser', name: 'Camel Pleated Trouser', price: 155 },
      { id: 'grey-tailored-trouser', name: 'Grey Tailored Trouser', price: 160 },
    ],
  },
];
