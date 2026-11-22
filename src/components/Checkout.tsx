import { ArrowLeft, ArrowRight, Check, Lightning, Lock, Minus, Plus, Trash } from '@phosphor-icons/react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { formatPrice } from '../data/looks';
import { type CartItem, cartCount, lineKey } from '../lib/cart';
import { isPromo, loadPromo, PROMO_CODE, SAMEDAY_FEE, savePromo, type Shipping, totals } from '../lib/checkout';
import './Checkout.css';

interface Props {
  cart: CartItem[];
  onQty: (key: string, qty: number) => void;
  onBack: () => void;
  onPlaced: () => void;
}

const BLANK = { name: '', email: '', phone: '', street: '', city: '', state: '', zip: '', card: '', expiry: '', cvc: '' };
const SAMPLE = {
  name: 'Alex Morgan',
  email: 'alex@example.com',
  phone: '+1 212 555 0148',
  street: '48 Mercer Street, Studio 3',
  city: 'New York',
  state: 'NY',
  zip: '10013',
  card: '4242 4242 4242 4242',
  expiry: '08 / 29',
  cvc: '123',
};
type Form = typeof BLANK;
type Pay = 'card' | 'paypal' | 'cod';
const PAY: [Pay, string][] = [['card', 'Card'], ['paypal', 'PayPal'], ['cod', 'Pay on delivery']];

