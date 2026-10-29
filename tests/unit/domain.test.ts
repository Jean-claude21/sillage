import { describe, expect, it } from 'vitest';
import { guard } from '@/features/analytics/events';
import { addLine, changeQty, sanitizeCart } from '@/features/cart/domain/cart';
import { filterBooks, relatedBooks, type Book } from '@/features/catalog/domain/book';
import { catalogSearch } from '@/features/catalog/domain/search';
import { deliveryFee } from '@/features/checkout/domain/checkout';
import { convert, formatAmount, parseRates, PEG } from '@/features/currency/domain/currency';
import { can, isStaff } from '@/features/auth/domain/roles';
import { canPrepare, inQueue, orderTotal } from '@/features/orders/domain/order';

const book = (over: Partial<Book>): Book => ({
  id: 'x',
  title: 'Titre',
  subtitle: '',
  author: 'Auteur',
  publisherId: 'p',
  publisherName: 'Éditions',
  theme: 'litterature',
  kind: 'book',
  format: '',
  priceXof: 10000,
  pages: 100,
  isbn: '',
  description: '',
  excerpt: '',
  cover: 'c',
  stock: 5,
  threshold: 4,
  active: true,
  isNew: false,
  inSelection: false,
  ...over,
});

describe('cart', () => {
  it('adds, merges and caps each book at 20 copies', () => {
    const one = addLine([], 'a', 2);
    expect(one).toEqual({ ok: true, lines: [{ id: 'a', qty: 2 }] });
    if (!one.ok) throw new Error();
    expect(addLine(one.lines, 'a', 18)).toEqual({ ok: true, lines: [{ id: 'a', qty: 20 }] });
    expect(addLine([{ id: 'a', qty: 20 }], 'a', 1)).toEqual({ ok: false, reason: 'max' });
  });

  it('removes a line that reaches zero and refuses broken stored carts', () => {
    expect(changeQty([{ id: 'a', qty: 1 }], 'a', -1)).toEqual([]);
    expect(sanitizeCart([{ id: 'a', qty: 1.5 }, { id: 'b', qty: 2 }, { qty: 1 }, 'x'])).toEqual([{ id: 'b', qty: 2 }]);
    expect(sanitizeCart('nope')).toEqual([]);
  });
});

describe('catalogue', () => {
  const books = [
    book({ id: 'eco', title: 'Comprendre l’économie', theme: 'savoirs', priceXof: 15000, isNew: true }),
    book({ id: 'mer', title: 'La maison des marées', priceXof: 13000, inSelection: true }),
    book({ id: 'box', title: 'Le coffret', kind: 'pack', theme: 'savoirs', priceXof: 28000 }),
  ];

  it('searches without accents or case', () => {
    expect(filterBooks(books, { q: 'ECONOMIE' }).map((b) => b.id)).toEqual(['eco']);
    expect(filterBooks(books, { q: 'marees' }).map((b) => b.id)).toEqual(['mer']);
  });

  it('filters and sorts as the mockup does', () => {
    expect(filterBooks(books, { theme: 'savoirs', tri: 'prix-desc' }).map((b) => b.id)).toEqual(['box', 'eco']);
    expect(filterBooks(books, { selection: 'nouveautes' }).map((b) => b.id)).toEqual(['eco']);
    expect(filterBooks(books, { type: 'pack' }).map((b) => b.id)).toEqual(['box']);
  });

  it('suggests the same theme first', () => {
    expect(relatedBooks(books, books[0]!).map((b) => b.id)).toEqual(['box', 'mer']);
  });

  it('drops unknown address parameters', () => {
    expect(catalogSearch({ tri: 'hack', selection: 'x', type: 'pack', q: '  roman ' })).toEqual({
      q: 'roman',
      theme: undefined,
      editeur: undefined,
      selection: undefined,
      type: 'pack',
      tri: undefined,
    });
  });
});

describe('currency', () => {
  it('keeps the fixed EUR parity and rounds each line before multiplying', () => {
    expect(convert(PEG, 1, 'EUR', 1 / PEG)).toBe(1);
    expect(convert(13000, 3, 'EUR', 1 / PEG)).toBeCloseTo(59.46, 2);
    expect(formatAmount(13000, 'XOF')).toBe('13 000 F CFA');
  });

  it('refuses incomplete or stale quotes', () => {
    expect(() => parseRates([{ base: 'XOF', quote: 'USD', rate: 0.0017, date: '2026-10-28' }])).toThrow();
    expect(() => parseRates('x')).toThrow();
  });
});

describe('orders', () => {
  const order = (over: object) => ({ paymentStatus: 'pending', paymentMethod: 'mobile_money', deliveryStatus: 'a-preparer', ...over });

  it('prepares paid orders and orders paid on delivery only', () => {
    expect(canPrepare(order({}))).toBe(false);
    expect(canPrepare(order({ paymentStatus: 'paid' }))).toBe(true);
    expect(canPrepare(order({ paymentMethod: 'cash_on_delivery' }))).toBe(true);
    expect(inQueue(order({ paymentStatus: 'paid', deliveryStatus: 'livree' }))).toBe(false);
  });

  it('adds the delivery fee to the lines', () => {
    expect(orderTotal({ fee: 1500, lines: [{ priceXof: 13000, qty: 2 }] })).toBe(27500);
    expect(deliveryFee('outside', { lome: 1500, outside: 2500 })).toBe(2500);
  });
});

describe('access', () => {
  it('opens each area to the right role', () => {
    expect(isStaff('customer')).toBe(false);
    expect(can('owner', 'settings')).toBe(true);
    expect(can('delivery', 'catalog')).toBe(false);
    expect(can('catalog', 'stocks')).toBe(true);
  });
});

describe('analytics', () => {
  it('never sends an e-mail, a phone number or a long text', () => {
    expect(guard({ q: 'afi@example.com', phone: '+228 90 00 00 00', n: 3, ok: true, long: 'x'.repeat(200) })).toEqual({
      n: 3,
      ok: true,
      long: 'x'.repeat(80),
    });
  });
});
