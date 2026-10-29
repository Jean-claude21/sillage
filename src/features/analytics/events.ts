/**
 * Every event the shop measures, named `feature.action`, with its few facts. A measure, never a
 * person: no name, e-mail, phone or address ever leaves the shop (see guard()).
 */
export interface AnalyticsEvents {
  'search.submit': { results: number; has_results: boolean };
  'search.no_results': { q: string };
  'catalog.filter': { kind: string; value: string };
  'catalog.sort': { by: string };
  'book.view': { isbn: string; book: string; publisher: string; theme: string; price_xof: number };
  'book.excerpt_open': { book: string };
  'wishlist.add': { book: string };
  'wishlist.remove': { book: string };
  'cart.add': { book: string; source: string; qty: number; price_xof: number };
  'cart.remove': { book: string };
  'cart.open': { items: number };
  'guide.start': Record<string, never>;
  'guide.choose': { theme: string };
  'currency.change': { country: string; currency: string };
  'publisher.view': { publisher: string };
  'checkout.start': { items: number; value_xof: number };
  'checkout.delivery': { zone: string };
  'checkout.payment': { method: string };
  'checkout.payment_failed': { method: string; reason: string };
  'order.placed': { order: string; items: number; value_xof: number; method: string };
  'order.paid': { order: string; revenue: number; currency: 'XOF'; items: number; method: string };
  'account.signup': { source: string };
  'account.signin': { source: string };
  'newsletter.subscribe': { source: string };
  'contact.submit': { topic: string };
  'reorder.click': { order: string };
}

export type EventName = keyof AnalyticsEvents;

const PERSONAL = /@|\+?\d[\d\s.-]{7,}/;

/** Refuses a value that looks like an e-mail or a phone number, and texts longer than 80 characters. */
export function guard(data: Record<string, unknown>): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'number' || typeof value === 'boolean') safe[key] = value;
    else if (typeof value === 'string' && !PERSONAL.test(value)) safe[key] = value.slice(0, 80);
  }
  return safe;
}
