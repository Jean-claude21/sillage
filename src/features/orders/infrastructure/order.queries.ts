import { and, desc, eq, inArray, type SQL } from 'drizzle-orm';
import type { Db } from '@/platform/db';
import type { OrderView } from '../domain/order';
import { activity, orderLines, orders } from './order.table';

type OrderRow = typeof orders.$inferSelect;

function toView(row: OrderRow, lines: (typeof orderLines.$inferSelect)[]): OrderView {
  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customerName,
    email: row.email,
    phone: row.phone,
    paymentStatus: row.paymentStatus,
    paymentMethod: row.paymentMethod,
    paymentReference: row.paymentReference,
    deliveryStatus: row.deliveryStatus,
    zone: row.zone,
    area: row.area,
    city: row.city,
    address: row.address,
    fee: row.fee,
    courier: row.courier,
    window: row.window,
    note: row.note,
    customerNote: row.customerNote,
    createdAt: row.createdAt.toISOString(),
    lines: lines
      .filter((l) => l.orderId === row.id)
      .map((l) => ({ bookId: l.bookId, title: l.title, author: l.author, cover: l.cover, priceXof: l.priceXof, qty: l.qty })),
  };
}

/** Orders with their lines, newest first. */
export async function listOrders(db: Db, where?: SQL): Promise<OrderView[]> {
  const rows = await db.select().from(orders).where(where).orderBy(desc(orders.number));
  if (!rows.length) return [];
  const lines = await db
    .select()
    .from(orderLines)
    .where(inArray(orderLines.orderId, rows.map((r) => r.id)))
    .orderBy(orderLines.id);
  return rows.map((r) => toView(r, lines));
}

export async function findOrder(db: Db, id: string, extra?: SQL): Promise<OrderView | null> {
  const [row] = await listOrders(db, extra ? and(eq(orders.id, id), extra) : eq(orders.id, id));
  return row ?? null;
}

export async function logActivity(db: Db, text: string): Promise<void> {
  await db.insert(activity).values({ text });
}

export async function recentActivity(db: Db, limit = 4) {
  return db.select().from(activity).orderBy(desc(activity.createdAt), desc(activity.id)).limit(limit);
}
