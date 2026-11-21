// The Remix Deck: four layers to mix. Headwear is new (public/remix/headwear/<id>.webp); tops and bottoms
// come from the fitting room's two models, footwear from the shoe line-up.
import type { Gender } from '../lib/remix';
import { FIT_MODELS } from './fitting';
import type { Piece } from './rack';
import { SHOES } from './shoes';

export type Layer = 'headwear' | 'top' | 'bottom' | 'footwear';

export interface RemixItem extends Piece {
  gender: Gender;
  image: string;
}

const HEADWEAR: Piece[] = [
  { id: 'oatmeal-twill-cap', name: 'Oatmeal Twill Cap', price: 45 },
  { id: 'rust-cotton-cap', name: 'Rust Cotton Cap', price: 42 },
  { id: 'charcoal-wool-beanie', name: 'Charcoal Wool Beanie', price: 48 },
  { id: 'black-bucket-hat', name: 'Black Bucket Hat', price: 55 },
  { id: 'sage-dad-cap', name: 'Sage Dad Cap', price: 38 },
  { id: 'cream-knit-beanie', name: 'Cream Knit Beanie', price: 40 },
];

const tag = (ps: Piece[], gender: Gender, dir: string): RemixItem[] =>
  ps.map((p) => ({ ...p, gender, image: `${dir}/${p.id}.webp` }));
const fit = (key: 'tops' | 'bottoms', dir: string) =>
  FIT_MODELS.flatMap((m) => tag(m[key], m.id === 'him' ? 'men' : 'women', dir));

export const REMIX_LAYERS: { id: Layer; label: string; items: RemixItem[] }[] = [
  { id: 'headwear', label: 'Headwear', items: tag(HEADWEAR, 'all', '/remix/headwear') },
  { id: 'top', label: 'Top layer', items: fit('tops', '/fitting/tops') },
  { id: 'bottom', label: 'Bottom', items: fit('bottoms', '/fitting/bottoms') },
  { id: 'footwear', label: 'Footwear', items: tag(SHOES, 'all', '/shoes') },
];
