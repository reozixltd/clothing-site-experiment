/**
 * Carousel maths. Pure functions, no React, so they can be tested with `npm test`.
 *
 * The runway shows five looks at once (slots -2..2) and loops forever.
 * A look's "slot" is its distance from the active look:
 *   0 = centre, negative = left of centre, positive = right of centre.
 */

/** 1 = moved forward (looks travel left), -1 = moved back. */
export type Direction = 1 | -1;

/** Slots beyond this are off stage and invisible. */
export const LAST_VISIBLE_SLOT = 2;

/** Modulo that stays positive for negative input. */
export const mod = (value: number, count: number) => ((value % count) + count) % count;

/**
 * Slot of look `i` when look `active` is centred.
 *
 * With an even number of looks, one look sits exactly opposite the centre and
 * could be placed on either side. We park it on the side looks are exiting to
 * (left after moving forward, right after moving back) so the look that just
 * left the stage glides out instead of jumping across it.
 */
export function slotOf(i: number, active: number, dir: Direction, count: number): number {
  const ahead = mod(i - active, count); // 0..count-1 steps to the right
  const half = Math.floor(count / 2);
  const maxRight = dir === 1 ? count - half - 1 : half;
  return ahead > maxRight ? ahead - count : ahead;
}

/**
 * True when a look went around the back of the loop instead of sliding across
 * the stage. Moving forward, every look travels left (its slot goes down), so
 * a slot that went up means the look wrapped. Moving back is the mirror image.
 */
export const didWrap = (from: number, to: number, dir: Direction) => (to - from) * dir > 0;
