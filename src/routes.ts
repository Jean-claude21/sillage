import { index, layout, rootRoute, route } from '@tanstack/virtual-file-routes';

// Every address of the app, once: files are named in English, addresses read in French.
export const routes = rootRoute('__root.tsx', [
  layout('shop', 'shop/layout.tsx', [
    index('shop/home.tsx'),
    route('/catalogue', 'shop/catalog.tsx'),
    route('/favoris', 'shop/wishes.tsx'),
    route('/livres/$bookId', 'shop/book.tsx'),
    route('/editeurs', 'shop/publishers.tsx'),
    route('/maison', 'shop/about.tsx'),
    route('/aide', 'shop/help.tsx'),
    route('/contact', 'shop/contact.tsx'),
    route('/commande', 'shop/checkout.tsx'),
    route('/commande/$orderId', 'shop/confirmation.tsx'),
    route('/paiement/$orderId', 'shop/payment.tsx'),
    route('/connexion', 'shop/sign-in.tsx'),
    route('/inscription', 'shop/sign-up.tsx'),
  ]),
  route('/api/auth/$', 'api/auth.ts'),
  route('/api/paiements/retour', 'api/payment-return.ts'),
  route('/sitemap.xml', 'api/sitemap.ts'),
  route('/robots.txt', 'api/robots.ts'),
]);
