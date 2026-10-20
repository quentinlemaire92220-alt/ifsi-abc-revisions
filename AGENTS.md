# Production et publication des cours

Un « GO production » autorise la préparation du package, ses contrôles et ses autocorrections. Il n'autorise pas sa mise à disposition aux étudiants.

Pour chaque nouveau cours ou mise à jour pédagogique :

1. Préparer et contrôler tous les livrables disponibles, sans demander d'approbation pour chaque brouillon.
2. Présenter un package de revue privé avec des liens ouvrables pour la fiche, le QCM et son corrigé, les infographies intégrées et séparées, le vocabulaire, les flashcards, les planches et les scripts vocaux prévus.
3. Attendre la validation du package et un **GO publication**, ou une instruction explicite équivalente du propriétaire, avant toute mise à disposition dans le Drive étudiant, tout ajout de contenu pédagogique au dépôt public, toute fusion ou tout déploiement de ce lot.
4. Enregistrer la portée et l'empreinte du lot approuvé selon `docs/PUBLICATION_APPROVAL.md`. Une approbation d'un fichier seul ne valide pas les autres éléments. Ne jamais déduire une autorisation de publication d'un simple accusé de réception.
5. Après autorisation, publier les fichiers validés, comparer les copies Drive retéléchargées, exécuter les TNR, vérifier la CI et le déploiement.

Tout changement de contenu après validation invalide l'approbation du lot. Représenter les éléments modifiés avant publication. Les MP3 absents restent explicitement en attente et ne peuvent être annoncés comme produits. Les MP3 reçus ultérieurement font l'objet de leurs propres contrôles et autorisation de mise à disposition.

Les instructions pédagogiques détaillées, transcriptions, pièces officielles non autorisées, captures et liens de revue privés restent hors du dépôt public. Les preuves détaillées de validation utilisateur restent privées ; seules les métadonnées techniques minimales sont versionnées.

## Skill fiches de révision / infographies originales

Pour toute fiche de révision, appliquer **`docs/skills/production-fiches-revision-infographies-originales.md`** avant sa génération, son contrôle et sa publication. **Aucune capture, photo ou figure extraite du support officiel ne doit être intégrée au PDF** : les notions utiles doivent être réinterprétées en infographies originales au modèle Système nerveux. Ce skill est distinct des planches anatomiques autonomes et des schémas de QCM. Une maquette non conforme est bloquée avant présentation ; pas de répétition de la consigne à demander à l'utilisateur.

## Skill Pathologies — modèle maître infographies BPCO

**Pour toute nouvelle pathologie et toute refonte d'une fiche Pathologies**, appliquer impérativement `docs/skills/production-pathologies-infographies-cliniques.md` **en complément** du skill fiches original. La présentation des infographies BPCO validée le 20/10/2026 est le **modèle de forme** : toute représentation schématique dans une fiche Pathologies doit être une vraie infographie pédagogique **originale, sourcée, intégrée à la section**, jamais un schéma brut, une capture, une image décorative ou une coupe non expliquée. Nombre de visuels libre selon les notions illustrables ; aucune obligation artificielle de 10 infographies.

**Contrôles bloquants** : inventaire schéma→infographie, vérification médicale du texte/des repères/flèches/chiffres/dispositifs, provenance officielle vs complément vérifié, contrôle PDF page par page à 100 % et mobile, package en revue privée. **La validation du style BPCO ne vaut pas validation médicale ni GO publication.** Les visuels de QCM et les planches anatomiques autonomes conservent leurs règles spécifiques. Ne pas diffuser de contenus non approuvés.

## Skill anatomie — génération + annotations SVG (méthode principale)

Pour toute planche anatomique nouvelle ou remplacée, appliquer **`docs/skills/production-planches-anatomiques-svg.md`** (en complément du standard IFSI ABC). **Canva n'est plus l'outil de production par défaut** : son ancien skill `docs/skills/production-planches-anatomiques-canva.md` est une archive et un secours ponctuel seulement.

Procédure : illustration anatomique originale **sans texte ni flèche incrustée**, contrôle de l'orientation et des organes, **légendes et flèches en SVG éditables séparément**, contrôle de chaque pointe contre le cours officiel, export HD automatique et TNR. Les positions non vérifiées demeurent `null` : **aucune flèche inventée**. Style graphique : `Planche_05_Cellule_humaine_HD.png` ; pas de collage de figures du cours.

Bloquants : licence/provenance de chaque illustration, validation clinique réelle de toutes les structures et directions, contrôle A4 et mobile, validation de la forme distincte de la validation médicale. Les maquettes en revue n'incrémentent pas le total de planches approuvées et ne servent pas aux QCM. **Pas de diffusion aux étudiants ni de master HD annoncé comme validé sans revue et GO publication explicite du lot exact.** Pilote : `docs/anatomy-r01-svg-pilot.json` (R01 sagittale masculine, 11 repères à vérifier).

## Éligibilité des séances du planning

Avant de créer ou de signaler une fiche manquante à partir du planning, appliquer `docs/COURSE_REVISION_ELIGIBILITY.md` : exclure les connexions MySchool, les temps d’appropriation et les activités administratives/autonomes sans nouveau contenu. Exclure aussi **toutes les simulations** et **toutes les séances asynchrones**, même pédagogiques, de la liste de suivi ; conserver les autres CM, TD et TP pertinents. Ne pas effacer ces créneaux du planning général.
