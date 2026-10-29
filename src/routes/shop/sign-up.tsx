import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { SignUpPage } from '@/features/auth/ui/AuthPages';

export const Route = createFileRoute('/_shop/inscription')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search['redirect'] === 'string' ? search['redirect'] : undefined,
  }),
  head: () => ({ meta: [{ title: m.auth_sign_up_title() }, { name: 'robots', content: 'noindex' }] }),
  component: AuthRoute,
});

function AuthRoute() {
  return <SignUpPage redirect={Route.useSearch().redirect} />;
}
