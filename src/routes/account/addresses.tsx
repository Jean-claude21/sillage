import { createFileRoute } from '@tanstack/react-router';
import { fetchAccount } from '@/features/account/functions';
import { AddressesView } from '@/features/account/ui/ClientViews';

export const Route = createFileRoute('/mon-compte/adresses')({
  loader: () => fetchAccount(),
  component: AddressesRoute,
});

function AddressesRoute() {
  const { addresses, profile } = Route.useLoaderData();
  return <AddressesView addresses={addresses} name={profile.name} />;
}
