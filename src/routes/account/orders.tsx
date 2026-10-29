import { createFileRoute } from '@tanstack/react-router';
import { fetchMyOrders } from '@/features/orders/functions';
import { ClientOrdersView } from '@/features/orders/ui/OrdersView';

export const Route = createFileRoute('/mon-compte/commandes')({
  loader: () => fetchMyOrders(),
  component: OrdersRoute,
});

function OrdersRoute() {
  return <ClientOrdersView orders={Route.useLoaderData()} />;
}
