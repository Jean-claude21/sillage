import { createFileRoute } from '@tanstack/react-router';
import { listBooks } from '@/features/catalog/infrastructure/catalog.queries';
import { db } from '@/platform/db';
import { env } from '@/platform/env';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const books = await listBooks(await db());
        const pages = ['/', '/catalogue', '/editeurs', '/maison', '/aide', '/contact', ...books.map((b) => `/livres/${b.id}`)];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
          .map((p) => `  <url><loc>${env.siteUrl}${p}</loc></url>`)
          .join('\n')}\n</urlset>\n`;
        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
      },
    },
  },
});
