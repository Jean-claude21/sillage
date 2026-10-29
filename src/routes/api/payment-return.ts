import { createFileRoute } from '@tanstack/react-router';
import { eq } from 'drizzle-orm';
import { recordPayment } from '@/features/orders/commands/record-payment';
import { orderTotal } from '@/features/orders/domain/order';
import { findOrder } from '@/features/orders/infrastructure/order.queries';
import { orders } from '@/features/orders/infrastructure/order.table';
import { paymentProvider } from '@/features/payments';
import { db } from '@/platform/db';

/**
 * The provider sends the reader back here. Nothing in the address is trusted: the shop asks the
 * provider about the order's own transaction, checks the amount, then shows the confirmation.
 */
export const Route = createFileRoute('/api/paiements/retour')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get('order') ?? '';
        const token = url.searchParams.get('t') ?? '';
        const database = await db();
        const order = await findOrder(database, id, eq(orders.accessToken, token));
        if (order && order.paymentReference && order.paymentStatus !== 'paid') {
          try {
            const result = await paymentProvider().check(order.paymentReference);
            if (result.status === 'paid' && result.amountXof === orderTotal(order)) {
              await recordPayment(database, order.id, 'paid', order.paymentReference);
            } else if (result.status === 'failed') {
              await recordPayment(database, order.id, 'failed');
            }
          } catch (error) {
            console.error('[payment] check failed', error);
          }
        }
        const target = order ? `/commande/${encodeURIComponent(order.id)}?t=${encodeURIComponent(token)}` : '/';
        return new Response(null, { status: 302, headers: { Location: target } });
      },
    },
  },
});
