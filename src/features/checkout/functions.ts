import { createServerFn } from '@tanstack/react-start';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { viewerOf } from '@/features/auth/session.server';
import { addresses } from '@/features/account/infrastructure/account.table';
import { recordPayment } from '@/features/orders/commands/record-payment';
import { orderTotal, type OrderView } from '@/features/orders/domain/order';
import { findOrder } from '@/features/orders/infrastructure/order.queries';
import { orders } from '@/features/orders/infrastructure/order.table';
import { paymentProvider } from '@/features/payments';
import { db } from '@/platform/db';
import { env } from '@/platform/env';
import * as m from '@/paraglide/messages.js';
import { placeOrder } from './commands/place-order';
import { checkoutInput, CheckoutError } from './domain/checkout';

/** What the checkout form can fill in for a signed-in reader. */
export const fetchCheckoutProfile = createServerFn({ method: 'GET' }).handler(async () => {
  const viewer = await viewerOf();
  if (!viewer) return null;
  const rows = await (await db()).select().from(addresses).where(eq(addresses.userId, viewer.id));
  const address = rows.find((a) => a.isDefault) ?? rows[0];
  return {
    name: viewer.name,
    email: viewer.email,
    phone: address?.phone ?? '',
    street: address?.street ?? '',
    area: address?.area ?? '',
    city: address?.city ?? '',
  };
});

async function startPayment(order: OrderView, token: string): Promise<string | null> {
  if (order.paymentMethod === 'cash_on_delivery' || order.paymentStatus === 'paid') return null;
  const provider = paymentProvider();
  const returnUrl = `${env.siteUrl}/api/paiements/retour?order=${encodeURIComponent(order.id)}&t=${encodeURIComponent(token)}`;
  const { redirectUrl, reference } = await provider.start({
    orderId: order.id,
    amountXof: orderTotal(order),
    description: m.payment_description({ id: order.id }),
    customer: { name: order.customerName, email: order.email, phone: order.phone },
    returnUrl,
  });
  await (await db()).update(orders).set({ paymentReference: reference }).where(eq(orders.id, order.id));
  return redirectUrl;
}

export const submitOrder = createServerFn({ method: 'POST' })
  .validator(checkoutInput)
  .handler(async ({ data }) => {
    const viewer = await viewerOf();
    const database = await db();
    try {
      const placed = await placeOrder(database, data, viewer?.id ?? null);
      const order = (await findOrder(database, placed.id))!;
      let redirect: string | null = null;
      try {
        redirect = await startPayment(order, placed.token);
      } catch (error) {
        console.error('[payment] start failed', error);
      }
      return { ok: true as const, id: placed.id, token: placed.token, total: placed.total, items: placed.items, redirect };
    } catch (error) {
      if (error instanceof CheckoutError) return { ok: false as const, reason: error.reason, bookId: error.bookId ?? null };
      throw error;
    }
  });

const access = z.object({ id: z.string().min(1).max(40), t: z.string().max(80).optional() });

/** An order for its confirmation page: by its secret link, or for the reader who placed it. */
async function readable(id: string, token?: string) {
  const database = await db();
  if (token) {
    const order = await findOrder(database, id, eq(orders.accessToken, token));
    if (order) return order;
  }
  const viewer = await viewerOf();
  if (!viewer) return null;
  return findOrder(database, id, eq(orders.customerId, viewer.id));
}

export const fetchConfirmation = createServerFn({ method: 'GET' })
  .validator(access)
  .handler(async ({ data }) => {
    const order = await readable(data.id, data.t);
    return order ? { order, simulated: paymentProvider().id === 'simulated' } : null;
  });

/** Opens the payment page again for an order that is not paid yet. */
export const retryPayment = createServerFn({ method: 'POST' })
  .validator(access)
  .handler(async ({ data }) => {
    const order = await readable(data.id, data.t);
    if (!order) return { redirect: null };
    const [row] = await (await db()).select({ token: orders.accessToken }).from(orders).where(eq(orders.id, order.id));
    return { redirect: await startPayment(order, row?.token ?? '') };
  });

/** The test payment page's answer. Refused unless this deployment runs the simulated provider. */
export const confirmSimulatedPayment = createServerFn({ method: 'POST' })
  .validator(access.extend({ outcome: z.enum(['paid', 'failed']) }))
  .handler(async ({ data }) => {
    if (paymentProvider().id !== 'simulated') throw new Error('not available');
    const database = await db();
    const order = await findOrder(database, data.id, and(eq(orders.accessToken, data.t ?? '')));
    if (!order || order.paymentStatus === 'paid') return { ok: Boolean(order) };
    await recordPayment(database, order.id, data.outcome, `SIM-${order.id}`);
    return { ok: true };
  });
