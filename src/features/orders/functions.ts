import { createServerFn } from '@tanstack/react-start';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireArea, requireViewer } from '@/features/auth/session.server';
import { listBooks } from '@/features/catalog/infrastructure/catalog.queries';
import { readSettings } from '@/features/settings/infrastructure/settings.queries';
import { db } from '@/platform/db';
import { formatDate } from '@/lib/text';
import * as m from '@/paraglide/messages.js';
import { recordPayment } from './commands/record-payment';
import { cancelOrder, OrderRuleError, saveNote, updateDelivery } from './commands/manage-order';
import { DELIVERY_STATUSES } from './domain/order';
import { findOrder, listOrders, recentActivity } from './infrastructure/order.queries';
import { orders } from './infrastructure/order.table';

/** Everything the team's overview shows: orders, low stocks, the week's takings, the activity. */
export const fetchAdminOverview = createServerFn({ method: 'GET' }).handler(async () => {
  await requireArea('overview');
  const database = await db();
  const [all, books, activity] = await Promise.all([listOrders(database), listBooks(database, { withDrafts: true }), recentActivity(database, 4)]);
  return {
    orders: all,
    lowBooks: books.filter((b) => b.active && b.stock <= b.threshold).sort((a, b) => a.stock - b.stock),
    activity: activity.map((a) => ({ text: a.text, at: a.createdAt.toISOString() })),
  };
});

export const fetchAdminOrders = createServerFn({ method: 'GET' }).handler(async () => {
  const viewer = await requireArea('orders').catch(() => requireArea('deliveries'));
  const database = await db();
  return { orders: await listOrders(database), couriers: (await readSettings(database, 'delivery')).couriers, role: viewer.role };
});

export const fetchAdminOrder = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().max(40) }))
  .handler(async ({ data }) => {
    await requireArea('orders');
    const database = await db();
    return { order: await findOrder(database, data.id), couriers: (await readSettings(database, 'delivery')).couriers };
  });

function refusal(error: unknown) {
  if (error instanceof OrderRuleError) return { ok: false as const, reason: error.reason };
  throw error;
}

export const saveOrderDelivery = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string().max(40),
      status: z.enum(DELIVERY_STATUSES),
      courier: z.string().trim().max(80),
      window: z.string().trim().max(120),
    }),
  )
  .handler(async ({ data }) => {
    await requireArea('orders');
    try {
      await updateDelivery(await db(), data.id, data);
      return { ok: true as const };
    } catch (error) {
      return refusal(error);
    }
  });

export const saveOrderNote = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().max(40), note: z.string().trim().max(1000) }))
  .handler(async ({ data }) => {
    await requireArea('orders');
    await saveNote(await db(), data.id, data.note);
    return { ok: true };
  });

/** The team confirms money received in hand (paid on delivery), or a refund. */
export const savePaymentStatus = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().max(40), status: z.enum(['paid', 'refunded']) }))
  .handler(async ({ data }) => {
    await requireArea('payments').catch(() => requireArea('orders'));
    await recordPayment(await db(), data.id, data.status, data.status === 'paid' ? m.reference_cash() : undefined);
    return { ok: true };
  });

export const cancelOrderFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().max(40) }))
  .handler(async ({ data }) => {
    await requireArea('orders');
    try {
      await cancelOrder(await db(), data.id);
      return { ok: true as const };
    } catch (error) {
      return refusal(error);
    }
  });

/** Hands the ready orders to a courier on a date and time window, in one gesture. */
export const planDelivery = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      ids: z.array(z.string().max(40)).min(1).max(50),
      courier: z.string().trim().min(1).max(80),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      window: z.string().trim().min(1).max(40),
    }),
  )
  .handler(async ({ data }) => {
    await requireArea('deliveries');
    const database = await db();
    let count = 0;
    for (const id of data.ids) {
      const order = await findOrder(database, id);
      if (!order || order.deliveryStatus !== 'prete') continue;
      await updateDelivery(database, id, {
        status: 'livraison',
        courier: data.courier,
        window: `${formatDate(`${data.date}T12:00:00Z`)} · ${data.window}`,
      });
      count++;
    }
    return { count };
  });

// The reader's own orders: never another's.

export const fetchMyOrders = createServerFn({ method: 'GET' }).handler(async () => {
  const viewer = await requireViewer();
  return listOrders(await db(), eq(orders.customerId, viewer.id));
});

export const fetchMyOrder = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().max(40) }))
  .handler(async ({ data }) => {
    const viewer = await requireViewer();
    return findOrder(await db(), data.id, and(eq(orders.customerId, viewer.id)));
  });
