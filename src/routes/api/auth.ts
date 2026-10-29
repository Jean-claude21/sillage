import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/features/auth/auth.server';

const handle = async ({ request }: { request: Request }) => (await auth()).handler(request);

export const Route = createFileRoute('/api/auth/$')({
  server: { handlers: { GET: handle, POST: handle } },
});
