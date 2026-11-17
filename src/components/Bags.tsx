import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { type CSSProperties, useState } from 'react';
import { BAGS } from '../data/bags';
import { formatPrice } from '../data/looks';
import { useCarousel } from '../lib/useCarousel';
import './Bags.css';

/**
 * "One model. Every bag." One model stands in front of the headline; the bags hang on a diagonal
 * line behind her. Each scroll step moves the line one bag on and puts that bag in her hand.
 */
export function Bags({ onAddToBag }: { onAddToBag: (items: number) => void }) {
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);
  // ponytail: the wheel stops at the first and last bag so the page can scroll on; arrows and clicks loop.
  const { slots, wrapped, step, bind } = useCarousel<HTMLDivElement>(
    BAGS.length,
    active,
    (i) => {
      setActive(i);
      setAdded(false);
    },
    false,
  );
  const bag = BAGS[active];

  return (
    <section className="bags" id="bags" aria-label="Bags">
      <div className="bags__stage" tabIndex={0} aria-label="Bags: scroll or use the arrow keys" {...bind}>
        <h2 className="bags__title">
          One model.
          <br />
          Every bag.
        </h2>
        <ul className="bags__line">
          {BAGS.map((b, i) => (
            <li
              key={b.id}
              className="bags__slot"
              data-wrap={wrapped[i]}
              style={{ '--n': slots[i], '--a': Math.abs(slots[i]) } as CSSProperties}
            >
              <button type="button" tabIndex={-1} aria-label={b.name} onClick={() => step(slots[i])}>
                <img src={`/bags/${b.id}.webp`} alt="" draggable={false} />
              </button>
            </li>
          ))}
        </ul>
        {BAGS.map((b, i) => (
          <img
            key={b.id}
            className="bags__model"
            data-on={i === active}
            src={`/bags/model/${b.id}.webp`}
            alt={i === active ? `Model holding ${b.name}` : ''}
            draggable={false}
          />
        ))}
      </div>

      <div className="bags__info" key={bag.id}>
        <h3 className="bags__name">{bag.name}</h3>
        <p className="bags__note">{bag.note}</p>
        <p className="bags__price">{formatPrice(bag.price)}</p>
        {/* The bag button shares the fitting room's style (FittingRoom.css). */}
        <button
          className="fit__cta"
          type="button"
          disabled={added}
          onClick={() => {
            onAddToBag(1);
            setAdded(true);
          }}
        >
          {added ? 'Added to bag' : 'Add to bag'}
        </button>
      </div>

      <div className="bags__card" key={`card-${bag.id}`} aria-hidden>
        <img src={`/bags/${bag.id}.webp`} alt="" />
        <span>
          {String(active + 1).padStart(2, '0')} / {String(BAGS.length).padStart(2, '0')}
        </span>
      </div>

      {/* The arrows share the shoe line-up's style (Shoes.css). */}
      <div className="shoes__nav">
        <button type="button" onClick={() => step(-1)} aria-label="Previous bag">
          <ArrowLeft aria-hidden />
        </button>
        <button type="button" onClick={() => step(1)} aria-label="Next bag">
          <ArrowRight aria-hidden />
        </button>
      </div>
    </section>
  );
}
