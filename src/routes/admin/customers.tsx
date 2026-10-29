import { createFileRoute } from '@tanstack/react-router';
import { fetchCustomers } from '@/features/account/functions';
import { CustomersView } from '@/features/account/ui/CustomersAdmin';

export const Route = createFileRoute('/admin/clients')({
  loader: () => fetchCustomers(),
  component: CustomersRoute,
});

function CustomersRoute() {
  return <CustomersView customers={Route.useLoaderData()} />;
}
