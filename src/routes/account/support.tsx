import { createFileRoute } from '@tanstack/react-router';
import { fetchAccount } from '@/features/account/functions';
import { SupportView } from '@/features/account/ui/ClientViews';

export const Route = createFileRoute('/mon-compte/aide')({
  validateSearch: (search: Record<string, unknown>): { commande?: string } => ({
    commande: typeof search['commande'] === 'string' ? search['commande'] : undefined,
  }),
  loader: () => fetchAccount(),
  component: SupportRoute,
});

function SupportRoute() {
  const { orders, tickets } = Route.useLoaderData();
  return <SupportView orders={orders} tickets={tickets} orderId={Route.useSearch().commande} />;
}
