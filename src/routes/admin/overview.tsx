import { createFileRoute } from '@tanstack/react-router';
import { fetchAdminOverview } from '@/features/orders/functions';
import { AdminOverview } from '@/features/orders/ui/AdminOverview';

export const Route = createFileRoute('/admin/')({
  loader: () => fetchAdminOverview(),
  component: OverviewRoute,
});

function OverviewRoute() {
  return <AdminOverview {...Route.useLoaderData()} />;
}
