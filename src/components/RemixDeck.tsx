import { CaretLeft, CaretRight, Lightning, Lock, LockOpen, Shuffle } from '@phosphor-icons/react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { formatPrice } from '../data/looks';
import { type Layer, REMIX_LAYERS, type RemixItem } from '../data/remix';
import type { NewItem } from '../lib/cart';
import { bundle, byGender, type Gender, keepOrFirst, randomOther } from '../lib/remix';
import './RemixDeck.css';

const SIZES = ['S', 'M', 'L', 'XL'];
const FILTERS: [Gender, string][] = [
  ['all', 'All Archive'],
  ['men', 'Men'],
  ['women', 'Women'],
];
// Share of the flat-lay canvas each layer gets, top to bottom (adds up to 100).
const SHARE: Record<Layer, number> = { headwear: 18, top: 32, bottom: 36, footwear: 14 };
const pad = (n: number) => String(n).padStart(2, '0');
const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

/** The packshot, or a soft grey tile with initials if it is missing (headwear until generated). */
function Img({ item, className }: { item: RemixItem; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [item.image]);
  return failed ? (
    <span className={`remix__ph ${className ?? ''}`} aria-hidden>
      {initials(item.name)}
    </span>
  ) : (
    <img className={className} src={item.image} alt="" draggable={false} onError={() => setFailed(true)} />
  );
}

