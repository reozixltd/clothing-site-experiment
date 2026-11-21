import { X } from '@phosphor-icons/react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { BOTTOM_SIZES, FIT_MODELS, TOP_SIZES } from '../data/fitting';
import { formatPrice } from '../data/looks';
import type { Piece } from '../data/rack';
import { type Job, outfitKey, queuePick, outfitSrc, pieceSrc } from '../lib/headswap';
import { useCarousel } from '../lib/useCarousel';
import { headSwap } from '../lib/swapClient';
import { TryOn } from './TryOn';
import './FittingRoom.css';
import type { NewItem } from '../lib/cart';

type Kind = 'tops' | 'bottoms';
type Wear = { top: string; bottom: string };

/**
 * The fitting room: one model centre stage, a looping carousel of tops across the torso and one
 * of bottoms across the legs. Scroll, drag or click a row and it slides one piece along; the piece
 * that slides into the centre is what the model is wearing (a cross-fade to that outfit's Flow
 * photo). Click the model (or the caption) for sizes and Add to bag.
 */
export function FittingRoom({ onAddToBag }: { onAddToBag: (item: NewItem) => void }) {
  const [modelId, setModelId] = useState<'him' | 'her'>('him');
  const model = FIT_MODELS.find((m) => m.id === modelId)!;
  const [wear, setWear] = useState<Record<string, Wear>>(() =>
    Object.fromEntries(FIT_MODELS.map((m) => [m.id, { top: m.tops[0].id, bottom: m.bottoms[0].id }])),
  );
  const { top, bottom } = wear[modelId];
  const topPiece = model.tops.find((p) => p.id === top)!;
  const bottomPiece = model.bottoms.find((p) => p.id === bottom)!;

  // "Try it on me": the visitor's photo and their swapped photos per model + outfit.
  // One swap at a time; only the latest pick waits (nextJob). No pre-swapping.
  const key = outfitKey(modelId, top, bottom);
  const [face, setFace] = useState<Blob | null>(null);
  const [swapped, setSwapped] = useState<Map<string, string>>(() => new Map());
  const swappedRef = useRef(swapped);
  swappedRef.current = swapped;
  const [job, setJob] = useState<Job>({ running: null, queued: null });
  const [onMe, setOnMe] = useState(true);
  const [tryOpen, setTryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const onMeRef = useRef<HTMLButtonElement>(null);
  const busyTimer = useRef(0);

  // Only while the visitor is looking at themselves (no hidden uploads under "On the model").
  // Switching back to "On me" also retries an outfit that failed.
  const want = () => setJob((j) => queuePick(j, key, new Set(swappedRef.current.keys()), face !== null && onMe));
  // Wait until the rows stop: scrolling past outfits must not start (and use up) swaps.
  useEffect(() => {
    const t = setTimeout(want, 500);
    return () => clearTimeout(t);
  }, [key, face, onMe]);

  // Every outfit photo of this model, warmed up so scrolling through the rows stays smooth.
  useEffect(() => {
    for (const t of model.tops) for (const b of model.bottoms) new Image().src = outfitSrc(modelId, t.id, b.id);
  }, [modelId]);

  useEffect(() => {
    const k = job.running;
    if (!k || !face) return;
    const ctl = new AbortController();
    abort.current = ctl;
    const [m, t, b] = k.split('/');
    headSwap(face, location.origin + outfitSrc(m, t, b), ctl.signal)
      .then((url) => setSwapped((s) => new Map(s).set(k, url)))
      .catch(() => {
        if (ctl.signal.aborted) return;
        setBusy(true);
        clearTimeout(busyTimer.current);
        busyTimer.current = window.setTimeout(() => setBusy(false), 6000);
      })
      .finally(() => {
        if (!ctl.signal.aborted) setJob((j) => ({ running: j.queued, queued: null }));
      });
    return () => ctl.abort();
  }, [job.running, face]);

  const cancel = () => {
    abort.current?.abort();
    setJob({ running: null, queued: null });
  };
  const removePhoto = () => {
    cancel();
    swapped.forEach((url) => URL.revokeObjectURL(url));
    setSwapped(new Map());
    setFace(null);
    setOnMe(true);
  };

  const mine = onMe ? swapped.get(key) : undefined;
  const src = mine ?? outfitSrc(modelId, top, bottom);
  const working = face !== null && onMe && !mine && (job.running === key || job.queued === key);

  // Two stacked photos: the next one loads and decodes underneath, then fades in.
  const [layers, setLayers] = useState({ a: src, b: src, front: 'a' as 'a' | 'b', changes: 0 });
  useEffect(() => {
    if (src === layers[layers.front]) return;
    let live = true;
    const img = new Image();
    img.src = src;
    img.decode().catch(() => {}).then(() => {
      if (!live) return;
      setLayers((l) => {
        const back = l.front === 'a' ? 'b' : 'a';
        return { ...l, [back]: src, front: back, changes: l.changes + 1 };
      });
    });
    return () => {
      live = false;
    };
  }, [src, layers]);

  const [open, setOpen] = useState<{ kind: Kind; piece: Piece } | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const show = (kind: Kind, piece: Piece) => {
    opener.current = document.activeElement as HTMLElement;
    setOpen({ kind, piece });
    setSize(null);
    setAdded(false);
  };
  const close = () => {
    setOpen(null);
    setTryOpen(false);
    requestAnimationFrame(() => opener.current?.focus());
  };
  const openTry = () => {
    opener.current = document.activeElement as HTMLElement;
    setTryOpen(true);
  };

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  // Capture phase, so the runway's own arrow keys don't fire while the drawer or panel is open.
  useEffect(() => {
    if (!open && !tryOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (!['Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.stopImmediatePropagation();
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  const wearPiece = (kind: Kind, id: string) =>
    setWear((w) => ({ ...w, [modelId]: { ...w[modelId], [kind === 'tops' ? 'top' : 'bottom']: id } }));

  const sizes = open?.kind === 'tops' ? TOP_SIZES : BOTTOM_SIZES;

  return (
    <section
      className="fit"
      id="fitting"
      aria-label="Fitting room"
      data-open={open !== null || tryOpen}
      style={{ '--backdrop': model.backdrop } as CSSProperties}
    >
      <div className="fit__room" inert={open !== null || tryOpen}>
        <div className="fit__bar">
          <div className="fit__heading">
            <p className="eyebrow">Mix and match</p>
            <h2 className="fit__title h-section">
              Fitting <span className="h-grey">Room</span>
            </h2>
          </div>
          <div className="fit__models" role="group" aria-label="Model">
            {FIT_MODELS.map((m) => (
              <button key={m.id} type="button" aria-pressed={m.id === modelId} onClick={() => setModelId(m.id)}>
                {m.name}
              </button>
            ))}
          </div>
          <div className="fit__try">
            {face ? (
              <>
                <div className="fit__models" role="group" aria-label="Show the outfit">
                  <button type="button" ref={onMeRef} aria-pressed={onMe} onClick={() => setOnMe(true)}>
                    On me
                  </button>
                  <button type="button" aria-pressed={!onMe} onClick={() => setOnMe(false)}>
                    On the model
                  </button>
                </div>
                <button className="fit__link" type="button" onClick={removePhoto}>
                  Remove my photo
                </button>
              </>
            ) : (
              <button className="fit__trybtn" type="button" onClick={openTry}>
                Try it on me
              </button>
            )}
          </div>
        </div>

        <div className="fit__floor">
          <div className="fit__stage" data-working={working}>
            {(['a', 'b'] as const).map((k) => (
              <img
                key={k}
                className="fit__model"
                src={layers[k]}
                data-front={layers.front === k}
                alt={layers.front === k ? `${mine ? 'You' : 'Model'} wearing the ${topPiece.name} and ${bottomPiece.name}` : ''}
                draggable={false}
              />
            ))}
            {/* The bags' shimmer (Bags.css), run over the new outfit's silhouette each time it changes. */}
            {layers.changes > 0 && !layers[layers.front].startsWith('blob:') && (
              <div
                className="bags__magic fit__magic"
                key={layers.changes}
                aria-hidden
                style={{ '--mask': `url(${layers[layers.front].replace(/([^/]+)$/, 'mask/$1')})` } as CSSProperties}
              />
            )}
          </div>
          <button
            className="fit__stagehit"
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              if ((e.clientY - r.top) / r.height < 0.45) show('tops', topPiece);
              else show('bottoms', bottomPiece);
            }}
          />
          <Row kind="tops" pieces={model.tops} worn={top} onWear={(id) => wearPiece('tops', id)} />
          <Row kind="bottoms" pieces={model.bottoms} worn={bottom} onWear={(id) => wearPiece('bottoms', id)} />
        </div>

        <p className="fit__caption">
          <button type="button" onClick={() => show('tops', topPiece)}>
            Top: {topPiece.name}
          </button>
          <span aria-hidden> · </span>
          <button type="button" onClick={() => show('bottoms', bottomPiece)}>
            Bottom: {bottomPiece.name}
          </button>
        </p>
        <p className="fit__status" aria-live="polite">
          {working ? (
            <>
              Putting you in this outfit… ~30 s{' '}
              <button className="fit__link" type="button" onClick={cancel}>
                Cancel
              </button>
            </>
          ) : busy ? (
            <>
              The free try-on service is busy. Try again in a minute.{' '}
              <button
                className="fit__link"
                type="button"
                onClick={() => {
                  setBusy(false);
                  want();
                }}
              >
                Try again
              </button>
            </>
          ) : null}
        </p>
        <p className="fit__live" aria-live="polite">
          Wearing the {topPiece.name} and {bottomPiece.name}
        </p>
      </div>

      {tryOpen && (
        <TryOn
          onClose={close}
          onPhoto={(blob) => {
            setFace(blob);
            setOnMe(true);
            setTryOpen(false);
            // The "Try it on me" button that opened the panel is gone now; land on "On me".
            requestAnimationFrame(() => onMeRef.current?.focus());
          }}
        />
      )}

      {open && (
        <div className="fit__drawer" role="dialog" aria-modal="true" aria-label={open.piece.name}>
          <button className="fit__close" type="button" ref={closeRef} onClick={close} aria-label="Close">
            <X aria-hidden />
          </button>
          <img className="fit__shot" src={pieceSrc(open.kind, open.piece.id)} alt={open.piece.name} />
          <h3 className="fit__name">{open.piece.name}</h3>
          <p className="fit__price">{formatPrice(open.piece.price)}</p>
          <div className="fit__sizes" role="group" aria-label="Size">
            {sizes.map((s) => (
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
              onAddToBag({ id: open.piece.id, name: open.piece.name, price: open.piece.price, image: pieceSrc(open.kind, open.piece.id), size: size! });
              setAdded(true);
            }}
          >
            {added ? 'Added to bag' : size ? `Add to bag, ${size}` : 'Select a size'}
          </button>
        </div>
      )}
    </section>
  );
}

/**
 * One looping row. Pieces sit by slot (-2..2, `slotOf` from the runway); slot 0 is the worn piece,
 * hidden "inside" the model. A wheel tick, a drag or an arrow key moves one piece; a click on a
 * side piece brings it to the centre.
 */
function Row({ kind, pieces, worn, onWear }: { kind: Kind; pieces: Piece[]; worn: string; onWear: (id: string) => void }) {
  const active = Math.max(0, pieces.findIndex((p) => p.id === worn));
  const { slots, wrapped, moving, step, bind } = useCarousel<HTMLUListElement>(pieces.length, active, (i) => onWear(pieces[i].id));

  return (
    <ul
      className={`fit__row fit__row--${kind}`}
      aria-label={`${kind === 'tops' ? 'Tops' : 'Bottoms'}: scroll or use the arrow keys`}
      tabIndex={0}
      data-moving={moving}
      {...bind}
    >
      {pieces.map((p, i) => {
        const sl = slots[i];
        return (
          <li
            key={p.id}
            className="fit__slot"
            data-slot={sl}
            data-wrap={wrapped[i]}
            style={{ '--n': sl, '--a': Math.abs(sl), '--s': Math.sign(sl) } as CSSProperties}
            aria-hidden={Math.abs(sl) > 2}
          >
            <button
              type="button"
              className="fit__piece"
              tabIndex={-1}
              aria-pressed={sl === 0}
              aria-label={`${p.name}, ${formatPrice(p.price)}`}
              onClick={() => step(sl)}
            >
              <img src={pieceSrc(kind, p.id)} alt="" draggable={false} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
