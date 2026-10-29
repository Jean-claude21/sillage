import { createFileRoute } from '@tanstack/react-router';
import { fetchAdminCatalog } from '@/features/catalog/admin-functions';
import { CatalogueView } from '@/features/catalog/ui/admin/CatalogueAdmin';

export const Route = createFileRoute('/admin/stocks')({
  loader: () => fetchAdminCatalog(),
  component: StocksRoute,
});

function StocksRoute() {
  return <CatalogueView {...Route.useLoaderData()} stocks />;
}
