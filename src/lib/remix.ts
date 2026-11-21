export type Gender = 'men' | 'women' | 'all';

/** Pieces a filter lets through: 'all' shows everything, otherwise that gender plus the unisex ones. */
export const byGender = <T extends { gender: Gender }>(items: T[], filter: Gender) =>
  filter === 'all' ? items : items.filter((i) => i.gender === 'all' || i.gender === filter);

/** Keep the current pick if it is still in the pool, else the first. */
export const keepOrFirst = <T extends { id: string }>(pool: T[], id: string | undefined) =>
  pool.find((i) => i.id === id) ?? pool[0];

/** A random pool member other than the current one (the only one, if the pool has just one). */
export function randomOther<T extends { id: string }>(pool: T[], id: string | undefined, rnd = Math.random) {
  const rest = pool.filter((i) => i.id !== id);
  const from = rest.length ? rest : pool;
  return from[Math.floor(rnd() * from.length)];
}

/**
 * The remix bundle: 10% off the whole. `total` is the sum less 10%, in whole dollars; `items` are each
 * piece's discounted price, whole dollars too, adjusted on the dearest piece so they add up to `total`.
 */
export function bundle(prices: number[]) {
  const sum = prices.reduce((a, b) => a + b, 0);
  const total = Math.round((sum * 9) / 10);
  const items = prices.map((p) => Math.round((p * 9) / 10));
  const diff = total - items.reduce((a, b) => a + b, 0);
  if (diff && items.length) items[prices.indexOf(Math.max(...prices))] += diff;
  return { sum, total, save: sum - total, items };
}
