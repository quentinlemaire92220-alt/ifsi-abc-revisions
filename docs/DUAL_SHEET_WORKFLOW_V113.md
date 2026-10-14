# Workflow v1.13 — deux PDF de révision distincts

Ce document complète le référentiel privé Work v1.12 ; il décrit le CONTRAT TECHNIQUE **pour les publications futures**. Aucun cours historique n'est converti ni publié automatiquement.

## Livrables et métadonnées

Pour une première publication de cours, le manifeste `docs/course-deliveries.json` contient :
- `sheetResourceId` : fiche de révision classique, associée dans `sheets-*.json` à `sheetFormat:"classic"`.
- `infographicSheetResourceId` : deuxième PDF autonome « Fiche complète infographiée », `sheetFormat:"complete_infographic"`, `resourceId` et `driveId` distincts.
- `infographicResourceIds[]` : figures individuelles réellement publiées, indépendantes des deux PDF.
- `dualSheetCoverage` : résumé public de la matrice privée, avec `expectedNotions`, `classicCovered`, `infographicCovered` et `medicalReview:"approved"`.
- `visualAudit` + `publishedVerification` : contrôle et vérification de la copie Drive de la fiche classique.
- `infographicSheetVisualAudit` + `infographicSheetPublishedVerification` : contrôles INDEPENDANTS du PDF complet infographié. Les deux couples doivent avoir des SHA-256 cohérents avec `artifactSha256s[driveId]`.

La CI vérifie les métadonnées/empreintes DÉCLARÉES, pas les fichiers privés eux-mêmes. Le responsable de production doit télécharger effectivement chaque PDF depuis le Drive étudiant APRES son GO publication et vérifier les octets par `tools/verify_published_pdf.py`. Avant publication : inspection médico-graphique approfondie des deux PDF et revue privée avec le propriétaire. **Ne jamais fabriquer une preuve MATCH ni publier depuis le prototype.**

Les parties nouvellement ajoutées à un cours existant déclarent dans `partDeliveries[]` les deux `sheetResourceIds` et les mêmes sous-champs de contrôle. Les livrables historiques sans cette convention restent inchangés jusqu'à révision autorisée.

Les deux types apparaissent dans la section « Fiches de révision » de l'application avec des libellés distincts, sans dupliquer le fichier dans « Infographies ». Pour les nouvelles planches anatomiques : `additionalDocuments[].category:"anatomy"` et `atlasId` correspondant à un enregistrement réel du code atlas ; l'application les exclut de la liste générique des documents du cours et les présente depuis le module Anatomie. Les anciennes planches doivent être reprises séparément : ne jamais les masquer avant de vérifier leur présence dans Anatomie.

## Prototype local privé du package

```bash
python -m pip install reportlab==4.4.9 Pillow pymupdf==1.26.7
python tools/revision_course_pack.py \
  --content /chemin/prive/cours_structure.json \
  --assets-root /chemin/prive/visuels_valides \
  --out /chemin/prive/lot_en_revue
```

La source `cours_structure.json` possède un titre et `sections[]` comportant `heading`, `paragraphs[]` et éventuellement `figure:{path,caption,min_width_pt}`, `takeaway` et `trap`. Un portrait-guide approuvé peut être indiqué avec `guideImage` (et rendu obligatoire par `requireGuide:true`).

Le moteur réutilise les mêmes fichiers figure dans les deux PDF et copie leurs octets dans `04_Infographies`, sans lancer de génération d'image ; il produit un `manifest_privé.json` indiquant `DRAFT_REVIEW_ONLY` et `medicalReview:REQUIRED`. Il refuse le portrait demandé non fourni et les blocs complexes `complexBlocks` qui exigent un générateur plus puissant. **Il n'a pas accès à SOL, ne fabrique pas le visage et ne remplace pas la direction artistique complète du système respiratoire** : son niveau de rendu est un prototype technique vérifié par TNR synthétiques, pas une fiche médicale prête à publier.

## Contrôles

- `node tests/dual-sheet-contract-test.mjs` : absence d'une fiche, même fichier deux fois, format incorrect, mauvais SHA, preuve Drive absente, couverture non validée, partie incomplète.
- `python tests/revision-course-pack-test.py` : deux PDF indépendants, intégrité des exports, réutilisation des images, présence des sections et refus de perte.
- `node tests/anatomy-routing-contract-test.mjs` : planches nouvelles catégorisées et présentes dans le catalogue Anatomie, sans double emploi parmi les infographies.
- Les TNR existants restent exigés dans `.github/workflows/tnr.yml` avant fusion.

**Limites assumées :** aucun changement de la skill Work locale, aucun reformatage des anciennes fiches, aucun audit médical automatique fiable des planches, aucune lecture privée Google Drive dans GitHub CI, aucune preuve de gain de tokens SOL sans mesure. L'intégration bout-en-bout sur un nouveau vrai cours dans Work restera une étape distincte et requiert l'accord de publication après revue privée.
