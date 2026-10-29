import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/** A partner publishing house. Its logo is set in type: one or two lines, and a small kicker. */
export const publishers = pgTable('publishers', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  email: text('email').notNull().default(''),
  blurb: text('blurb').notNull().default(''),
  logoText: text('logo_text').notNull(),
  logoKicker: text('logo_kicker'),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** A book or a box set. Prices are whole XOF amounts: the reference currency of the shop. */
export const books = pgTable('books', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull().default(''),
  author: text('author').notNull(),
  publisherId: text('publisher_id')
    .notNull()
    .references(() => publishers.id, { onUpdate: 'cascade' }),
  theme: text('theme').notNull(),
  kind: text('kind', { enum: ['book', 'pack'] }).notNull().default('book'),
  format: text('format').notNull().default(''),
  priceXof: integer('price_xof').notNull(),
  pages: integer('pages').notNull().default(0),
  isbn: text('isbn').notNull().default(''),
  description: text('description').notNull().default(''),
  excerpt: text('excerpt').notNull().default(''),
  cover: text('cover').notNull(),
  stock: integer('stock').notNull().default(0),
  threshold: integer('threshold').notNull().default(4),
  active: boolean('active').notNull().default(false),
  isNew: boolean('is_new').notNull().default(false),
  inSelection: boolean('in_selection').notNull().default(false),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
