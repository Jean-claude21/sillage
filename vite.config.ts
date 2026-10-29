import { paraglideVitePlugin } from '@inlang/paraglide-js';
import netlify from '@netlify/vite-plugin-tanstack-start';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// Local development reads .env; Netlify gives deployed functions their real environment variables.
const localEnv = fileURLToPath(new URL('./.env', import.meta.url));
if (existsSync(localEnv)) process.loadEnvFile(localEnv);

export default defineConfig(({ command }) => ({
  plugins: [
    // French only for now; every visible string lives in messages/, so a rename is one file.
    paraglideVitePlugin({
      project: fileURLToPath(new URL('./project.inlang', import.meta.url)),
      outdir: fileURLToPath(new URL('./src/paraglide', import.meta.url)),
      outputStructure: 'message-modules',
      strategy: ['baseLocale'],
    }),
    // Files are named in English; addresses are French, declared once in src/routes.ts.
    tanstackStart({ router: { virtualRouteConfig: './src/routes.ts' } }),
    react(),
    // The Netlify adapter shapes the production build; local development stays a plain Vite server.
    ...(command === 'build' ? [netlify()] : []),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  ssr: { external: ['@electric-sql/pglite'] },
}));
