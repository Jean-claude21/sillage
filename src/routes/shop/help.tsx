import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/paraglide/messages.js';
import { HelpPage } from '@/features/storefront/ui/StaticPages';

export const Route = createFileRoute('/_shop/aide')({
  head: () => ({ meta: [{ title: m.title_help() }] }),
  component: HelpPage,
});
