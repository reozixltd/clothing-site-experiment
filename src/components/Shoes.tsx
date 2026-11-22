import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react';
import { type CSSProperties, useState } from 'react';
import { formatPrice } from '../data/looks';
import { SHOES, SHOE_SIZES } from '../data/shoes';
import { useCarousel } from '../lib/useCarousel';
import './Shoes.css';
import type { NewItem } from '../lib/cart';

const src = (id: string) => `/shoes/${id}.webp`;

/**
 * The shoe line-up: floating shoes on a diagonal that you scroll through. Click the front shoe and
 * the same line becomes the product view: that shoe large on the left, sizes and Add to bag on the
 * right, and every other shoe slides in from the side when picked.
 */
export function Shoes({ onAddToBag }: { onAddToBag: (item: NewItem) => void }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  // ponytail: the wheel stops at the first and last shoe so the page can scroll on; arrows and clicks loop.
  const { slots, wrapped, moving, step, bind } = useCarousel<HTMLDivElement>(
    SHOES.length,
    active,
    (i) => {
      setActive(i);
      setSize(null);
      setAdded(false);
    },
    false,
  );
  const shoe = SHOES[active];

  return (
    <section
      className="shoes"
      id="shoes"
      aria-label="Shoes"
      data-open={open}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      <div
        className="shoes__stage"
        tabIndex={0}
        aria-label="Shoes: scroll or use the arrow keys"
        data-moving={moving}
        {...bind}
      >
        <ul className="shoes__line">
          {SHOES.map((s, i) => {
            const sl = slots[i];
            return (
              <li
                key={s.id}
                className="shoes__slot"
                data-wrap={wrapped[i]}
                style={{ '--n': sl, '--a': Math.abs(sl), '--i': i } as CSSProperties}
                aria-hidden={open ? sl !== 0 : Math.abs(sl) > 2}
              >
                <button
                  type="button"
                  className="shoes__shoe"
                  tabIndex={sl === 0 && !open ? 0 : -1}
                  aria-label={sl === 0 ? `${s.name}, ${formatPrice(s.price)}: view` : s.name}
                  onClick={() => (sl === 0 ? setOpen(true) : step(sl))}
                >
                  <img src={src(s.id)} alt="" draggable={false} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="shoes__info" key={shoe.id}>
        <p className="eyebrow">Footwear</p>
        <h2 className="shoes__name h-section">{shoe.name}</h2>
        <p className="shoes__price">{formatPrice(shoe.price)}</p>
        {open ? (
          <>
            {/* Size buttons and the bag button share the fitting room's styles (FittingRoom.css). */}
            <div className="fit__sizes" role="group" aria-label="Size">
              {SHOE_SIZES.map((s) => (
                <button key={s} type="button" aria-pressed={size === s} onClick={() => (setSize(s), setAdded(false))}>
                  {s}
                </button>
              ))}
            </div>
            <button
              className="fit__cta"
              type="button"
              disabled={!size || added}
              onClick={() => {
                onAddToBag({ id: shoe.id, name: shoe.name, price: shoe.price, image: src(shoe.id), size: `EU ${size}` });
                setAdded(true);
              }}
            >
              {added ? 'Added to bag' : size ? `Add to bag, EU ${size}` : 'Select a size'}
            </button>
          </>
        ) : (
          <>
            <button className="shoes__view" type="button" onClick={() => setOpen(true)}>
              View shoe
            </button>
            <p className="shoes__hint">Scroll or swipe to browse. Tap a shoe to open it.</p>
          </>
        )}
      </div>

      {open && (
        <>
          <button className="shoes__close" type="button" onClick={() => setOpen(false)} aria-label="Back to the line-up">
            <X aria-hidden />
          </button>
          <div className="shoes__thumbs" role="group" aria-label="All shoes">
            {SHOES.map((s, i) => (
              <button key={s.id} type="button" aria-pressed={i === active} aria-label={s.name} onClick={() => step(slots[i])}>
                <img src={src(s.id)} alt="" />
              </button>
            ))}
          </div>
        </>
      )}
      <div className="shoes__nav">
        <button type="button" onClick={() => step(-1)} aria-label="Previous shoe">
          <ArrowLeft aria-hidden />
        </button>
        <span aria-hidden>
          {String(active + 1).padStart(2, '0')} / {String(SHOES.length).padStart(2, '0')}
        </span>
        <button type="button" onClick={() => step(1)} aria-label="Next shoe">
          <ArrowRight aria-hidden />
        </button>
      </div>
    </section>
  );
}
