import { type PointerEvent, useEffect, useRef } from 'react';

const DRAG_SPEED = 0.01; // radians per pixel dragged
const KEY_STEP = 0.35; // radians per arrow key press
const TURN = Math.PI * 2;

/**
 * A real person you can turn: one photo every few degrees of a full turn,
 * cut from a turntable video (see the README). Drag, or press Left / Right.
 *
 * Works like Model3D.tsx, but swaps photos instead of drawing a 3D model.
 * The angle of the photo on show goes to the --yaw CSS variable, so the pins
 * follow it (see .figure__pins in Runway.css).
 */
export function Turntable({ lookId, frames }: { lookId: string; frames: number }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const yaw = useRef(0);
  const lastX = useRef<number | null>(null);
  const touched = useRef(false);

  const src = (i: number) => `/turns/${lookId}/${i}.webp`;

  const turnTo = (angle: number) => {
    yaw.current = angle;
    const i = (((Math.round((angle / TURN) * frames)) % frames) + frames) % frames;
    const img = imgRef.current;
    if (!img) return;
    if (!img.src.endsWith(src(i))) img.src = src(i);
    img.closest<HTMLElement>('.figure')?.style.setProperty('--yaw', `${(i / frames) * TURN}rad`);
  };

  useEffect(() => {
    const img = imgRef.current!;
    const figure = img.closest<HTMLElement>('.figure');
    let gone = false;
    let frame = 0;

    // Load every photo before taking over from the still, so turning never shows a gap.
    const all = Array.from({ length: frames }, (_, i) => {
      const photo = new Image();
      photo.src = src(i);
      return photo.decode();
    });
    Promise.all(all)
      .then(() => {
        if (gone) return;
        turnTo(0);
        img.dataset.ready = '';
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        // One slow look left and right, so it is obvious the model turns.
        const start = performance.now();
        const sway = (now: number) => {
          if (touched.current) return; // the visitor took over
          const t = Math.min((now - start) / 1600, 1);
          turnTo(0.5 * Math.sin(TURN * t) * (1 - t));
          if (t < 1) frame = requestAnimationFrame(sway);
        };
        frame = requestAnimationFrame(sway);
      })
      .catch(() => undefined); // a missing photo: keep the still

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') touched.current = true;
      if (e.key === 'ArrowLeft') turnTo(yaw.current - KEY_STEP);
      if (e.key === 'ArrowRight') turnTo(yaw.current + KEY_STEP);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      gone = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKey);
      figure?.style.removeProperty('--yaw');
    };
  }, [lookId, frames]);

  const onPointerDown = (e: PointerEvent<HTMLImageElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    lastX.current = e.clientX;
    touched.current = true;
  };
  const onPointerMove = (e: PointerEvent<HTMLImageElement>) => {
    if (lastX.current === null) return;
    turnTo(yaw.current + (e.clientX - lastX.current) * DRAG_SPEED);
    lastX.current = e.clientX;
  };
  const onPointerEnd = () => {
    lastX.current = null;
  };

  return (
    <img
      ref={imgRef}
      className="figure__model"
      alt=""
      draggable={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    />
  );
}
