import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { fetchCheckoutProfile } from '@/features/checkout/functions';
import { CheckoutPage } from '@/features/checkout/ui/CheckoutPage';

export const Route = createFileRoute('/_shop/commande')({
  loader: () => fetchCheckoutProfile(),
  head: () => ({ meta: [{ title: m.title_checkout() }, { name: 'robots', content: 'noindex' }] }),
  component: CheckoutRoute,
});

function CheckoutRoute() {
  return <CheckoutPage prefill={Route.useLoaderData()} />;
}
