# Sillage — la librairie en ligne

Boutique, espace lecteur et gestion de la librairie, construits **à l’identique de la maquette validée
par le client** (`docs/maquette/`, `DESIGN.md`). « Sillage » est une marque provisoire : nom, charte et
textes se changent en quelques heures (voir « Changer de marque »).

## La pile

| Couche | Choix |
|---|---|
| Application | TanStack Start (React 19), rendu serveur, adresses en français (`src/routes.ts`) |
| Styles | Les feuilles de la maquette, reprises telles quelles (`src/styles/storefront.css`, `workspace.css`) ; les écrans nouveaux (commande, paiement, connexion) n’utilisent que leur vocabulaire (`storefront-flows.css`) |
| Données | Postgres + Drizzle. En local : PGlite embarqué dans `.data/` (rien à installer). En ligne : Netlify DB (Neon) |
| Comptes | Better Auth, e-mail + mot de passe ; rôles `owner`, `catalog`, `delivery`, `customer` |
| Textes | Paraglide, `messages/fr.json` : aucun texte visible écrit en dur |
| Paiement | Interface `payments` : fournisseur **simulé** (page de test) puis **FedaPay** (Mobile Money, carte) ; paiement à la livraison |
| E-mails | Resend, ou le journal du serveur tant qu’aucune clé n’est donnée |
| Mesure | Umami Cloud, sans cookie ; événements typés (`src/features/analytics/events.ts`) |
| Hébergement | Netlify (`netlify.toml`) |

## L’organisation : une fonctionnalité, un dossier

```
src/features/<fonctionnalité>/
  domain/          règles pures (prix, statuts, droits)
  commands/        actions qui changent l’état (passer une commande, encaisser)
  infrastructure/  tables Drizzle et requêtes
  functions.ts     fonctions serveur appelées par les écrans
  ui/              composants React
src/routes/        un fichier par adresse (déclarées une fois dans src/routes.ts)
src/platform/      base de données, environnement, e-mail, données de démonstration
```

Fonctionnalités : `catalog`, `cart`, `wishlist`, `currency`, `discovery` (le guide de lecture),
`checkout`, `payments`, `orders`, `account`, `auth`, `settings`, `contact`, `analytics`,
`storefront` (vitrine) et `workspace` (coque des deux espaces).

## Travailler en local

```bash
pnpm install
cp .env.example .env   # puis remplir BETTER_AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, DEMO_CUSTOMER_PASSWORD
pnpm dev               # http://localhost:3000 — base locale créée et remplie au premier lancement
```

- Boutique : `/` · Espace lecteur : `/mon-compte` (compte `afi.mensah@example.com`) · Gestion : `/admin` (compte `ADMIN_EMAIL`).
- `pnpm test` (règles métier) · `pnpm test:e2e` (achat complet, espaces) · `pnpm typecheck`.
- Changer le schéma : modifier un `*.table.ts`, puis `pnpm db:generate` (nouvelle migration dans `drizzle/`).
- Repartir de zéro en local : supprimer `.data/`.

## Le parcours d’achat

1. Le panier vit dans le navigateur (mêmes clés que la maquette).
2. `/commande` : coordonnées, zone de livraison (tarifs réglés dans l’admin), moyen de paiement.
3. Le serveur relit les prix dans le catalogue, vérifie et réserve le stock dans une transaction, crée
   la commande `SL-…` et envoie le récapitulatif.
4. Paiement en ligne : la page du prestataire, puis `/api/paiements/retour` **redemande l’état au
   prestataire** et vérifie le montant avant de marquer la commande payée. Paiement à la livraison :
   l’équipe confirme l’encaissement dans la fiche commande.
5. L’équipe prépare, confie au livreur (planning des livraisons), le lecteur suit tout dans son espace.

## La mesure (Umami Cloud)

Le script n’est chargé que si `VITE_UMAMI_WEBSITE_ID` est défini, et seulement sur le domaine de
production (`VITE_UMAMI_DOMAINS`). Aucun nom, e-mail ou téléphone n’est envoyé (`guard()`).
Le paiement confirmé (`order.paid`, avec `revenue` en XOF) part **du serveur**, après vérification.

Événements : `search.submit`, `search.no_results`, `catalog.filter`, `catalog.sort`, `book.view`,
`book.excerpt_open`, `wishlist.add/remove`, `cart.add/remove/open`, `guide.start/choose`,
`currency.change`, `publisher.view`, `checkout.start/delivery/payment/payment_failed`,
`order.placed`, `order.paid`, `account.signup/signin`, `newsletter.subscribe`, `contact.submit`,
`reorder.click`.

Entonnoir conseillé dans Umami : `/` → `/catalogue` → `book.view` → `cart.add` → `checkout.start` → `order.paid`.

## Mettre en ligne (Netlify)

1. Site Netlify relié au dépôt GitHub, branche `main`.
2. Netlify DB : `npx netlify db init` (Neon, fournit `NETLIFY_DATABASE_URL`).
3. Variables : `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (adresse du site), `ADMIN_EMAIL`,
   `ADMIN_PASSWORD`, `SEED_DEMO=1` pour la démonstration, `VITE_UMAMI_*`.
4. La construction lance les migrations puis le build (`netlify.toml`).

## Changer de marque

- **Nom et textes** : `messages/fr.json` (`brand_*`, `meta_*`, `title_*`…), puis le nom dans Paramètres.
- **Logo** : `BrandMark` dans `src/features/storefront/ui/ShopLayout.tsx` et `public/assets/favicon.svg`.
- **Charte** : les variables `:root` en tête des deux feuilles de `src/styles/` (`--ink`, `--green`,
  `--paper`, `--yellow`…) et les polices dans `public/assets/`.
- **Catalogue réel** : depuis l’admin, ou import à prévoir dès que le client fournit son fichier.

## Avant l’ouverture

- Compte marchand FedaPay au nom du client, puis `PAYMENT_PROVIDER=fedapay` et sa clé — l’adaptateur
  n’a pas encore été éprouvé contre un compte sandbox.
- Domaine d’envoi des e-mails (Resend) et adresse de la librairie.
- Domaine, nom, logo, charte ; catalogue, éditeurs, tarifs de livraison réels.
- `VITE_DEMO_MODE=0`, `INDEXING=1`, retirer `SEED_DEMO`.
