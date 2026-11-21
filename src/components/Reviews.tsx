import { Star } from '@phosphor-icons/react';
import { initials, REVIEWS, type Review } from '../data/reviews';
import './Reviews.css';

const ROWS = [REVIEWS.slice(0, 5), REVIEWS.slice(5)];

function Card({ r }: { r: Review }) {
  return (
    <figure className="review">
      <span className="review__mark" aria-hidden="true">
        &ldquo;
      </span>
      <blockquote>{r.quote}</blockquote>
      <figcaption>
        <span className="review__avatar" style={{ background: r.bg, color: r.fg }} aria-hidden="true">
          {initials(r.name)}
        </span>
        <span>
          <strong>{r.name}</strong>
          <small>
            {r.city} · {r.piece}
          </small>
        </span>
      </figcaption>
    </figure>
  );
}

/** Two rows of testimonials drifting in opposite directions; the list is doubled so the loop has no seam. */
export function Reviews() {
  return (
    <section id="reviews" className="reviews section">
      <div className="wrap reviews__head reveal">
        <h2 className="h-section">
          Every Fit Tells A<br />
          Story, Here&rsquo;s Theirs.
        </h2>
        <div className="reviews__score">
          <span className="reviews__faces" aria-hidden="true">
            {REVIEWS.slice(0, 3).map((r) => (
              <i key={r.name} style={{ background: r.bg, color: r.fg }}>
                {initials(r.name)}
              </i>
            ))}
          </span>
          <span>
            <span className="reviews__stars">
              <span aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} weight="fill" />
                ))}
              </span>
              <strong>4.9/5</strong>
              <span className="visually-hidden">rated 4.9 out of 5</span>
            </span>
            <small>Trusted by 2.4K+ customers</small>
          </span>
        </div>
      </div>

      <div className="reviews__rows">
        {ROWS.map((row, i) => (
          <div key={i} className={`marquee${i ? ' marquee--back' : ''}`}>
            <div className="marquee__track">
              {[0, 1].map((copy) => (
                <div key={copy} className="marquee__half" aria-hidden={copy ? true : undefined}>
                  {row.map((r) => (
                    <Card key={r.name} r={r} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
