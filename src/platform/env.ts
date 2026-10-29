/**
 * The environment, read once. Netlify DB gives NETLIFY_DATABASE_URL; any Postgres works through
 * DATABASE_URL. Without either, development runs on an embedded Postgres (PGlite) in .data/.
 */
export const env = {
  databaseUrl: process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL ?? '',
  localDataDir: process.env.LOCAL_DATA_DIR ?? '.data/pglite',
  authSecret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-secret-change-me-in-production-0000',
  siteUrl: process.env.BETTER_AUTH_URL ?? process.env.URL ?? 'http://localhost:3000',
  /** "fedapay" once the shop's merchant account exists; "simulated" shows a test payment page. */
  paymentProvider: (process.env.PAYMENT_PROVIDER ?? 'simulated') as 'simulated' | 'fedapay',
  fedapaySecretKey: process.env.FEDAPAY_SECRET_KEY ?? '',
  fedapayEnvironment: (process.env.FEDAPAY_ENVIRONMENT ?? 'sandbox') as 'sandbox' | 'live',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  mailFrom: process.env.MAIL_FROM ?? 'Sillage <bonjour@sillage.example>',
  umamiWebsiteId: process.env.VITE_UMAMI_WEBSITE_ID ?? '',
  umamiHost: process.env.VITE_UMAMI_HOST ?? 'https://cloud.umami.is',
  /** Neon object storage of the database's branch (covers). Empty locally: files go to .data/. */
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT ?? '',
    region: process.env.STORAGE_REGION ?? 'us-east-2',
    bucket: process.env.STORAGE_BUCKET ?? 'covers',
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? '',
  },
  seedDemo: process.env.SEED_DEMO === '1',
  adminEmail: process.env.ADMIN_EMAIL ?? '',
  adminPassword: process.env.ADMIN_PASSWORD ?? '',
  demoCustomerPassword: process.env.DEMO_CUSTOMER_PASSWORD ?? '',
};
