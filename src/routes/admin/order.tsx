import { createFileRoute } from '@tanstack/react-router';
import { fetchAdminOrder } from '@/features/orders/functions';
import { OrderDetail } from '@/features/orders/ui/OrderDetail';

export const Route = createFileRoute('/admin/commandes/$orderId')({
  loader: ({ params }) => fetchAdminOrder({ data: { id: params.orderId } }),
  component: OrderRoute,
});

function OrderRoute() {
  const { order, couriers } = Route.useLoaderData();
  const { shopName } = Route.useRouteContext().shell;
  return <OrderDetail order={order} couriers={couriers} admin shopName={shopName} />;
}
