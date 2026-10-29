import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { readSettings } from '@/features/settings/infrastructure/settings.queries';
import { db } from '@/platform/db';
import { sendMail } from '@/platform/mail';
import { contactMessages, newsletterSubscribers } from './infrastructure/contact.table';

export const subscribeNewsletter = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.email().max(150), source: z.string().max(40).default('footer') }))
  .handler(async ({ data }) => {
    await (await db())
      .insert(newsletterSubscribers)
      .values({ email: data.email.toLowerCase(), source: data.source })
      .onConflictDoNothing();
    return { ok: true };
  });

export const sendContactMessage = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().trim().min(1).max(100),
      email: z.email().max(150),
      message: z.string().trim().min(10).max(4000),
    }),
  )
  .handler(async ({ data }) => {
    const database = await db();
    await database.insert(contactMessages).values(data);
    const shop = await readSettings(database, 'shop');
    await sendMail({
      to: shop.email,
      replyTo: data.email,
      subject: `Message de ${data.name}`,
      text: `${data.message}\n\n— ${data.name} <${data.email}>`,
    });
    return { ok: true };
  });
