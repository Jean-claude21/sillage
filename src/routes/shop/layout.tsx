import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { fetchViewer } from '@/features/auth/functions';
import { fetchShop } from '@/features/catalog/functions';
import { ShopLayout } from '@/features/storefront/ui/ShopLayout';
import { ShopProvider } from '@/features/storefront/ui/shop-context';
import { fetchWishes } from '@/features/wishlist/functions';
import { startWishes } from '@/features/wishlist/ui/wish-store';
import storefrontCss from '@/styles/storefront.css?url';
import flowsCss from '@/styles/storefront-flows.css?url';

export const Route = createFileRoute('/_shop')({
  loader: async () => {
    const [shop, viewer, wishes] = await Promise.all([fetchShop(), fetchViewer(), fetchWishes()]);
    return { ...shop, viewer, wishes };
  },
  staleTime: 60_000,
  head: () => ({ links: [
      { rel: 'stylesheet', href: storefrontCss },
      { rel: 'stylesheet', href: flowsCss },
    ] }),
  component: ShopRoute,
});

function ShopRoute() {
  const { wishes, ...data } = Route.useLoaderData();
  useEffect(() => startWishes(wishes), [wishes]);
  return (
    <ShopProvider value={data}>
      <ShopLayout>
        <Outlet />
      </ShopLayout>
    </ShopProvider>
  );
}
