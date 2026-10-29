import { eq } from 'drizzle-orm';
import { trackServerEvent } from '@/features/analytics/server';
import { readSettings } from '@/features/settings/infrastructure/settings.queries';
import type { Db } from '@/platform/db';
import { sendMail } from '@/platform/mail';
import { formatXof } from '@/lib/text';
import * as m from '@/paraglide/messages.js';
import { orderTotal, type PaymentStatus } from '../domain/order';
import { findOrder, logActivity } from '../infrastructure/order.queries';
import { orders } from '../infrastructure/order.table';

/**
 * Records what the payment provider (or the team, for cash) confirmed. Idempotent: a second
 * confirmation of a paid order changes nothing and sends nothing.
 */
export async function recordPayment(db: Db, orderId: string, status: PaymentStatus, reference?: string): Promise<void> {
  const order = await findOrder(db, orderId);
  if (!order || order.paymentStatus === status) return;
  if (order.paymentStatus === 'paid' && status !== 'refunded') return;
  await db
    .update(orders)
    .set({
      paymentStatus: status,
      ...(reference ? { paymentReference: reference } : {}),
      ...(status === 'paid' && order.window === m.window_after_payment() ? { window: m.window_to_organise() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));
  if (status === 'paid') {
    await logActivity(db, m.activity_paid({ id: orderId }));
    const shop = await readSettings(db, 'shop');
    await sendMail({
      to: order.email,
      subject: m.mail_paid_subject({ id: orderId }),
      text: m.mail_paid_body({ name: order.customerName, id: orderId, total: formatXof(orderTotal(order)), shop: shop.name }),
    });
    await trackServerEvent(
      'order.paid',
      { order: orderId, revenue: orderTotal(order), currency: 'XOF', items: order.lines.reduce((s, l) => s + l.qty, 0), method: order.paymentMethod },
      `/commande/${orderId}`,
    );
  } else if (status === 'failed') {
    await logActivity(db, m.activity_payment_failed({ id: orderId }));
  } else if (status === 'refunded') {
    await logActivity(db, m.activity_refunded({ id: orderId }));
  }
}
