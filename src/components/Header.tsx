import { MagnifyingGlass, ShoppingBag, User } from '@phosphor-icons/react';
import './Header.css';

// Only "Runway" exists in this build. The other links are placeholders.
const NAV = ['Home', 'Collections', 'Denim', 'Runway', 'Atelier'];
const CURRENT = 'Runway';

export function Header({ bagCount }: { bagCount: number }) {
  return (
    <header className="header">
      <a className="header__brand" href="#" aria-label="Halden home">
        HALDEN
      </a>

      <nav className="header__nav" aria-label="Primary">
        {NAV.map((label) => (
          <a key={label} href="#" aria-current={label === CURRENT ? 'page' : undefined}>
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
