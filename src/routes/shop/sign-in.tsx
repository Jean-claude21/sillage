import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { SignInPage } from '@/features/auth/ui/AuthPages';

export const Route = createFileRoute('/_shop/connexion')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search['redirect'] === 'string' ? search['redirect'] : undefined,
  }),
  head: () => ({ meta: [{ title: m.auth_sign_in_title() }, { name: 'robots', content: 'noindex' }] }),
  component: AuthRoute,
});

function AuthRoute() {
  return <SignInPage redirect={Route.useSearch().redirect} />;
}
