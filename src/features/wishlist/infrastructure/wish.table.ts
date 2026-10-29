import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from '../../auth/infrastructure/auth.table';
import { books } from '../../catalog/infrastructure/catalog.table';

export const wishes = pgTable(
  'wishes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.bookId] })],
);