/** HH:MM:SS, ticking. */
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/** Spin the four garment tiers, lock what you like, and add the whole fit at 10% off. */
export function RemixDeck({ onAddToBag }: { onAddToBag: (item: NewItem) => void }) {
  const [gender, setGender] = useState<Gender>('all');
  const [picks, setPicks] = useState<Partial<Record<Layer, string>>>({});
  const [locked, setLocked] = useState<Partial<Record<Layer, boolean>>>({});
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [spin, setSpin] = useState(false);
  const clock = useClock();
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const rows = REMIX_LAYERS.map((l) => {
    const pool = byGender(l.items, gender);
    const item = keepOrFirst(pool, picks[l.id])!;
    return { ...l, pool, item, at: pool.indexOf(item) };
  });
  const fit = bundle(rows.map((r) => r.item.price));

  const pick = (layer: Layer, item: RemixItem) => {
    setPicks((p) => ({ ...p, [layer]: item.id }));
    setAdded(false);
  };
  const shuffle = () => {
    setPicks((p) => {
      const next = { ...p };
      for (const r of rows) if (!locked[r.id]) next[r.id] = randomOther(r.pool, r.item.id).id;
      return next;
    });
    setAdded(false);
    setSpin(true);
    timers.current.push(window.setTimeout(() => setSpin(false), 900));
  };
  const addFit = () => {
    if (!size) return;
    rows.forEach((r, i) =>
      onAddToBag({
        id: `remix:${r.item.id}`, // its own line: this one is bundle-priced
        name: r.item.name,
        price: fit.items[i],
        image: r.item.image,
        size: r.id === 'top' || r.id === 'bottom' ? size : undefined,
      }),
    );
    setAdded(true);
    timers.current.push(window.setTimeout(() => setAdded(false), 1800));
  };

  return (
    <section className="remix section" id="remix" aria-label="Remix deck">
      <div className="wrap">
        <header className="remix__head">
          <div className="remix__intro">
            <h2 className="h-section">
              4-Layer Outfit <span className="h-lime">Remix Deck.</span>
            </h2>
            <p>
              Spin individual garment tiers across every look, lock your favourite pieces, and build a custom 4-piece
              fit with an automatic 10% remix bundle rate.
            </p>
          </div>
          <div className="remix__controls">
            <div className="pills" role="group" aria-label="Filter pieces">
              {FILTERS.map(([id, label]) => (
                <button key={id} type="button" className="pill" aria-pressed={gender === id} onClick={() => setGender(id)}>
                  {label}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn--lime" onClick={shuffle}>
              <Shuffle weight="bold" aria-hidden /> Shuffle fit
            </button>
          </div>
        </header>

        <div className="remix__body">
          <div className="remix__rows">
            {rows.map((r, ri) => {
              const n = r.pool.length;
              const go = (by: number) => pick(r.id, r.pool[(r.at + by + n) % n]);
              return (
                <div
                  key={r.id}
                  className="remix__row card"
                  data-spin={spin && !locked[r.id]}
                  data-locked={!!locked[r.id]}
                  style={{ '--r': ri } as CSSProperties}
                >
                  <div className="remix__meta">
                    <span className="eyebrow">
                      {pad(ri + 1)} // {r.label}
                    </span>
                    <span className="remix__count">
                      {pad(r.at + 1)} OF {pad(n)}
                    </span>
                    <button
                      type="button"
                      className="remix__lock"
                      aria-pressed={!!locked[r.id]}
                      onClick={() => setLocked((l) => ({ ...l, [r.id]: !l[r.id] }))}
                    >
                      {locked[r.id] ? <Lock weight="fill" aria-hidden /> : <LockOpen aria-hidden />}
                      {locked[r.id] ? 'Locked' : 'Lock'}
                    </button>
                  </div>

                  <div className="remix__carousel">
                    <button type="button" className="remix__chev" aria-label={`Previous ${r.label}`} onClick={() => go(-1)}>
                      <CaretLeft weight="bold" aria-hidden />
                    </button>
                    <div
                      className="remix__stage"
                      tabIndex={0}
                      aria-label={`${r.label}: arrow keys to browse`}
                      onKeyDown={(e) => {
                        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                        e.preventDefault();
                        go(e.key === 'ArrowRight' ? 1 : -1);
                      }}
                    >
                      <div className="remix__track">
                        {r.pool.map((it, i) => {
                          // Shortest signed distance round the loop, clamped: far items wait out of sight.
                          let o = (((i - r.at) % n) + n) % n;
                          if (o > n / 2) o -= n;
                          o = Math.max(-2, Math.min(2, o));
                          return (
                            <div
                              key={it.id}
                              className="remix__cell"
                              data-o={o}
                              style={{ '--o': o } as CSSProperties}
                              aria-hidden={o !== 0}
                            >
                              <Img item={it} />
                              {o === 0 && <span className="remix__pick">Pick</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <button type="button" className="remix__chev" aria-label={`Next ${r.label}`} onClick={() => go(1)}>
                      <CaretRight weight="bold" aria-hidden />
                    </button>
                  </div>

                  <div className="remix__info" aria-live="polite">
                    <strong title={r.item.name}>{r.item.name}</strong>
                    <span>
                      {r.label} · {r.item.gender === 'all' ? 'Unisex' : r.item.gender === 'men' ? 'Men' : 'Women'}
                    </span>
                    <b>{formatPrice(r.item.price)}</b>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="remix__preview panel-dark" aria-label="Your custom stack">
            <div className="remix__bar">
              <span className="remix__clock">
                <Lightning weight="fill" aria-hidden /> Custom stack // {clock}
              </span>
              <span className="tag">Save {formatPrice(fit.save)}</span>
            </div>

            <div className="remix__canvas">
              {rows.map((r) => (
                <div key={r.id} className="remix__slot" style={{ height: `${SHARE[r.id]}%` }}>
                  <Img key={r.item.id} item={r.item} className="remix__flat" />
                  <span className="remix__label">
                    {r.id === 'top' ? 'Top layer' : r.label} <b>{formatPrice(r.item.price)}</b>
                  </span>
                </div>
              ))}
            </div>

            <div className="remix__size">
              <span className="eyebrow">Select fit size</span>
              <div className="remix__chips" role="group" aria-label="Fit size">
                {SIZES.map((s) => (
                  <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <footer className="remix__foot">
              <div>
                <span className="eyebrow">4-piece custom remix bundle</span>
                <div className="remix__total">
                  <strong>{formatPrice(fit.total)}</strong>
                  <s>{formatPrice(fit.sum)}</s>
                </div>
              </div>
              <div className="remix__add">
                <button type="button" className="btn btn--lime" disabled={!size} onClick={addFit}>
                  {added ? 'Added ✓' : 'Add remix fit'}
                </button>
                {!size && <small>Pick a size to add the fit</small>}
              </div>
            </footer>
          </aside>
        </div>
      </div>
    </section>
  );
}
