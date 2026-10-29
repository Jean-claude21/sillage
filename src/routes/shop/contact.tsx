import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { ContactPage } from '@/features/storefront/ui/StaticPages';

export const Route = createFileRoute('/_shop/contact')({
  head: () => ({ meta: [{ title: m.title_contact() }] }),
  component: ContactPage,
});
