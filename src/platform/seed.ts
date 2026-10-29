import { hashPassword } from 'better-auth/crypto';
import { randomBytes, randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import type { Db } from './db';
import { demoBooks } from './demo-catalogue';
import { env } from './env';
import { account, activity, addresses, books, orderLines, orders, publishers, tickets, user, wishes } from './schema';

const demoPublishers = [
  {
    id: 'les-editions-du-large',
    name: 'Les Éditions du Large',
    email: 'bonjour@large.example',
    blurb: 'Romans, sciences et essais : des regards ouverts pour explorer le monde et ses histoires.',
    logoText: 'le large',
    logoKicker: 'ÉDITIONS',
    position: 0,
  },
  {
    id: 'maison-des-pages',
    name: 'Maison des Pages',
    email: 'contact@pages.example',
    blurb: 'Littérature, livres pratiques et beaux projets : le goût des idées qui se partagent.',
    logoText: 'maison\ndes pages',
    logoKicker: null,
    position: 1,
  },
  {
    id: 'editions-aube',
    name: 'Éditions Aube',
    email: 'contact@aube.example',
    blurb: 'Des aventures jeunesse et des livres de découverte pour tous les âges.',
    logoText: 'aube',
    logoKicker: 'ÉDITIONS',
    position: 2,
  },
];

/** Fills an empty database: the demo catalogue always, fictive readers and orders on demand. */
export async function seedIfEmpty(db: Db): Promise<void> {
  const [{ count } = { count: 0 }] = await db.select({ count: sql<number>`count(*)::int` }).from(publishers);
  if (count === 0) {
    await db.insert(publishers).values(demoPublishers);
    await db.insert(books).values(demoBooks.map((b) => ({ ...b })));
  }
  await seedStaff(db);
  if (env.seedDemo || !env.databaseUrl) await seedDemoReaders(db);
}

async function createPerson(
  db: Db,
  person: { name: string; email: string; role?: string; phone?: string; city?: string; genres?: string },
  password?: string,
): Promise<string> {
  const existing = await db.select({ id: user.id }).from(user).where(sql`${user.email} = ${person.email}`);
  if (existing[0]) return existing[0].id;
  const id = randomUUID();
  await db.insert(user).values({ id, emailVerified: true, ...person });
  if (password) {
    await db.insert(account).values({
      id: randomUUID(),
      accountId: id,
      providerId: 'credential',
      userId: id,
      password: await hashPassword(password),
    });
  }
  return id;
}

/** The owner account comes from ADMIN_EMAIL and ADMIN_PASSWORD, never from the code. */
async function seedStaff(db: Db): Promise<void> {
  if (!env.adminEmail || !env.adminPassword) return;
  const id = await createPerson(db, { name: 'Équipe Sillage', email: env.adminEmail, role: 'owner' }, env.adminPassword);
  await db.update(user).set({ role: 'owner' }).where(sql`${user.id} = ${id}`);
}

/** The fictive readers and orders of the mockup, so the workspaces can be explored before opening. */
async function seedDemoReaders(db: Db): Promise<void> {
  const [{ count } = { count: 0 }] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
  if (count > 0) return;
  const readers = [
    { key: 'afi', name: 'Afi Mensah', email: 'afi.mensah@example.com', city: 'Lomé', phone: '90 00 00 00', genres: 'litterature,jeunesse' },
    { key: 'kokou', name: 'Kokou Agbo', email: 'kokou.agbo@example.com', city: 'Lomé' },
    { key: 'senam', name: 'Sénam Lawson', email: 'senam.lawson@example.com', city: 'Lomé' },
    { key: 'ama', name: 'Ama Dossa', email: 'ama.dossa@example.com', city: 'Kpalimé' },
    { key: 'yao', name: 'Yao Kpodar', email: 'yao.kpodar@example.com', city: 'Lomé' },
    { key: 'essi', name: 'Essi Soh', email: 'essi.soh@example.com', city: 'Lomé' },
  ];
  const ids: Record<string, string> = {};
  for (const { key, ...person } of readers) {
    const password = key === 'afi' ? env.demoCustomerPassword || undefined : undefined;
    ids[key] = await createPerson(db, { phone: '+228 · numéro de démonstration', ...person }, password);
  }
  const book = (id: string) => demoBooks.find((b) => b.id === id)!;
  const line = (orderId: string, id: string, qty = 1) => ({
    orderId,
    bookId: id,
    title: book(id).title,
    author: book(id).author,
    cover: book(id).cover,
    priceXof: book(id).priceXof,
    qty,
  });
  // Dates follow today, so the overview always shows a living week.
  const day = (offset: number, time: string) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - offset);
    const [h, min] = time.split(':').map(Number);
    d.setUTCHours(h ?? 9, min ?? 0, 0, 0);
    // Early in the morning, "today 09:42" would be in the future: keep the same order, in the past.
    return d.getTime() > Date.now() ? new Date(d.getTime() - 86_400_000) : d;
  };
  const demo = [
    { n: 1048, c: 'afi', at: day(0, '09:42'), pay: 'paid', method: 'mobile_money', del: 'a-preparer', items: ['maison-des-marees', 'etoiles-de-naya'], fee: 1500, zone: 'lome', area: 'Tokoin', city: 'Lomé', address: '12, rue Exemple · Tokoin, Lomé', courier: '', window: 'Demain · 09 h – 13 h', note: '' },
    { n: 1047, c: 'kokou', at: day(0, '09:18'), pay: 'paid', method: 'card', del: 'prete', items: ['champ-des-possibles', 'comprendre-economie'], fee: 1500, zone: 'lome', area: 'Agoè', city: 'Lomé', address: '8, avenue de Démonstration · Agoè, Lomé', courier: '', window: 'Aujourd’hui · 14 h – 18 h', note: 'Appeler avant le passage (exemple).' },
    { n: 1046, c: 'senam', at: day(1, '17:35'), pay: 'paid', method: 'mobile_money', del: 'livraison', items: ['histoire-du-monde'], fee: 1500, zone: 'lome', area: 'Bè', city: 'Lomé', address: '4, rue des Lecteurs · Bè, Lomé', courier: 'Kossi · équipe livraison', window: 'Aujourd’hui · 14 h – 18 h', note: '' },
    { n: 1045, c: 'ama', at: day(1, '15:10'), pay: 'pending', method: 'mobile_money', del: 'a-preparer', items: ['saveurs-maison'], fee: 2500, zone: 'outside', area: 'Kpalimé', city: 'Kpalimé', address: 'Maison Exemple · Kpalimé', courier: '', window: 'À organiser après paiement', note: '' },
    { n: 1044, c: 'yao', at: day(2, '11:23'), pay: 'paid', method: 'card', del: 'livree', items: ['minuit-sur-le-fleuve', 'milo-voyage'], fee: 1500, zone: 'lome', area: 'Adidogomé', city: 'Lomé', address: 'Rue Exemple · Adidogomé, Lomé', courier: 'Kossi · équipe livraison', window: 'Livrée', note: '' },
    { n: 1043, c: 'essi', at: day(3, '16:05'), pay: 'refunded', method: 'mobile_money', del: 'annulee', items: ['carnet-creatif'], fee: 1500, zone: 'lome', area: 'Tokoin', city: 'Lomé', address: 'Rue Exemple · Tokoin, Lomé', courier: '', window: '', note: 'Commande annulée à la demande du client (démo).' },
    { n: 1042, c: 'afi', at: day(8, '13:42'), pay: 'paid', method: 'mobile_money', del: 'livree', items: ['liens-invisibles', 'histoire-du-monde'], fee: 1500, zone: 'lome', area: 'Tokoin', city: 'Lomé', address: '12, rue Exemple · Tokoin, Lomé', courier: 'Ama · équipe livraison', window: 'Livrée', note: '' },
    { n: 1041, c: 'afi', at: day(15, '10:09'), pay: 'paid', method: 'card', del: 'livree', items: ['etoiles-de-naya', 'milo-voyage'], fee: 1500, zone: 'lome', area: 'Tokoin', city: 'Lomé', address: '12, rue Exemple · Tokoin, Lomé', courier: 'Ama · équipe livraison', window: 'Livrée', note: '' },
  ] as const;
  for (const o of demo) {
    const reader = readers.find((r) => r.key === o.c)!;
    const id = `SL-${o.n}`;
    await db.insert(orders).values({
      id,
      number: o.n,
      customerId: ids[o.c] ?? null,
      customerName: reader.name,
      email: reader.email,
      phone: '+228 · numéro de démonstration',
      paymentStatus: o.pay,
      paymentMethod: o.method,
      paymentReference: `DEMO-${id}`,
      deliveryStatus: o.del,
      zone: o.zone,
      area: o.area,
      city: o.city,
      address: o.address,
      fee: o.fee,
      courier: o.courier,
      window: o.window,
      note: o.note,
      accessToken: randomBytes(18).toString('base64url'),
      createdAt: o.at,
      updatedAt: o.at,
    });
    await db.insert(orderLines).values(o.items.map((b) => line(id, b)));
  }
  const afi = ids['afi']!;
  await db.insert(addresses).values([
    { id: randomUUID(), userId: afi, label: 'Maison', name: 'Afi Mensah', street: '12, rue Exemple', area: 'Tokoin', city: 'Lomé', phone: '90 00 00 00', isDefault: true },
    { id: randomUUID(), userId: afi, label: 'Bureau', name: 'Afi Mensah', street: '8, avenue de Démonstration', area: 'Assivito', city: 'Lomé', phone: '90 00 00 00', isDefault: false },
  ]);
  await db.insert(wishes).values(
    ['liens-invisibles', 'monde-en-questions', 'milo-voyage', 'carnet-creatif'].map((bookId) => ({ userId: afi, bookId })),
  );
  await db.insert(tickets).values({
    id: 'A-001',
    userId: afi,
    subject: 'Disponibilité d’un livre',
    message: 'Je souhaitais connaître la disponibilité du carnet des idées.',
    status: 'resolved',
    createdAt: day(7, '10:00'),
  });
  await db.insert(activity).values([
    { text: 'Une livraison est en cours dans le quartier de Bè.', createdAt: day(0, '09:15') },
    { text: 'La commande SL-1047 est prête à être livrée.', createdAt: day(0, '09:30') },
    { text: 'Paiement confirmé pour la commande SL-1048.', createdAt: day(0, '09:42') },
  ]);
}
