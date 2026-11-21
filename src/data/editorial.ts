// Presentation data for the Try the Look and Editorial Looks sections.

/** Who each runway look is styled for, and its one-line description. */
export const LOOK_INFO: Record<string, { gender: 'M' | 'W'; blurb: string }> = {
  'city-edit': { gender: 'M', blurb: 'Washed-black bomber over olive carpenters, finished with a white high top.' },
  'gallery-opening': { gender: 'W', blurb: 'Plum micro-print tee, a black denim mini and ankle straps for a late opening.' },
  'record-run': { gender: 'M', blurb: 'Cobalt track hoodie, dark loose denim and off-white club lows.' },
  'studio-day': { gender: 'W', blurb: 'Black zip hoodie, cuffed mid-blue shorts and skate lows for a long day.' },
  'late-train': { gender: 'M', blurb: 'Worn indigo trucker, stone-wash straights and clean white courts.' },
  'sunday-reset': { gender: 'W', blurb: 'Mint ringer tee, light skinny jeans and taupe ballet flats.' },
};

/** Fitting-room outfits shown as editorial cards: [model, top id, bottom id, name, blurb]. */
export const FIT_LOOKS = [
  ['him', 'sage-linen-overshirt', 'grey-utility-cargo', 'Sage Linen Utility', 'Relaxed linen overshirt over washed utility cargos.'],
  ['her', 'ivory-silk-shirt', 'cream-wide-trouser', 'Ivory Silk Tailored', 'A soft silk shirt tucked into wide cream trousers.'],
  ['him', 'indigo-chore-coat', 'stone-pleated-trouser', 'Indigo Chore Layer', 'A workwear chore coat with a pleated stone trouser.'],
  ['her', 'black-cropped-blazer', 'black-midi-skirt', 'Cropped Blazer Edit', 'Sharp cropped blazer, black midi skirt, all-day polish.'],
  ['him', 'charcoal-merino-crew', 'black-straight-jean', 'Charcoal Knit and Denim', 'Fine merino crew with black straight jeans.'],
  ['her', 'terracotta-rib-cardigan', 'indigo-wide-jean', 'Terracotta and Indigo', 'Warm rib cardigan against a deep wide-leg jean.'],
] as const;
