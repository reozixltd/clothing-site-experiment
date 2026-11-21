import { ArrowRight, Minus, Plus, Trash, X } from '@phosphor-icons/react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { type CartItem, cartCount, lineKey } from '../lib/cart';
import { FREE_SHIPPING_AT, isPromo, loadPromo, PROMO_CODE, savePromo, totals } from '../lib/checkout';
import { formatPrice } from '../data/looks';
import './Cart.css';

interface Props {
  cart: CartItem[];
  onQty: (key: string, qty: number) => void;
  onClose: () => void;
  onCheckout: () => void;
}

/** The bag drawer: lines, free-shipping progress, promo code, total, and on to checkout. */
export function Cart({ cart, onQty, onClose, onCheckout }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [applied, setApplied] = useState(loadPromo);
  const [code, setCode] = useState(applied);
  const [bad, setBad] = useState(false);

  // Focus lands in the panel; Escape closes it.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const apply = (e: FormEvent) => {
    e.preventDefault();
    const ok = isPromo(code);
    setBad(!ok && code.trim() !== '');
    const next = ok ? PROMO_CODE : '';
    setApplied(next);
    savePromo(next);
  };

  const n = cartCount(cart);
  const t = totals(cart, { promo: applied });
  const away = FREE_SHIPPING_AT - t.subtotal;
  return (
    <div className="cart" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cart__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart__head">
          <h2 id="cart-title">Your bag</h2>
          <span className="cart__count">{n === 1 ? '1 item' : `${n} items`}</span>
          <button className="cart__round" type="button" ref={closeRef} onClick={onClose} aria-label="Close bag">
            <X aria-hidden />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart__empty">
            <p>Your bag is empty. Add a piece from any look, the rail, the fitting room, the shoes or the bags.</p>
            <button className="btn btn--lime" type="button" onClick={onClose}>
              Start shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart__ship" data-done={away <= 0}>
              <p className="eyebrow">{away <= 0 ? 'Free express shipping unlocked' : `${formatPrice(away)} away from free shipping`}</p>
              <div className="cart__bar" aria-hidden>
                <i style={{ width: `${Math.min(100, (t.subtotal / FREE_SHIPPING_AT) * 100)}%` }} />
              </div>
            </div>

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
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="cart__foot">
              <form className="cart__promo" onSubmit={apply}>
                <label className="visually-hidden" htmlFor="cart-promo">
                  Promo code
                </label>
                <input
                  id="cart-promo"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Promo code"
                  autoComplete="off"
                  aria-invalid={bad}
                />
                <button className="btn btn--ghost" type="submit">
                  Apply
                </button>
              </form>
              <p className="cart__note" data-bad={bad} aria-live="polite">
                {bad ? 'Code not recognised' : applied ? `${PROMO_CODE} applied: 10% off` : ''}
              </p>
              <dl className="cart__sums">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(t.subtotal)}</dd>
                </div>
                <div>
                  <dt>Discount</dt>
                  <dd>{t.discount ? `−${formatPrice(t.discount)}` : formatPrice(0)}</dd>
                </div>
                <div className="cart__grand">
                  <dt className="eyebrow">Total amount</dt>
                  <dd>{formatPrice(t.total)}</dd>
                </div>
              </dl>
              <button className="btn btn--lime cart__checkout" type="button" onClick={onCheckout}>
                Proceed to secure checkout <ArrowRight aria-hidden />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
