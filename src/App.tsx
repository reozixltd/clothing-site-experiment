import { useState } from 'react';
import { Header } from './components/Header';
import { Runway } from './components/Runway';
import { LOOKS } from './data/looks';

export function App() {
  // The bag only counts items. There is no checkout in this build.
  const [bagCount, setBagCount] = useState(0);

  return (
    <>
      <Header bagCount={bagCount} />
      <main>
        <Runway looks={LOOKS} onAddToBag={(items) => setBagCount((n) => n + items)} />
      </main>
    </>
  );
}
