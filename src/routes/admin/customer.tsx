import { createFileRoute } from '@tanstack/react-router';
import { fetchCustomer } from '@/features/account/functions';
import { CustomerView } from '@/features/account/ui/CustomersAdmin';

export const Route = createFileRoute('/admin/clients/$customerId')({
  loader: ({ params }) => fetchCustomer({ data: { id: params.customerId } }),
  component: CustomerRoute,
});

function CustomerRoute() {
  return <CustomerView customer={Route.useLoaderData()} />;
}
