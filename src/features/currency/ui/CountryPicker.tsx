import { useEffect, useRef, useState } from 'react';
import { fold } from '@/lib/text';
import * as m from '@/paraglide/messages.js';
import { trackEvent } from '@/features/analytics/track';
import { COUNTRIES, convert, formatAmount } from '../domain/currency';
import { choose, fetchRates, startCurrency, useCurrency } from './currency-store';

const DAY = 86_400_000;

/** The sentence that explains the current rate, shown in the picker and the footer. */
export function useRateLabel(): string {
  const { country, rates, dates } = useCurrency();
  const c = country.currency;
  if (c === 'XOF') return m.rate_xof();
  if (c === 'EUR') return m.rate_eur();
  if (c === 'XAF') return m.rate_xaf();
  const date = dates[c];
  const age = date ? Date.now() - Date.parse(`${date}T00:00:00Z`) : Infinity;
  const sample = formatAmount(convert(1000, 1, c, rates[c] ?? 1), c);
  const day = date ? date.split('-').reverse().join('/') : m.rate_today();
  return age > 3 * DAY ? m.rate_floating_stale({ date: day, sample }) : m.rate_floating({ date: day, sample });
}

export function CountryPicker() {
  const { country } = useCurrency();
  const rateLabel = useRateLabel();
  const ref = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    startCurrency();
    const close = (e: Event) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false;
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && ref.current?.open) {
        ref.current.open = false;
        summary.current?.focus();
      }
    };
    document.addEventListener('click', close);
    document.addEventListener('focusin', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('focusin', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  const visible = COUNTRIES.filter((c) => fold(`${c.name} ${c.symbol} ${c.currency}`).includes(fold(query)));

  async function pick(code: string) {
    if (busy) return;
    setBusy(true);
    const next = COUNTRIES.find((c) => c.code === code);
    if (next && !['XOF', 'XAF', 'EUR'].includes(next.currency)) setStatus(m.rate_updating());
    try {
      await choose(code);
      if (next) {
        setStatus(m.rate_chosen({ currency: next.currency, country: next.name }));
        trackEvent('currency.change', { country: next.code, currency: next.currency });
      }
      if (ref.current) ref.current.open = false;
      summary.current?.focus();
    } catch {
      setStatus(m.rate_choice_failed());
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    setBusy(true);
    setStatus(m.rate_refreshing());
    try {
      await fetchRates(true);
      setStatus(m.rate_refreshed());
    } catch {
      setStatus(m.rate_refresh_failed());
    } finally {
      setBusy(false);
    }
  }

  return (
    <details
      className="country-picker"
      id="country-picker"
      ref={ref}
      onToggle={() => {
        if (ref.current?.open) setQuery('');
      }}
    >
      <summary
        id="country-summary"
        ref={summary}
        aria-label={m.country_summary_label({ country: country.name, currency: country.currency })}
      >
        <img src={`/assets/flags/${country.code.toLowerCase()}.svg`} alt="" width="20" height="20" />
        <span id="country-current">
          {country.name} · {country.symbol}
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 9 5 5 5-5" />
        </svg>
      </summary>
      <div className="country-panel" id="country-panel" aria-busy={busy || undefined}>
        <h2>{m.country_title()}</h2>
        <p>{m.country_intro()}</p>
        <label className="sr-only" htmlFor="country-search">
          {m.country_search_label()}
        </label>
        <input
          id="country-search"
          type="search"
          placeholder={m.country_search_placeholder()}
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="country-options" id="country-options" role="group" aria-label={m.country_group_label()}>
          {visible.map((c) => (
            <button
              key={c.code}
              type="button"
              className="country-option"
              data-country={c.code}
              aria-pressed={c.code === country.code}
              disabled={busy}
              onClick={() => void pick(c.code)}
            >
              <img src={`/assets/flags/${c.code.toLowerCase()}.svg`} alt="" width="23" height="23" />
              <span>{c.name}</span>
              <small>
                {c.symbol} <span>{c.currency}</span>
              </small>
            </button>
          ))}
        </div>
        <p id="country-no-result" hidden={visible.length > 0}>
          {m.country_no_result()}
        </p>
        <div className="country-explanation">
          <p id="country-rate-detail">{rateLabel}</p>
          <button id="country-refresh" type="button" className="text-button" disabled={busy} onClick={() => void refresh()}>
            {m.country_refresh()}
          </button>
          <p id="country-status" role="status">
            {status}
          </p>
        </div>
      </div>
    </details>
  );
}