/** Checkout: delivery details, shipping speed, payment method, and the order manifest. Demo only. */
export function Checkout({ cart, onQty, onBack, onPlaced }: Props) {
  const [f, setF] = useState<Form>(BLANK);
  const [ship, setShip] = useState<Shipping>('express');
  const [pay, setPay] = useState<Pay>('card');
  const [applied, setApplied] = useState(loadPromo);
  const [code, setCode] = useState(applied);
  const [bad, setBad] = useState(false);
  const [done, setDone] = useState<{ no: string; total: number; count: number } | null>(null);

  const t = totals(cart, { promo: applied, shipping: ship });
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF((v) => ({ ...v, [k]: e.target.value }));

  const apply = (e: FormEvent) => {
    e.preventDefault();
    const ok = isPromo(code);
    setBad(!ok && code.trim() !== '');
    const next = ok ? PROMO_CODE : '';
    setApplied(next);
    savePromo(next);
  };

  // The browser's own validation runs before submit; nothing here is sent or stored.
  const place = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    setDone({ no: `HLD-${Math.floor(10000 + Math.random() * 90000)}`, total: t.total, count: cartCount(cart) });
    onPlaced(); // the order is in: empty the bag now, the confirmation keeps its own copy
    window.scrollTo({ top: 0 });
  };

  const leave = onBack;

  // 02 lights once the delivery details are in.
  const step = done ? 3 : f.name && f.email && f.street && f.city && f.zip ? 2 : 1;
  const input = (k: keyof Form, label: string, o: { req?: boolean; type?: string; ph?: string; auto?: string; mode?: 'numeric' } = {}) => (
    <label className="ck__field">
      <span className="eyebrow">
        {label}
        {o.req && ' *'}
      </span>
      <input
        value={f[k]}
        onChange={set(k)}
        required={o.req}
        type={o.type ?? 'text'}
        placeholder={o.ph}
        autoComplete={o.auto}
        inputMode={o.mode}
      />
    </label>
  );

  return (
    <div className="ck">
      <section className="ck__hero">
        <div className="wrap">
          <div className="ck__bar">
            <button className="btn btn--ghost ck__back" type="button" onClick={onBack}>
              <ArrowLeft aria-hidden /> Back to bag
            </button>
            <button className="ck__continue" type="button" onClick={onBack}>
              Continue shopping
            </button>
            <p className="eyebrow ck__ssl">
              <Lock aria-hidden /> SSL encrypted secure checkout
            </p>
          </div>
          <div className="ck__title">
            <div>
              <h1 className="h-display">
                Atelier <span className="ck__lime">Checkout.</span>
              </h1>
              <p className="ck__sub">Complete delivery coordinates and a payment method for your reserved Drop 04 order.</p>
            </div>
            <ol className="ck__steps" aria-label="Checkout steps">
              {['Details', 'Payment', 'Confirm'].map((s, i) => (
                <li key={s} data-on={i + 1 === step} aria-current={i + 1 === step ? 'step' : undefined}>
                  0{i + 1} {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {done ? (
        <section className="wrap ck__done" aria-live="polite">
          <span className="ck__check">
            <Check weight="bold" aria-hidden />
          </span>
          <h2 className="h-section">Order {done.no} confirmed</h2>
          <p className="ck__sub">
            {done.count === 1 ? '1 piece' : `${done.count} pieces`} on their way, {formatPrice(done.total)} in total. A receipt would land
            in {f.email || 'your inbox'}, if this were more than a concept demo.
          </p>
          <button className="btn btn--lime" type="button" onClick={leave}>
            Continue shopping <ArrowRight aria-hidden />
          </button>
        </section>
      ) : cart.length === 0 ? (
        <section className="wrap ck__done">
          <h2 className="h-section">Your bag is empty</h2>
          <p className="ck__sub">Add a piece or two and come back to settle up.</p>
          <button className="btn" type="button" onClick={onBack}>
            <ArrowLeft aria-hidden /> Back to the shop
          </button>
        </section>
      ) : (
        <div className="wrap ck__body">
          <form id="checkout-form" className="ck__form" onSubmit={place}>
            <div className="ck__block">
              <div className="ck__headrow">
                <div>
                  <p className="eyebrow">01 // Client coordinates</p>
                  <h2 className="ck__h">Contact &amp; Delivery Address</h2>
                </div>
                <button className="ck__fill" type="button" onClick={() => setF(SAMPLE)}>
                  <Lightning weight="fill" aria-hidden /> Quick demo fill
                </button>
              </div>
              <div className="ck__grid">
                {input('name', 'Full name', { req: true, ph: 'e.g. Alex Morgan', auto: 'name' })}
                {input('email', 'Email address', { req: true, type: 'email', ph: 'you@domain.com', auto: 'email' })}
                {input('phone', 'Mobile number', { type: 'tel', ph: '+1 212 555 0148', auto: 'tel' })}
                <div className="ck__wide">{input('street', 'Street address / studio / apt', { req: true, ph: 'Building, street, neighbourhood', auto: 'street-address' })}</div>
                <div className="ck__wide ck__three">
                  {input('city', 'City', { req: true, ph: 'New York', auto: 'address-level2' })}
                  {input('state', 'State', { ph: 'NY', auto: 'address-level1' })}
                  {input('zip', 'ZIP code', { req: true, ph: '10013', auto: 'postal-code', mode: 'numeric' })}
                </div>
              </div>
            </div>

            <fieldset className="ck__block">
              <legend className="ck__legend">
                <span className="eyebrow">02 // Dispatch cadence</span>
                <span className="ck__h">Select shipping speed</span>
              </legend>
              <div className="ck__cards">
                <Choice name="ship" checked={ship === 'express'} onPick={() => setShip('express')} title="Express studio air" meta="2–3 days, tracked" price="Free" />
                <Choice name="ship" checked={ship === 'sameday'} onPick={() => setShip('sameday')} title="Same-day courier" meta="Order by 2pm, city only" price={`+${formatPrice(SAMEDAY_FEE)}`} />
              </div>
            </fieldset>

            <fieldset className="ck__block">
              <legend className="ck__legend">
                <span className="eyebrow">03 // Payment method</span>
                <span className="ck__h">Choose how to settle</span>
              </legend>
              <div className="ck__seg">
                {PAY.map(([id, label]) => (
                  <label key={id} data-on={pay === id}>
                    <input className="visually-hidden" type="radio" name="pay" checked={pay === id} onChange={() => setPay(id)} />
                    {label}
                  </label>
                ))}
              </div>
              {pay === 'card' ? (
                <div className="ck__grid ck__card">
                  <div className="ck__wide">{input('card', 'Card number', { ph: '1234 5678 9012 3456', auto: 'cc-number', mode: 'numeric' })}</div>
                  {input('expiry', 'Expiry', { ph: 'MM / YY', auto: 'cc-exp' })}
                  {input('cvc', 'CVC', { ph: '123', auto: 'cc-csc', mode: 'numeric' })}
                </div>
              ) : (
                <p className="ck__hint">{pay === 'paypal' ? 'You would be sent to PayPal to approve the payment.' : 'Pay the courier in cash or card when your order arrives.'}</p>
              )}
              <p className="ck__hint">Demo — no payment is taken. Nothing you type here is stored.</p>
            </fieldset>
          </form>

          <aside className="panel-dark ck__sum" aria-label="Order summary">
            <p className="eyebrow">Order manifest</p>
            <div className="ck__sumhead">
              <h2>Your bag ({cartCount(cart)} {cartCount(cart) === 1 ? 'item' : 'items'})</h2>
              <span className="ck__drop">Drop 04</span>
            </div>
            <ul className="ck__list">
              {cart.map((l) => {
                const k = lineKey(l);
                return (
                  <li key={k}>
                    <span className="ck__thumb">{l.image && <img src={l.image} alt="" />}</span>
                    <div className="ck__lineinfo">
                      <p>{l.name}</p>
                      {l.size && <p className="ck__meta">Size {l.size}</p>}
                      <b>{formatPrice(l.price * l.qty)}</b>
                    </div>
                    <div className="ck__lineact">
                      <button type="button" onClick={() => onQty(k, 0)} aria-label={`Remove ${l.name}`} className="ck__rm">
                        <Trash aria-hidden />
                      </button>
                      <div className="ck__qty" role="group" aria-label={`Quantity of ${l.name}`}>
                        <button type="button" onClick={() => onQty(k, l.qty - 1)} aria-label="One fewer">
                          <Minus aria-hidden />
                        </button>
                        <span>{l.qty}</span>
                        <button type="button" onClick={() => onQty(k, l.qty + 1)} aria-label="One more">
                          <Plus aria-hidden />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <form className="ck__promo" onSubmit={apply}>
              <label className="visually-hidden" htmlFor="ck-promo">
                Promo code
              </label>
              <input id="ck-promo" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" autoComplete="off" aria-invalid={bad} />
              <button type="submit">Apply</button>
            </form>
            <p className="ck__note" data-bad={bad} aria-live="polite">
              {bad ? 'Code not recognised' : applied ? `${PROMO_CODE} applied: 10% off` : ''}
            </p>

            <dl className="ck__sums">
              <Row k="Subtotal" v={formatPrice(t.subtotal)} />
              <Row k="Discount" v={t.discount ? `−${formatPrice(t.discount)}` : formatPrice(0)} />
              <Row k="Shipping" v={t.shipping ? formatPrice(t.shipping) : 'Free'} />
              <div className="ck__grand">
                <dt className="eyebrow">Total payable</dt>
                <dd>{formatPrice(t.total)}</dd>
              </div>
            </dl>
            <button className="btn btn--lime ck__place" type="submit" form="checkout-form">
              Place order · {formatPrice(t.total)} <ArrowRight aria-hidden />
            </button>
            <p className="ck__tiny">
              <Lock aria-hidden /> Concept demo. No payment is taken.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: ReactNode }) => (
  <div>
    <dt>{k}</dt>
    <dd>{v}</dd>
  </div>
);

/** A selectable card with radio semantics; the chosen one turns black. */
function Choice(p: { name: string; checked: boolean; onPick: () => void; title: string; meta: string; price: string }) {
  return (
    <label className="ck__choice" data-on={p.checked}>
      <input className="visually-hidden" type="radio" name={p.name} checked={p.checked} onChange={p.onPick} />
      <span className="ck__price">{p.price}</span>
      <b>{p.title}</b>
      <span>{p.meta}</span>
    </label>
  );
}
