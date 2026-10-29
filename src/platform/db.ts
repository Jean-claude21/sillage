import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { env } from './env';
import * as schema from './schema';

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

let instance: Promise<Db> | undefined;

/**
 * The database: Postgres on Neon (Netlify DB) when a URL is given, otherwise an embedded Postgres
 * in .data/ that migrates and seeds itself, so `pnpm dev` works with nothing to configure.
 */
export function db(): Promise<Db> {
  instance ??= open().catch((error: unknown) => {
    instance = undefined;
    throw error;
  });
  return instance;
}

async function open(): Promise<Db> {
  if (env.databaseUrl) {
    const { Pool } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-serverless');
    return drizzle({ client: new Pool({ connectionString: env.databaseUrl }), schema }) as unknown as Db;
  }
  const { mkdirSync } = await import('node:fs');
  mkdirSync(env.localDataDir, { recursive: true });
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const local = drizzle({ client: new PGlite(env.localDataDir), schema });
  await migrate(local, { migrationsFolder: 'drizzle' });
  const { seedIfEmpty } = await import('./seed');
  await seedIfEmpty(local as unknown as Db);
  return local as unknown as Db;
}
