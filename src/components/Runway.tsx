import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { type PointerEvent, useEffect, useRef, useState } from 'react';
import type { Look } from '../data/looks';
import { type Direction, didWrap, mod, slotOf } from '../lib/carousel';
import { Figure } from './Figure';
import { LookRail } from './LookRail';
import './Runway.css';
import type { NewItem } from '../lib/cart';

interface Position {
  index: number;
  dir: Direction;
}

interface Props {
  looks: Look[];
  onAddToBag: (item: NewItem) => void;
}

/**
 * The whole "Shop the Look" experience.
 *
 * Two modes:
 *  - browse: a looping line-up of looks, centre one in focus
 *  - detail: the centre look alone, with a numbered pin on each piece
 */
export function Runway({ looks, onAddToBag }: Props) {
  const count = looks.length;

  // We keep the previous position too, so each figure can tell whether it
  // slid one slot (CSS transition) or wrapped around the loop (enter animation).
  const [pos, setPos] = useState<{ now: Position; prev: Position }>(() => {
    const start: Position = { index: 0, dir: 1 };
    return { now: start, prev: start };
  });
  const [detail, setDetail] = useState(false);
  const [activeProduct, setActiveProduct] = useState<string | null>(null);
  const ready = useImagesReady(looks);

  const { now, prev } = pos;
  const look = looks[now.index];

  const move = (index: number, dir: Direction) =>
    setPos((p) => ({ now: { index: mod(index, count), dir }, prev: p.now }));
  const step = (dir: Direction) => move(now.index + dir, dir);

  const closeDetail = () => {
    setDetail(false);
    setActiveProduct(null);
  };

  // Pointer handling on the stage: moving the pointer shifts the looks by depth
  // (parallax), dragging sideways changes look. Written straight to CSS variables
  // so pointer movement never re-renders React.
  const drag = useRef({ startX: 0, swiped: false });

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--px', String(((e.clientX - box.left) / box.width) * 2 - 1));
    e.currentTarget.style.setProperty('--py', String(((e.clientY - box.top) / box.height) * 2 - 1));
  };
  const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--px', '0');
    e.currentTarget.style.setProperty('--py', '0');
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { startX: e.clientX, swiped: false };
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - drag.current.startX;
    if (detail || Math.abs(dx) < 60) return;
    drag.current.swiped = true; // the click that follows a swipe must not select a figure
    // That click fires before any timer. If none comes (the drag ended on another
    // element), clear the flag so it cannot swallow a later keyboard press.
    setTimeout(() => (drag.current.swiped = false));
    step(dx < 0 ? 1 : -1);
  };

  /** Centre figure opens its detail view. Any other figure walks to the centre. */
  const selectFigure = (i: number) => {
    if (drag.current.swiped) {
      drag.current.swiped = false;
      return;
    }
    const slot = slotOf(i, now.index, now.dir, count);
    if (slot === 0) setDetail(true);
    else move(i, slot > 0 ? 1 : -1);
  };

  // Arrow keys browse, Escape leaves the detail view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDetail();
      if (detail) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const number = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <section className="runway" id="runway" data-mode={detail ? 'detail' : 'browse'} data-ready={ready} aria-label="Shop the look">
      <div className="runway__intro" key={detail ? look.id : 'browse'}>
        {detail ? (
          <>
            <p className="runway__eyebrow">Look {number(now.index)}</p>
            <h1 className="runway__title runway__title--look">{look.name}</h1>
          </>
        ) : (
          <>
            <h1 className="runway__title">Shop the Look.</h1>
            <p className="runway__sub">Six looks, styled head to toe. Open one to see every piece.</p>
          </>
        )}
      </div>

      <div
        className="runway__stage"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {looks.map((item, i) => {
          const slot = slotOf(i, now.index, now.dir, count);
          const from = slotOf(i, prev.index, prev.dir, count);
          return (
            <Figure
              key={item.id}
              look={item}
              slot={slot}
              enterFrom={didWrap(from, slot, now.dir) ? (now.dir === 1 ? 'right' : 'left') : undefined}
              showPins={detail && slot === 0}
              activeProduct={activeProduct}
              onActiveProduct={setActiveProduct}
              onSelect={() => selectFigure(i)}
            />
          );
        })}
        {detail && (
          <p className="runway__hint">
            {look.turn || look.model ? 'Drag to turn the model. ' : ''}Tap a dot to see the piece.
          </p>
        )}
      </div>

      <div className="runway__controls">
        {detail ? (
          <button className="runway__back" type="button" onClick={closeDetail}>
            <ArrowLeft aria-hidden />
            All looks
          </button>
        ) : (
          <>
            <button className="runway__arrow" type="button" onClick={() => step(-1)} aria-label="Previous look">
              <ArrowLeft aria-hidden />
            </button>
            <ol className="progress">
              {looks.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="progress__step"
                    aria-current={i === now.index ? 'true' : undefined}
                    aria-label={`Look ${number(i)}, ${item.name}`}
                    onClick={() => selectFigure(i)}
                  >
                    <span className="progress__bar" />
                    <span className="progress__label">
                      {number(i)}
                      {i === now.index && <span className="progress__name">{item.name}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <button className="runway__arrow" type="button" onClick={() => step(1)} aria-label="Next look">
              <ArrowRight aria-hidden />
            </button>
          </>
        )}
      </div>

      <LookRail look={look} activeProduct={activeProduct} onActiveProduct={setActiveProduct} onAddToBag={onAddToBag} />

      {/* Screen readers hear the look change. */}
      <p className="visually-hidden" aria-live="polite">
        Look {number(now.index)} of {number(count - 1)}: {look.name}
      </p>
    </section>
  );
}

/** False until every look photo has decoded, so the line-up appears in one go. */
function useImagesReady(looks: Look[]) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const decodes = looks.map((look) => {
      const img = new Image();
      img.src = look.image;
      return img.decode().catch(() => undefined); // a broken image must not block the page
    });
    Promise.all(decodes).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [looks]);

  return ready;
}
