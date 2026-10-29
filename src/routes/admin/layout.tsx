import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { WorkspaceShell, type NavItem, type Notice } from '@/features/workspace/ui/WorkspaceShell';
import { fetchAdminShell } from '@/features/workspace/functions';
import workspaceCss from '@/styles/workspace.css?url';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const shell = await fetchAdminShell();
    if (!shell.viewer) throw redirect({ to: '/connexion', search: { redirect: location.href } });
    if (!shell.counts) throw redirect({ to: '/mon-compte' });
    return { shell };
  },
  loader: ({ context }) => context.shell,
  head: () => ({
    meta: [{ title: m.title_admin() }, { name: 'robots', content: 'noindex,nofollow' }],
    links: [{ rel: 'stylesheet', href: workspaceCss }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { viewer, counts } = Route.useLoaderData();
  const navigate = useNavigate();
  if (!viewer || !counts) return null;
  const nav: NavItem[] = [
    { to: '/admin', icon: 'grid', label: m.ws_nav_overview(), area: 'overview', exact: true },
    { to: '/admin/commandes', icon: 'bag', label: m.ws_nav_orders(), count: counts.queue, area: 'orders' },
    { to: '/admin/catalogue', icon: 'book', label: m.ws_nav_catalog(), area: 'catalog' },
    { to: '/admin/stocks', icon: 'box', label: m.ws_nav_stocks(), count: counts.low, area: 'stocks' },
    { to: '/admin/clients', icon: 'users', label: m.ws_nav_customers(), area: 'customers' },
    { to: '/admin/editeurs', icon: 'layers', label: m.ws_nav_publishers(), area: 'publishers' },
    { to: '/admin/livraisons', icon: 'truck', label: m.ws_nav_deliveries(), area: 'deliveries' },
    { to: '/admin/paiements', icon: 'wallet', label: m.ws_nav_payments(), area: 'payments' },
  ];
  const secondary: NavItem[] = [
    { to: '/admin/contenus', icon: 'edit', label: m.ws_nav_content(), area: 'content' },
    { to: '/admin/parametres', icon: 'settings', label: m.ws_nav_settings(), area: 'settings' },
  ];
  const notices: Notice[] = [
    ...(counts.queue ? [{ to: '/admin/commandes', title: m.ws_notice_queue({ count: counts.queue }), body: m.ws_notice_queue_body() }] : []),
    ...(counts.low ? [{ to: '/admin/stocks', title: m.ws_notice_low({ count: counts.low }), body: m.ws_notice_low_body() }] : []),
    ...(counts.firstDelivering
      ? [{ to: '/admin/livraisons', title: m.ws_notice_delivering({ count: counts.delivering }), body: m.ws_notice_delivering_body({ id: counts.firstDelivering }) }]
      : []),
  ];
  return (
    <WorkspaceShell
      space="admin"
      viewer={viewer}
      nav={nav}
      secondary={secondary}
      notices={notices}
      onSearch={(q) => {
        const id = q.replace(/^#/, '').toUpperCase();
        if (/^SL-\d+$/.test(id)) void navigate({ to: '/admin/commandes/$orderId', params: { orderId: id } });
        else void navigate({ to: '/admin/commandes', search: { recherche: q } });
      }}
    >
      <Outlet />
    </WorkspaceShell>
  );
}
