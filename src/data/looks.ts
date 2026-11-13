/**
 * All runway content lives here. To add, remove or reorder looks, edit LOOKS.
 * Nothing else in the app needs to change.
 *
 * Product names match what each model wears in the look photo. Prices are
 * sample data. Image credits are in the README.
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  /** Whole US dollars. */
  price: number;
  /** Colourway. Shown as the thumbnail swatch when there is no product photo. */
  color: string;
  /** Optional product photo in /public/products, e.g. "/products/ringer-tee-mint.webp". */
  image?: string;
  /**
   * Where the pin sits on the model. x and y are percent of the look image
   * (0,0 = top left). z is how far the spot is in front of the model's centre,
   * in percent of the image width (negative = on the back). The pin uses z to
   * follow the 3D model when it is turned.
   */
  pin: { x: number; y: number; z: number };
}

export interface Look {
  id: string;
  name: string;
  /** Full-length cutout of the model, transparent, 500 x 1300 (5:13), feet on the bottom edge. */
  image: string;
  /**
   * Optional 3D model folder in /public/models/. When set, the detail view
   * shows a model you can turn instead of the photo. It must be the same
   * person and outfit as the image, so only set it for a matching model.
   */
  model?: string;
  /**
   * Optional real-person turntable: the number of photos in /public/turns/<id>/
   * (0.webp, 1.webp, ...), spread evenly over one full turn to the model's
   * left, starting from the front. Used instead of `model` when set.
   */
  turn?: number;
  /** Three pieces. Listed in the rail and pinned on the model in this order. */
  products: [Product, Product, Product];
}

export const LOOKS: Look[] = [
  {
    id: 'city-edit',
    name: 'The City Edit',
    image: '/looks/city-edit.webp',
    turn: 36,
    products: [
      { id: 'flight-bomber-black', name: 'Flight Bomber, Washed Black', category: 'Outerwear', price: 195, color: '#2b2e2b', image: '/products/flight-bomber-black.webp', pin: { x: 70, y: 32, z: 16 } },
      { id: 'yard-trouser-olive', name: 'Yard Carpenter Trouser, Olive', category: 'Trousers', price: 145, color: '#4a4433', image: '/products/yard-trouser-olive.webp', pin: { x: 42, y: 68, z: 12 } },
      { id: 'relay-high-white', name: 'Relay High Top, White', category: 'Footwear', price: 135, color: '#e4e4e6', image: '/products/relay-high-white.webp', pin: { x: 40, y: 95, z: 14 } },
    ],
  },
  {
    id: 'gallery-opening',
    name: 'Gallery Opening',
    image: '/looks/gallery-opening.webp',
    turn: 36,
    products: [
      { id: 'micro-print-tee', name: 'Micro Print Tee, Plum', category: 'Tops', price: 60, color: '#5a4650', image: '/products/micro-print-tee.webp', pin: { x: 59, y: 30, z: 15 } },
      { id: 'denim-mini-black', name: 'Denim Mini Skirt, Black', category: 'Skirts', price: 85, color: '#17181c', image: '/products/denim-mini-black.webp', pin: { x: 41, y: 52, z: 13 } },
      { id: 'strap-sandal-black', name: 'Ankle Strap Sandal, Black', category: 'Footwear', price: 130, color: '#1a1a1c', image: '/products/strap-sandal-black.webp', pin: { x: 39, y: 95, z: 12 } },
    ],
  },
  {
    id: 'record-run',
    name: 'Record Run',
    image: '/looks/record-run.webp',
    turn: 36,
    products: [
      { id: 'relay-track-hoodie', name: 'Relay Track Hoodie, Cobalt', category: 'Sweats', price: 130, color: '#1f3fb0', image: '/products/relay-track-hoodie.webp', pin: { x: 62, y: 38, z: 16 } },
      { id: 'loose-jean-dark', name: 'Loose Jean, Dark Wash', category: 'Denim', price: 155, color: '#3a4658', image: '/products/loose-jean-dark.webp', pin: { x: 36, y: 72, z: 12 } },
      { id: 'club-low-offwhite', name: 'Club Low, Off White', category: 'Footwear', price: 115, color: '#dcdad4', image: '/products/club-low-offwhite.webp', pin: { x: 30, y: 97, z: 14 } },
    ],
  },
  {
    id: 'studio-day',
    name: 'Studio Day',
    image: '/looks/studio-day.webp',
    turn: 36,
    products: [
      { id: 'signal-zip-hoodie', name: 'Signal Zip Hoodie, Black', category: 'Sweats', price: 110, color: '#1f2220', image: '/products/signal-zip-hoodie.webp', pin: { x: 33, y: 32, z: 15 } },
      { id: 'cuffed-denim-short', name: 'Cuffed Denim Short, Mid Blue', category: 'Shorts', price: 90, color: '#3d5a80', image: '/products/cuffed-denim-short.webp', pin: { x: 63, y: 55, z: 12 } },
      { id: 'skate-low-black', name: 'Skate Low, Black and Green', category: 'Footwear', price: 105, color: '#1b1c1e', image: '/products/skate-low-black.webp', pin: { x: 42, y: 95, z: 14 } },
    ],
  },
  {
    id: 'late-train',
    name: 'Late Train',
    image: '/looks/late-train.webp',
    turn: 36,
    products: [
      { id: 'trucker-jacket-indigo', name: 'Trucker Jacket, Worn Indigo', category: 'Outerwear', price: 180, color: '#3d5273', image: '/products/trucker-jacket-indigo.webp', pin: { x: 64, y: 31, z: 16 } },
      { id: 'straight-jean-stone', name: 'Straight Jean, Stone Wash', category: 'Denim', price: 150, color: '#9fb0c2', image: '/products/straight-jean-stone.webp', pin: { x: 36, y: 72, z: 12 } },
      { id: 'court-low-white', name: 'Court Low, White', category: 'Footwear', price: 120, color: '#e6e6e8', image: '/products/court-low-white.webp', pin: { x: 30, y: 96, z: 14 } },
    ],
  },
  {
    id: 'sunday-reset',
    name: 'Sunday Reset',
    image: '/looks/sunday-reset.webp',
    turn: 36,
    products: [
      { id: 'ringer-tee-mint', name: 'Ringer Tee, Mint', category: 'Tees', price: 50, color: '#6fc08f', image: '/products/ringer-tee-mint.webp', pin: { x: 59, y: 38, z: 15 } },
      { id: 'skinny-jean-light', name: 'Skinny Jean, Light Wash', category: 'Denim', price: 140, color: '#a9cbe0', image: '/products/skinny-jean-light.webp', pin: { x: 37, y: 71, z: 11 } },
      { id: 'ballet-flat-taupe', name: 'Ballet Flat, Taupe', category: 'Footwear', price: 95, color: '#8c7a6c', image: '/products/ballet-flat-taupe.webp', pin: { x: 42, y: 97, z: 12 } },
    ],
  },
];

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const formatPrice = (dollars: number) => usd.format(dollars);

export const lookTotal = (look: Look) => look.products.reduce((sum, p) => sum + p.price, 0);
