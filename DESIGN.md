---
name: Sillage
description: Proposition de système visuel pour une librairie généraliste multiéditeurs.
colors:
  paper: "#faf9f5"
  ink: "#193d34"
  green: "#194e3d"
  muted: "#626b63"
  line: "#dfE2d8"
  yellow: "#f4cd65"
  peach: "#eed4c0"
  lavender: "#e7e3ef"
  white: "white"
  button-hover: "#2b5b4b"
  secondary-border: "#a4afa2"
  secondary-hover: "#e2e7dc"
  focus: "#a56b18"
  search-surface: "#efF0e9"
  chip-border: "#d9ddd2"
  book-surface: "#eceee7"
  stage-peach: "#e9cbb3"
  curated-surface: "#e3e8dd"
  workspace-background: "#f3f5ef"
  workspace-surface: "#fffefa"
  workspace-muted: "#657064"
  workspace-line: "#e2e7dd"
  workspace-success: "#496342"
  workspace-success-background: "#edf1e8"
  workspace-warning: "#82561c"
  workspace-warning-background: "#faf0d9"
  workspace-danger: "#a33c38"
  workspace-danger-background: "#fae9e5"
  workspace-info: "#395b7b"
  workspace-info-background: "#eaf0f5"
  workspace-focus: "#ac751d"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(42px,4.7vw,70px)"
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(29px,3vw,42px)"
    fontWeight: 550
    lineHeight: 1.14
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 650
    lineHeight: 1.14
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 1.65
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 650
    lineHeight: 1.65
  emphasis:
    fontFamily: "Bodoni, Georgia, serif"
    fontSize: "1.18em"
    fontWeight: 500
    lineHeight: 0.9
  workspace-title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "29px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  workspace-title-compact:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  workspace-heading:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  workspace-body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "13px"
    lineHeight: 1.6
rounded:
  badge: "2px"
  field: "4px"
  button: "5px"
  search: "6px"
  modal: "12px"
  pill: "30px"
  circle: "50%"
  workspace-panel: "10px"
spacing:
  compact: "8px"
  small: "12px"
  regular: "16px"
  medium: "20px"
  large: "24px"
  group: "28px"
  spacious: "40px"
  modal: "48px"
  section: "65px"
  workspace-panel: "22px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "13px 21px"
  button-primary-hover:
    backgroundColor: "{colors.button-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "13px 21px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
  theme-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  theme-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  search:
    backgroundColor: "{colors.search-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.search}"
    padding: "6px 8px 6px 15px"
  contact-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px"
  modal:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.modal}"
    padding: "48px"
  workspace-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "10px 15px"
  workspace-panel:
    backgroundColor: "{colors.workspace-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.workspace-panel}"
  workspace-status:
    backgroundColor: "{colors.workspace-success-background}"
    textColor: "{colors.workspace-success}"
    rounded: "{rounded.field}"
    padding: "4px 7px"
  workspace-status-warning:
    backgroundColor: "{colors.workspace-warning-background}"
    textColor: "{colors.workspace-warning}"
  workspace-status-danger:
    backgroundColor: "{colors.workspace-danger-background}"
    textColor: "{colors.workspace-danger}"
  workspace-status-info:
    backgroundColor: "{colors.workspace-info-background}"
    textColor: "{colors.workspace-info}"
---

# Design System: Sillage

## Overview

**Creative North Star: "La librairie qui accompagne"**

Ce document décrit la proposition HTML/CSS/JS actuellement construite dans `dist/`, extraite de `index.html`, `styles.css` et `app.js`. Sillage est une marque provisoire. L'atmosphère, les noms descriptifs et les règles ci-dessous formalisent cette version pour avis ; ils ne constituent pas une identité approuvée par le client.

La direction associe le calme du papier ivoire, une encre verte profonde et des mises en scène de livres sur fonds pastel. Une sans-serif contemporaine porte la navigation et la lecture ; l'italique Bodoni apporte une voix plus littéraire à quelques mots des grands titres. La présentation donne d'abord une place aux ouvrages, puis à leurs thèmes et aux maisons d'édition.

**Key Characteristics:**

