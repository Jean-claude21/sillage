import { asc, eq } from 'drizzle-orm';
import type { Db } from '@/platform/db';
import type { Book, Publisher } from '../domain/book';
import { books, publishers } from './catalog.table';

const bookColumns = {
  id: books.id,
  title: books.title,
  subtitle: books.subtitle,
  author: books.author,
  publisherId: books.publisherId,
  publisherName: publishers.name,
  theme: books.theme,
  kind: books.kind,
  format: books.format,
  priceXof: books.priceXof,
  pages: books.pages,
  isbn: books.isbn,
  description: books.description,
  excerpt: books.excerpt,
  cover: books.cover,
  stock: books.stock,
  threshold: books.threshold,
  active: books.active,
  isNew: books.isNew,
  inSelection: books.inSelection,
};

/** Books in the shop's order; drafts only when the team asks for them. */
export async function listBooks(db: Db, { withDrafts = false } = {}): Promise<Book[]> {
  const query = db
    .select(bookColumns)
    .from(books)
    .innerJoin(publishers, eq(books.publisherId, publishers.id))
    .orderBy(asc(books.position), asc(books.createdAt));
  return withDrafts ? query : query.where(eq(books.active, true));
}

export async function findBook(db: Db, id: string): Promise<Book | null> {
  const [row] = await db
    .select(bookColumns)
    .from(books)
    .innerJoin(publishers, eq(books.publisherId, publishers.id))
    .where(eq(books.id, id));
  return row ?? null;
}

export async function listPublishers(db: Db): Promise<Publisher[]> {
  return db
    .select({
      id: publishers.id,
      name: publishers.name,
      email: publishers.email,
      blurb: publishers.blurb,
      logoText: publishers.logoText,
      logoKicker: publishers.logoKicker,
    })
    .from(publishers)
    .orderBy(asc(publishers.position), asc(publishers.name));
}
