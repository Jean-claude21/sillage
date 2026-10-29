import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import * as m from '@/paraglide/messages.js';
import { UmamiScript } from '@/features/analytics/UmamiScript';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#173f35' },
      { title: m.meta_title() },
      { name: 'description', content: m.meta_description() },
    ],
    links: [
      { rel: 'icon', href: '/assets/favicon.svg', type: 'image/svg+xml' },
      { rel: 'preload', href: '/assets/manrope.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
    ],
  }),
  component: Root,
});

function Root() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

function Document({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
        <UmamiScript />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