- Fond papier, texte vert et séparateurs fins.
- Titres Manrope avec accents Bodoni italiques.
- Couvertures mises en volume, surfaces d'interface presque plates.
- Angles légèrement adoucis, filtres en capsules, actions utilitaires circulaires.
- Densité commerciale mesurée et grilles resserrées sur mobile.

Les deux maquettes navigables `/mon-compte/` et `/admin/` prolongent cette proposition dans des espaces de travail : la continuité vient du papier, de l'encre forêt, de Manrope et des couvertures. Leur extraction repose sur `workspace.css`, `workspace.js`, `workspace-views.js`, `workspace-events.js` et les deux fichiers HTML d'entrée. Les décisions restent proposées pour avis. Le préfixe documentaire `workspace-*` limite les ajouts ci-dessous à ces espaces ; il ne remplace ni les tokens marketing existants ni les variables CSS, dont certains noms se recoupent entre les feuilles séparées.

## Colors

La palette observée est chaude et végétale : les verts structurent l'interface, tandis que les pastels servent de fonds aux livres.

### Primary

- **Encre forêt — `ink`** : texte principal, boutons pleins, bandeau éditeurs, capsule sélectionnée et notifications.
- **Vert feuillage — `green`** : accent des titres, état favori, disponibilité et contrôle de recherche actif.
- **Or de focus — `focus`** : contour de navigation au clavier ; distinct de la couleur d'action.

### Secondary

- **Soleil — `yellow`** : compteurs et macaron de la composition de livres ; ce n'est pas le fond du bouton principal.
- **Pêche de scène — `stage-peach`** : fond du visuel d'accueil.
- **Sauge claire — `curated-surface`** : surface de la sélection mise en avant.
- **Pêche — `peach`** et **lavande — `lavender`** : variables déclarées à la racine, actuellement sans référence `var()` dans le CSS. Les fonds pastel construits emploient aussi des valeurs locales ; ne pas supposer que ces deux variables pilotent déjà ces scènes.

### Neutral

- **Papier — `paper`** : fond de page, tiroir et fenêtres modales.
- **Gris végétal — `muted`** : auteurs, descriptions et informations secondaires.
- **Ligne douce — `line`** : séparateurs horizontaux et groupes de filtres.
- **Surface recherche — `search-surface`** : champ de recherche intégré à l'en-tête.
- **Surface livre — `book-surface`** : première variante de présentoir catalogue. Les variantes alternées sont définies localement dans le CSS.
- **Blanc — `white`** : libellés sur boutons ou capsules sombres.

Les valeurs machine ci-dessus conservent les couleurs du CSS. Les variantes de survol et de bordure décrivent des états réellement présents. Les rampes du fichier compagnon sont des interpolations documentaires, sans effet sur le frontend.

### Espaces client et administration

Le fond `workspace-background` porte la page ; `workspace-surface` détache les panneaux. Le papier et l'encre existants restent communs à la barre latérale, à la barre supérieure et aux actions. `workspace-muted` et `workspace-line` décrivent les variantes locales du texte secondaire et des séparateurs, sans modifier les équivalents marketing.

Les couples `workspace-success`, `workspace-warning`, `workspace-danger` et `workspace-info`, avec leurs fonds respectifs, portent les états textuels : payé ou livré, attente ou stock bas, échec ou rupture, préparation ou livraison en cours. L'annulation et le remboursement sont neutres ; ils ne partagent pas la gravité d'un échec. `workspace-focus` est le contour clavier propre aux espaces.

**The Explicit Status Rule.** Dans les espaces, chaque couleur d'état accompagne un libellé lisible ; paiement et livraison conservent deux statuts séparés.

## Typography

**Display Font:** Manrope, avec Arial et sans-serif en secours.

**Body Font:** Manrope, même pile de secours.

**Emphasis Font:** Bodoni italique, avec Georgia et serif en secours.

Les deux fontes sont hébergées localement dans `dist/assets/`. Manrope déclare une plage de graisse (200–800) ; Bodoni italique une plage (400–700). Le contraste repose sur le changement de dessin de l'italique, sans changer de famille pour les commandes ou les paragraphes.

### Hierarchy

