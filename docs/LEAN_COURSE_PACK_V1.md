# IFSI ABC — Pack `lean_v1` (pilote cardio / respiratoire)

**Statut : contrat technique et pipeline privé non publiés, 20/10/2026.** Ce document explique le parcours de production économe. Les anciennes livraisons continuent d'utiliser `dual-sheet-contract.mjs`.

## Livrables par défaut

1. Fiche de révision **complète**, PDF multipage, explications écrites et infographies originales si le support officiel le justifie.
2. **Une seule page A4 infographiée de synthèse** : contient les notions **sélectionnées**, et non l'intégralité du cours. Ne prétend jamais remplacer la fiche classique.
3. QCM à cinq choix A–E et 1–3 réponses, corrigés argumentés, cardinalité annoncée issue de la même matrice de données.
4. Flashcards autonomes, réponses fournies dans les données pour l'application, **jamais visibles avant retournement** dans son interface.
5. Planches anatomiques si nécessaire seulement, après recherche dans le module Anatomie.

**Non systématiques** : exports individuels d'images, vocabulaire séparé, fichiers TXT vocaux, MP3 et seconde fiche complète en planches. Aucun dossier existant n'est supprimé ou renommé.

## Processus, sans consommation systématique de Work

- **GO audit dans ChatGPT classique** : support officiel, parties, courseId et source, matrice des notions avec identifiants et numéros de pages, inventaire du Drive et de l'application. Réutiliser les ressources validées. Aucun fichier scientifique produit sur la base d'une supposition.
- **GO production** : rédiger et valider les sections complètes, les panneaux sélectionnés, les QCM, les cartes et les visuels originaux ; exécuter le générateur local seulement lorsque la matrice est prête. Work n'est invoqué qu'en recours exceptionnel pour les opérations non réalisables dans le chat classique.
- **Contrôles** : inspection visuelle réelle des deux PDF, revue scientifique des légendes et mécanismes, et tests QCM/flashcards. Le générateur ne certifie pas la science.
- **Revue privée et GO publication** : seulement après accord explicite, publier les fichiers réellement approuvés, vérifier Drive authentifié puis l'application. Préparer une PR technique, tests et CI avant fusion. Ne jamais attribuer un GO publication à un simple GO production.

## Utilisation du générateur local

```bash
python -m pip install reportlab==4.4.9 Pillow pymupdf==1.26.7
python tools/lean_course_pack.py \
  --content /chemin/prive/matrice_du_cours.json \
  --assets-root /chemin/prive/illustrations_validees \
  --out /chemin/prive/pack_en_revue
```

Le générateur produit `Fiche_Revision.pdf`, `Synthese_Infographiee_A4.pdf`, `QCM_Corrige.pdf`, `QCM.json`, `Flashcards.json` et `manifest_prive.json`. **Les deux premiers PDFs sont les deux formats validés**, le troisième est le cahier QCM et son corrigé. Il n'exporte pas d'infographies supplémentaires. Une exécution identique avec des images identiques renvoie le cache validé par SHA-256 et n'effectue pas une nouvelle génération. Des données différentes invalident ce cache. Il ne fait aucun upload, merge ou publication.

La matrice JSON contient :
- `title`, `notions: [{id,sourcePage}]` ;
- `sections: [{heading,paragraphs,notionIds,figure?}]` : **union des notionIds égale à toutes les notions** ;
- `summaryPanels: [{heading,body,notionIds,figure?}]` : **1 à 5 panneaux**, sélection sourcée, mise en page A4 une page (dépassement bloquant) ;
- `qcmQuestions: [{id,courseId,theme,difficulty,question,choices:[A,B,C,D,E],answers:[indices 0..4],announcedCorrectCount,explanation}]` ;
- `flashcards: [{id,front,answers,explanation}]` ;
- les `figure.path` restent des chemins relatifs dans `assets-root`.

Le programme refuse les notions non couvertes par la fiche complète, les références de page absentes, les sections vides, les énoncés QCM sans cinq choix, les nombres annoncés incohérents, les réponses multiples hors contrat et une page de synthèse débordante. Il n'est **pas** un outil d'interprétation automatique du support médical : la matrice vient d'un travail pédagogique sourcé et validé.

## Intégration applicative progressive

Pour les **nouvelles** livraisons uniquement, déclarer `packFormat:"lean_v1"`. La seconde ressource a `sheetFormat:"infographic_summary"`, son propre `resourceId` et son propre Drive ID. Conserver `sheetResourceId` et `infographicSheetResourceId` distincts pour la compatibilité avec l'index. Ne jamais réécrire les métadonnées des cours anciens.

- `summaryCoverage: {expectedNotions,classicCovered,selectedNotions,summaryCovered,medicalReview? | disciplinaryReview?,readabilityReview:"approved"}` ; `classicCovered` doit égaler `expectedNotions`, mais `summaryCovered` égale seulement `selectedNotions`.
- `infographicSheetVisualAudit` contient `pageCount:1`, `pageSize:"A4"` en plus du SHA-256 et des contrôles habituels. La preuve authentifiée `infographicSheetPublishedVerification` doit contenir `pageCount:1` et le même SHA.
- `schematics` vaut `none`, `embedded_only` ou `with_exports`; `embeddedFigureCount` donne le vrai nombre des visuels de la fiche ; `infographicResourceIds` peut être vide sans imposer un faux export, avec justification des décisions. Si des figures sont présentes, la revue médicale est obligatoire.
- `vocals` et `vocalScripts` peuvent être vides dans un pack `lean_v1` déclaré `complete` (sauf demande explicite `requestedVocals:true`). Les anciens statuts et manifests ne sont pas modifiés.
- QCM et flashcards destinés au pack `lean_v1` sont revalidés par `tests/lean-content-contract.mjs` ; les attributs exacts du nouveau QCM sont conservés lors de l'intégration.

**Important** : les tests CI confirment la cohérence des données et des **déclarations** de contrôle. La vérification effective des pages PDF, des points anatomiques et des fichiers Drive ne peut pas être inventée ou remplacée par un PASS automatique.

## TNR

```bash
node tests/dual-sheet-contract-test.mjs
node tests/lean-course-contract-test.mjs
python tests/revision-course-pack-test.py
python tests/lean-course-pack-test.py
node tests/course-delivery.mjs
node tests/course-delivery-new-course.mjs
```

Les commandes différentielles demandent un historique Git suffisant et `IFSI_BASE_SHA` dans la CI. Aucun support officiel ou transcript privé n'est stocké dans ce document ou les fixtures de test.
