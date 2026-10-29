import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { catalogSearch } from '@/features/catalog/domain/search';
import { CatalogPage } from '@/features/catalog/ui/CatalogPage';

export const Route = createFileRoute('/_shop/favoris')({
  validateSearch: catalogSearch,
  head: () => ({ meta: [{ title: m.title_wishes() }] }),
  component: WishesRoute,
});

function WishesRoute() {
  return <CatalogPage query={Route.useSearch()} wishes />;
}
