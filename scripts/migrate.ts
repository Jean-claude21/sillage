// Runs before each Netlify build: applies the migrations of drizzle/, then fills an empty database
// (demo catalogue; owner account from ADMIN_EMAIL; fictive orders when SEED_DEMO=1).
import { existsSync } from 'node:fs';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

// The local .env only when no database is given: never mix development values into production.
if (!process.env.DATABASE_URL && !process.env.NETLIFY_DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');

const url = process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL;
if (!url) {
  console.log('[migrate] no database URL: skipped (local development uses PGlite).');
  process.exit(0);
}

const { env } = await import('../src/platform/env');
const schema = await import('../src/platform/schema');
const { seedIfEmpty } = await import('../src/platform/seed');

const pool = new Pool({ connectionString: url });
const db = drizzle({ client: pool, schema });
await migrate(db, { migrationsFolder: 'drizzle' });
console.log('[migrate] migrations applied.');
await seedIfEmpty(db as never);
console.log(`[migrate] seed checked (demo readers: ${env.seedDemo ? 'yes' : 'no'}).`);
await pool.end();
