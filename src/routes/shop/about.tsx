import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { AboutPage } from '@/features/storefront/ui/StaticPages';

export const Route = createFileRoute('/_shop/maison')({
  head: () => ({ meta: [{ title: m.title_about() }] }),
  component: AboutPage,
});
