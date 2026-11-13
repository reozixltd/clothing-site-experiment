import { ArrowRight, Check } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { formatPrice, type Look, lookTotal } from '../data/looks';
import './LookRail.css';

interface Props {
  look: Look;
  activeProduct: string | null;
  onActiveProduct: (id: string | null) => void;
  onAddToBag: (items: number) => void;
}

/** "In this look": the pieces the centre model is wearing, the total, and the buy button. */
export function LookRail({ look, activeProduct, onActiveProduct, onAddToBag }: Props) {
  const [added, setAdded] = useState(false);

  // Show "Added" briefly, and reset straight away when the look changes.
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [added]);
  useEffect(() => setAdded(false), [look.id]);

  return (
    <aside className="rail" aria-label="In this look">
      <h2 className="rail__heading">In this look</h2>

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
            onAddToBag(look.products.length);
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
