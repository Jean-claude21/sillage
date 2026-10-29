# Sillage — Proposition de frontend

Une maquette de librairie multiéditeurs en HTML, CSS et JavaScript natifs, sans compilation ni dépendance d’exécution. « Sillage » est une marque provisoire. L’utilisateur a confirmé une librairie généraliste avec des ouvrages de tout genre et des éditeurs partenaires.

## Ouvrir la maquette

Ouvrir `dist/index.html` directement dans un navigateur. Le fonctionnement est également prévu derrière un simple serveur HTTP statique. Tous les visuels et toutes les polices sont locaux. Le sélecteur de pays interroge l’API publique Frankfurter pour les dernières cotations de change disponibles. Les prix de référence XOF et les parités fixes EUR/XAF restent utilisables sans cette requête.

## Parcours disponibles

- Accueil avec sélection éditoriale, thèmes, coffrets et éditeurs.
- Catalogue de douze références fictives, recherche insensible aux accents, filtres par thème et éditeur, tri par titre et prix, états sans résultat.
- Fiches livre avec extrait, informations et suggestion de lectures complémentaires.
- Guide de lecture, favoris et panier avec quantités, suppression et calcul du sous-total.
- Pages éditeurs, présentation de la librairie, questions fréquentes et contact.
- Récapitulatif de panier, formulaires de contact et de newsletter en mode démonstration.
- Adaptation mobile, menu compact, navigation au clavier et prise en compte de la préférence de mouvement réduit.

Le panier, les favoris, le pays sélectionné et un cache des taux sont conservés uniquement dans le navigateur grâce à `localStorage`, lorsque celui-ci est disponible. Pas de compte, paiement, commande, e-mail, suivi statistique ou administration connecté.

## Pourquoi cette direction