- **Display** : titre d'accueil fluide défini dans le frontmatter. Les pages intérieures emploient des tailles spécifiques : introduction (49px), fiche livre (44px).
- **Headline** : titres de section fluides ; la lettre d'information utilise une taille locale (31px).
- **Title** : base des petits titres ; les titres de livres passent à (14px), graisse (650), interligne (1.5).
- **Body** : base globale (14px / 1.65). Les descriptions commerciales emploient aussi (12–13px) et un interligne (1.85–1.9).
- **Label** : boutons et liens d'action compacts. Les métadonnées utilisent souvent (10px) et les badges (8px), avec capitales et espacement léger.
- **Emphasis** : italique Bodoni ; taille relative et interligne serré définis dans le frontmatter.

La hiérarchie n'est pas une échelle modulaire unique : des tailles locales répondent aux différents composants. Sur les petits écrans, les champs de saisie passent à (16px) ; plusieurs métadonnées restent compactes. Cette documentation constate ces choix sans certifier leur lisibilité pour tous les lecteurs.

### Espaces client et administration

Manrope est la seule famille chargée et employée par l'interface de ces deux espaces ; Bodoni reste dans le storefront. Le corps utilise `workspace-body`, les titres de panneaux `workspace-heading`. Le titre de page utilise `workspace-title`, puis `workspace-title-compact` à (1000px) et moins : des tailles fixes par seuil, sans `clamp()`. Les titres secondaires des panneaux passent localement à (16px) sous (760px). Les chiffres de synthèse utilisent (27px), puis (24px), (22px), (25px) et (24px) selon les seuils successifs. Les valeurs locales ne constituent pas une nouvelle rampe marketing.

Les tableaux gardent des cellules à (11px), des en-têtes et badges généralement à (9px), et quelques métadonnées à (8–10px). Les champs de formulaire sont à (12px), puis (16px) dès (760px) et moins. Les petits corps demandent une validation de lisibilité avec le client. Le reçu HTML fictif téléchargé est un document autonome en Arial, avec un titre à (28px), distinct de l'interface Manrope.

## Layout

Le conteneur central plafonne à (1320px), avec une largeur initiale de `calc(100% - 112px)`. Il ménage donc deux gouttières de (56px), puis (32px) à la première réduction et (20px) sous le seuil tablette. Les sections catalogue courantes utilisent un espace supérieur (65px) et inférieur (68px), ramenés à (45px) sous le seuil tablette.

Les grilles d'accueil affichent quatre livres par ligne, écart (27px). Le catalogue associe une colonne filtres (205px), un écart (42px) et trois colonnes de livres. Les compositions éditoriales et la fiche produit partagent deux colonnes ; la fiche produit utilise un écart (70px). Le pied de page comporte quatre colonnes.

Les points de rupture proviennent des règles CSS, avec un comportement cumulatif :

| Condition | Adaptation observée |
| --- | --- |
| `min-width: 1500px` | Ajustement des marges de la composition d'accueil. |
| `max-width: 1150px` | Gouttières (32px), filtres (180px), espacements réduits ; libellés des icônes d'en-tête masqués. |
| `max-width: 800px` | Gouttières (20px), recherche sur sa propre ligne, menu dépliant, grilles de livres à deux colonnes ; filtres masqués derrière un bouton ; pied de page à deux colonnes. |
| `max-width: 520px` | Accueil, sélection, fiche produit et lettre en une colonne ; livres conservés en deux colonnes ; boutons d'ajout (44 × 44px), favoris (40 × 40px), champs (16px). |

Les capsules thématiques défilent horizontalement sous (800px). Le tiroir panier utilise `min(490px,100%)`, occupe toute la hauteur (`100dvh`) et conserve une zone de lignes défilante. La fenêtre centrale utilise `min(620px,calc(100% - 32px))` et une hauteur maximale liée au viewport.

### Espaces client et administration

La barre latérale fixe mesure (232px), la barre supérieure (76px) de haut ; le contenu occupe la colonne restante avec une largeur minimale nulle et un plafond de (1600px). Les gouttières sont de (35px), les écarts courants de (22px). Les panneaux de synthèse, listes et détails privilégient la séparation par traits. Les quatre indicateurs partagent une même bande. À partir de (1650px), les gouttières passent à (50px).

