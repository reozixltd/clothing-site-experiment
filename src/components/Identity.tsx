import { ArrowRight } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import './Identity.css';

const IMAGES = 8;
const SLOTS = 12; // more slots than photos so the ring always has cards where the screen is
const DEG = 180 / Math.PI;
const SPEED = 3.2; // degrees per second of idle drift
// Card width and cylinder radius; the card size itself is in Identity.css.
const SIZES = { desktop: { w: 280, R: 1200 }, phone: { w: 150, R: 620 } };

/**
 * A curved image strip: cards sit on the inside of a cylinder (rotateY + translateZ), so the middle
 * is flat and close and the ends turn away. Drifts on its own, drag to scrub, the arrow steps one card.
 */
export function Identity() {
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const next = useRef<() => void>(() => {});
  const [broken, setBroken] = useState<number[]>([]);

  useEffect(() => {
    const stageEl = stage.current;
    const ringEl = ring.current;
    if (!stageEl || !ringEl) return;
    const phone = matchMedia('(max-width: 767px)');
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    let off = 0; // degrees the ring has turned
    let goal: number | null = null; // where the arrow button is sending it
    let paused = false;
    let dragging = false;
    let visible = true;
    let last = performance.now();
    let raf = 0;

    const size = () => (phone.matches ? SIZES.phone : SIZES.desktop);
    const step = () => (size().w / size().R) * DEG * 1.07;

    const draw = () => {
      const { R } = size();
      const total = SLOTS * step();
      ringEl.style.transform = `translateZ(${R}px)`;
      cards.current.forEach((el, i) => {
        if (!el) return;
        let a = (((i * step() - off) % total) + total) % total;
        if (a > total / 2) a -= total;
        el.style.transform = `rotateY(${a}deg) translateZ(${-R}px)`;
        el.style.opacity = String(Math.min(1, Math.max(0, (78 - Math.abs(a)) / 16)));
      });
    };

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (visible && !dragging) {
        if (goal !== null) {
          off += (goal - off) * (1 - Math.exp(-dt * 7));
          if (Math.abs(goal - off) < 0.02) {
            off = goal;
            goal = null;
          }
        } else if (!paused && !still.matches) off -= SPEED * dt;
      }
      if (visible) draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    next.current = () => {
      goal = (Math.round((goal ?? off) / step()) - 1) * step();
      if (still.matches) {
        off = goal;
        goal = null;
      }
    };

    let x0 = 0;
    let off0 = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      goal = null;
      x0 = e.clientX;
      off0 = off;
      stageEl.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (dragging) off = off0 + ((e.clientX - x0) / size().R) * DEG * 0.85;
    };
    const up = () => {
      dragging = false;
    };
    const pauseOn = () => {
      paused = true;
    };
    const pauseOff = () => {
      paused = false;
    };
    stageEl.addEventListener('pointerdown', down);
    stageEl.addEventListener('pointermove', move);
    stageEl.addEventListener('pointerup', up);
    stageEl.addEventListener('pointercancel', up);
    const section = stageEl.closest('section');
    section?.addEventListener('pointerenter', pauseOn);
    section?.addEventListener('pointerleave', pauseOff);
    section?.addEventListener('focusin', pauseOn);
    section?.addEventListener('focusout', pauseOff);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(stageEl);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      stageEl.removeEventListener('pointerdown', down);
      stageEl.removeEventListener('pointermove', move);
      stageEl.removeEventListener('pointerup', up);
      stageEl.removeEventListener('pointercancel', up);
      section?.removeEventListener('pointerenter', pauseOn);
      section?.removeEventListener('pointerleave', pauseOff);
      section?.removeEventListener('focusin', pauseOn);
      section?.removeEventListener('focusout', pauseOff);
    };
  }, []);

  return (
    <section id="identity" className="identity section">
      <div className="wrap identity__head reveal">
        <h2 className="h-section">
          Express Your Identity
          <br />
          With Our Unique Style
        </h2>
        <p>Showcase your true self with a collection built on clean silhouettes and honest craft, in a style that speaks before you do.</p>
      </div>

      <div className="identity__stage" ref={stage} role="group" aria-roledescription="carousel" aria-label="Customers in HALDEN">
        <div className="identity__ring" ref={ring}>
          {Array.from({ length: SLOTS }, (_, i) => {
            const n = (i % IMAGES) + 1;
            return (
              <div key={i} className="identity__card" ref={(el) => void (cards.current[i] = el)} aria-hidden={i >= IMAGES || undefined}>
                {broken.includes(n) ? null : (
                  <img src={`/editorial/${n}.webp`} alt={i < IMAGES ? `Editorial portrait ${n}` : ''} draggable={false} loading="lazy" onError={() => setBroken((b) => [...b, n])} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="wrap identity__foot">
        <div className="identity__proof">
          <span className="identity__dots" aria-hidden="true">
            <i style={{ background: '#b4352a' }} />
            <i style={{ background: '#2f5d46' }} />
            <i style={{ background: '#2a3340' }} />
          </span>
          <span>
            <strong>3.4K+ Reviews</strong>
            <small>From verified buyers</small>
          </span>
        </div>
        <a className="identity__more" href="#gallery">
          Explore more
        </a>
        <button type="button" className="identity__next" aria-label="Next photo" onClick={() => next.current()}>
          <ArrowRight weight="bold" />
        </button>
      </div>
    </section>
  );
}
