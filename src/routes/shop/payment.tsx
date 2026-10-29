import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { fetchConfirmation } from '@/features/checkout/functions';
import { SimulatedPaymentPage } from '@/features/checkout/ui/SimulatedPaymentPage';

export const Route = createFileRoute('/_shop/paiement/$orderId')({
  validateSearch: (search: Record<string, unknown>) => ({ t: typeof search['t'] === 'string' ? search['t'] : '' }),
  loaderDeps: ({ search }) => ({ t: search.t }),
  loader: ({ params, deps }) => fetchConfirmation({ data: { id: params.orderId, t: deps.t } }),
  head: () => ({ meta: [{ title: m.pay_title() }, { name: 'robots', content: 'noindex' }] }),
  component: PaymentRoute,
});

function PaymentRoute() {
  const result = Route.useLoaderData();
  return <SimulatedPaymentPage order={result?.order ?? null} token={Route.useSearch().t} simulated={result?.simulated ?? false} />;
}
