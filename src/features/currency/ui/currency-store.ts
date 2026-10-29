import { createStore, readLocal, useStore, writeLocal } from '@/lib/store';
import { COUNTRIES, convert, DEFAULT_COUNTRY, FIXED_RATES, formatAmount, parseRates, RATES_ENDPOINT, type Country } from '../domain/currency';

// The same keys as the mockup, so a visitor's choice survives the move to the real shop.
const COUNTRY_KEY = 'sillage-country-v1';
const RATES_KEY = 'sillage-rates-v1';
const DAY = 86_400_000;

interface CurrencyState {
  country: Country;
  rates: Record<string, number>;
  dates: Record<string, string>;
  fetchedAt: number;
}

const initial: CurrencyState = { country: DEFAULT_COUNTRY, rates: { ...FIXED_RATES }, dates: {}, fetchedAt: 0 };
export const currency = createStore<CurrencyState>(initial);

let started = false;
let inFlight: Promise<void> | null = null;

/** Reads the device's choice and cached quotes; called once, after hydration. */
export function startCurrency(): void {
  if (started) return;
  started = true;
  const cached = readLocal<{ rates?: Record<string, number>; dates?: Record<string, string>; fetchedAt?: number } | null>(RATES_KEY, null);
  const next: CurrencyState = { ...initial, rates: { ...FIXED_RATES } };
  if (cached?.fetchedAt && Date.now() - cached.fetchedAt < 7 * DAY) {
    for (const [code, rate] of Object.entries(cached.rates ?? {})) {
      const date = cached.dates?.[code] ?? '';
      if (/^[A-Z]{3}$/.test(code) && Number.isFinite(rate) && rate > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        next.rates[code] = rate;
        next.dates[code] = date;
      }
    }
    Object.assign(next.rates, FIXED_RATES);
    next.fetchedAt = cached.fetchedAt;
  }
  const saved = COUNTRIES.find((c) => c.code === readLocal<string>(COUNTRY_KEY, 'TG'));
  if (saved && next.rates[saved.currency]) next.country = saved;
  currency.set(next);
  fetchRates()
    .then(() => {
      if (saved && saved.code !== currency.get().country.code) void choose(saved.code);
    })
    .catch(() => undefined);
}

export async function fetchRates(force = false): Promise<void> {
  if (inFlight) return inFlight;
  const { fetchedAt } = currency.get();
  if (!force && fetchedAt && Date.now() - fetchedAt < 3_600_000) return;
  inFlight = (async () => {
    const res = await fetch(RATES_ENDPOINT, { cache: 'no-store', signal: AbortSignal.timeout(12_000) });
    if (!res.ok) throw new Error('unavailable');
    const { rates, dates } = parseRates(await res.json());
    const now = Date.now();
    currency.set((s) => ({ ...s, rates, dates, fetchedAt: now }));
    writeLocal(RATES_KEY, { rates, dates, fetchedAt: now });
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Switches the display currency; keeps the previous one if its rate cannot be read. */
export async function choose(code: string): Promise<boolean> {
  const next = COUNTRIES.find((c) => c.code === code);
  if (!next) return false;
  if (!FIXED_RATES[next.currency]) {
    await fetchRates();
    if (!currency.get().rates[next.currency]) throw new Error('unavailable');
  }
  currency.set((s) => ({ ...s, country: next }));
  writeLocal(COUNTRY_KEY, next.code);
  return true;
}

export function useCurrency(): CurrencyState {
  return useStore(currency, initial);
}

/** Formats a unit price for the chosen country. */
export function useMoney(): (unitXof: number, qty?: number) => string {
  const { country, rates } = useCurrency();
  return (unitXof, qty = 1) => formatAmount(convert(unitXof, qty, country.currency, rates[country.currency] ?? 1), country.currency);
}

/** Converts each line before adding them up, as the mockup's cart does. */
export function useTotal(): (lines: readonly { priceXof: number; qty: number }[]) => string {
  const { country, rates } = useCurrency();
  return (lines) => {
    const rate = rates[country.currency] ?? 1;
    return formatAmount(lines.reduce((sum, l) => sum + convert(l.priceXof, l.qty, country.currency, rate), 0), country.currency);
  };
}
