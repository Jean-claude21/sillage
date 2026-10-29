import { createFileRoute } from '@tanstack/react-router';
import { fetchMyOrder } from '@/features/orders/functions';
import { OrderDetail } from '@/features/orders/ui/OrderDetail';

export const Route = createFileRoute('/mon-compte/commandes/$orderId')({
  loader: ({ params }) => fetchMyOrder({ data: { id: params.orderId } }),
  component: OrderRoute,
});

function OrderRoute() {
  const { shopName } = Route.useRouteContext().shell;
  return <OrderDetail order={Route.useLoaderData()} admin={false} shopName={shopName} />;
}
