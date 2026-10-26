> Priorité 26/10/2026 : appliquer aussi [le contrat de trame V3](PDF_TEMPLATE_CONTRACT_V3.md), références figées et revue liée aux octets. Les contrôles historiques ci-dessous restent obligatoires.

# Validation du package avant publication

Le flux d'un cours est **production → contrôles et autocorrections → revue privée de tous les livrables → validation du propriétaire et GO publication → Drive étudiant et application**.

## Deux autorisations distinctes

- `GO production` : autorise la fabrication, les tests et la préparation privée du lot.
- `GO publication`, ou instruction explicite équivalente : autorise la mise à disposition du package effectivement examiné. La validation d'un seul PDF ne vaut pas validation de l'ensemble. Une réponse ambiguë doit être clarifiée avant publication.

Cette règle s'applique aux nouveaux cours, aux nouvelles parties et aux mises à jour pédagogiques. Elle ne demande aucune approbation intermédiaire pour les brouillons ordinaires. Les changements de code ou de procédure sans livraison pédagogique n'exigent pas une approbation de package de cours.

## Package de revue

Présenter les fichiers disponibles avec leurs nombres et versions : fiche complète avec ses infographies intégrées, QCM avec grille et corrigé, infographies séparées, vocabulaire, flashcards, planches anatomiques et scripts vocaux. Indiquer séparément les MP3 reçus et ceux encore attendus. Donner un bilan des contrôles réels et des blocages.

Conserver la revue dans un espace privé dont les droits ont été vérifiés. La validation des scripts permet de publier un lot sans MP3 si le propriétaire approuve explicitement cette portée ; le statut reste `awaiting_mp3`. L'arrivée ultérieure de MP3 déclenche des contrôles et une nouvelle autorisation pour cette mise à disposition.

## Porte graphique exécutable — PDF nouveaux ou modifiés (v1.16)

