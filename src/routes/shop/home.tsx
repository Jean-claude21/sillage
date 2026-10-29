import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/features/storefront/ui/HomePage';

export const Route = createFileRoute('/_shop/')({
  component: HomePage,
});