Le site [Metanoia & Vie](https://metanoiaetvie.com/) sert de référence métier : librairie chrétienne, collections, packs et parcours d’achat. La proposition reprend les fonctions de commerce et de navigation sans reproduire la marque ou les contenus du tiers. Elle présente une librairie généraliste : romans, jeunesse, BD, essais, sciences et livres pratiques.

Le recul pris sur le site de référence conduit à cinq choix :

1. **Une promesse claire dès l’accueil.** L’utilisateur comprend l’univers de la librairie, puis peut explorer le catalogue ou se faire guider.
2. **Moins de concurrence entre les sélections.** Une sélection courte et des chemins par thème, plutôt que de nombreuses rangées de produits équivalentes.
3. **Une recherche visible.** Recherche par titre, auteur, thème ou éditeur, complétée par des filtres et un tri explicites.
4. **Une place pour les partenaires.** Page dédiée aux maisons d’édition, liens depuis les fiches et filtrage de leur catalogue.
5. **Un panier facile à vérifier.** Confirmation après ajout, modification des quantités, suppression, sous-total et maintien du panier à la navigation.

La direction visuelle associe une base claire, un vert profond et des couleurs de couvertures qui différencient les livres. La typographie Manrope structure l’interface ; Bodoni Moda italique apporte ponctuellement une voix plus littéraire. Les couvertures géométriques SVG sont originales et modifiables. Les illustrations de produits seront remplacées par les vrais visuels fournis par les éditeurs.

## Références de recherche

Consultées le 27 octobre 2026 :

- [Baymard — Homepage & Category Navigation UX](https://baymard.com/research/homepage-and-category-usability) : découverte des produits, catégories et navigation. Source des principes de navigation ; ne constitue pas une validation mesurée de cette maquette.
- [Nielsen Norman Group — Ecommerce Homepages & Listing Pages](https://www.nngroup.com/articles/ecommerce-homepages-listing-pages/) : informations utiles à chaque étape vers le produit.
- [Nielsen Norman Group — Ecommerce Product Pages](https://www.nngroup.com/articles/ecommerce-product-pages/) : titre, visuel, prix, disponibilité et confirmation de l’ajout au panier.
- [Daunt Books](https://dauntbooks.co.uk/) : référence observée pour la sélection de livres, les chemins de découverte et l’identité d’une librairie. Inspiration éditoriale, sans copie de mise en page ou d’assets.
- [Bookshop.org](https://bookshop.org/) : référence observée pour le contexte de librairie indépendante et la découverte par sélections. Aucune reproduction de ses contenus.

Il n’existe pas de « meilleur design » universel : cette piste devra être confrontée au vrai catalogue et aux usages de la clientèle.

## À valider avant l’administration

Le nom, le logo et l’identité de la marque ; les thèmes et filtres utiles ; les vrais éditeurs et produits ; le parcours mobile ; la place des coffrets ; les contenus des fiches ; puis les conditions commerciales et la destination des formulaires.

Après validation : définir les données livres/auteurs/éditeurs, les variantes et stocks, les commandes, les rôles et les fonctions réellement nécessaires dans l’espace admin. Cette phase n’est pas implémentée dans le prototype.

## Structure

`dist/index.html` : structure, en-tête, pied de page et dialogues.

`dist/styles.css` : styles, variables, états et adaptations d’écran.

`dist/app.js` : catalogue de démonstration, routes et interactions.

`dist/currency.js` : pays, conversion d’affichage, taux, cache et gestion des indisponibilités.

`netlify.toml` et `dist/_headers` : configuration de publication et en-têtes du prototype. Le dossier local `.netlify/` est ignoré par Git.

`dist/assets/` : couvertures SVG, favicon et polices auto-hébergées.

`DESIGN.md` : vocabulaire visuel observé et règles de prolongement.

## Vérification

Le parcours a été contrôlé en navigateur à 1440 et 390 pixels : affichage, absence de débordement horizontal, images chargées, guide vers une fiche, ajout au panier et sous-totaux dans les différentes devises, favoris, recherche d’éditeur, filtre thématique et tri de prix. Le JavaScript passe le contrôle de syntaxe Node. Ces vérifications ne remplacent pas les tests de paiement, d’envoi, d’authentification ou de compatibilité nécessaires lors de la construction de la boutique réelle.

## Polices

Manrope et Bodoni Moda sont distribuées sous SIL Open Font License. Les notices figurent dans `dist/assets/OFL-Manrope.txt` et `dist/assets/OFL-BodoniModa.txt`.

## Pays et devises

Le Togo et le franc CFA de l’UEMOA (XOF) sont les valeurs par défaut. Le choix du pays règle uniquement la devise d’affichage ; il ne promet pas une livraison dans ce pays. Les prix de base sont des montants entiers en XOF. Les lignes du panier et leur sous-total additionnent les mêmes prix unitaires convertis et arrondis à la précision monétaire.

La parité EUR est fixée à 655,957 XOF pour 1 EUR ; XAF/XOF = 1 à la parité de référence. Source : [BCEAO](https://www.bceao.int/fr/content/histoire-du-franc-cfa). Les autres devises utilisent [Frankfurter v2](https://frankfurter.dev/), avec date de cotation visible. Il s’agit de dernières cotations quotidiennes, pas d’un flux de marché en temps réel. La récupération est faite à l’ouverture, lors d’un choix sans cache récent ou à la demande. En cas d’échec, la sélection précédente reste active. Un cache jusqu’à sept jours permet une reprise, avec la date de la cotation affichée.

Un véritable flux intrajournalier nécessitera un fournisseur et un abonnement adaptés ; aucune fréquence temps réel n’est simulée. Les moyens de paiement, leur devise de débit et le montant final seront vérifiés côté serveur lors de l’intégration du paiement.

## Livraison et espaces à venir

La librairie organisera elle-même les livraisons. Les tarifs, zones et délais ne sont pas inventés par la maquette. Les maquettes des espaces client et admin sont maintenant disponibles. Leur authentification et leurs services réels restent à connecter après validation. Aucune clé Netlify ou Neon ne figure dans les fichiers publiés.

Les drapeaux sont fournis par Flagcdn et hébergés localement.

## Aperçu publié

[Ouvrir la proposition Sillage](https://sillage-librairie.netlify.app). Publication statique manuelle sur le compte Netlify de l’utilisateur. Aucun dépôt Git n’est relié au déploiement. Le sous-domaine sillage-librairie.netlify.app a été retenu ; aucun domaine payant n’a été acheté. Les fichiers locaux .netlify/ sont exclus de Git.

## Maquettes client et admin

- [Espace client](https://sillage-librairie.netlify.app/mon-compte/) : aperçu, commandes, suivi, favoris, adresses, profil et assistance.
- [Administration](https://sillage-librairie.netlify.app/admin/) : aperçu, commandes, catalogue, fiches livre, stocks, clients, éditeurs, livraisons, paiements, contenus et paramètres.

Les espaces sont accessibles sans identifiants : ce sont des démonstrations publiques avec des personnes et commandes fictives. Le bandeau le rappelle sur chaque écran. Le bouton « Réinitialiser » remet les deux espaces à leur état initial, sans modifier le panier de la boutique. Les changements restent locaux à cet appareil ; ils ne publient pas de modifications de catalogue sur la boutique.

Les écrans partagent le catalogue de base dans dist/catalogue.js. Les fichiers dist/workspace.css, workspace.js, workspace-views.js et workspace-events.js portent respectivement la présentation, les données/helpers, les vues et les interactions. Les pages dist/admin/index.html et dist/mon-compte/index.html sont leurs points d’entrée. Utiliser un serveur HTTP statique pour explorer les espaces localement, car leurs ressources emploient des chemins à la racine.

Les contrôles et limites des nouvelles maquettes sont décrits dans VERIFICATION-ESPACES.md. Aucune clé privée n’est ajoutée au code publié.
