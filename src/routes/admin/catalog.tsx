import { createFileRoute } from '@tanstack/react-router';
import { fetchAdminCatalog } from '@/features/catalog/admin-functions';
import { CatalogueView } from '@/features/catalog/ui/admin/CatalogueAdmin';

export const Route = createFileRoute('/admin/catalogue')({
  validateSearch: (search: Record<string, unknown>): { editeur?: string } => ({
    editeur: typeof search['editeur'] === 'string' ? search['editeur'] : undefined,
  }),
  loader: () => fetchAdminCatalog(),
  component: CatalogRoute,
});

function CatalogRoute() {
  const editeur = Route.useSearch().editeur ?? '';
  return <CatalogueView key={editeur} {...Route.useLoaderData()} initialPublisher={editeur} />;
}
