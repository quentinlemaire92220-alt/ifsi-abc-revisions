# IFSI ABC — Migration métier v1.46 : fiche hybride infographiée unique

**Décision du 22 octobre 2026. Portée : nouvelles productions uniquement.**

## Contrat pédagogique nouveau

Un seul PDF étudiant **Fiche de révision hybride infographiée** par cours/partie : textes synthétiques sur les priorités, infographies pédagogiques médicales intégrées dans les sections concernées, tableaux, « À retenir », pièges QCM et **définitions et mots-clés à la fin**. Aucune limite de pages artificielle. Un support complet infographié séparé n'est plus produit systématiquement. Aucune figure décorative ne compense une notion importante manquante.

La référence graphique maître est l'annexe des **dix pages de pharmacologie** intégrée dans la charte privée Google Drive `CHARTE_IFSI_ABC_v1.46_FICHE_REVISION_HYBRIDE_INFOGRAPHIEE_2026-10-22`. Le dépôt **public** ne contient ni son URL privée, ni les images/diapositives sources. La revue visuelle doit réellement comparer toutes les pages PDF avec les dix modèles. Les images ne valent pas preuve de justesse scientifique.

**Inchangés :** les contrats, règles et rendus QCM, flashcards et vocaux ; les planches anatomiques autonomes et les schémas de QCM restent possibles comme ressources **spécifiques**, selon leurs propres contrats, non comme seconde fiche obligatoire.

## Compatibilité, sans migration rétroactive

- `lean_v1` : ancien pack avec deux PDF, inchangé, validé par `tests/lean-course-contract.mjs`.
- `dual-sheet` : ancien contrat avec fiche classique + cours infographié, inchangé.
- `single_with_complete_boards` : ancien contrat avec fiche et planches séparées, inchangé.
- **`hybrid_v1`** : nouveau contrat avec **un seul** `sheetResourceId` et une ressource `sheetFormat:"hybrid_infographic"`.

Les cours déjà publiés restent intacts. Une révision substantielle d'un ancien cours doit faire l'objet d'une nouvelle livraison vérifiée, sans supprimer les archives antérieures.

## Production privée du PDF

Lancer à partir de la matrice de notions et d'illustrations **privée** ; aucune donnée de cours ou capture ne doit être commitée dans le dépôt public :

```bash
python -m pip install reportlab==4.4.9 Pillow pymupdf==1.26.7
python tools/hybrid_course_pack.py \
  --content /dossier_prive/matrice_importante.json \
  --assets-root /dossier_prive/visuels_originaux \
  --out /dossier_prive/revue_hybride
```

La matrice contient :

- `title` et `notions:[{id,sourcePage}]` pour les notions **essentielles**, pas toutes les diapositives.
- `sections:[{heading,notionIds,paragraphs,figure?:{path,caption,min_width_pt?,mode?},tables?}]` : paragraphes explicatifs, figures originales pertinentes et lisibles, tableaux optionnels. Au moins une figure dans le pack hybride.
- `lexicon:[{id?,term,definition}]` obligatoire, au **dernier chapitre**, en texte sélectionnable et dans `Lexique_source_prive.json` pour réemploi par les vocaux sans OCR.

Le générateur rend `Fiche_Revision_Hybride_Infographiee.pdf`, `Lexique_source_prive.json` et `manifest_prive.json`. **Il n'émet aucun PDF de planches infographiques totales**. Il vérifie les IDs, la provenance, la couverture de toutes les notions déclarées, la présence d'illustrations, les entrées de lexique, leur présence dans le PDF et les empreintes des fichiers. **Il ne certifie ni la qualité graphique, ni la fidélité médicale.** Le statut privé reste `DRAFT_REVIEW_ONLY`, jamais publié automatiquement.

## Schéma du manifeste PUBLIC pour `hybrid_v1`

La fiche est publiée via l'entrée habituelle dans `sheets-N.json` (label étudiant « Fiche de révision infographiée ») :
```json
{
  "courseId": "demo",
  "resourceId": "demo_fiche_hybride_p01",
  "sheetFormat": "hybrid_infographic",
  "officialSupport": true,
  "driveId": "<ID authentiquement retourné par Drive>",
  "url": "<URL authentiquement retournée par Drive>"
}
```

La déclaration `docs/course-deliveries.json` reprend **une seule** fiche, avec les champs suivants : `packFormat:"hybrid_v1"`, `sheetResourceId`, `sheetResourceIds:[sheetResourceId]` pour les parties, `infographicResourceIds:[]`, pas de `infographicSheetResourceId`, `schematics:"embedded_only"`, `embeddedFigureCount`, `visualAudit:{status,pdfSha256,expectedCount,checkedCount,pageCount,pageSize:"A4"}`, `artifactSha256s:{driveId:sha256}`, `publishedVerification` (obtenue **après** retéléchargement Drive authentifié), et :

```json
{
  "hybridCoverage": {
    "expectedEssential": 12,
    "coveredEssential": 12,
    "prioritySourceReference": "référence de la matrice privée, sans URL sensible",
    "medicalReview": "approved",
    "readabilityReview": "approved"
  },
  "hybridVisualReview": {
    "status": "approved",
    "reference": "pharmacologie_v1.46_10_pages",
    "pagesChecked": 8
  },
  "lexicon": {
    "termCount": 30,
    "textSelectable": true,
    "checked": true,
    "sourceSha256": "<SHA-256 du lexique source>"
  }
}
```

**Ces nombres sont des EXEMPLES fictifs** ; ne jamais les recopier comme validations ou résultats réels. Compter les notions importantes et les pages/figures du vrai fichier, puis demander une vérification scientifique et graphique réelle. La preuve publiée doit fournir `status:"MATCH"`, `source:"authenticated_drive_download"`, `pdfSha256`, `expectedCount`, `checkedCount` et `pageCount` concordants. Ne pas remplir de données de publication sur une simple maquette.

## Portes de validation

1. `GO audit` : inventaire et pertinence des notions importantes.
2. `GO production` : produire le PDF **en privé** avec lexique final et infographies originales.
3. Revue humaine **page par page** comparée au modèle pharmacologie ; contrôle scientifique distinct ; correction sans régression.
4. Accord sur le lot exact, avec son SHA-256.
5. `GO publication` explicite : Drive étudiant, manifeste, TNR et déploiement, jamais déduit de la validation de la charte ou d'un pilote.

## Tests

```bash
node tests/hybrid-sheet-contract-test.mjs
python tests/hybrid-course-pack-test.py
node tests/lean-course-contract-test.mjs
python tests/lean-course-pack-test.py
node tests/course-delivery.mjs
```

Les contrats historiques et leurs TNR restent activés. Les deux nouveaux tests utilisent exclusivement des données synthétiques sans fichiers pédagogiques privés. L'ancienne structure `lean_v1` et les cours publiés ne sont pas réécrits par cette PR.
