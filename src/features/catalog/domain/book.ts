import { fold } from '@/lib/text';

/** A book as the shop shows it: plain, serializable values. */
export interface Book {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  publisherId: string;
  publisherName: string;
  theme: string;
  kind: 'book' | 'pack';
  format: string;
  priceXof: number;
  pages: number;
  isbn: string;
  description: string;
  excerpt: string;
  cover: string;
  stock: number;
  threshold: number;
  active: boolean;
  isNew: boolean;
  inSelection: boolean;
}

export interface Publisher {
  id: string;
  name: string;
  email: string;
  blurb: string;
  logoText: string;
  logoKicker: string | null;
}

/** A cover is a file of the demo catalogue (its name) or a full address once real files arrive. */
export function coverUrl(cover: string): string {
  if (/^(https?:|data:|\/)/.test(cover)) return cover;
  return `/assets/${cover}.svg`;
}

export const MAX_PER_BOOK = 20;

export type CatalogSort = 'selection' | 'prix-asc' | 'prix-desc' | 'titre';

export interface CatalogQuery {
  q?: string;
  theme?: string;
  editeur?: string;
  selection?: 'nouveautes' | 'selection';
  type?: 'pack';
  tri?: CatalogSort;
}

/** The catalogue's filter: accent- and case-insensitive search across the useful fields. */
export function filterBooks(books: readonly Book[], query: CatalogQuery, only?: readonly string[]): Book[] {
  const needle = query.q ? fold(query.q) : '';
  const list = books.filter(
    (b) =>
      (!only || only.includes(b.id)) &&
      (!query.theme || b.theme === query.theme) &&
      (!query.editeur || b.publisherId === query.editeur) &&
      (!query.selection || (query.selection === 'nouveautes' ? b.isNew : b.inSelection)) &&
      (!query.type || b.kind === query.type) &&
      (!needle ||
        fold([b.title, b.subtitle, b.author, b.publisherName, b.description, b.isbn].join(' ')).includes(needle)),
  );
  if (query.tri === 'prix-asc') list.sort((a, b) => a.priceXof - b.priceXof);
  if (query.tri === 'prix-desc') list.sort((a, b) => b.priceXof - a.priceXof);
  if (query.tri === 'titre') list.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  return list;
}

/** Books to read next: the same theme first, then the rest of the shop. */
export function relatedBooks(books: readonly Book[], book: Book, count = 4): Book[] {
  return books
    .filter((b) => b.id !== book.id)
    .sort((a, c) => Number(c.theme === book.theme) - Number(a.theme === book.theme))
    .slice(0, count);
}
