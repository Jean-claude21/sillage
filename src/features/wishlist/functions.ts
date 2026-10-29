import { createServerFn } from '@tanstack/react-start';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireViewer, viewerOf } from '@/features/auth/session.server';
import { db } from '@/platform/db';
import { wishes } from './infrastructure/wish.table';

/** The signed-in reader's wishes; an empty list for a visitor (theirs stay on the device). */
export const fetchWishes = createServerFn({ method: 'GET' }).handler(async () => {
  const viewer = await viewerOf();
  if (!viewer) return null;
  const rows = await (await db()).select({ id: wishes.bookId }).from(wishes).where(eq(wishes.userId, viewer.id));
  return rows.map((r) => r.id);
});

export const saveWish = createServerFn({ method: 'POST' })
  .validator(z.object({ bookId: z.string().min(1).max(120), wished: z.boolean() }))
  .handler(async ({ data }) => {
    const viewer = await requireViewer();
    const database = await db();
    if (data.wished) {
      await database.insert(wishes).values({ userId: viewer.id, bookId: data.bookId }).onConflictDoNothing();
    } else {
      await database.delete(wishes).where(and(eq(wishes.userId, viewer.id), eq(wishes.bookId, data.bookId)));
    }
    return { ok: true };
  });

/** Brings a visitor's wishes into their account when they sign in. */
export const mergeWishes = createServerFn({ method: 'POST' })
  .validator(z.object({ bookIds: z.array(z.string().min(1).max(120)).max(200) }))
  .handler(async ({ data }) => {
    const viewer = await requireViewer();
    if (data.bookIds.length) {
      await (await db())
        .insert(wishes)
        .values(data.bookIds.map((bookId) => ({ userId: viewer.id, bookId })))
        .onConflictDoNothing();
    }
    return { ok: true };
  });
