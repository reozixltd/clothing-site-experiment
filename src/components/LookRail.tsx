import { ArrowRight, Check, Plus } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { formatPrice, type Look, lookTotal, type Product } from '../data/looks';
import './LookRail.css';
import type { NewItem } from '../lib/cart';

interface Props {
  look: Look;
  activeProduct: string | null;
  onActiveProduct: (id: string | null) => void;
  onAddToBag: (item: NewItem) => void;
}

/** "In this look": the pieces the centre model is wearing, the total, and the buy button. */
export function LookRail({ look, activeProduct, onActiveProduct, onAddToBag }: Props) {
  const [added, setAdded] = useState(false);
  // The pieces added one by one, shown with a tick until the look changes.
  const [one, setOne] = useState<Set<string>>(() => new Set());
  const bag = (p: Product) => onAddToBag({ id: p.id, name: p.name, price: p.price, image: p.image });

  // Show "Added" briefly, and reset straight away when the look changes.
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [added]);
  useEffect(() => {
    setAdded(false);
    setOne(new Set());
  }, [look.id]);

  return (
    <aside className="rail" aria-label="In this look">
      <div>
        <p className="eyebrow">Every piece, one tap</p>
        <h2 className="rail__heading h-section">
          In this <span className="h-grey">look</span>
        </h2>
      </div>

      {/* key restarts the fade-in whenever the look changes */}
      <ol className="rail__list" key={look.id}>
        {look.products.map((product, i) => (
          <li
            key={product.id}
            className="rail__item"
            data-active={activeProduct === product.id}
            style={{ animationDelay: `${i * 60}ms` }}
            onMouseEnter={() => onActiveProduct(product.id)}
            onMouseLeave={() => onActiveProduct(null)}
          >
            <span className="rail__thumb" style={{ background: product.image ? undefined : product.color }}>
              {product.image && <img src={product.image} alt="" />}
            </span>
            <span className="rail__text">
              <span className="rail__category">{product.category}</span>
              <span className="rail__name">{product.name}</span>
              <span className="rail__price">{formatPrice(product.price)}</span>
            </span>
            <button
              className="rail__add"
              type="button"
              data-added={one.has(product.id)}
              aria-label={one.has(product.id) ? `${product.name} added to bag, add another` : `Add ${product.name} to bag`}
              onClick={() => {
                bag(product);
                setOne((s) => new Set(s).add(product.id));
              }}
            >
              {one.has(product.id) ? <Check aria-hidden /> : <Plus aria-hidden />}
            </button>
          </li>
        ))}
      </ol>

      <div className="rail__buy">
        <p className="rail__total">
          <span>Complete the look</span>
          <b>{formatPrice(lookTotal(look))}</b>
        </p>
        <button
          className="rail__cta"
          type="button"
          onClick={() => {
            look.products.forEach(bag);
            setAdded(true);
          }}
        >
          {added ? 'Added to bag' : 'Add all to bag'}
          {added ? <Check aria-hidden /> : <ArrowRight aria-hidden />}
        </button>
      </div>
    </aside>
  );
}
