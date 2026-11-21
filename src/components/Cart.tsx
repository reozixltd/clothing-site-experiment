import { Minus, Plus, Trash, X } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { type CartItem, cartCount, lineKey, subtotal } from '../lib/cart';
import { formatPrice } from '../data/looks';
import './Cart.css';

interface Props {
  cart: CartItem[];
  onQty: (key: string, qty: number) => void;
  onClose: () => void;
  onCheckout: () => void;
}

/** The bag: every line with its size and quantity, remove, and the subtotal. */
export function Cart({ cart, onQty, onClose, onCheckout }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [note, setNote] = useState(false);

  // Focus lands in the panel; Escape closes it.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const n = cartCount(cart);
  return (
    <div className="cart" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cart__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart__head">
          <h2 id="cart-title">
            Your bag <span>{n === 1 ? '1 item' : `${n} items`}</span>
          </h2>
          <button className="cart__round" type="button" ref={closeRef} onClick={onClose} aria-label="Close bag">
            <X aria-hidden />
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="cart__empty">Your bag is empty. Add a piece from any look, the rail, the fitting room, the shoes or the bags.</p>
        ) : (
          <ul className="cart__list">
            {cart.map((l) => {
              const k = lineKey(l);
              return (
                <li key={k} className="cart__line">
                  <span className="cart__thumb">{l.image && <img src={l.image} alt="" />}</span>
                  <div className="cart__info">
                    <p className="cart__name">{l.name}</p>
                    {l.size && <p className="cart__meta">Size {l.size}</p>}
                    <div className="cart__qty" role="group" aria-label={`Quantity of ${l.name}`}>
                      <button type="button" onClick={() => onQty(k, l.qty - 1)} aria-label="One fewer">
                        <Minus aria-hidden />
                      </button>
                      <span aria-live="polite">{l.qty}</span>
                      <button type="button" onClick={() => onQty(k, l.qty + 1)} aria-label="One more">
                        <Plus aria-hidden />
                      </button>
                    </div>
                  </div>
                  <div className="cart__side">
                    <p className="cart__price">{formatPrice(l.price * l.qty)}</p>
                    <button className="cart__remove" type="button" onClick={() => onQty(k, 0)} aria-label={`Remove ${l.name}`}>
                      <Trash aria-hidden />
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {cart.length > 0 && (
          <div className="cart__foot">
            <p className="cart__total">
              <span>Subtotal</span>
              <b>{formatPrice(subtotal(cart))}</b>
            </p>
            <p className="cart__meta">Shipping and taxes are worked out at checkout.</p>
            <button className="cart__checkout" type="button" onClick={() => setNote(true)}>
              Checkout
            </button>
            {/* ponytail: no payments in this build; a checkout page goes here when there is one. */}
            <p className="cart__meta" aria-live="polite">
              {note ? 'Checkout is not part of this demo. Your bag is saved on this device.' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
