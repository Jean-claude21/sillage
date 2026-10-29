import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { PublishersPage } from '@/features/storefront/ui/StaticPages';

export const Route = createFileRoute('/_shop/editeurs')({
  head: () => ({ meta: [{ title: m.title_publishers() }] }),
  component: PublishersPage,
});
