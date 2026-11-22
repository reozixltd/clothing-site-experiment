import { MagnifyingGlass } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import './Header.css';

// The sections of the one page, in the order they sit in the nav.
const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'try', label: 'Try the Look' },
  { id: 'remix', label: 'Remix' },
  { id: 'fitting', label: 'Fitting Room' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'contact', label: 'Contact' },
];

export function Header({ bagCount, onOpenBag, view }: { bagCount: number; onOpenBag: () => void; view: string }) {
  // The section filling the middle of the screen is the current page.
  const [page, setPage] = useState('home');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setPage(e.target.id)),
      { rootMargin: '-50% 0px' },
    );
    // Not every section exists in every view (the checkout has none of them, so nothing is lit).
    // Re-run per view: coming back from the checkout mounts fresh section elements.
    setPage(view === 'shop' ? 'home' : '');
    if (view !== 'shop') return;
    NAV.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [view]);

  // On a phone the nav is a sideways-scrolling row: keep the lit link in sight.
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const a = nav?.querySelector<HTMLElement>('[aria-current]');
    if (!nav || !a || nav.scrollWidth <= nav.clientWidth) return;
    const left = a.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
    nav.scrollTo({ left: left - (nav.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
  }, [page]);

  return (
    <header className="header">
      <div className="header__bar">
        <a className="header__brand" href="#home" aria-label="Halden home">
          <span className="header__mark" aria-hidden />
          <span className="header__word">HALDEN</span>
          <span className="tag header__drop">Drop 04</span>
        </a>

        <nav className="header__nav" aria-label="Primary" ref={navRef}>
          {NAV.map((s) => (
            <a key={s.id} href={`#${s.id}`} aria-current={s.id === page ? 'page' : undefined}>
              {s.label}
            </a>
          ))}
        </nav>

        <div className="header__tools">
          <span className="header__cur">USD</span>
          <button className="header__icon" type="button" aria-label="Search">
            <MagnifyingGlass aria-hidden />
          </button>
          <button className="header__bag" type="button" data-bag-button onClick={onOpenBag} aria-label={`Bag, ${bagCount} items`}>
            BAG
            <span className="header__count" key={bagCount}>
              {bagCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
