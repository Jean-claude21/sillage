# Sillage — contexte du projet

Projet client : une librairie en ligne (boutique, espace lecteur, gestion). Lire `README.md` d’abord.

## Règles

- **Le design est celui de la maquette validée** (`docs/maquette/`, `DESIGN.md`). Les feuilles
  `src/styles/storefront.css` et `workspace.css` en sont des copies : on ne les réécrit pas, on
  réutilise leurs classes. Un écran nouveau n’emploie que leur vocabulaire (`storefront-flows.css`).
- **Une fonctionnalité, un dossier** (`src/features/<f>/{domain,commands,infrastructure,ui}`,
  `functions.ts`). Les écrans n’importent jamais une table directement.
- **Le code est en anglais, la documentation en français.** Aucun texte visible en dur : tout passe
  par `messages/fr.json` (Paraglide).
- **Aucun nom de fournisseur dans le domaine** : paiement, e-mail, mesure vivent derrière leur adaptateur.
- **Aucun secret dans un fichier suivi.** Les valeurs vivent dans Netlify et dans
  `F:/programmation/perso/.secrets/sillage.env`.
- Le prix vient toujours du serveur ; une commande n’est payée qu’après relecture chez le prestataire.

## Branches

`main` (production, geste humain) · `dev` (intégration) · `NNN-slug` par fonctionnalité.

## Vérifier

`pnpm typecheck && pnpm test && pnpm test:e2e` avant toute fusion ; les captures de revue vont dans
`review/` (ignoré par Git, `node scripts/shots.mjs <url> <nom> [largeur]`).
