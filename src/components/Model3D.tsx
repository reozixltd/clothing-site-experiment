import { type PointerEvent, useEffect, useRef } from 'react';
import { type Avatar, createAvatar } from '../lib/avatar';

const DRAG_SPEED = 0.01; // radians per pixel dragged
const KEY_STEP = 0.35; // radians per arrow key press

/**
 * The rotatable 3D model in the detail view. Sits on top of the look image
 * and replaces it once loaded. Drag, or use the Left / Right keys, to turn it.
 *
 * The angle is written to a --yaw CSS variable on the figure, which is how the
 * pins follow the model (see .figure__pins in Runway.css). No React state, so
 * turning never re-renders.
 *
 * Loaded lazily by Figure.tsx, so three.js is only downloaded when a look is opened.
 * If WebGL is not available the image simply stays.
 */
export default function Model3D({ lookId }: { lookId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatar = useRef<Avatar | null>(null);
  const yaw = useRef(0);
  const lastX = useRef<number | null>(null);
  const touched = useRef(false);

  const turnTo = (angle: number) => {
    yaw.current = angle;
    avatar.current?.draw(angle);
    canvasRef.current?.closest<HTMLElement>('.figure')?.style.setProperty('--yaw', `${angle}rad`);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const figure = canvas.closest<HTMLElement>('.figure');
    let gone = false;
    let frame = 0;

    createAvatar(canvas, lookId)
      .then((loaded) => {
        if (gone) return loaded.dispose();
        avatar.current = loaded;
        turnTo(0);
        canvas.dataset.ready = '';
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        // One slow look left and right, so it is obvious the model turns.
        const start = performance.now();
        const sway = (now: number) => {
          if (touched.current) return; // the visitor took over
          const t = Math.min((now - start) / 1600, 1);
          turnTo(0.5 * Math.sin(Math.PI * 2 * t) * (1 - t));
          if (t < 1) frame = requestAnimationFrame(sway);
        };
        frame = requestAnimationFrame(sway);
      })
      .catch(() => undefined); // no WebGL: keep the image

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') touched.current = true;
      if (e.key === 'ArrowLeft') turnTo(yaw.current - KEY_STEP);
      if (e.key === 'ArrowRight') turnTo(yaw.current + KEY_STEP);
    };
    const redraw = () => avatar.current?.draw(yaw.current);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', redraw);

    return () => {
      gone = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', redraw);
      figure?.style.removeProperty('--yaw');
      avatar.current?.dispose();
      avatar.current = null;
    };
  }, [lookId]);

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    lastX.current = e.clientX;
    touched.current = true;
  };
  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (lastX.current === null) return;
    turnTo(yaw.current + (e.clientX - lastX.current) * DRAG_SPEED);
    lastX.current = e.clientX;
  };
  const onPointerEnd = () => {
    lastX.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className="figure__model"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    />
  );
}
