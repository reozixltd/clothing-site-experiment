import { ArrowsClockwise } from '@phosphor-icons/react';
import { type CSSProperties, lazy, Suspense } from 'react';
import { formatPrice, type Look } from '../data/looks';
import { LAST_VISIBLE_SLOT } from '../lib/carousel';
import { Turntable } from './Turntable';

// three.js is only downloaded when a look is opened.
const Model3D = lazy(() => import('./Model3D'));

interface Props {
  look: Look;
  /** Distance from the centre of the line-up. See lib/carousel.ts. */
  slot: number;
  /** Set when the figure wrapped around the loop and must walk in from off stage. */
  enterFrom?: 'left' | 'right';
  /** True for the centre look in the detail view: shows the pins (and the 3D model, if the look has one). */
  showPins: boolean;
  activeProduct: string | null;
  onActiveProduct: (id: string | null) => void;
  onSelect: () => void;
}

/** One model on the runway. Position, size and blur come from CSS via data-slot. */
export function Figure({ look, slot, enterFrom, showPins, activeProduct, onActiveProduct, onSelect }: Props) {
  const hidden = Math.abs(slot) > LAST_VISIBLE_SLOT;
  // Every off-stage slot shares the same CSS, so clamp to +-3.
  const cssSlot = Math.max(-3, Math.min(3, slot));

  return (
    <div className="figure" data-slot={cssSlot} data-enter={enterFrom} aria-hidden={hidden || undefined}>
      <button
        type="button"
        className="figure__hit"
        tabIndex={hidden ? -1 : 0}
        onClick={onSelect}
        aria-label={
          showPins && (look.turn || look.model)
            ? `${look.name}. Drag or use the arrow keys to turn the model`
            : showPins
              ? look.name
              : slot === 0
              ? `${look.name}: see the pieces`
              : `Go to ${look.name}`
        }
      >
        <img src={look.image} alt="" draggable={false} />
        {showPins && look.turn && <Turntable lookId={look.id} frames={look.turn} />}
        {showPins && !look.turn && look.model && (
          <Suspense fallback={null}>
            <Model3D lookId={look.model} />
          </Suspense>
        )}
        {/* Tells the visitor the centre look can be turned all the way round. */}
        {slot === 0 && (look.turn || look.model) && (
          <span className="figure__360" aria-hidden>
            <ArrowsClockwise weight="bold" />
            360°
          </span>
        )}
      </button>

      {showPins && (
        <ol className="figure__pins">
          {look.products.map((product, i) => (
            <li
              key={product.id}
              style={{ '--x': product.pin.x - 50, '--y': product.pin.y, '--z': product.pin.z, '--i': i } as CSSProperties}
            >
              <button
                type="button"
                className="pin"
                aria-pressed={activeProduct === product.id}
                aria-label={`${product.name}, ${formatPrice(product.price)}`}
                onClick={() => onActiveProduct(activeProduct === product.id ? null : product.id)}
              >
                {i + 1}
              </button>
              <span className="pin__tip" aria-hidden>
                {product.name}
                <b>{formatPrice(product.price)}</b>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