| Condition propre aux espaces | Adaptation observée |
| --- | --- |
| `max-width: 1200px` | Barre latérale (210px), gouttières (25px), écarts (18px), favoris à trois colonnes et recherche supérieure réduite. |
| `max-width: 1000px` | Titre de page compact ; listes principales et détails sur une colonne, panneaux secondaires encore en deux colonnes ; éditeurs présentés en lignes et paramètres avec navigation resserrée. |
| `max-width: 760px` | Barre latérale hors champ (245px), ouverte par bouton et voile ; barre supérieure (65px), gouttières (20px), recherche supérieure masquée, indicateurs en grille de deux ; navigation des paramètres horizontale. |
| `max-width: 520px` | Actions sous le titre ; panneaux secondaires, adresses, formulaires et fiches éditeurs sur une colonne ; favoris à deux colonnes ; illustration du résumé client masquée et étapes de suivi en grille de deux. |

Les tableaux défilent dans leur propre conteneur, sans élargir la page : les tableaux standards ont une largeur minimale de (620px) sous (760px), puis (650px) sous (520px). La variante compacte conserve une largeur minimale de (550px) sous (760px), y compris sur petit écran. Leur conteneur positionné et les libellés visuellement cachés ancrés en haut à gauche évitent un débordement horizontal artificiel. Le tiroir de détail utilise (520px) maximum et toute la hauteur disponible, avec défilement interne.

**The Contained Table Rule.** Dans les espaces, conserver le tableau lisible et son défilement horizontal dans le panneau ; ne pas réduire les cellules pour les faire tenir dans le viewport mobile.

## Elevation & Depth

La profondeur est hybride : les surfaces et la navigation de bureau sont plates et séparées par des traits ; les couvertures, le panier et les fenêtres utilisent des ombres. Les rotations et petits déplacements au survol appartiennent aux livres et aux boutons, sans animation continue.

### Shadow Vocabulary

- **Fenêtre / tiroir** : `0 18px 60px #173f3526` ; variable `--shadow` appliquée aux éléments `dialog`.
- **Livre en scène** : `13px 18px 19px #5b3c3238` ; ombre de la composition d'accueil.
- **Couverture catalogue** : `drop-shadow(9px 13px 9px #22222224)` ; attache l'objet au présentoir.
- **Menu mobile** : `0 15px 20px #173f351a` ; détache le menu sous l'en-tête.
- **Notification** : `0 5px 25px #0002` ; signale l'événement au-dessus du contenu.

L'arrière-plan modal est assombri par `#122c2377`. Les transitions courantes durent (0.2s), les couvertures (0.35s) et les livres en scène (0.45s). Le chargement de route passe de (0.6) à (1) d'opacité avec un décalage vertical initial (7px), en (0.35s). `prefers-reduced-motion: reduce` supprime animations et transitions et désactive le défilement fluide.

Dans les espaces, les panneaux de travail restent plats : fond, bordure et rayon suffisent. L'ombre revient aux éléments superposés : menu de profil (`0 12px 36px #163f3526`), tiroir (`-10px 0 45px #193d3424`) et notification (`0 7px 25px #173f3526`). Le voile du menu mobile (`#122d2566`) et l'arrière-plan du tiroir (`#112e2660`) ont des portées distinctes. Le menu coulisse en (0.2s), la notification apparaît en (0.18s) et les interrupteurs se déplacent en (0.15s). La préférence de mouvement réduit supprime animations et transitions.

## Shapes

Les formes restent proches de l'objet livre : rectangles à angles discrets pour les présentoirs, champs et actions, tranches légèrement arrondies sur les couvertures. Les rayons observés sont consignés dans le frontmatter. La variable `--radius` vaut (12px), mais les composants portent actuellement leurs propres rayons littéraux ; ne pas supposer qu'elle les contrôle tous.

Le cercle sert aux favoris, au bouton d'ajout, aux compteurs et aux formes solaires des scènes. Les filtres sont des capsules longues. La fenêtre centrale est plus arrondie que les boutons, tandis que le tiroir panier conserve des coins droits.

Les espaces prolongent les rectangles adoucis : panneaux au rayon `workspace-panel`, actions et champs (5px), badges (4px), navigation latérale (6px). Les avatars restent circulaires. Le tiroir de travail garde des coins droits ; l'ajout d'adresse utilise une bordure pointillée. Ces rayons locaux ne remplacent pas ceux du storefront.

