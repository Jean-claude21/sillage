import { createServerFn } from '@tanstack/react-start';
import { randomUUID } from 'node:crypto';
import { eq, ne, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { requireArea } from '@/features/auth/session.server';
import { logActivity } from '@/features/orders/infrastructure/order.queries';
import { db } from '@/platform/db';
import { fold, slugify } from '@/lib/text';
import * as m from '@/paraglide/messages.js';
import { THEME_IDS } from './domain/themes';
import { findBook, listBooks, listPublishers } from './infrastructure/catalog.queries';
import { books, publishers } from './infrastructure/catalog.table';
import { saveCover } from './infrastructure/cover-store';

export const fetchAdminCatalog = createServerFn({ method: 'GET' }).handler(async () => {
  await requireArea('catalog').catch(() => requireArea('stocks'));
  const database = await db();
  const [list, houses] = await Promise.all([listBooks(database, { withDrafts: true }), listPublishers(database)]);
  return { books: list, publishers: houses };
});

export const fetchAdminBook = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().max(120) }))
  .handler(async ({ data }) => {
    await requireArea('catalog');
    const database = await db();
    return { book: data.id === 'nouveau' ? null : await findBook(database, data.id), publishers: await listPublishers(database) };
  });

const bookInput = z.object({
  id: z.string().max(120).optional(),
  title: z.string().trim().min(1).max(150),
  subtitle: z.string().trim().max(200).default(''),
  author: z.string().trim().min(1).max(120),
  publisherId: z.string().min(1).max(120),
  theme: z.enum(THEME_IDS),
  kind: z.enum(['book', 'pack']),
  isbn: z.string().trim().max(40),
  description: z.string().trim().min(1).max(3000),
  excerpt: z.string().trim().max(1500).default(''),
  cover: z.string().trim().min(1).max(500),
  priceXof: z.number().int().min(0).max(10_000_000),
  stock: z.number().int().min(0).max(999_999),
  threshold: z.number().int().min(0).max(999_999),
  pages: z.number().int().min(1).max(99_999),
  active: z.boolean(),
  isNew: z.boolean(),
  inSelection: z.boolean(),
});

export const saveBook = createServerFn({ method: 'POST' })
  .validator(bookInput)
  .handler(async ({ data }) => {
    await requireArea('catalog');
    const database = await db();
    const { id, ...values } = data;
    const format = values.kind === 'pack' ? m.format_pack() : m.format_book();
    if (id) {
      await database.update(books).set({ ...values, updatedAt: new Date() }).where(eq(books.id, id));
      await logActivity(database, m.activity_book_saved({ title: values.title }));
      return { id };
    }
    let next = slugify(values.title) || 'livre';
    for (let i = 2; (await findBook(database, next)) !== null; i++) next = `${slugify(values.title)}-${i}`;
    const [{ last } = { last: 0 }] = await database.select({ last: sql<number>`coalesce(max(${books.position}), 0)::int` }).from(books);
    await database.insert(books).values({ id: next, format, position: last + 1, ...values });
    await logActivity(database, m.activity_book_added({ title: values.title }));
    return { id: next };
  });

export const saveStock = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().max(120), stock: z.number().int().min(0).max(999_999) }))
  .handler(async ({ data }) => {
    await requireArea('stocks');
    const database = await db();
    await database.update(books).set({ stock: data.stock, updatedAt: new Date() }).where(eq(books.id, data.id));
    const book = await findBook(database, data.id);
    if (book) await logActivity(database, m.activity_stock({ title: book.title, count: data.stock }));
    return { ok: true };
  });

export const savePublisher = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string().max(120).optional(),
      name: z.string().trim().min(1).max(150),
      email: z.email().max(150),
      blurb: z.string().trim().max(400).default(''),
    }),
  )
  .handler(async ({ data }) => {
    await requireArea('publishers');
    const database = await db();
    const all = await listPublishers(database);
    if (all.some((p) => p.id !== data.id && fold(p.name) === fold(data.name))) return { ok: false as const, reason: 'duplicate' as const };
    if (data.id) {
      await database.update(publishers).set({ name: data.name, email: data.email, blurb: data.blurb }).where(eq(publishers.id, data.id));
      return { ok: true as const };
    }
    let id = slugify(data.name) || 'editeur';
    for (let i = 2; all.some((p) => p.id === id); i++) id = `${slugify(data.name)}-${i}`;
    await database.insert(publishers).values({
      id,
      name: data.name,
      email: data.email,
      blurb: data.blurb,
      logoText: data.name.toLocaleLowerCase('fr').replace(/^(les |la |le |l’|éditions |editions )/, ''),
      position: all.length,
    });
    return { ok: true as const };
  });

const COVER_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const;
export const MAX_COVER_BYTES = 3 * 1024 * 1024;

/**
 * Stores a cover chosen by the team and returns its address, to save in the book's form.
 * The browser has already reduced the picture; the server checks its type and size again.
 */
export const uploadCover = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      contentType: z.enum(Object.keys(COVER_TYPES) as [keyof typeof COVER_TYPES, ...(keyof typeof COVER_TYPES)[]]),
      base64: z.string().min(1).max(Math.ceil((MAX_COVER_BYTES * 4) / 3) + 4),
    }),
  )
  .handler(async ({ data }) => {
    await requireArea('catalog');
    const bytes = Buffer.from(data.base64, 'base64');
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_COVER_BYTES) return { ok: false as const };
    const key = `${randomUUID()}.${COVER_TYPES[data.contentType]}`;
    await saveCover(key, new Uint8Array(bytes), data.contentType);
    return { ok: true as const, url: `/images/couvertures/${key}` };
  });

/** Whether a publisher can be removed: only when no book refers to it. */
export const deletePublisher = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().max(120) }))
  .handler(async ({ data }) => {
    await requireArea('publishers');
    const database = await db();
    const [used] = await database.select({ id: books.id }).from(books).where(eq(books.publisherId, data.id)).limit(1);
    if (used) return { ok: false as const };
    await database.delete(publishers).where(and(eq(publishers.id, data.id), ne(publishers.id, '')));
    return { ok: true as const };
  });
