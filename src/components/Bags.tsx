import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { BAGS } from '../data/bags';
import { formatPrice } from '../data/looks';
import { useCarousel } from '../lib/useCarousel';
import './Bags.css';
import type { NewItem } from '../lib/cart';

const pack = (id: string) => `/bags/${id}.webp`;
const worn = (id: string) => `/bags/model/${id}.webp`;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * "One model. Every bag." One model stands in front of the headline; the bags hang on a diagonal
 * line behind her. Each scroll step moves the line one bag on and puts that bag in her hand, in her
 * own pose for it, with a shimmer over her as it changes. The first time the section comes into
 * view, the bags swirl in a ring while a counter runs to 100.
 */
export function Bags({ onAddToBag }: { onAddToBag: (item: NewItem) => void }) {
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
        <div className="bags__head">
          <p className="eyebrow">The bag edit</p>
          <h2 className="bags__title">
            One model.
            <br />
            <span className="h-grey">Every bag.</span>
          </h2>
        </div>
        <ul className="bags__line">
          {BAGS.map((b, i) => (
            <li
              key={b.id}
              className="bags__slot"
              data-wrap={wrapped[i]}
              style={{ '--n': slots[i], '--a': Math.abs(slots[i]) } as CSSProperties}
            >
              <button type="button" tabIndex={-1} aria-label={b.name} onClick={() => step(slots[i])}>
                <img src={pack(b.id)} alt="" draggable={false} />
                <span className="bags__label">{b.name}</span>
              </button>
            </li>
          ))}
        </ul>
        {BAGS.map((b, i) => (
          <img
            key={b.id}
            className="bags__model"
            data-on={i === active}
            src={worn(b.id)}
            alt={i === active ? `Model carrying ${b.name}` : ''}
            draggable={false}
          />
        ))}
        {/* The shimmer: a band of light that runs up her, cut to her silhouette. Keyed, so it restarts on every change. */}
        <div
          className="bags__magic"
          key={`magic-${bag.id}`}
          aria-hidden
          style={{ '--mask': `url(${worn(bag.id)})` } as CSSProperties}
        />
      </div>

      <div className="bags__info" key={bag.id}>
        <p className="bags__kicker eyebrow">
          {pad(active + 1)} / {pad(BAGS.length)} · {bag.kind}
        </p>
        <h3 className="bags__name">{bag.name}</h3>
        <p className="bags__note">{bag.note}</p>
        <dl className="bags__details">
          {bag.details.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="bags__price">{formatPrice(bag.price)}</p>
        {/* The bag button shares the fitting room's style (FittingRoom.css). */}
        <button
          className="fit__cta"
          type="button"
          disabled={added}
          onClick={() => {
            onAddToBag({ id: bag.id, name: bag.name, price: bag.price, image: pack(bag.id) });
            setAdded(true);
          }}
        >
          {added ? 'Added to bag' : 'Add to bag'}
        </button>
      </div>

      <div className="bags__card" key={`card-${bag.id}`} aria-hidden>
        <img src={pack(bag.id)} alt="" />
        <span className="bags__cardname">{bag.name}</span>
        <span>{formatPrice(bag.price)}</span>
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

      <Intro slots={slots} />
    </section>
  );
}

/**
 * The intro: the bags fly into a turning ring while a counter runs 000 to 100, then each bag flies to
 * its place on the diagonal line (`slots`, the line's own positions) as the cover clears, and the real
 * line takes over.
 */
function Intro({ slots }: { slots: number[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'wait' | 'run' | 'out' | 'done'>(() =>
    matchMedia('(prefers-reduced-motion: reduce)').matches ? 'done' : 'wait',
  );

  // Start once, the first time the section is mostly on screen.
  useEffect(() => {
    if (phase !== 'wait') return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setPhase('run'), { threshold: 0.5 });
    io.observe(ref.current!.parentElement!);
    return () => io.disconnect();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'run') return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 2600);
      setCount(Math.round(100 * (1 - (1 - p) ** 2)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setPhase('out');
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'out') return;
    const t = setTimeout(() => setPhase('done'), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'done') return null;
  return (
    <div
      className="bags__intro"
      ref={ref}
      data-phase={phase}
      aria-hidden
    >
      <ul className="bags__ring">
        {BAGS.map((b, i) => (
          <li key={b.id} style={{ '--i': i, '--of': BAGS.length, '--n': slots[i], '--a': Math.abs(slots[i]) } as CSSProperties}>
            <img src={pack(b.id)} alt="" />
          </li>
        ))}
      </ul>
      <p className="bags__count">
        {String(count).padStart(3, '0')}
        <small>%</small>
      </p>
    </div>
  );
}
