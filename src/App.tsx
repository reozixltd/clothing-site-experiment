import { useCallback, useEffect, useState } from 'react';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { Drop } from './components/Drop';
import { EditorialLooks } from './components/EditorialLooks';
import { FittingRoom } from './components/FittingRoom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Identity } from './components/Identity';
import { Rack } from './components/Rack';
import { Bags } from './components/Bags';
import { RemixDeck } from './components/RemixDeck';
import { Reviews } from './components/Reviews';
import { Runway } from './components/Runway';
import { Shoes } from './components/Shoes';
import { TryTheLook } from './components/TryTheLook';
import { LOOKS } from './data/looks';
import { RACK } from './data/rack';
import { addItem, type CartItem, cartCount, type NewItem, setQty } from './lib/cart';

// One scrolling storefront, plus a checkout view at #checkout.
export function App() {
  // The bag, kept on this device so it survives a reload.
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
  const onQty = (k: string, q: number) => setCart((c) => setQty(c, k, q));
  const [bagOpen, setBagOpen] = useState(false);
  const closeBag = useCallback(() => {
    setBagOpen(false);
    document.querySelector<HTMLElement>('[data-bag-button]')?.focus();
  }, []);

  // #checkout shows the checkout view; any other hash is a section of the shop.
  const [checkout, setCheckout] = useState(() => location.hash === '#checkout');
  useEffect(() => {
    const onHash = () => setCheckout(location.hash === '#checkout');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (checkout) window.scrollTo(0, 0);
  }, [checkout]);

  // The page renders after the browser's own jump to #rail, so do it again.
  useEffect(() => {
    if (!checkout) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, [checkout]);

  return (
    <>
      <Header bagCount={cartCount(cart)} onOpenBag={() => setBagOpen(true)} />
      {checkout ? (
        <main>
          <Checkout cart={cart} onQty={onQty} onBack={() => (location.hash = '')} onPlaced={() => setCart([])} />
        </main>
      ) : (
        <main>
          <Hero />
          <TryTheLook onAddToBag={add} />
          <RemixDeck onAddToBag={add} />
          <Runway looks={LOOKS} onAddToBag={add} />
          <Rack pieces={RACK} onAddToBag={add} />
          <FittingRoom onAddToBag={add} />
          <Shoes onAddToBag={add} />
          <Bags onAddToBag={add} />
          <EditorialLooks onAddToBag={add} />
          <Identity />
          <Reviews />
          <Drop />
        </main>
      )}
      <Footer />
      {bagOpen && (
        <Cart
          cart={cart}
          onQty={onQty}
          onClose={closeBag}
          onCheckout={() => {
            setBagOpen(false);
            location.hash = 'checkout';
          }}
        />
      )}
    </>
  );
}
