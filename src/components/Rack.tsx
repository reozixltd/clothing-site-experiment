import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { formatPrice } from '../data/looks';
import type { Piece } from '../data/rack';
import './Rack.css';
import type { NewItem } from '../lib/cart';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const TOUCH = matchMedia('(hover: none)').matches;

/** Hanger shots made in Flow: /rack/<id>-<view>.webp, 800 x 1000, hook top centre, one scale for all views. */
const shot = (p: Piece, view: 'front' | 'back' | 'side') => `/rack/${p.id}-${view}.webp`;

interface Props {
  pieces: Piece[];
  onAddToBag: (item: NewItem) => void;
}

/**
 * The clothes rail. Every piece hangs side-on (a real side photo); hover or focus
 * spins it on its hook to the front photo. Click opens it on its own over the
 * blurred rail, where Front / Back spins it on the hook.
 */
export function Rack({ pieces, onAddToBag }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [back, setBack] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const show = (i: number | null) => {
    setOpen(i === null ? null : (i + pieces.length) % pieces.length);
    setBack(false);
    setSize(null);
    setAdded(false);
  };

  // Focus moves into the open piece, and back to its hanger when it closes.
  const closeRef = useRef<HTMLButtonElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const was = useRef<number | null>(null);
  useEffect(() => {
    if (open !== null && was.current === null) closeRef.current?.focus();
    if (open === null && was.current !== null) rowRef.current?.querySelectorAll('button')[was.current]?.focus();
    was.current = open;
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === 'Escape') show(null);
      if (e.key === 'ArrowRight') show(open + 1);
      if (e.key === 'ArrowLeft') show(open - 1);
    };
    // Capture phase, so the runway's own arrow keys don't fire while a piece is open.
    const onKeyFirst = (e: KeyboardEvent) => {
      if (open !== null && ['Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.stopImmediatePropagation();
        onKey(e);
      }
    };
    window.addEventListener('keydown', onKeyFirst, true);
    return () => window.removeEventListener('keydown', onKeyFirst, true);
  });

  // Swipe the open piece sideways to move along the rail.
  const swipeX = useRef(0);

  const piece = open === null ? null : pieces[open];
  const label = hover === null ? null : pieces[hover];

  return (
    <section className="rack" id="rail" data-open={piece !== null} aria-label="The rail">
      <div className="rack__rail" inert={piece !== null}>
        <div className="rack__bar" />
        <ul className="rack__row" ref={rowRef} onPointerLeave={() => setHover(null)}>
          {pieces.map((p, i) => (
            <li key={p.id} className="rack__item" data-hover={hover === i} style={{ '--i': i } as CSSProperties}>
              <button
                type="button"
                className="rack__hanger"
                aria-label={`${p.name}, ${formatPrice(p.price)}`}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => show(i)}
              >
                <img className="rack__side" src={shot(p, 'side')} alt="" draggable={false} />
                <img className="rack__front" src={shot(p, 'front')} alt="" draggable={false} />
              </button>
            </li>
          ))}
        </ul>
        <p className="rack__caption" aria-hidden>
          {label ? `${label.name} · ${formatPrice(label.price)}` : TOUCH ? 'Swipe the rail, tap a piece' : 'Hover a piece to turn it round'}
        </p>
      </div>

      {piece && open !== null && (
        <div
          className="rack__detail"
          role="dialog"
          aria-modal="true"
          aria-label={piece.name}
          onTouchStart={(e) => (swipeX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - swipeX.current;
            if (Math.abs(dx) > 50) show(open + (dx < 0 ? 1 : -1));
          }}
        >
          <button className="rack__close" type="button" ref={closeRef} onClick={() => show(null)} aria-label="Back to the rail">
            <X aria-hidden />
          </button>
          <button className="rack__nav rack__nav--prev" type="button" onClick={() => show(open - 1)} aria-label="Previous piece">
            <ArrowLeft aria-hidden />
          </button>
          <button className="rack__nav rack__nav--next" type="button" onClick={() => show(open + 1)} aria-label="Next piece">
            <ArrowRight aria-hidden />
          </button>

          <div className="rack__card" key={piece.id}>
            <div className="rack__flip" data-back={back}>
              <img src={shot(piece, 'front')} alt={`${piece.name}, front`} />
              <img src={shot(piece, 'back')} alt={`${piece.name}, back`} />
            </div>

            <h2 className="rack__name">{piece.name}</h2>
            <p className="rack__price">{formatPrice(piece.price)}</p>

            <div className="rack__sides" role="group" aria-label="View">
              <button type="button" aria-pressed={!back} onClick={() => setBack(false)}>
                Front
              </button>
              <button type="button" aria-pressed={back} onClick={() => setBack(true)}>
                Back
              </button>
            </div>

            <div className="rack__sizes" role="group" aria-label="Size">
              {SIZES.map((s) => (
                <button key={s} type="button" aria-pressed={size === s} onClick={() => (setSize(s), setAdded(false))}>
                  {s}
                </button>
              ))}
            </div>

            <button
              className="rack__cta"
              type="button"
              disabled={!size || added}
              onClick={() => {
                onAddToBag({ id: piece.id, name: piece.name, price: piece.price, image: shot(piece, 'front'), size: size! });
                setAdded(true);
              }}
            >
              {added ? 'Added to bag' : size ? `Add to bag, ${size}` : 'Select a size'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
