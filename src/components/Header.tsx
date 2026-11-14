import { MagnifyingGlass, ShoppingBag, User } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import './Header.css';

// Only "Runway" and "Rail" exist in this build: sections of the one page. The other links are placeholders.
const NAV = ['Home', 'Runway', 'Rail', 'Denim', 'Atelier'];
const HREF: Record<string, string> = { Runway: '#runway', Rail: '#rail' };

export function Header({ bagCount }: { bagCount: number }) {
  // The section filling most of the screen is the current page.
  const [page, setPage] = useState('Runway');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setPage(e.target.id === 'rail' ? 'Rail' : 'Runway')),
      { rootMargin: '-50% 0px' },
    );
    ['runway', 'rail'].forEach((id) => io.observe(document.getElementById(id)!));
    return () => io.disconnect();
  }, []);

  return (
    <header className="header">
      <a className="header__brand" href="#" aria-label="Halden home">
        HALDEN
      </a>

      <nav className="header__nav" aria-label="Primary">
        {NAV.map((label) => (
          <a key={label} href={HREF[label] ?? '#'} aria-current={label === page ? 'page' : undefined}>
            {label}
          </a>
        ))}
      </nav>

      <div className="header__tools">
        <button className="header__search" type="button">
          <MagnifyingGlass aria-hidden />
          Search
        </button>
        <button className="header__icon" type="button" aria-label="Account">
          <User aria-hidden />
        </button>
        <button className="header__icon" type="button" aria-label={`Bag, ${bagCount} items`}>
          <ShoppingBag aria-hidden />
          {bagCount > 0 && <span className="header__count">{bagCount}</span>}
        </button>
      </div>
    </header>
  );
}
