import { createFileRoute } from '@tanstack/react-router';
import { fetchSettings } from '@/features/settings/functions';
import { SettingsView } from '@/features/settings/ui/SettingsViews';

const TABS = ['boutique', 'livraison', 'paiements', 'equipe'] as const;

export const Route = createFileRoute('/admin/parametres')({
  validateSearch: (search: Record<string, unknown>): { onglet?: (typeof TABS)[number] } => ({
    onglet: TABS.find((t) => t === search['onglet']) ?? 'boutique',
  }),
  loader: () => fetchSettings(),
  component: SettingsRoute,
});

function SettingsRoute() {
  const onglet = Route.useSearch().onglet ?? 'boutique';
  const { settings, team, paymentProvider } = Route.useLoaderData();
  return <SettingsView key={onglet} tab={onglet} settings={settings} team={team} paymentProvider={paymentProvider} />;
}
