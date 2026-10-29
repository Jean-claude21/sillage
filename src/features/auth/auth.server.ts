import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { db } from '@/platform/db';
import { env } from '@/platform/env';
import { account, session, user, verification } from './infrastructure/auth.table';

async function create() {
  return betterAuth({
    secret: env.authSecret,
    baseURL: env.siteUrl,
    database: drizzleAdapter(await db(), { provider: 'pg', schema: { user, session, account, verification } }),
    emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
    session: { expiresIn: 60 * 60 * 24 * 30, cookieCache: { enabled: true, maxAge: 5 * 60 } },
    user: {
      additionalFields: {
        role: { type: 'string', required: false, defaultValue: 'customer', input: false },
        phone: { type: 'string', required: false, defaultValue: '' },
        city: { type: 'string', required: false, defaultValue: '' },
        newsletter: { type: 'boolean', required: false, defaultValue: false },
        genres: { type: 'string', required: false, defaultValue: '' },
      },
    },
    plugins: [tanstackStartCookies()],
  });
}

let instance: ReturnType<typeof create> | undefined;

export function auth() {
  instance ??= create();
  return instance;
}
