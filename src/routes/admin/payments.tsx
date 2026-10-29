import { createFileRoute } from '@tanstack/react-router';
import { fetchAdminOrders } from '@/features/orders/functions';
import { PaymentsView } from '@/features/orders/ui/DeliveriesPayments';

export const Route = createFileRoute('/admin/paiements')({
  loader: () => fetchAdminOrders(),
  component: PaymentsRoute,
});

function PaymentsRoute() {
  return <PaymentsView orders={Route.useLoaderData().orders} />;
}
