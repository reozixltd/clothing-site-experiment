import { ArrowRight, Clock, Envelope } from '@phosphor-icons/react';
import { type FormEvent, useEffect, useState } from 'react';
import { nextDrop, parts } from '../lib/countdown';
import './Drop.css';

const KEY = 'halden-vip';
const UNITS = [
  ['days', 'Days'],
  ['hours', 'Hrs'],
  ['minutes', 'Min'],
  ['seconds', 'Sec'],
] as const;

/** A number that slides in whenever it changes (the key remounts it, the CSS does the rest). */
function Digits({ value }: { value: number }) {
  return (
    <span key={value} className="drop__num">
      {String(value).padStart(2, '0')}
    </span>
  );
}

export function Drop() {
  const [now, setNow] = useState(() => new Date());
  const [joined, setJoined] = useState(() => {
    try {
      return !!localStorage.getItem(KEY);
    } catch {
      return false;
    }
  });
  const [remind, setRemind] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = parts(nextDrop(now).getTime() - now.getTime());

  const join = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email'));
    try {
      localStorage.setItem(KEY, email);
    } catch {
      // private mode: the thank-you just lasts for this visit
    }
    setJoined(true);
  };

  return (
    <section id="drop" className="drop section">
      <div className="wrap">
        <div className="drop__card card reveal">
          <div className="drop__copy">
            <span className="tag">
              <span aria-hidden="true">●</span> VIP early access // Drop 05
            </span>
            <h2 className="h-section">
              Never Miss
              <br />
              <span className="h-grey">A Sold-Out Drop.</span>
            </h2>
            <p>Small-batch drops sell out within 48 hours. Join the list for 15-minute priority access before everyone else, plus member codes that never reach the public site.</p>

            {joined ? (
              <p className="drop__done" role="status">
                You&rsquo;re on the list &mdash; watch your inbox.
              </p>
            ) : (
              <form className="drop__form" onSubmit={join}>
                <label className="drop__field">
                  <Envelope aria-hidden="true" />
                  <input type="email" name="email" required autoComplete="email" placeholder="Enter your email for early access" aria-label="Email address" />
                </label>
                <button type="submit" className="drop__submit">
                  Get VIP access
                  <span aria-hidden="true">
                    <ArrowRight weight="bold" />
                  </span>
                </button>
              </form>
            )}
            <ul className="drop__notes eyebrow">
              <li>No spam</li>
              <li>1-click unsubscribe</li>
              <li>4,200+ members</li>
            </ul>
          </div>

          <div className="drop__panel panel-dark">
            <div className="drop__bar">
              <span className="drop__label">
                <Clock aria-hidden="true" /> Next release window
              </span>
              <button type="button" className="tag drop__remind" aria-pressed={remind} onClick={() => setRemind((r) => !r)}>
                {remind ? 'Reminder set' : 'Set reminder'}
              </button>
            </div>

            <div className="drop__clock" role="timer" aria-label={`${left.days} days, ${left.hours} hours, ${left.minutes} minutes until the next drop`}>
              {UNITS.map(([k, label]) => (
                <div key={k} className="drop__box" aria-hidden="true">
                  <Digits value={left[k]} />
                  <small>{label}</small>
                </div>
              ))}
            </div>

            <div className="drop__perks">
              <div className="drop__perks-head">
                <span className="drop__label">Member pass benefits</span>
                <span className="drop__free">Free</span>
              </div>
              <ul>
                <li>15-minute priority drop access</li>
                <li>Member-only pricing and codes</li>
                <li>Complimentary express dispatch</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
