import { createServerFn } from '@tanstack/react-start';
import { randomUUID } from 'node:crypto';
import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { requireArea, requireViewer } from '@/features/auth/session.server';
import { user } from '@/features/auth/infrastructure/auth.table';
import { listBooks } from '@/features/catalog/infrastructure/catalog.queries';
import { THEME_IDS } from '@/features/catalog/domain/themes';
import { listOrders } from '@/features/orders/infrastructure/order.queries';
import { orders } from '@/features/orders/infrastructure/order.table';
import { readSettings } from '@/features/settings/infrastructure/settings.queries';
import { wishes } from '@/features/wishlist/infrastructure/wish.table';
import { db } from '@/platform/db';
import { sendMail } from '@/platform/mail';
import { addresses, tickets } from './infrastructure/account.table';

/** The reader's space in one read: profile, orders, addresses, wishes, questions. */
export const fetchAccount = createServerFn({ method: 'GET' }).handler(async () => {
  const viewer = await requireViewer();
  const database = await db();
  const [[person], myOrders, myAddresses, myWishes, myTickets, catalogue] = await Promise.all([
    database.select().from(user).where(eq(user.id, viewer.id)),
    listOrders(database, eq(orders.customerId, viewer.id)),
    database.select().from(addresses).where(eq(addresses.userId, viewer.id)).orderBy(addresses.createdAt),
    database.select({ id: wishes.bookId }).from(wishes).where(eq(wishes.userId, viewer.id)).orderBy(wishes.createdAt),
    database.select().from(tickets).where(eq(tickets.userId, viewer.id)).orderBy(desc(tickets.createdAt)),
    listBooks(database),
  ]);
  return {
    profile: {
      name: person?.name ?? viewer.name,
      email: person?.email ?? viewer.email,
      phone: person?.phone ?? '',
      newsletter: person?.newsletter ?? false,
      genres: (person?.genres ?? '').split(',').filter(Boolean),
      role: viewer.role,
    },
    orders: myOrders,
    addresses: myAddresses.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    wishes: myWishes.map((w) => catalogue.find((b) => b.id === w.id)).filter((b) => b !== undefined),
    tickets: myTickets.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
  };
});

export const saveProfile = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().trim().min(1).max(100),
      phone: z.string().trim().max(50),
      newsletter: z.boolean(),
      genres: z.array(z.enum(THEME_IDS)).max(5),
    }),
  )
  .handler(async ({ data }) => {
    const viewer = await requireViewer();
    await (await db())
      .update(user)
      .set({ name: data.name, phone: data.phone, newsletter: data.newsletter, genres: data.genres.join(','), updatedAt: new Date() })
      .where(eq(user.id, viewer.id));
    return { ok: true };
  });

const addressInput = z.object({
  id: z.string().max(60).optional(),
  label: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(100),
  street: z.string().trim().min(1).max(300),
  area: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(1).max(50),
  isDefault: z.boolean(),
});

export const saveAddress = createServerFn({ method: 'POST' })
  .validator(addressInput)
  .handler(async ({ data }) => {
    const viewer = await requireViewer();
    const database = await db();
    const mine = await database.select().from(addresses).where(eq(addresses.userId, viewer.id));
    const isDefault = data.isDefault || mine.filter((a) => a.id !== data.id).length === 0;
    if (isDefault) await database.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, viewer.id));
    const { id, ...values } = data;
    if (id && mine.some((a) => a.id === id)) {
      await database.update(addresses).set({ ...values, isDefault }).where(and(eq(addresses.id, id), eq(addresses.userId, viewer.id)));
    } else {
      await database.insert(addresses).values({ id: randomUUID(), userId: viewer.id, ...values, isDefault });
    }
    const [anyDefault] = await database.select().from(addresses).where(and(eq(addresses.userId, viewer.id), eq(addresses.isDefault, true)));
    if (!anyDefault) await database.update(addresses).set({ isDefault: true }).where(eq(addresses.id, mine[0]?.id ?? ''));
    return { ok: true };
  });

export const setDefaultAddress = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().max(60) }))
  .handler(async ({ data }) => {
    const viewer = await requireViewer();
    const database = await db();
    await database.update(addresses).set({ isDefault: sql`${addresses.id} = ${data.id}` }).where(eq(addresses.userId, viewer.id));
    return { ok: true };
  });

export const deleteAddress = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().max(60) }))
  .handler(async ({ data }) => {
    const viewer = await requireViewer();
    const database = await db();
    await database.delete(addresses).where(and(eq(addresses.id, data.id), eq(addresses.userId, viewer.id)));
    const rest = await database.select().from(addresses).where(eq(addresses.userId, viewer.id));
    if (rest.length && !rest.some((a) => a.isDefault)) await database.update(addresses).set({ isDefault: true }).where(eq(addresses.id, rest[0]!.id));
    return { ok: true };
  });

export const sendTicket = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      orderId: z.string().max(40).optional(),
      subject: z.string().trim().min(1).max(150),
      message: z.string().trim().min(10).max(3000),
    }),
  )
  .handler(async ({ data }) => {
    const viewer = await requireViewer();
    const database = await db();
    const [{ count } = { count: 0 }] = await database.select({ count: sql<number>`count(*)::int` }).from(tickets);
    const owned = data.orderId
      ? (await database.select({ id: orders.id }).from(orders).where(and(eq(orders.id, data.orderId), eq(orders.customerId, viewer.id))))[0]
      : undefined;
    await database.insert(tickets).values({
      id: `A-${String(count + 1).padStart(3, '0')}-${randomUUID().slice(0, 4)}`,
      userId: viewer.id,
      orderId: owned?.id ?? null,
      subject: data.subject,
      message: data.message,
    });
    const shop = await readSettings(database, 'shop');
    await sendMail({
      to: shop.email,
      replyTo: viewer.email,
      subject: `${data.subject}${owned ? ` · ${owned.id}` : ''}`,
      text: `${data.message}\n\n— ${viewer.name} <${viewer.email}>`,
    });
    return { ok: true };
  });

// The team's view of readers.

export const fetchCustomers = createServerFn({ method: 'GET' }).handler(async () => {
  await requireArea('customers');
  const database = await db();
  const [people, all] = await Promise.all([
    database.select({ id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city, role: user.role }).from(user).where(eq(user.role, 'customer')),
    listOrders(database),
  ]);
  return people.map((p) => {
    const theirs = all.filter((o) => o.customerId === p.id);
    return { ...p, city: p.city || theirs[0]?.city || '', orders: theirs };
  });
});

export const fetchCustomer = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().max(60) }))
  .handler(async ({ data }) => {
    await requireArea('customers');
    const database = await db();
    const [person] = await database.select({ id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city }).from(user).where(eq(user.id, data.id));
    if (!person) return null;
    const theirs = await listOrders(database, eq(orders.customerId, person.id));
    const [address] = await database.select().from(addresses).where(and(eq(addresses.userId, person.id), eq(addresses.isDefault, true)));
    return { ...person, phone: person.phone || address?.phone || '', city: person.city || address?.city || theirs[0]?.city || '', orders: theirs };
  });
