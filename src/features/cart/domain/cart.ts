import { MAX_PER_BOOK } from '@/features/catalog/domain/book';

export interface CartLine {
  id: string;
  qty: number;
}

/** Keeps only lines of known books, with a whole quantity between 1 and the per-book limit. */
export function sanitizeCart(raw: unknown, knownIds?: ReadonlySet<string>): CartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is CartLine =>
      typeof x?.id === 'string' &&
      Number.isInteger(x.qty) &&
      x.qty > 0 &&
      x.qty <= MAX_PER_BOOK &&
      (!knownIds || knownIds.has(x.id)),
  );
}

export type AddResult = { ok: true; lines: CartLine[] } | { ok: false; reason: 'max' };

export function addLine(lines: readonly CartLine[], id: string, qty = 1): AddResult {
  const existing = lines.find((l) => l.id === id);
  if (existing && existing.qty + qty > MAX_PER_BOOK) return { ok: false, reason: 'max' };
  if (!existing && qty > MAX_PER_BOOK) return { ok: false, reason: 'max' };
  return {
    ok: true,
    lines: existing ? lines.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l)) : [...lines, { id, qty }],
  };
}

export function changeQty(lines: readonly CartLine[], id: string, delta: number): CartLine[] {
  return lines
    .map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_PER_BOOK, l.qty + delta) } : l))
    .filter((l) => l.qty > 0);
}

export function countItems(lines: readonly CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}
