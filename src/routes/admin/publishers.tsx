import { createFileRoute } from '@tanstack/react-router';
import { fetchAdminCatalog } from '@/features/catalog/admin-functions';
import { PublishersAdmin } from '@/features/catalog/ui/admin/PublishersAdmin';

export const Route = createFileRoute('/admin/editeurs')({
  loader: () => fetchAdminCatalog(),
  component: PublishersRoute,
});

function PublishersRoute() {
  return <PublishersAdmin {...Route.useLoaderData()} />;
}
