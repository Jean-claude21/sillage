import { createFileRoute } from '@tanstack/react-router';
import { fetchAccount } from '@/features/account/functions';
import { ClientOverview } from '@/features/account/ui/ClientViews';

export const Route = createFileRoute('/mon-compte/')({
  loader: () => fetchAccount(),
  component: OverviewRoute,
});

function OverviewRoute() {
  return <ClientOverview account={Route.useLoaderData()} />;
}
