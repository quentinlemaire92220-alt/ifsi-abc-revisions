# Production alternative des planches anatomiques — procédure P1

Date : 2026-10-19. Référence : Standard de production v1.17 + checklist qualité v1.17 (Google Drive).

## Objectif
La production de planches anatomiques doit rester possible sans outil de génération d’images : composition SVG à partir de sources médicales identifiées et légalement réutilisables. Il n’est pas question de simplifier l’anatomie afin d’éviter un blocage technique.

## Workflow
1. Repérer les figures pertinentes du cours officiel et vérifier la licence de chaque image d’origine séparément. Le fait qu’une figure apparaisse dans un cours officiel **ne constitue pas** un droit de redistribution publique.
2. Si un outil de création d’images refuse une figure anatomique médicalement légitime, ne pas réessayer en boucle : passer à la préparation depuis une source médicale existante, ou une ressource universitaire libre sous licence compatible.
3. Dans une **revue privée**, conserver la figure source sans crop/déformation, créer le fond/la composition SVG (titre, numéro, légendes annexes), exporter un PNG de vérification, puis examiner à la taille cible. Ne pas inventer de nouvelles flèches ; la liste de repères ne vaut pas un pointeur validé.
4. Documenter source/pages, structures, orientation, licences/auteurs, différences avec le support, résolution source effective, risques anatomiques, revue visuelle et médicale.
5. Pour le public, utiliser **exclusivement** des images dont la licence autorise l’usage réel, en joignant les crédits, les liens, l’éventuelle licence de partage à l’identique et la preuve de relecture clinique.
6. Préparer la version muette QCM uniquement après approbation de la planche légendée ; vérifier qu’aucune réponse n’est révélée ou coupée.
7. Intégrer les ressources validées à la rubrique **Anatomie / Planches anatomiques** avec IDs stables, vérifier Drive / zoom / mobile / CI / TNR, puis attendre un GO publication explicite.

## Première application — système reproducteur B1
Sept planches prévues dans `docs/anatomy-p1-clinical-matrix.json`, chacune issue de deux illustrations du support officiel Vanessa Petit :
- R01 : pages 15 et 12 — appareil masculin, vue d’ensemble.
- R02 : pages 8 et 9 — testicule, tubules et histologie.
- R03 : pages 13 et 17 — voies spermatiques et glandes annexes.
- R04 : pages 30 et 31 — appareil génital féminin.
- R05 : pages 28 et 29 — ovaire et trompe.
- R06 : pages 32 et 33 — paroi utérine, col et vagin.
- R07 : pages 36 et 38 — vulve et périnée.

**État des livrables :** 7 PNG (1800 × 2350) + 7 SVG éditables + matrice de provenance + aperçu disponibles dans un ZIP de **revue privée remis dans la conversation**. **Aucun de ces fichiers n’est versé au dépôt public.** Les figures source sont intégrées au PDF officiel et les droits de publication de ces images parfois tierces ne sont pas établis. Ce ne sont pas des masters HD médicaux validés : un upscale visuel ne résout pas une source à faible définition. `publicationStatus` reste `BLOCKED` et `imagesReady` reste `0`.

### Ressources de remplacement identifiées, attribution requise
Université de Genève, licences CC BY-SA 4.0 :
- https://commons.wikimedia.org/wiki/File:Appareil_g%C3%A9nital_m%C3%A2le_-_Vue_sagittale.svg
- https://commons.wikimedia.org/wiki/File:Appareil_sexuel_f%C3%A9minin_-_Vue_sagittale.svg
- https://commons.wikimedia.org/wiki/File:Male_genital_system_-_Front_view.svg

La réutilisation de ces ressources dans une nouvelle planche devra respecter l’attribution et le partage dans les mêmes conditions, et sa correspondance avec les éléments évaluables du cours devra être contrôlée.

## Portes bloquantes avant publication
- [ ] Remplacer les illustrations du support dont la licence n’est pas confirmée par des ressources publiables.
- [ ] Vérifier toutes les étiquettes et points anatomiques source, y compris les erreurs déjà présentes dans les images de départ.
- [ ] Contrôler la résolution réelle de chaque source et les versions SVG/PNG finales.
- [ ] Archiver les rapports de revue médicale et visuelle et les crédits.
- [ ] Produire le pack « master » et « export application » approuvé.
- [ ] Exécuter TNR et vérifications de navigation ; obtenir GO publication.
