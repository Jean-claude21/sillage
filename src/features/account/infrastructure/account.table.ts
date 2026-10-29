import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from '../../auth/infrastructure/auth.table';
import { orders } from '../../orders/infrastructure/order.table';

export const addresses = pgTable('addresses', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  name: text('name').notNull(),
  street: text('street').notNull(),
  area: text('area').notNull(),
  city: text('city').notNull(),
  phone: text('phone').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** A question from a reader to the bookshop, about an order or not. */
export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status', { enum: ['open', 'resolved'] }).notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
