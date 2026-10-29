import { createServerFn } from '@tanstack/react-start';
import { eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { STAFF_ROLES } from '@/features/auth/domain/roles';
import { user } from '@/features/auth/infrastructure/auth.table';
import { requireArea } from '@/features/auth/session.server';
import { listBooks } from '@/features/catalog/infrastructure/catalog.queries';
import { db } from '@/platform/db';
import { env } from '@/platform/env';
import { contentSettings, deliverySettings, paymentSettings, shopSettings } from './domain/settings';
import { readAllSettings, writeSettings } from './infrastructure/settings.queries';

export const fetchSettings = createServerFn({ method: 'GET' }).handler(async () => {
  await requireArea('content');
  const database = await db();
  const [settings, team, books] = await Promise.all([
    readAllSettings(database),
    database.select({ id: user.id, name: user.name, email: user.email, role: user.role }).from(user).where(ne(user.role, 'customer')),
    listBooks(database),
  ]);
  return { settings, team, books, paymentProvider: env.paymentProvider };
});

const change = z.discriminatedUnion('key', [
  z.object({ key: z.literal('shop'), value: shopSettings }),
  z.object({ key: z.literal('delivery'), value: deliverySettings }),
  z.object({ key: z.literal('payments'), value: paymentSettings }),
  z.object({ key: z.literal('content'), value: contentSettings }),
]);

export const saveSettings = createServerFn({ method: 'POST' })
  .validator(change)
  .handler(async ({ data }) => {
    await requireArea(data.key === 'content' ? 'content' : 'settings');
    const database = await db();
    if (data.key === 'shop') await writeSettings(database, 'shop', data.value);
    if (data.key === 'delivery') await writeSettings(database, 'delivery', data.value);
    if (data.key === 'payments') await writeSettings(database, 'payments', data.value);
    if (data.key === 'content') await writeSettings(database, 'content', data.value);
    return { ok: true };
  });

/** Gives a role of the team to an existing account, or takes it back (never one's own). */
export const setMemberRole = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.email(), role: z.enum([...STAFF_ROLES, 'customer']) }))
  .handler(async ({ data }) => {
    const viewer = await requireArea('settings');
    const database = await db();
    const [person] = await database.select().from(user).where(eq(user.email, data.email.toLowerCase()));
    if (!person) return { ok: false as const, reason: 'unknown' as const };
    if (person.id === viewer.id) return { ok: false as const, reason: 'self' as const };
    await database.update(user).set({ role: data.role, updatedAt: new Date() }).where(eq(user.id, person.id));
    return { ok: true as const };
  });
