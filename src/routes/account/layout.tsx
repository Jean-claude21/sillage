import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { WorkspaceShell, type NavItem, type Notice } from '@/features/workspace/ui/WorkspaceShell';
import { fetchClientShell } from '@/features/workspace/functions';
import workspaceCss from '@/styles/workspace.css?url';

export const Route = createFileRoute('/mon-compte')({
  beforeLoad: async ({ location }) => {
    const shell = await fetchClientShell();
    if (!shell.viewer) throw redirect({ to: '/connexion', search: { redirect: location.href } });
    return { shell };
  },
  loader: ({ context }) => context.shell,
  head: () => ({
    meta: [{ title: m.title_account() }, { name: 'robots', content: 'noindex,nofollow' }],
    links: [{ rel: 'stylesheet', href: workspaceCss }],
  }),
  component: AccountLayout,
});

function AccountLayout() {
  const { viewer, counts } = Route.useLoaderData();
  if (!viewer || !counts) return null;
  const nav: NavItem[] = [
    { to: '/mon-compte', icon: 'grid', label: m.ws_nav_my_overview(), exact: true },
    { to: '/mon-compte/commandes', icon: 'bag', label: m.ws_nav_my_orders(), count: counts.active },
    { to: '/mon-compte/favoris', icon: 'heart', label: m.ws_nav_my_wishes(), count: counts.wishes },
    { to: '/mon-compte/adresses', icon: 'pin', label: m.ws_nav_my_addresses() },
    { to: '/mon-compte/profil', icon: 'user', label: m.ws_nav_my_profile() },
    { to: '/mon-compte/aide', icon: 'life', label: m.ws_nav_help() },
  ];
  const notices: Notice[] = [
    ...(counts.latest
      ? [
          {
            to: `/mon-compte/commandes/${counts.latest.id}`,
            title: counts.latest.paid ? m.ws_notice_confirmed() : m.ws_notice_recorded(),
            body: m.ws_notice_order_body({ id: counts.latest.id }),
          },
        ]
      : []),
    ...(counts.wishes ? [{ to: '/mon-compte/favoris', title: m.ws_notice_wishes(), body: m.ws_notice_wishes_body() }] : []),
  ];
  return (
    <WorkspaceShell space="client" viewer={viewer} nav={nav} notices={notices}>
      <Outlet />
    </WorkspaceShell>
  );
}
