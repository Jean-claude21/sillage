import { createFileRoute } from '@tanstack/react-router';
import { fetchAdminOrders } from '@/features/orders/functions';
import { DeliveriesView } from '@/features/orders/ui/DeliveriesPayments';

export const Route = createFileRoute('/admin/livraisons')({
  loader: () => fetchAdminOrders(),
  component: DeliveriesRoute,
});

function DeliveriesRoute() {
  const { orders, couriers } = Route.useLoaderData();
  return <DeliveriesView orders={orders} couriers={couriers} />;
}
