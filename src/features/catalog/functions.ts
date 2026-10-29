import { createServerFn } from '@tanstack/react-start';
import { readAllSettings } from '@/features/settings/infrastructure/settings.queries';
import { db } from '@/platform/db';
import { listBooks, listPublishers } from './infrastructure/catalog.queries';

/**
 * What every page of the shop needs, read once by its layout: the published books, the publishers
 * and the public settings. The catalogue filters on the device, instantly, as in the mockup.
 */
export const fetchShop = createServerFn({ method: 'GET' }).handler(async () => {
  const database = await db();
  const [books, publishers, settings] = await Promise.all([
    listBooks(database),
    listPublishers(database),
    readAllSettings(database),
  ]);
  return {
    books,
    publishers,
    shop: settings.shop,
    content: settings.content,
    delivery: { lome: settings.delivery.lome, outside: settings.delivery.outside },
    payments: settings.payments,
  };
});

export type ShopData = Awaited<ReturnType<typeof fetchShop>>;
