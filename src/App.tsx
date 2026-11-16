import { useEffect, useState } from 'react';
import { FittingRoom } from './components/FittingRoom';
import { Header } from './components/Header';
import { Rack } from './components/Rack';
import { Runway } from './components/Runway';
import { LOOKS } from './data/looks';
import { RACK } from './data/rack';

// One scrolling page: the runway, the rail, then the fitting room.
export function App() {
  // The bag only counts items. There is no checkout in this build.
  const [bagCount, setBagCount] = useState(0);
  const add = (items: number) => setBagCount((n) => n + items);

  // The page renders after the browser's own jump to #rail, so do it again.
  useEffect(() => {
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, []);

  return (
    <>
      <Header bagCount={bagCount} />
      <main>
        <Runway looks={LOOKS} onAddToBag={add} />
        <Rack pieces={RACK} onAddToBag={add} />
        <FittingRoom onAddToBag={add} />
      </main>
    </>
  );
}
