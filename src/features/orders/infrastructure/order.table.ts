import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from '../../auth/infrastructure/auth.table';
import { books } from '../../catalog/infrastructure/catalog.table';

/**
 * An order. Payment and delivery are followed separately: a paid order can wait, an order paid on
 * delivery is prepared before it is paid. The address is copied, so editing an address book
 * never rewrites a past order.
 */
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  number: integer('number').generatedByDefaultAsIdentity({ startWith: 1049 }).notNull().unique(),
  customerId: text('customer_id').references(() => user.id, { onDelete: 'set null' }),
  customerName: text('customer_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  paymentStatus: text('payment_status', { enum: ['pending', 'paid', 'failed', 'refunded'] })
    .notNull()
    .default('pending'),
  paymentMethod: text('payment_method', {
    enum: ['mobile_money', 'card', 'cash_on_delivery'],
  }).notNull(),
  paymentReference: text('payment_reference').notNull().default(''),
  deliveryStatus: text('delivery_status', {
    enum: ['a-preparer', 'preparation', 'prete', 'livraison', 'livree', 'annulee'],
  })
    .notNull()
    .default('a-preparer'),
  zone: text('zone', { enum: ['lome', 'outside'] }).notNull(),
  area: text('area').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  fee: integer('fee').notNull(),
  courier: text('courier').notNull().default(''),
  window: text('delivery_window').notNull().default(''),
  note: text('note').notNull().default(''),
  customerNote: text('customer_note').notNull().default(''),
  /** Lets a guest open the confirmation page of their own order, and only theirs. */
  accessToken: text('access_token').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** A line keeps the title, author, cover and price of the day: the catalogue may change later. */
export const orderLines = pgTable('order_lines', {
  id: serial('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  bookId: text('book_id')
    .notNull()
    .references(() => books.id, { onUpdate: 'cascade' }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  cover: text('cover').notNull(),
  priceXof: integer('price_xof').notNull(),
  qty: integer('qty').notNull(),
});

/** The life of the bookshop: what the team did, newest first on the overview. */
export const activity = pgTable('activity', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
