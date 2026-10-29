// Display currencies. Prices are whole XOF amounts; the chosen country only sets the currency in
// which they are shown. Payment is always charged in XOF, on the server.

/** BCEAO: 1 EUR = 655.957 XOF. XAF and XOF are at par. */
export const PEG = 655.957;
export const FIXED_RATES: Record<string, number> = { XOF: 1, XAF: 1, EUR: 1 / PEG };
export const FLOATING = ['USD', 'GHS', 'NGN', 'GBP', 'CAD', 'CHF', 'MAD', 'DZD', 'TND'] as const;
export const RATES_ENDPOINT = `https://api.frankfurter.dev/v2/rates?base=XOF&quotes=${FLOATING.join(',')}`;

export interface Country {
  code: string;
  name: string;
  currency: string;
  symbol: string;
}

export const COUNTRIES: readonly Country[] = (
  [
    ['TG', 'Togo', 'XOF', 'F CFA'],
    ['BJ', 'Bénin', 'XOF', 'F CFA'],
    ['CI', 'Côte d’Ivoire', 'XOF', 'F CFA'],
    ['SN', 'Sénégal', 'XOF', 'F CFA'],
    ['BF', 'Burkina Faso', 'XOF', 'F CFA'],
    ['ML', 'Mali', 'XOF', 'F CFA'],
    ['NE', 'Niger', 'XOF', 'F CFA'],
    ['GW', 'Guinée-Bissau', 'XOF', 'F CFA'],
    ['GH', 'Ghana', 'GHS', 'GH₵'],
    ['NG', 'Nigeria', 'NGN', '₦'],
    ['CM', 'Cameroun', 'XAF', 'F CFA'],
    ['GA', 'Gabon', 'XAF', 'F CFA'],
    ['CG', 'Congo-Brazzaville', 'XAF', 'F CFA'],
    ['FR', 'France', 'EUR', '€'],
    ['BE', 'Belgique', 'EUR', '€'],
    ['DE', 'Allemagne', 'EUR', '€'],
    ['ES', 'Espagne', 'EUR', '€'],
    ['IT', 'Italie', 'EUR', '€'],
    ['GB', 'Royaume-Uni', 'GBP', '£'],
    ['US', 'États-Unis', 'USD', '$ US'],
    ['CA', 'Canada', 'CAD', '$ CA'],
    ['CH', 'Suisse', 'CHF', 'CHF'],
    ['MA', 'Maroc', 'MAD', 'DH'],
    ['DZ', 'Algérie', 'DZD', 'DA'],
    ['TN', 'Tunisie', 'TND', 'DT'],
  ] as const
).map(([code, name, currency, symbol]) => ({ code, name, currency, symbol }));

export const DEFAULT_COUNTRY = COUNTRIES[0]!;

function digits(currency: string): number {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

/** A unit price converted and rounded first, then multiplied: lines and totals always agree. */
export function convert(unitXof: number, qty: number, currency: string, rate: number): number {
  const scale = 10 ** digits(currency);
  return (Math.round(unitXof * rate * scale) * qty) / scale;
}

export function formatAmount(amount: number, currency: string): string {
  if (currency === 'XOF' || currency === 'XAF') {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)} F CFA`;
  }
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
}

export interface RateRow {
  base: string;
  quote: string;
  rate: number;
  date: string;
}

const DAY = 86_400_000;

/** Keeps only complete, recent quotes; refuses a partial answer. */
export function parseRates(rows: unknown, now = Date.now()): { rates: Record<string, number>; dates: Record<string, string> } {
  if (!Array.isArray(rows) || !rows.length) throw new Error('invalid');
  const rates: Record<string, number> = { ...FIXED_RATES };
  const dates: Record<string, string> = {};
  for (const row of rows as RateRow[]) {
    if (
      row.base === 'XOF' &&
      /^[A-Z]{3}$/.test(row.quote) &&
      Number.isFinite(row.rate) &&
      row.rate > 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
      now - Date.parse(`${row.date}T00:00:00Z`) < 7 * DAY
    ) {
      rates[row.quote] = row.rate;
      dates[row.quote] = row.date;
    }
  }
  if (Object.keys(dates).length !== FLOATING.length) throw new Error('incomplete');
  return { rates, dates };
}
