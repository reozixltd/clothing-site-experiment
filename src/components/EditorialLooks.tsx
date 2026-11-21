import { ArrowUpRight, Check, Plus } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { FIT_LOOKS, LOOK_INFO } from '../data/editorial';
import { FIT_MODELS } from '../data/fitting';
import { formatPrice, LOOKS } from '../data/looks';
import type { NewItem } from '../lib/cart';
import './EditorialLooks.css';

interface Piece {
  id: string;
  name: string;
  price: number;
  image: string;
}
interface Card {
  id: string;
  name: string;
  blurb: string;
  gender: 'M' | 'W';
  image: string;
  /** Fitting photos sit on #ececea, runway cutouts are transparent. */
  bg: string;
  pieces: Piece[];
}

const BUNDLE = 0.9; // the full-look price: every piece at 90%, rounded to whole dollars
const bundlePrice = (p: number) => Math.round(p * BUNDLE);

const runway: Card[] = LOOKS.map((l) => ({
  id: l.id,
  name: l.name,
  blurb: LOOK_INFO[l.id].blurb,
  gender: LOOK_INFO[l.id].gender,
  image: l.image,
  bg: '#f1f1ef',
  pieces: l.products.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image ?? '' })),
}));

const fitting: Card[] = FIT_LOOKS.map(([m, top, bottom, name, blurb]) => {
  const model = FIT_MODELS.find((f) => f.id === m)!;
  const t = model.tops.find((p) => p.id === top)!;
  const b = model.bottoms.find((p) => p.id === bottom)!;
  return {
    id: `${m}-${top}`,
    name,
    blurb,
    gender: m === 'him' ? 'M' : 'W',
    image: `/fitting/${m}/${top}__${bottom}.webp`,
    bg: model.backdrop,
    pieces: [
      { ...t, image: `/fitting/tops/${top}.webp` },
      { ...b, image: `/fitting/bottoms/${bottom}.webp` },
    ],
  };
});

// Runway and fitting-room looks alternate down the grid.
const CARDS = runway.flatMap((c, i) => [c, fitting[i]]);

/** A grid of styled outfits, each with a bundle price for the whole look. */
export function EditorialLooks({ onAddToBag }: { onAddToBag: (item: NewItem) => void }) {
  const top = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const flash = (id: string) => {
    setAdded(id);
    setTimeout(() => setAdded((a) => (a === id ? null : a)), 1800);
  };

  return (
    <section className="section edl" id="gallery" ref={top} aria-labelledby="edl-title">
      <div className="wrap">
        <header className="edl__head">
          <div>
            <p className="eyebrow">6 pieces styled outfits · bundle save 10%</p>
            <h2 className="h-section" id="edl-title">
              Editorial Looks ({CARDS.length})
            </h2>
          </div>
          <a
            className="edl__all"
            href="#gallery"
            onClick={(e) => {
              e.preventDefault();
              top.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View all {CARDS.length} looks <ArrowUpRight weight="bold" />
          </a>
        </header>

        <ul className="edl__grid">
          {CARDS.map((c, i) => {
            const full = c.pieces.reduce((s, p) => s + p.price, 0);
            const bundle = c.pieces.reduce((s, p) => s + bundlePrice(p.price), 0);
            const isOpen = open === c.id;
            return (
              <li key={c.id} className="edl__card card reveal">
                <div className="edl__bar">
                  <span className="edl__no">
                    Look {String(i + 1).padStart(2, '0')} · {c.gender}
                  </span>
                  <span className="tag">Save {formatPrice(full - bundle)}</span>
                </div>
                <div className="edl__img" style={{ background: c.bg }}>
                  <img src={c.image} alt={c.name} loading="lazy" />
                  <ul className="edl__thumbs">
                    {c.pieces.map((p) => (
                      <li key={p.id} title={p.name}>
                        <img src={p.image} alt={p.name} loading="lazy" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="edl__body">
                  <div className="edl__title">
                    <h3>{c.name}</h3>
                    <p className="edl__price">
                      <strong>{formatPrice(bundle)}</strong>
                      <s>{formatPrice(full)}</s>
                    </p>
                  </div>
                  <p className="edl__blurb">{c.blurb}</p>
                  <div className="edl__actions">
                    <button
                      type="button"
                      className="btn edl__add"
                      data-added={added === c.id}
                      onClick={() => {
                        c.pieces.forEach((p) =>
                          onAddToBag({ id: `${p.id}~bundle`, name: `${p.name} (bundle)`, price: bundlePrice(p.price), image: p.image }),
                        );
                        flash(c.id);
                      }}
                    >
                      {added === c.id ? (
                        <>
                          Added <Check weight="bold" />
                        </>
                      ) : (
                        'Add full look'
                      )}
                    </button>
                    <button
                      type="button"
                      className="edl__inspect"
                      aria-expanded={isOpen}
                      aria-controls={`edl-${c.id}`}
                      onClick={() => setOpen(isOpen ? null : c.id)}
                    >
                      Inspect <ArrowUpRight weight="bold" />
                    </button>
                  </div>
                  {isOpen && (
                    <ul className="edl__pieces" id={`edl-${c.id}`}>
                      {c.pieces.map((p) => (
                        <li key={p.id}>
                          <span>
                            {p.name}
                            <small>{formatPrice(p.price)}</small>
                          </span>
                          <button
                            type="button"
                            aria-label={`Add ${p.name}`}
                            onClick={() => onAddToBag({ id: p.id, name: p.name, price: p.price, image: p.image })}
                          >
                            <Plus weight="bold" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
