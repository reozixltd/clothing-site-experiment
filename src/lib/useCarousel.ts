import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from 'react';
import { type Direction, didWrap, mod, slotOf } from './carousel';

/**
 * The moves of a looping carousel: one step per wheel tick, touch swipe or arrow key.
 * Spread `bind` on the element that listens. `slots[i]` is item i's distance from the centre and
 * `wrapped[i]` says it just went round the back of the loop. `moving` is true while a step slides.
 * With `loop` off, the wheel stops at the first and last item and lets the page scroll on.
 */
export function useCarousel<E extends HTMLElement>(count: number, active: number, go: (index: number) => void, loop = true) {
  const [dir, setDir] = useState<Direction>(1);
  const prev = useRef<number[]>([]);
  const [moving, setMoving] = useState(false);
  const lock = useRef(0);
  const wheel = useRef(0);
  const drag = useRef<{ x: number; id: number } | null>(null);

  const slots = Array.from({ length: count }, (_, i) => slotOf(i, active, dir, count));
  const wrapped = slots.map((sl, i) => prev.current[i] !== undefined && didWrap(prev.current[i], sl, dir));
  useEffect(() => {
    prev.current = slots;
  });

  const step = (by: number) => {
    if (!by) return;
    setDir(by > 0 ? 1 : -1);
    setMoving(true);
    clearTimeout(lock.current);
    lock.current = window.setTimeout(() => setMoving(false), 450);
    go(mod(active + by, count));
  };

  // One item per wheel gesture tick; horizontal trackpad swipes and vertical wheels both work.
  const onWheel = (e: WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (!d) return;
    const next = active + Math.sign(d);
    if (!loop && (next < 0 || next >= count)) return;
    e.preventDefault();
    if (moving) return;
    wheel.current += d;
    if (Math.abs(wheel.current) < 30) return;
    step(wheel.current > 0 ? 1 : -1);
    wheel.current = 0;
  };

  // React's onWheel is passive, so preventDefault there can't stop the page scrolling.
  const ref = useRef<E>(null);
  const wheelFn = useRef(onWheel);
  wheelFn.current = onWheel;
  useEffect(() => {
    const el = ref.current!;
    const h = (e: WheelEvent) => wheelFn.current(e);
    el.addEventListener('wheel', h, { passive: false });
    return () => el.removeEventListener('wheel', h);
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    e.stopPropagation(); // the runway listens for arrows on window
    step(e.key === 'ArrowRight' ? 1 : -1);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return; // mice use the wheel and clicks
    drag.current = { x: e.clientX, id: e.pointerId };
  };
  const onPointerUp = (e: PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  };

  return {
    slots,
    wrapped,
    moving,
    step,
    bind: { ref, onKeyDown, onPointerDown, onPointerUp, onPointerCancel: () => void (drag.current = null) },
  };
}
