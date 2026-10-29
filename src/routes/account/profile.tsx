import { createFileRoute } from '@tanstack/react-router';
import { fetchAccount } from '@/features/account/functions';
import { ProfileView } from '@/features/account/ui/ClientViews';

export const Route = createFileRoute('/mon-compte/profil')({
  loader: () => fetchAccount(),
  component: ProfileRoute,
});

function ProfileRoute() {
  return <ProfileView profile={Route.useLoaderData().profile} />;
}
