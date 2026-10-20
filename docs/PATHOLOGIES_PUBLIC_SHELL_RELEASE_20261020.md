# Publication limitée de l'onglet Pathologies — 20/10/2026

## Portée exacte du déploiement

**GO publication du propriétaire reçu**, mais le contrôle du lot clinique P1 révèle des prérequis médicaux non remplis. Cette PR publie **uniquement l'onglet informatif**, pas les fiches, QCM, flashcards, cas ou images des trois pathologies.

La navigation de l'application fait apparaître « 🩺 Pathologies » comme sixième onglet. Tant qu'aucun catalogue approuvé n'est fourni, cet onglet propose :
- BPCO → le cours public existant « Système respiratoire » ;
- Hypertension artérielle → le cours public existant « Système cardiovasculaire » ;
- Diabète de type 2 → le cours public existant « Système endocrinien ».

Chaque rubrique porte la mention **« Contenu en cours de validation »**. Aucune pathologie ne donne accès à une fiche, un QCM, une flashcard ou un cas clinique non validé. Les cours associés sont les cours déjà présents dans l'application.

## Verrous conservés

Le contrôle du paquet `IFSI_ABC_PATHOLOGIES_P1_REVUE_CLINIQUE_CIBLEE_20261020` a relevé les éléments suivants :

| Contrôle | BPCO | HTA | DT2 |
|---|---:|---:|---:|
| Sections structurées présentes | 10/10 | 10/10 | 10/10 |
| Planches originales et SHA-256 corrects | 6/6 | 6/6 | 6/6 |
| Sources associées aux exercices (association, pas validation médicale) | 52/52 | 52/52 | 52/52 |
| Relecture médicale finale approuvée des planches | 0/6 | 0/6 | 0/6 |
| URL HTTPS publique approuvée des visuels | 0/6 | 0/6 | 0/6 |
| Audit clinique complet et traçabilité du lot final | En attente | En attente | En attente |

Ces résultats **n'autorisent pas** de mettre `medicalReview:'approved'` ou `publicationApproval:'approved'` dans les catalogues, de rendre leurs images publiques, ou de charger le lot privé dans l'application.

## Fonctionnement

- Le moteur `pathologies-module-v1.js` expose `showShell()`, qui monte le seul conteneur et sa navigation sans activer de données.
- `pathologies-boot-v1.js` appelle `showShell()` quand aucun catalogue publié conforme n'est disponible ou si le catalogue est refusé par le moteur.
- Le catalogue authentiquement approuvé pourra être activé ultérieurement via le mécanisme existant `IFSI_PATHOLOGIES_PUBLISHED_BUNDLE` **après** revue médicale réelle, vérification des empreintes, de la provenance et du GO publication sur les octets finaux.
- Le service worker renouvelle son cache pour que la nouvelle navigation soit bien livrée.
- `tests/pathologies-app-integration-v1.mjs` vérifie l'affichage informatif sans activation du catalogue et le rejet des brouillons.

Il s'agit d'une publication **fonctionnelle mais limitée**. Ne pas annoncer « BPCO/HTA/DT2 disponibles pour révision » à la promotion à ce stade. Les livrables privés restent hors du dépôt public.

## Suite

Pour rendre les fiches, QCM, cartes et cas accessibles, faire relire les 18 planches et 156 exercices par un relecteur clinique, corriger les éventuelles erreurs sans dégrader les planches maître à six panneaux, valider le lot exact et ses empreintes, puis réaliser une PR de publication des supports approuvés, avec tests et vérification après déploiement.
