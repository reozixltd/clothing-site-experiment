import { useCallback, useEffect, useState } from 'react';
import { Cart } from './components/Cart';
import { FittingRoom } from './components/FittingRoom';
import { Header } from './components/Header';
import { Rack } from './components/Rack';
import { Bags } from './components/Bags';
import { Runway } from './components/Runway';
import { Shoes } from './components/Shoes';
import { LOOKS } from './data/looks';
import { RACK } from './data/rack';
import { addItem, type CartItem, cartCount, type NewItem, setQty } from './lib/cart';

// One scrolling page: the runway, the rail, the fitting room, the shoes, then the bags.
export function App() {
  // The bag, kept on this device so it survives a reload. There is no checkout in this build.
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('halden-bag') ?? '[]');
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('halden-bag', JSON.stringify(cart));
    } catch {
      // private mode: the bag just lasts for this visit
    }
  }, [cart]);
  const add = (item: NewItem) => setCart((c) => addItem(c, item));
  const [bagOpen, setBagOpen] = useState(false);
  const closeBag = useCallback(() => {
    setBagOpen(false);
    document.querySelector<HTMLElement>('[data-bag-button]')?.focus();
  }, []);

  // The page renders after the browser's own jump to #rail, so do it again.
  useEffect(() => {
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, []);

  return (
    <>
      <Header bagCount={cartCount(cart)} onOpenBag={() => setBagOpen(true)} />
      <main>
        <Runway looks={LOOKS} onAddToBag={add} />
        <Rack pieces={RACK} onAddToBag={add} />
        <FittingRoom onAddToBag={add} />
        <Shoes onAddToBag={add} />
        <Bags onAddToBag={add} />
      </main>
      {bagOpen && <Cart cart={cart} onQty={(k, q) => setCart((c) => setQty(c, k, q))} onClose={closeBag} />}
    </>
  );
}
