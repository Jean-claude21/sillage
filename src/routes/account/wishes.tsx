import { createFileRoute } from '@tanstack/react-router';
import { fetchAccount } from '@/features/account/functions';
import { FavoritesView } from '@/features/account/ui/ClientViews';

export const Route = createFileRoute('/mon-compte/favoris')({
  loader: () => fetchAccount(),
  component: WishesRoute,
});

function WishesRoute() {
  return <FavoritesView wishes={Route.useLoaderData().wishes} />;
}
