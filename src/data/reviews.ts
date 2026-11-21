export type Review = { quote: string; name: string; city: string; piece: string; bg: string; fg: string };

const SAGE = '#9fb48a';
const CLAY = '#d9a58a';
const SKY = '#9fb8d6';
const SAND = '#e3d3a8';
const INK = '#0b0b0c';
const LIME = '#d6ff1f';
const ON = '#0b0b0c';

export const REVIEWS: Review[] = [
  { quote: 'The Flight Bomber has the weight of something twice the price. Zips feel heavy, the cropped fit sits right on the hip.', name: 'Marcus Reid', city: 'Manchester', piece: 'Flight Bomber', bg: INK, fg: LIME },
  { quote: 'Wore the Yard Carpenter Trouser for a full week of site visits and dinners. Still sharp, still comfortable.', name: 'Tomas Berg', city: 'Malmo', piece: 'Yard Carpenter Trouser', bg: SAGE, fg: ON },
  { quote: 'The Sage Linen Overshirt drapes the way linen should. It breathes in July and layers fine in October.', name: 'Idris Okafor', city: 'London', piece: 'Sage Linen Overshirt', bg: CLAY, fg: ON },
  { quote: 'Court Low is the cleanest white sneaker I have owned. No logo noise, and the leather broke in after two days.', name: 'Jonah Park', city: 'Seattle', piece: 'Court Low', bg: SKY, fg: ON },
  { quote: 'Relay Runner fits true to size, cushioned enough for a long commute and quiet enough for the office.', name: 'Elias Moretti', city: 'Milan', piece: 'Relay Runner', bg: SAND, fg: ON },
  { quote: 'Ordered a size up on the Indigo Chore Coat by mistake. The exchange took a day and the second fit was perfect.', name: 'Callum Doyle', city: 'Dublin', piece: 'Indigo Chore Coat', bg: INK, fg: LIME },
  { quote: 'The Charcoal Merino Crew does not pill and does not itch. I now own it in every colour they make.', name: 'Rafael Diaz', city: 'Madrid', piece: 'Charcoal Merino Crew', bg: SKY, fg: ON },
  { quote: 'Stone Pleated Trouser has a lovely fall. Wore them to a wedding and then straight to the pub.', name: 'Owen Hartley', city: 'Leeds', piece: 'Stone Pleated Trouser', bg: SAND, fg: ON },
  { quote: 'The Trucker Jacket in Worn Indigo looks like it has been mine for years. Great shoulders, no stiffness.', name: 'Kenji Mori', city: 'Vancouver', piece: 'Trucker Jacket', bg: SAGE, fg: ON },
  { quote: 'Plain packaging, fast delivery, and the Rust Corduroy Overshirt looks better in person than on the site.', name: 'Luca Ferreira', city: 'Lisbon', piece: 'Rust Corduroy Overshirt', bg: CLAY, fg: ON },
];

export const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('');
