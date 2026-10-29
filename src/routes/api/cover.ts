import { createFileRoute } from '@tanstack/react-router';
import { readCover } from '@/features/catalog/infrastructure/cover-store';

/** Serves an uploaded cover. Keys are unique per upload, so browsers may keep them for a year. */
export const Route = createFileRoute('/images/couvertures/$key')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(params.key)) return new Response(null, { status: 404 });
        const cover = await readCover(params.key);
        if (!cover) return new Response(null, { status: 404 });
        return new Response(cover.bytes as BodyInit, {
          headers: {
            'Content-Type': cover.contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      },
    },
  },
});
