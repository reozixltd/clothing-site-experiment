// The pieces on the rail. Shots: public/rack/<id>-front|back|side.webp (see README).
export interface Piece {
  id: string;
  name: string;
  price: number;
}

export const RACK: Piece[] = [
  { id: 'oat-heavyweight-hoodie', name: 'Heavyweight Hoodie', price: 145 },
  { id: 'navy-varsity-jacket', name: 'Varsity Jacket', price: 420 },
  { id: 'pine-zip-hoodie', name: 'Zip Hoodie', price: 155 },
  { id: 'rust-coach-jacket', name: 'Coach Jacket', price: 210 },
  { id: 'brick-dyed-hoodie', name: 'Garment-Dyed Hoodie', price: 150 },
  { id: 'cocoa-cord-trucker', name: 'Cord Trucker', price: 295 },
  { id: 'grey-marl-hoodie', name: 'Classic Hoodie', price: 120 },
  { id: 'olive-liner-jacket', name: 'Quilted Liner', price: 240 },
  { id: 'ecru-sherpa-jacket', name: 'Sherpa Fleece', price: 260 },
  { id: 'burgundy-track-jacket', name: 'Track Jacket', price: 180 },
];