## Components

### Buttons

Actions pleines, compactes et légèrement adoucies. Le bouton principal associe encre forêt, texte blanc, bordure d'un pixel et hauteur minimale (47px). Le secondaire conserve le papier visible, avec une bordure gris végétal. Le survol déplace les deux variantes de (-2px) et change leur fond. Les boutons principaux n'ont pas de variante `:active` ou `:disabled` dédiée dans cette version.

Le focus visible commun est un contour or (3px) décalé de (5px). Les liens d'action soulignés restent distincts des boutons ; leur survol devient ocre (`#9d620e`). Les actions par icône ont une cible initiale minimale (42 × 44px), avec ajustements locaux selon le composant et le viewport.

### Chips

Les thèmes sont des capsules à bordure, libellé (10px) et point coloré (6px). Survol et sélection emploient la même inversion encre/blanc. Les filtres actifs du catalogue utilisent une capsule plus petite, fond (`#e8ece1`), bordure (`#c8cec0`), rayon (20px), avec action de retrait.

### Cards / Containers

Une carte livre n'est pas enfermée dans un panneau blanc : seul son présentoir est teinté. Son ratio est (1.1), son rayon (4px) ; la couverture occupe (76%) de sa hauteur et (54%) de sa largeur. Le favori est superposé en haut à droite, le badge en haut à gauche, puis viennent éditeur, titre, auteur, prix et ajout au panier.

Les couvertures se soulèvent de (-7px) et pivotent de (-2deg) au survol. Les cartes d'éditeur ont des fonds pastel pleins, sans ombre, et un padding (38px 28px), puis (30px) sous le seuil tablette. Les articles éditoriaux sont séparés par un trait supérieur plutôt que par une boîte.

### Inputs / Fields

La recherche est un champ rempli, intégré à l'en-tête ; la mise au point colore sa bordure en vert. Ses contrôles internes gardent un fond transparent. Le contact emploie des champs transparents à bordure (`#bac3b2`), padding (12px), rayon (4px), et le focus visible commun. La lettre utilise une simple ligne inférieure.

Il n'existe pas de système graphique d'erreur ou de désactivation complet : la validation de contact et de lettre repose sur les attributs HTML natifs. Les messages de résultat utilisent `role="status"` et décrivent explicitement l'absence d'envoi réel.

### Navigation

En bureau, deux groupes de liens Manrope (12px, graisse 600) partagent une ligne au-dessus d'un séparateur. Le survol colore les liens en ocre. JavaScript renseigne `aria-current="page"`, mais cette version ne possède pas de traitement visuel dédié à cet attribut.

Sous le seuil tablette, le bouton de menu pilote un panneau vertical positionné sous l'en-tête, avec ombre et lignes séparatrices. `aria-expanded` reflète son état et Échap le referme. Le changement de route replace le focus sur le contenu principal ; la modification d'un filtre restaure le contrôle actif.

### Panier, guide et notifications

Le panier est un `dialog` latéral ; le guide de lecture et les informations sont des `dialog` centrés. La fermeture peut se faire par bouton, Échap ou clic sur l'arrière-plan extérieur au panneau. L'ouverture bloque le défilement de la page. Le guide est composé d'options pleine largeur, fond sauge, bordure fine et rayon (6px).

Une notification courte, fond encre et texte blanc, apparaît en bas au centre pour confirmer l'ajout ou le retrait. Panier et favoris sont conservés localement ; il s'agit d'états de démonstration. Le récapitulatif ne réalise aucun paiement et ne crée aucune commande. Les espaces client et administration ajoutés sont décrits ci-dessous.

### Actions et formulaires des espaces

Le bouton `workspace-button` est plus dense que son équivalent marketing : hauteur minimale (40px), puis (42px) sous (760px), sans déplacement au survol. Les variantes secondaire et danger gardent respectivement un fond transparent et un fond rouge. La désactivation réduit l'opacité à (0.45) et change le curseur. Le contour clavier est or, de (3px), décalé de (3px).

