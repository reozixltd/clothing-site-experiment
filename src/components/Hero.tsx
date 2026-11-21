import {
  ArrowRight,
  Globe,
  InstagramLogo,
  Medal,
  Play,
  Sparkle,
  Stack,
  TiktokLogo,
  Users,
  YoutubeLogo,
} from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import type { NewItem } from '../lib/cart';
import './Hero.css';

const FALLBACK = '/fitting/him/sage-linen-overshirt__stone-pleated-trouser.webp';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STATS = [
  { Icon: Stack, n: '50+', label: 'Collections' },
  { Icon: Globe, n: '30+', label: 'Countries' },
  { Icon: Users, n: '2.4K+', label: 'Happy Customers' },
];

const TICKER = 'HALDEN · DROP 04 · FREE SHIPPING OVER $150 · ';

export function Hero(_: { onAddToBag?: (item: NewItem) => void }) {
  // video, then its poster, then a studio shot: each step is only taken when the last one fails.
  const [media, setMedia] = useState<'video' | 'poster' | 'fallback'>(() => (reduced() ? 'poster' : 'video'));
  const stage = useRef<HTMLDivElement>(null);

  // A few pixels of parallax on the model, on desktop with a mouse only.
  const onMove = (e: React.PointerEvent) => {
    const el = stage.current;
    if (!el || e.pointerType !== 'mouse' || reduced()) return;
    el.style.setProperty('--px', `${(e.clientX / innerWidth - 0.5) * -14}px`);
    el.style.setProperty('--py', `${(e.clientY / innerHeight - 0.5) * -8}px`);
  };

  return (
    <section className="hero" id="home" onPointerMove={onMove}>
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">
            Summer drop 04 <span className="hero__dot" aria-hidden />
          </p>
          <h1 className="h-display hero__title">
            <span className="hero__line">
              <span>Menswear.</span>
            </span>
            <span className="hero__line hero__line--grey">
              <span className="h-grey">Redefined.</span>
            </span>
          </h1>
          <p className="hero__lede">
            Relaxed fits, soft-pleated trousers and textured weaves, cut to look easy and built to last the whole summer.
          </p>
          <div className="hero__cta">
            <a className="hero__explore" href="#try">
              Explore collection
              <span className="hero__arrow">
                <ArrowRight weight="bold" aria-hidden />
              </span>
            </a>
            <a className="hero__watch" href="#gallery">
              <Play weight="fill" aria-hidden />
              Watch lookbook
            </a>
          </div>
        </div>

        <div className="hero__stage" ref={stage}>
          {media === 'video' ? (
            <video
              className="hero__media"
              src="/hero/hero.mp4"
              poster="/hero/poster.webp"
              autoPlay
              muted
              loop
              playsInline
              aria-label="A model in a sage linen overshirt"
              onError={() => setMedia('poster')}
            />
          ) : (
            <img
              className="hero__media"
              src={media === 'poster' ? '/hero/poster.webp' : FALLBACK}
              alt="A model in a sage linen overshirt"
              onError={() => setMedia('fallback')}
            />
          )}
        </div>

        <aside className="hero__side" aria-label="Highlights">
          <div className="hero__card">
            <Medal aria-hidden />
            <div>
              <h2>Premium Quality</h2>
              <p>Durable, comfortable, timeless.</p>
            </div>
          </div>
          <div className="hero__card">
            <Sparkle aria-hidden />
            <div>
              <h2>Limited Edition</h2>
              <p>Exclusive pieces, small runs.</p>
            </div>
          </div>
          <div className="hero__card hero__card--loved">
            <div className="hero__proof">
              <span className="hero__dots" aria-hidden>
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="hero__count">2.4K+</span>
            </div>
            <h2>Loved by Thousands</h2>
            <p>Join thousands who already dress in Halden.</p>
          </div>
          <div className="hero__card hero__follow">
            <span>Follow us</span>
            <span className="hero__social">
              <a href="#contact" aria-label="Instagram">
                <InstagramLogo aria-hidden />
              </a>
              <a href="#contact" aria-label="TikTok">
                <TiktokLogo aria-hidden />
              </a>
              <a href="#contact" aria-label="YouTube">
                <YoutubeLogo aria-hidden />
              </a>
            </span>
          </div>
        </aside>

        <ul className="hero__stats">
          {STATS.map(({ Icon, n, label }) => (
            <li key={label}>
              <Icon aria-hidden />
              <span>
                <b>{n}</b>
                {label}
              </span>
            </li>
          ))}
        </ul>

        <div className="hero__ticker" aria-hidden>
          <div className="hero__track">
            <span>{TICKER.repeat(4)}</span>
            <span>{TICKER.repeat(4)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
