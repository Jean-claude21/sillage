import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { can, isStaff } from '@/features/auth/domain/roles';
import { viewerOf } from '@/features/auth/session.server';
import { listBooks } from '@/features/catalog/infrastructure/catalog.queries';
import { inQueue } from '@/features/orders/domain/order';
import { listOrders } from '@/features/orders/infrastructure/order.queries';
import { orders } from '@/features/orders/infrastructure/order.table';
import { readSettings } from '@/features/settings/infrastructure/settings.queries';
import { wishes } from '@/features/wishlist/infrastructure/wish.table';
import { db } from '@/platform/db';

/** Who opens the team's space, and the counts its rail and bell show. */
export const fetchAdminShell = createServerFn({ method: 'GET' }).handler(async () => {
  const viewer = await viewerOf();
  if (!viewer || !isStaff(viewer.role)) return { viewer, counts: null, shopName: '' };
  const database = await db();
  const [all, books, shop] = await Promise.all([listOrders(database), listBooks(database, { withDrafts: true }), readSettings(database, 'shop')]);
  return {
    viewer,
    shopName: shop.name,
    counts: {
      queue: can(viewer.role, 'orders') ? all.filter(inQueue).length : 0,
      low: books.filter((b) => b.active && b.stock <= b.threshold).length,
      delivering: all.filter((o) => o.deliveryStatus === 'livraison').length,
      firstDelivering: all.find((o) => o.deliveryStatus === 'livraison')?.id ?? null,
    },
  };
});

/** The reader's rail: orders in progress and wishes. */
export const fetchClientShell = createServerFn({ method: 'GET' }).handler(async () => {
  const viewer = await viewerOf();
  if (!viewer) return { viewer, counts: null, shopName: '' };
  const database = await db();
  const [mine, wished, shop] = await Promise.all([
    listOrders(database, eq(orders.customerId, viewer.id)),
    database.select({ id: wishes.bookId }).from(wishes).where(eq(wishes.userId, viewer.id)),
    readSettings(database, 'shop'),
  ]);
  return {
    viewer,
    shopName: shop.name,
    counts: {
      active: mine.filter((o) => !['livree', 'annulee'].includes(o.deliveryStatus)).length,
      wishes: wished.length,
      latest: mine[0] ? { id: mine[0].id, paid: mine[0].paymentStatus === 'paid' } : null,
    },
  };
});
