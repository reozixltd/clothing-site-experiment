import { CaretLeft, CaretRight, Check, Plus } from '@phosphor-icons/react';
import { type CSSProperties, useEffect, useState } from 'react';
import { LOOK_INFO } from '../data/editorial';
import { formatPrice, LOOKS, lookTotal, type Product } from '../data/looks';
import type { NewItem } from '../lib/cart';
import './TryTheLook.css';

const SIZES = ['S', 'M', 'L', 'XL'];
const FILTERS = [
  ['All Looks', null],
  ['Men', 'M'],
  ['Women', 'W'],
] as const;
const pad = (n: number) => String(n).padStart(2, '0');

/** Three runway looks side by side, the middle one in focus with shoppable pins, and the shop panel beside it. */
export function TryTheLook({ onAddToBag }: { onAddToBag: (item: NewItem) => void }) {
  const [filter, setFilter] = useState<'M' | 'W' | null>(null);
  const [active, setActive] = useState(0);
  const [hot, setHot] = useState<number | null>(null); // piece being hovered, from a pin or a row
  const [sel, setSel] = useState(0); // piece whose size chips are open
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [auto, setAuto] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [paused, setPaused] = useState(false);

  const looks = LOOKS.filter((l) => !filter || LOOK_INFO[l.id].gender === filter);
  const n = looks.length;
  const look = looks[active];
  const go = (i: number) => {
    setActive(((i % n) + n) % n);
    setHot(null);
    setSel(0);
    setAdded(false);
  };

  useEffect(() => {
    if (!auto || paused) return;
    const t = setInterval(() => go(active + 1), 6000);
    return () => clearInterval(t);
  });

  const item = (p: Product, size?: string): NewItem => ({ id: p.id, name: p.name, price: p.price, image: p.image, size });
  const addFull = () => {
    look.products.forEach((p) => onAddToBag(item(p, sizes[p.id])));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const half = Math.floor(n / 2);
  return (
    <section className="section ttl" id="try" aria-labelledby="ttl-title">
      <div className="wrap">
        <header className="ttl__head">
          <div>
            <p className="eyebrow">Styled head to toe // 6 curated sets</p>
            <h2 className="h-section" id="ttl-title">
              Try the <span className="h-lime">Look.</span>
            </h2>
            <p className="ttl__lede">
              Rotating runway sets styled from hat to sneaker. Tap any <span className="ttl__dot" aria-hidden /> pin on
              the active outfit to see the piece and its price, or shop all three below.
            </p>
          </div>
          <div className="ttl__tools">
            <div className="pills" role="group" aria-label="Filter looks">
              {FILTERS.map(([label, g]) => (
                <button
                  key={label}
                  type="button"
                  className="pill"
                  aria-pressed={filter === g}
                  onClick={() => {
                    setFilter(g);
                    setActive(0);
                    setHot(null);
                    setSel(0);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="ttl__auto"
              aria-pressed={auto}
              onClick={() => setAuto((a) => !a)}
              title="Advance every 6 seconds"
            >
              <span aria-hidden className="ttl__autodot" />
              Auto
            </button>
          </div>
        </header>

        <div
          className="ttl__grid"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="ttl__left">
            <div className="ttl__stage">
              <span className="ttl__count">
                Look {pad(active + 1)} / {pad(n)}
              </span>
              <div className="ttl__arrows">
                <button type="button" onClick={() => go(active - 1)} aria-label="Previous look">
                  <CaretLeft weight="bold" />
                </button>
                <button type="button" onClick={() => go(active + 1)} aria-label="Next look">
                  <CaretRight weight="bold" />
                </button>
              </div>
              <div className="ttl__floor" aria-hidden />
              {looks.map((l, i) => {
                const o = ((((i - active + half) % n) + n) % n) - half;
                const c = o === 0;
                return (
                  <div
                    key={l.id}
                    className="ttl__model"
                    data-c={c}
                    data-far={Math.abs(o) > 1}
                    style={{ '--o': Math.max(-2, Math.min(2, o)) } as CSSProperties}
                  >
                    <img src={l.image} alt={c ? l.name : ''} draggable={false} />
                    {!c && (
                      <button
                        type="button"
                        className="ttl__peek"
                        onClick={() => go(i)}
                        aria-label={`Show ${l.name}`}
                        tabIndex={Math.abs(o) > 1 ? -1 : 0}
                      />
                    )}
                    {c &&
                      l.products.map((p, pi) => (
                        <button
                          key={p.id}
                          type="button"
                          className="ttl__pin"
                          data-hot={hot === pi}
                          data-flip={p.pin.x > 55}
                          style={{ left: `${p.pin.x}%`, top: `${p.pin.y}%` }}
                          aria-label={`Add ${p.name}, ${formatPrice(p.price)}`}
                          onMouseEnter={() => setHot(pi)}
                          onMouseLeave={() => setHot(null)}
                          onFocus={() => setHot(pi)}
                          onBlur={() => setHot(null)}
                          onClick={() => {
                            setSel(pi);
                            onAddToBag(item(p));
                          }}
                        >
                          <span className="ttl__chip" aria-hidden>
                            Add {formatPrice(p.price)}
                          </span>
                        </button>
                      ))}
                  </div>
                );
              })}
            </div>
            <p className="ttl__name" aria-live="polite">
              {look.name}
            </p>
            <p className="ttl__blurb">{LOOK_INFO[look.id].blurb}</p>
          </div>

          <aside className="ttl__panel" aria-label="Shop this look">
            <div className="ttl__panelhead">
              <div>
                <p className="eyebrow">Runway pieces // 3 items</p>
                <h3>Shop This Look</h3>
              </div>
              <span className="ttl__tip">Tip: click pins</span>
            </div>
            <ul className="ttl__rows">
              {look.products.map((p, pi) => (
                <li
                  key={p.id}
                  className="ttl__row"
                  data-hot={hot === pi}
                  data-open={sel === pi}
                  onMouseEnter={() => setHot(pi)}
                  onMouseLeave={() => setHot(null)}
                  onFocus={() => setHot(pi)}
                  onBlur={() => setHot(null)}
                >
                  <div className="ttl__main" onClick={() => setSel(pi)}>
                    <span className="ttl__thumb" style={{ background: p.color }}>
                      {p.image && <img src={p.image} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                    </span>
                    <span className="ttl__info">
                      <span className="ttl__cat">{p.category}</span>
                      <span className="ttl__pname">{p.name}</span>
                      <span className="ttl__price">{formatPrice(p.price)}</span>
                    </span>
                    <button
                      type="button"
                      className="ttl__add"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSel(pi);
                        onAddToBag(item(p, sizes[p.id]));
                      }}
                      aria-label={`Add ${p.name}`}
                    >
                      <Plus weight="bold" /> Add
                    </button>
                  </div>
                  {sel === pi && (
                    <div className="ttl__sizes" role="group" aria-label={`Size for ${p.name}`}>
                      <span className="eyebrow">Size</span>
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={sizes[p.id] === s}
                          onClick={() => setSizes((m) => ({ ...m, [p.id]: s }))}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="ttl__total">
              <div>
                <span className="eyebrow">Bundle</span>
                <span className="ttl__bundle">Full look, 3 pieces</span>
              </div>
              <div className="ttl__sum">
                <span className="tag">Free shipping</span>
                <strong>{formatPrice(lookTotal(look))}</strong>
              </div>
            </div>
            <button type="button" className="btn ttl__full" onClick={addFull} data-added={added}>
              {added ? (
                <>
                  Added <Check weight="bold" />
                </>
              ) : (
                'Add full look to bag'
              )}
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
