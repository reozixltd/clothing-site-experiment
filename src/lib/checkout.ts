import { type CartItem, subtotal } from './cart.ts';

export type Shipping = 'express' | 'sameday';
export const FREE_SHIPPING_AT = 150;
export const SAMEDAY_FEE = 18;
export const PROMO_CODE = 'HALDEN10';
const PROMO_KEY = 'halden-promo';

export const isPromo = (code: string) => code.trim().toUpperCase() === PROMO_CODE;

/** Whole dollars: 10% off with the code, express is always free, same-day is $18. */
export function totals(cart: CartItem[], opts: { promo?: string; shipping?: Shipping } = {}) {
  const sub = subtotal(cart);
  const discount = opts.promo && isPromo(opts.promo) ? Math.round(sub * 0.1) : 0;
  const shipping = opts.shipping === 'sameday' && sub > 0 ? SAMEDAY_FEE : 0;
  return { subtotal: sub, discount, shipping, total: sub - discount + shipping };
}

/** The applied code lives on this device so the bag and checkout agree. */
export function loadPromo() {
  try {
    const c = localStorage.getItem(PROMO_KEY) ?? '';
    return isPromo(c) ? PROMO_CODE : '';
  } catch {
    return '';
  }
}
export function savePromo(code: string) {
  try {
    localStorage.setItem(PROMO_KEY, code);
  } catch {
    // private mode: the code lasts until reload
  }
}
