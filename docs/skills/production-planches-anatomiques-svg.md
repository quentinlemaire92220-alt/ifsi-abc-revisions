# Skill IFSI ABC — planches anatomiques sans Canva : illustration + annotations SVG (v1.0)

**Date : 20/10/2026. Statut : méthode de production par défaut à partir de ce jour.** Remplace le recours systématique à Canva, jugé trop chronophage, pour les planches anatomiques autonomes. L'ancien skill Canva reste consultable comme archive et solution de dernier recours. **Aucune illustration n'est réputée fiable du seul fait d'avoir été générée.**

## Objectif et modèle
- **Modèle graphique** : `Planche_05_Cellule_humaine_HD.png` (illustration médicale dominante, relief anatomique, mise en page A4 portrait, titres nets, marges aérées, palette cohérente, fond neutre, français correct).
- Sortie à **couches séparées** : `illustration-source.png/webp` (aucune lettre, légende, flèche ou repère incrusté), `annotations.json` (ID, libellé, point d'ancrage anatomique et position du texte en coordonnées normalisées, source scientifique de vérification), `planche.svg` (composition avec textes/flèches éditables) et export `planche.webp/png` + PDF si besoin.
- Le cours officiel est **la source scientifique** des structures et des fonctions, **jamais une source d'images à recopier**. Aucun schéma d'un PDF de cours, d'un livre ou d'un tiers n'est modifié/redistribué sans droit explicite.
- Les annotations texte et flèches doivent pouvoir être corrigées **sans régénérer l'illustration**. Un nouveau texte ne rend pas une flèche imprécise correcte.

## Procédure par défaut — un schéma à la fois
1. **Spécification médicale** : relever `Rxx`, UE, intitulé, vue, structures obligatoires, fonctions et pièges de confusion, références de pages/diapos du cours. Distinguer les informations confirmées et les éléments à vérifier.
2. **Générer un visuel anatomique original *sans aucun texte ni flèche***, avec le relief/éclairage du master Cellule humaine et une orientation vérifiable. Proscrire les structures inventées, ambiguës, sexualisées, le collage d'images du cours et les légendes générées dans les pixels. Si l'anatomie ne peut être obtenue correctement, utiliser une illustration sous licence compatible avec attribution documentée, ou signaler le blocage.
3. **Contrôle de l'illustration seule**, à taille 100 % et en zoom : vérifier nombre/forme/orientation des organes, rapport spatial des structures, continuité des conduits et plausibilité de la perspective. En cas de structure absente ou mal dessinée, recommencer la **seule image de fond**, ne pas masquer par une légende.
4. **Placer les annotations dans `annotations.json`** : chaque repère dispose d'un texte exact, d'une pointe `tip` placée sur la structure représentée et d'un point `label`; ajouter une preuve de relecture (référence du support officiel et observation), pas une certification automatique. Les coordonnées non vérifiées restent `null`. Le générateur refuse de créer une prétendue version complète lorsqu'une pointe manque.
5. **Composer le SVG** : image de fond inchangée + connecteurs vectoriels à pointe distincte + textes SVG français modifiables ; aucune transformation globale de la source, flèches éditables indépendamment, contraste et superpositions contrôlés.
6. **Exporter automatiquement** depuis le SVG validé : rendu écran WebP/PNG, haute définition A4 (objectif 300 ppp si source suffisante, sans promettre de détails supplémentaires), éventuel PDF vectoriel ; tenir un fichier de version et une empreinte SHA256 du package exact. Test de lecture sur mobile et desktop.
7. **Revue médicale et droits indépendantes** : comparer chaque structure, pointe, texte, chiffres et orientation avec le cours officiel et, si nécessaire, une référence anatomique fiable indiquée. La validation de la *forme* par l'utilisateur n'est pas la validation scientifique. Vérifier origine/licence de l'image de fond et des éléments utilisés.
8. **Intégration** : revue privée des exports et contrôles TNR ; seulement après GO publication explicite, mettre à jour Drive étudiant et les chemins de l'application. Les schémas non validés restent hors atlas approuvé, hors QCM, hors flashcards image, sans augmentation du compteur de planches.

## Contrat `annotations.json` (source de vérité visuelle)
Chaque illustration possède `sourceImage`, `canvas` (largeur/hauteur), `landmarks`, `sourceCourse`, `reviewStatus`. Chaque repère contient `id`, `label`, `tip:{x,y}`, `labelPosition:{x,y}`, `evidence` et `reviewed`, avec `x,y` normalisés entre 0 et 1. Les composants d'un repère peuvent rester `null` en brouillon ; ils sont **obligatoires et revus** avant une version validée.

Le composant/exporteur ne déduit **jamais** la position de la flèche de son seul libellé. Tout repère absent, ou dont la structure n'est pas individualisée, est inscrit `status:unresolved` et **aucune flèche trompeuse n'est créée**. Les éléments `SVG` restent éditables (IDs de repère stables).

## Acceptation obligatoire et TNR
- **Exactitude anatomique** : contrôle de chaque pointe à la bonne structure, revue de la direction des flux/flèches et des vues (sagittale, frontale, coupe) ; aucune extrapolation de repère.
- **Qualité graphique** : une vraie illustration, pas une mosaïque de cartes décoratives ; style Cellule humaine, lisibilité A4/mobile, marges/contraste, aucune ligne coupée ou cachée.
- **Sources & droits** : image originale ou licence exploitable prouvée, traçabilité de chaque asset ; ne pas confondre une image « passée dans Canva » et une illustration libérée de droits.
- **Reproductibilité** : l'image, le JSON et l'outil doivent reproduire le même export ; SHA des fichiers, version et identifiant Rxx suivis.
- **Séparation des statuts** : `graphicalApproved` distinct de `clinicalApproved`, `rightsApproved`, `publicationApproved`.
- **Publication** : aucun PDF/capture de cours, aucun lien privé, aucune diffusion des schémas non validés en tant que ressources officiellement fiables, aucun QCM tant que la relecture n'est pas terminée.

## Retour arrière contrôlé
Si la génération ne donne pas une forme médicalement lisible après **deux essais ciblés**, interrompre : chercher une **illustration médicale explicitement réutilisable**, vérifier la licence puis annoter directement le fond avec SVG, ou revenir au schéma source vectoriel autorisé. **Ne pas multiplier les allers-retours Canva.** Canva n'est utilisé que si une retouche marginale est plus rapide qu'un changement de calque SVG.

## Pilote R01 — appareil génital masculin (UE B1)
Contrat d'entrée dans `docs/anatomy-r01-svg-pilot.json`. Figure attendue : **vue sagittale médicalement fidèle** avec vessie, prostate, vésicule séminale, canal déférent, épididyme, testicule, scrotum, pénis/urètre et rectum. L'image est produite sans flèches ni textes, les onze repères sont posés en SVG et vérifiés un à un. Les repères spatiaux non résolus restent nuls ; ne **pas** montrer une fausse anatomie en la déclarant validée. Le pilote ne modifie ni les six maquettes R02–R07 ni les 106 planches existantes.

**La méthode change dès maintenant ; la publication pédagogique de R01 nécessite sa propre revue et autorisation.**
