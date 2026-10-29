import { randomBytes } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { books } from '@/features/catalog/infrastructure/catalog.table';
import { orderLines, orders } from '@/features/orders/infrastructure/order.table';
import { logActivity } from '@/features/orders/infrastructure/order.queries';
import { readAllSettings } from '@/features/settings/infrastructure/settings.queries';
import type { Db } from '@/platform/db';
import { sendMail } from '@/platform/mail';
import { formatXof } from '@/lib/text';
import * as m from '@/paraglide/messages.js';
import { CheckoutError, deliveryFee, type CheckoutInput } from '../domain/checkout';

export interface PlacedOrder {
  id: string;
  token: string;
  total: number;
  items: number;
}

/**
 * Turns a cart into an order in one transaction: prices are read from the catalogue, never from
 * the browser; each book's stock is checked and reserved. Payment comes after, outside.
 */
export async function placeOrder(db: Db, input: CheckoutInput, customerId: string | null): Promise<PlacedOrder> {
  const settings = await readAllSettings(db);
  const allowed = {
    mobile_money: settings.payments.mobileMoney,
    card: settings.payments.card,
    cash_on_delivery: settings.payments.cashOnDelivery,
  };
  if (!allowed[input.paymentMethod]) throw new CheckoutError('method');
  const fee = deliveryFee(input.zone, settings.delivery);
  const token = randomBytes(18).toString('base64url');

  const placed = await db.transaction(async (tx) => {
    const lines = [];
    for (const line of input.lines) {
      const [book] = await tx.select().from(books).where(eq(books.id, line.id)).for('update');
      if (!book || !book.active) throw new CheckoutError('unavailable', line.id);
      if (book.stock < line.qty) throw new CheckoutError('stock', line.id);
      await tx
        .update(books)
        .set({ stock: sql`${books.stock} - ${line.qty}`, updatedAt: new Date() })
        .where(eq(books.id, book.id));
      lines.push({ bookId: book.id, title: book.title, author: book.author, cover: book.cover, priceXof: book.priceXof, qty: line.qty });
    }
    const result: unknown = await tx.execute(sql`select nextval(pg_get_serial_sequence('orders', 'number'))::int as next`);
    // Neon and PGlite both answer { rows }; a driver answering a bare array is accepted too.
    const rows = (Array.isArray(result) ? result : (result as { rows: unknown[] }).rows) as { next: number }[];
    const next = Number(rows[0]?.next);
    if (!Number.isInteger(next)) throw new Error('order number unavailable');
    const id = `SL-${next}`;
    await tx.insert(orders).values({
      id,
      number: next,
      customerId,
      customerName: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      paymentMethod: input.paymentMethod,
      zone: input.zone,
      area: input.area,
      city: input.city,
      address: `${input.street} · ${input.area}, ${input.city}`,
      fee,
      window: input.paymentMethod === 'cash_on_delivery' ? m.window_to_organise() : m.window_after_payment(),
      customerNote: input.note,
      accessToken: token,
    });
    await tx.insert(orderLines).values(lines.map((l) => ({ ...l, orderId: id })));
    return { id, lines };
  });

  const subtotal = placed.lines.reduce((s, l) => s + l.priceXof * l.qty, 0);
  const total = subtotal + fee;
  await logActivity(db, m.activity_placed({ id: placed.id, name: input.name }));
  const summary = placed.lines.map((l) => `${l.qty} × ${l.title} — ${formatXof(l.priceXof * l.qty)}`).join('\n');
  await sendMail({
    to: input.email,
    subject: m.mail_placed_subject({ id: placed.id }),
    text: m.mail_placed_body({ name: input.name, id: placed.id, lines: summary, fee: formatXof(fee), total: formatXof(total), shop: settings.shop.name }),
  });
  await sendMail({
    to: settings.shop.email,
    subject: m.mail_team_subject({ id: placed.id }),
    text: m.mail_team_body({ id: placed.id, name: input.name, area: input.area, total: formatXof(total) }),
  });
  return { id: placed.id, token, total, items: placed.lines.reduce((s, l) => s + l.qty, 0) };
}
