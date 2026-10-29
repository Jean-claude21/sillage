import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { catalogSearch } from '@/features/catalog/domain/search';
import { CatalogPage } from '@/features/catalog/ui/CatalogPage';

export const Route = createFileRoute('/_shop/catalogue')({
  validateSearch: catalogSearch,
  head: () => ({ meta: [{ title: m.title_catalog() }] }),
  component: CatalogRoute,
});

function CatalogRoute() {
  return <CatalogPage query={Route.useSearch()} />;
}
