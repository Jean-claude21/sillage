import { createFileRoute } from '@tanstack/react-router';
import { env } from '@/platform/env';

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () => {
        // A preview stays out of search engines until the shop opens (INDEXING=1).
        const open = process.env.INDEXING === '1';
        const body = open
          ? `User-agent: *\nDisallow: /admin\nDisallow: /mon-compte\nDisallow: /commande\nDisallow: /paiement\nSitemap: ${env.siteUrl}/sitemap.xml\n`
          : 'User-agent: *\nDisallow: /\n';
        return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      },
    },
  },
});
