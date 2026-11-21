import { MagnifyingGlass } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
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

export function Header({ bagCount, onOpenBag }: { bagCount: number; onOpenBag: () => void }) {
  // The section filling the middle of the screen is the current page.
  const [page, setPage] = useState('home');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setPage(e.target.id)),
      { rootMargin: '-50% 0px' },
    );
    // Not every section exists in every view (the checkout has none of them).
    NAV.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <header className="header">
      <div className="header__bar">
        <a className="header__brand" href="#home" aria-label="Halden home">
          <span className="header__mark" aria-hidden />
          <span className="header__word">HALDEN</span>
          <span className="tag header__drop">Drop 04</span>
        </a>

        <nav className="header__nav" aria-label="Primary">
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
