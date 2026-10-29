import { createFileRoute } from '@tanstack/react-router';
import { fetchAdminOrders } from '@/features/orders/functions';
import { AdminOrdersView } from '@/features/orders/ui/OrdersView';

export const Route = createFileRoute('/admin/commandes')({
  validateSearch: (search: Record<string, unknown>): { recherche?: string } => ({
    recherche: typeof search['recherche'] === 'string' ? search['recherche'] : undefined,
  }),
  loader: () => fetchAdminOrders(),
  component: OrdersRoute,
});

function OrdersRoute() {
  const q = Route.useSearch().recherche ?? '';
  return <AdminOrdersView key={q} orders={Route.useLoaderData().orders} initialQuery={q} />;
}
