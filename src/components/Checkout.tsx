import type { CartItem } from '../lib/cart';

// STUB: replaced by the real checkout view.
export function Checkout(_: { cart: CartItem[]; onQty: (key: string, qty: number) => void; onBack: () => void; onPlaced: () => void }) {
  return null;
}