**Un statut PDF technique `visualAudit.status=PASS`, un comptage d'images ou un SHA ne vaut JAMAIS conformité graphique.** L'incident de la fiche Douleur V2/V3 (issue #192) a révélé ce défaut.

Le garde-fou `tests/visual-owner-review-gate.mjs` appelé par le contrat de publication refuse **chaque nouvelle ou nouvelle version de fiche, de cours infographié ou de visuels associés** tant que la déclaration `visualOwnerReview` manque. Les modifications purement QCM/audio et les anciens lots non modifiés restent exemptées.

Exemple de structure **illustrative, interdite tant que la revue n'a pas réellement eu lieu** :

```json
"visualOwnerReview": {
  "status": "owner_accepted",
  "reference": "cardiovascular_revision_pdf_17p",
  "method": "manual_full_pdf_comparison_100_200_percent",
  "reviewedAt": "2026-10-21T20:00:00Z",
  "reviewerDecision": "explicit_graphic_acceptance",
  "criteria": {
    "REVISION_TEXT_FIRST": "PASS",
    "INFOGRAPHIC_VISUAL_FIRST": "PASS",
    "MEDICAL_ILLUSTRATION_REAL": "PASS",
    "INTEGRATED_IN_CONTEXT": "PASS",
    "ORIGINAL_LEGENDS_VERIFIED": "PASS",
    "NO_DECORATIVE_BOX_SUBSTITUTION": "PASS",
    "ALL_PAGES_CHECKED": "PASS"
  },
  "reviewedPdfSha256s": {
    "course_sheet_resource_id": "SHA256_REEL_64_CARACTERES",
    "course_infographic_sheet_resource_id": "SHA256_REEL_64_CARACTERES"
  },
  "reviewedImageSha256s": {
    "infographic_resource_id": "SHA256_REEL_64_CARACTERES"
  }
}
```

Pour le mode « fiche + planches séparées », ajouter `reviewedBoardSha256s` avec **une entrée par planche**, liée à `artifactSha256s`. Les champs non pertinents peuvent être omis ; le second critère `INFOGRAPHIC_VISUAL_FIRST` est obligatoire dès qu'un deuxième cours infographié ou des planches complètes sont livrés.

**Procédure humaine incontournable :**
1. Inspecter réellement chaque PDF **entier**, avec agrandissements 100–200 %, à côté de la **vraie fiche cardiovasculaire validée**, pas d'un prototype ni d'une génération d'aperçu. Comparer la hiérarchie, les paragraphes et tableaux, la position/qualité des illustrations, les légendes et les relations anatomiques.
2. Refuser les pictogrammes décoratifs ou boîtes/flèches simplistes présentés comme des illustrations physiologiques complètes ; une image médicale réellement explicative est nécessaire lorsque le mécanisme l'exige.
3. Conserver les preuves visuelles de revue **privées**, avec les PDF et SHA-256 réellement regardés. Demander explicitement l'acceptation graphique du propriétaire après présentation du lot ; un simple **GO production** ne suffit pas. Ne jamais annoncer « PASS » en son nom.
4. Lier la revue à l'empreinte de chacun des PDF et des images ; si un fichier change, **recommencer la revue** sur le nouveau fichier. Le `GO publication` de l'ensemble reste une autorisation **distincte**.
5. Sans revue/acceptation explicite : `status=pending`, indiquer `À_CORRIGER` et **ne pas insérer de faux `visualOwnerReview`** pour obtenir du vert.

Ce test peut bloquer un manque de déclaration ou une empreinte incohérente ; il **ne peut pas détecter seul** qu'un schéma est physiologiquement incorrect ou trop décoratif, car les PDF privés ne sont pas lus par GitHub Actions. Une CI verte ne remplace donc **jamais** la vérification visuelle réelle.

## Enregistrement public minimal

Le format demandé le 20/10/2026 peut être déclaré avec `revisionSheetMode:"single_with_complete_boards"` : une seule fiche de révision écrite avec ses visuels intégrés et des planches complètes séparées. Ce choix explicite conserve l'audit et la copie authentifiée de la fiche, la couverture de toutes les notions et la revue disciplinaire. Chaque planche séparée possède aussi son audit, son empreinte et sa copie Drive vérifiée dans `completeBoardAudits`. Les lots historiques à deux fiches gardent leur contrat. Ce choix et ses preuves participent à l'empreinte de publication ; il n'autorise jamais une publication sans accord du propriétaire.

Pour un lot pédagogique nouveau ou modifié, `docs/course-deliveries.json` doit contenir :

```json
"publicationApproval": {
  "status": "approved",
  "authorization": "explicit_go_publication",
  "scope": "course_package",
  "approvedAt": "2026-10-13T12:00:00Z",
  "bundleSha256": "empreinte_SHA256_du_lot_de_publication"
}
```

Ce bloc est renseigné seulement après un message explicite du propriétaire. La date ci-dessus est un exemple ; elle ne constitue pas une validation. Ne pas commiter la conversation, son contenu, des adresses personnelles, les liens de revue privés ou les PDF. La preuve complète de l'autorisation et la liste des livrables examinés restent privées.

L'empreinte lie l'approbation aux ressources du cours, aux banques QCM déclarées, aux images locales et aux résumés de contrôle PDF. Le contenu des flashcards rattachées aux questions fait partie de cette empreinte. Les anciens cours inchangés ne sont pas soumis rétroactivement à cette nouvelle obligation.

Renseigner aussi `artifactSha256s`, un objet associant chaque identifiant de fichier Drive du lot à l'empreinte SHA-256 de ses octets réellement examinés. Cela couvre notamment les supports, PDF, exports de flashcards et scripts. Le contrôle refuse un fichier référencé sans empreinte de revue. Le téléchargement authentifié et le contrôle après dépôt restent des opérations privées à exécuter ; la CI ne les effectue pas elle-même.

La commande de contrôle affiche l'empreinte attendue lorsqu'une approbation manque :

```sh
IFSI_BASE_SHA=<commit_de_base> node tests/course-publication-approval.mjs
```

Un contenu modifié, un nouveau MP3 ou un PDF dont l'empreinte change invalide la validation précédente. Représenter les éléments touchés et obtenir l'autorisation avant d'enregistrer une nouvelle empreinte. Ne jamais actualiser automatiquement le bloc d'approbation pour faire passer la CI.

## Ce que la CI atteste

La CI refuse un lot pédagogique suivi dans le manifeste lorsqu'il est nouveau ou modifié sans approbation explicite déclarée, ou lorsque l'empreinte approuvée diffère du lot proposé. Les contrôles existants continuent de refuser les premières publications et parties absentes du manifeste.

La CI ne peut pas prouver l'identité de la personne qui a donné l'accord, lire sa conversation privée, vérifier les droits Drive en temps réel ou garantir l'exactitude médicale. L'opérateur doit vérifier ces points. Aucun champ JSON ne remplace l'accord réel.

Après le GO publication : déposer les finales autorisées dans Drive étudiant, vérifier les copies retéléchargées, vérifier le manifeste et les TNR, attendre la CI verte, puis contrôler la version déployée. La CI verte seule n'autorise pas la publication.
