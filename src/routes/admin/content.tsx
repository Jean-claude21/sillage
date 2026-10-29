import { createFileRoute } from '@tanstack/react-router';
import { fetchSettings } from '@/features/settings/functions';
import { ContentView } from '@/features/settings/ui/SettingsViews';

export const Route = createFileRoute('/admin/contenus')({
  loader: () => fetchSettings(),
  component: ContentRoute,
});

function ContentRoute() {
  const { settings, books } = Route.useLoaderData();
  return <ContentView content={settings.content} books={books} />;
}
