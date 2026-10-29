import { eq, sql } from 'drizzle-orm';
import { books } from '@/features/catalog/infrastructure/catalog.table';
import type { Db } from '@/platform/db';
import { sendMail } from '@/platform/mail';
import * as m from '@/paraglide/messages.js';
import { canPrepare, deliveryBadge, type DeliveryStatus } from '../domain/order';
import { findOrder, logActivity } from '../infrastructure/order.queries';
import { orders } from '../infrastructure/order.table';

export class OrderRuleError extends Error {
  constructor(readonly reason: 'not-found' | 'unpaid' | 'courier' | 'final') {
    super(reason);
  }
}

/** Moves an order along preparation and delivery, with the mockup's rules. */
export async function updateDelivery(
  db: Db,
  id: string,
  next: { status: DeliveryStatus; courier: string; window: string },
): Promise<void> {
  const order = await findOrder(db, id);
  if (!order) throw new OrderRuleError('not-found');
  if (order.deliveryStatus === 'annulee') throw new OrderRuleError('final');
  if (next.status === 'annulee') return cancelOrder(db, id);
  if (!canPrepare(order)) throw new OrderRuleError('unpaid');
  if (['livraison', 'livree'].includes(next.status) && !next.courier) throw new OrderRuleError('courier');
  await db
    .update(orders)
    .set({ deliveryStatus: next.status, courier: next.courier, window: next.window, updatedAt: new Date() })
    .where(eq(orders.id, id));
  if (next.status !== order.deliveryStatus) {
    const label = deliveryBadge(next.status)[0];
    await logActivity(db, m.activity_delivery({ id, status: label.toLowerCase() }));
    if (['livraison', 'livree'].includes(next.status)) {
      await sendMail({
        to: order.email,
        subject: m.mail_delivery_subject({ id, status: label }),
        text: m.mail_delivery_body({ name: order.customerName, id, status: label.toLowerCase(), window: next.window || '—' }),
      });
    }
  }
}

/** Cancels an order and puts its books back in stock. A paid order is then to be refunded. */
export async function cancelOrder(db: Db, id: string): Promise<void> {
  const order = await findOrder(db, id);
  if (!order) throw new OrderRuleError('not-found');
  if (order.deliveryStatus === 'annulee' || order.deliveryStatus === 'livree') throw new OrderRuleError('final');
  await db.transaction(async (tx) => {
    for (const line of order.lines) {
      await tx.update(books).set({ stock: sql`${books.stock} + ${line.qty}` }).where(eq(books.id, line.bookId));
    }
    await tx
      .update(orders)
      .set({
        deliveryStatus: 'annulee',
        paymentStatus: order.paymentStatus === 'pending' ? 'failed' : order.paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));
  });
  await logActivity(db, m.activity_cancelled({ id }));
}

export async function saveNote(db: Db, id: string, note: string): Promise<void> {
  await db.update(orders).set({ note, updatedAt: new Date() }).where(eq(orders.id, id));
}