Les champs associent un libellé visible, une bordure végétale, un rayon (5px), un padding (11px 12px) et une hauteur minimale (42px), puis (45px) sous (760px). Les formulaires utilisent deux colonnes, puis une sous (520px), et un pied d'actions séparé. Les messages d'aide restent sous le champ. La validation repose sur les contraintes HTML natives ; les confirmations passent par une notification `role="status"`. Aucun système complet d'erreur sous champ n'est établi. Les interrupteurs et cases utilisent le vert pour l'état coché.

### Navigation et panneaux des espaces

Le rail latéral identifie l'espace et conserve le retour boutique. Le lien actif inverse encre et blanc et expose `aria-current="page"` ; les compteurs sont secondaires. La barre supérieure porte le chemin, la recherche admin, les notifications et un menu de profil natif `details`. Le bandeau de démonstration reste visible sous cette barre. Les panneaux regroupent listes, détails et formulaires autour d'un titre et d'une prochaine action ; leurs en-têtes ont un padding (20px 22px).

Sur mobile, le rail fermé est `inert` ; ouvert, il rend le contenu principal `inert`, bloque le défilement du document et reçoit le focus sur son premier lien. Le voile ou Échap referme le menu et rend le focus au bouton d'ouverture. Une navigation de route referme le rail par reconstruction de la coque ; après la première vue, le focus rejoint le contenu principal. Le filtre recherche conserve le focus et la position de saisie pendant les mises à jour.

### Tableaux, badges et tiroirs des espaces

Les tableaux ont des en-têtes clairs, des séparateurs fins, un survol de ligne discret et des actions nommées. Les paiements et livraisons sont montrés dans des colonnes distinctes. Les badges associent un point, un fond pâle et un texte de statut ; les onglets sélectionnés ajoutent une ligne verte inférieure. Le suivi de commande emploie des étapes textuelles et des repères ronds reliés par une ligne.

Les formulaires courts, notifications et confirmations utilisent un `dialog` latéral nommé, avec en-tête séparé et fermeture par bouton, Échap ou clic extérieur. Le document est bloqué pendant son ouverture. La réinitialisation et la suppression d'adresse demandent une confirmation dans ce tiroir. Les enregistrements et réglages modifient seulement les données locales de démonstration ; les accès, paiements, livraisons et messages ne sont pas réels. Le reçu téléchargé porte une mention fictive sur fond (`#f5eedb`), couleur ponctuelle de ce document autonome.

## Do's and Don'ts

### Do:

- **Do** conserver les verts pour structurer le texte et les actions, le papier pour la page et les pastels pour les présentoirs.
- **Do** employer Manrope pour l'interface et réserver Bodoni italique à des accents de titre.
- **Do** respecter les ruptures de grille documentées et conserver des champs de saisie à (16px) sur petit écran.
- **Do** garder visibles le focus clavier et les indications de démonstration dans les parcours interactifs.
- **Do** utiliser les vraies couvertures et métadonnées à la place des éléments fictifs après validation du catalogue et des droits.
- **Do** appliquer les tokens `workspace-*` uniquement aux espaces client et administration ; y garder Manrope, les états nommés et le défilement contenu des tableaux.

### Don't:

- **Don't** présenter ce document ou la marque Sillage comme une identité client approuvée.
- **Don't** transformer les fonds pastel des livres en une couleur universelle de bouton.
- **Don't** ajouter une ombre à chaque bloc : l'interface observée réserve l'essentiel de la profondeur aux livres et aux panneaux superposés.
- **Don't** traiter les tailles locales et les rampes documentaires comme un système de tokens déjà connecté à tout le CSS.
- **Don't** faire passer les prix, auteurs, éditeurs, formulaires ou récapitulatifs fictifs pour des données ou transactions réelles.
- **Don't** appliquer la rampe de titres marketing aux espaces de travail, ni propager leurs variantes locales de couleurs et de densité au storefront.

Le sélecteur de pays se place dans le bandeau supérieur, sous forme de menu natif `details` à panneau aligné à droite. Drapeau circulaire, nom du pays et devise restent visibles dans le résumé. Le panneau contient une recherche, une liste de boutons de 46 px minimum et une date de cotation. À 520 px et moins, le panneau reste dans la largeur de l’écran.
