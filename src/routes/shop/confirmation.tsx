import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { fetchConfirmation } from '@/features/checkout/functions';
import { ConfirmationPage } from '@/features/checkout/ui/ConfirmationPage';

export const Route = createFileRoute('/_shop/commande/$orderId')({
  validateSearch: (search: Record<string, unknown>) => ({ t: typeof search['t'] === 'string' ? search['t'] : undefined }),
  loaderDeps: ({ search }) => ({ t: search.t }),
  loader: ({ params, deps }) => fetchConfirmation({ data: { id: params.orderId, t: deps.t } }),
  head: () => ({ meta: [{ title: m.title_confirmation() }, { name: 'robots', content: 'noindex' }] }),
  component: ConfirmationRoute,
});

function ConfirmationRoute() {
  const result = Route.useLoaderData();
  return <ConfirmationPage order={result?.order ?? null} token={Route.useSearch().t} />;
}
