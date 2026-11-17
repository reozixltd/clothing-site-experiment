/** One line in the bag: a piece, in one size, with how many. */
export interface CartItem {
  id: string;
  name: string;
  /** Whole US dollars, each. */
  price: number;
  image?: string;
  size?: string;
  qty: number;
}
export type NewItem = Omit<CartItem, 'qty'>;

/** The same piece in another size is another line. */
export const lineKey = (i: Pick<CartItem, 'id' | 'size'>) => `${i.id}|${i.size ?? ''}`;

export function addItem(cart: CartItem[], item: NewItem): CartItem[] {
  const k = lineKey(item);
  return cart.some((l) => lineKey(l) === k)
    ? cart.map((l) => (lineKey(l) === k ? { ...l, qty: l.qty + 1 } : l))
    : [...cart, { ...item, qty: 1 }];
}

/** Zero (or less) takes the line out. */
export function setQty(cart: CartItem[], key: string, qty: number): CartItem[] {
  return qty > 0 ? cart.map((l) => (lineKey(l) === key ? { ...l, qty } : l)) : cart.filter((l) => lineKey(l) !== key);
}

export const cartCount = (cart: CartItem[]) => cart.reduce((n, l) => n + l.qty, 0);
export const subtotal = (cart: CartItem[]) => cart.reduce((n, l) => n + l.qty * l.price, 0);
