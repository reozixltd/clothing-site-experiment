import {
  ArrowRight,
  ArrowUp,
  ArrowsClockwise,
  InstagramLogo,
  LockKey,
  Truck,
  XLogo,
} from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import type { NewItem } from '../lib/cart';
import './Footer.css';

const BENEFITS = [
  { Icon: Truck, title: 'Express 48-hr dispatch', text: 'Ordered by noon, packed and gone the same day.' },
  { Icon: ArrowsClockwise, title: 'Free doorstep exchanges', text: 'Wrong size? We collect and swap it at no cost.' },
  { Icon: LockKey, title: '100% secure payments', text: 'Cards, wallets and bank transfer, all encrypted.' },
];

const EXPLORE = [
  ['Hero lookbook', '#home'],
  ['Try the look', '#try'],
  ['Client stories', '#reviews'],
  ['Identity gallery', '#identity'],
  ['VIP drop 05 pass', '#drop'],
];
const SERVICES = ['Track your order', 'Doorstep size exchange', 'Shipping & returns', 'Fabric care guide'];

export function Footer(_: { onAddToBag?: (item: NewItem) => void }) {
  const [done, setDone] = useState(false);
  const mark = useRef<HTMLDivElement>(null);

  // The lime glow in the wordmark follows the pointer.
  const onMove = (e: React.PointerEvent) => {
    const el = mark.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  return (
    <footer className="footer" id="contact" onPointerMove={onMove}>
      <div className="wrap">
        <div className="footer__top">
          <div>
            <h2 className="h-section">
              Crafted For Movement.
              <br />
              <span className="footer__grey">Tailored To Stand Out.</span>
            </h2>
            <p className="footer__lede">
              Understated basics, architectural Roman weaves and a relaxed cut, made for men, women and juniors.
            </p>
          </div>
          <div className="footer__cta">
            <a className="btn btn--lime" href="#try">
              Try the look <ArrowRight weight="bold" aria-hidden />
            </a>
            <a className="btn btn--ghost" href="#drop">
              Join drop 05
            </a>
          </div>
        </div>

        <div className="footer__grid">
          <ul className="footer__perks">
            {BENEFITS.map(({ Icon, title, text }) => (
              <li key={title}>
                <span className="footer__icon">
                  <Icon aria-hidden />
                </span>
                <span>
                  <b>{title}</b>
                  {text}
                </span>
              </li>
            ))}
          </ul>

          <nav className="footer__links" aria-label="Explore">
            <h3 className="eyebrow">Explore</h3>
            {EXPLORE.map(([label, href]) => (
              <a key={label} href={href}>
                {label}
              </a>
            ))}
          </nav>

          <nav className="footer__links" aria-label="Client services">
            <h3 className="eyebrow">Client services</h3>
            {SERVICES.map((label) => (
              <a key={label} href="#contact">
                {label}
              </a>
            ))}
          </nav>

          <div className="footer__news">
            <h3 className="eyebrow">Drop notes</h3>
            <p>New drops and restocks, once a fortnight.</p>
            {done ? (
              <p className="footer__ok" role="status">
                Subscribed
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDone(true);
                }}
              >
                <input type="email" required placeholder="you@email.com" aria-label="Email address" />
                <button type="submit" aria-label="Subscribe">
                  <ArrowRight weight="bold" aria-hidden />
                </button>
              </form>
            )}
            <div className="footer__social">
              <a href="#contact" aria-label="Instagram">
                <InstagramLogo aria-hidden />
              </a>
              <a href="#contact" aria-label="X">
                <XLogo aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__mark" ref={mark} aria-hidden>
        <span className="footer__outline">HALDEN</span>
        <span className="footer__glow">HALDEN</span>
      </div>

      <div className="wrap footer__bar">
        <p>&copy; 2026 Halden — concept demo, not a real store</p>
        <button className="btn btn--ghost" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Back to top <ArrowUp weight="bold" aria-hidden />
        </button>
      </div>
    </footer>
  );
}
