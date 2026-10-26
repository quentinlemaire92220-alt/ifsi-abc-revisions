# Trame commune fiche de révision et QCM — V3

**Directive du 26/10/2026, pour ChatGPT et Work.** Lire ce contrat AVANT toute production ou réparation de fiche/QCM. Il complète les contrôles V2, pédagogiques et de publication, sans remplacer leurs exigences. Les fichiers historiques inchangés et leurs accords sont conservés.

## Références obligatoires

Lire `docs/pdf-template-policy-v3.json`, ouvrir les deux PDF identifiés puis contrôler leur SHA-256 et leur pagination :

| Rôle | Référence de présentation | Pages du modèle |
| --- | --- | --- |
| Fiche | `communication_written_v5.3_2026-10-24` — `assets/communication-td1/UE_D1_Communication_TD1_Fiche_de_revision.pdf` | 19 |
| QCM | `communication_qcm_2026-10-24` — `assets/communication-td1/UE_D1_Communication_TD1_QCM_50_avec_corriges.pdf` | 23 |

Ces nombres identifient les modèles ; ils ne fixent aucun quota aux nouveaux documents. Ces PDF servent uniquement à la forme. Ne pas en importer les notions dans un autre cours. Ne pas substituer une référence approximative, une capture isolée ou une version de même nom à des octets différents. Référence absente ou SHA différent : **BLOQUÉ — MODÈLE NON VÉRIFIÉ**, aucune conformité ni publication déclarée.

## Production et contrôles des octets

- A4 portrait ; texte sélectionnable ; police **Lato** et variantes Lato-Bold/Heavy ; fond clair ; marges du corps au moins 36 pt. Corps au moins 9 pt, sans réduction opportuniste pour faire tenir une page.
- Bandeaux violets `#5E3587`, pleine largeur, haut 45,35 pt et bas 42,52 pt (tolérance 3 pt), sur CHAQUE page. Le test vérifie aussi les pixels rendus : un bandeau caché sous un rectangle blanc ne compte pas.
- Pagination cohérente `n / N` sur chaque page, UE et titre lisibles ; hiérarchie et encadrés fidèles au modèle. Violet : concepts ; bleu : notes ; vert : essentiels ; orange : exemples ; rouge : pièges/réserves, lorsque ces contenus existent.
- Fiche : sans image générée ; explications complètes, tableaux utiles ; rubrique unique Pièges QCM → Synthèse générale → Définitions et mots-clés en dernière section.
- QCM : UN PDF, questions regroupées par thème, chaque question dans un encadré ; difficulté visible ; cinq choix A–E avec cases à gauche. Garder chaque question et ses cinq choix sur la même page. Corrigés argumentés après toutes les questions, aucune clé révélée dans les questions. Vérifier séparément la concordance exacte avec la banque canonique et son miroir.

Commandes dans l’espace de production privé :

```sh
python tools/pdf-template-v3.py fiche.pdf --role sheet --technical-only --report fiche-trame.json
python tools/pdf-template-v3.py qcm.pdf --role qcm --technical-only --report qcm-trame.json
```

`technicalOnly: true` n’est ni une revue visuelle ni un GO. Ne pas réécrire les notions, choix, réponses ou argumentations pour satisfaire un contrôle graphique.

## Revue complète et validation du lot

Rendre **toutes** les pages des deux PDF, puis comparer au modèle à 100 % et 200 %. Vérifier bandeaux, typographie, hiérarchie, couleurs, tableaux/encadrés, blancs, marges, pagination, absence de chevauchements/coupures, lisibilité, ordre des sections et rendu des choix QCM. Une planche de contact sert à repérer les écarts ; inspecter les pages en taille lisible pour les résoudre. Aucun « PASS graphique » fondé seulement sur la génération du fichier, le nombre de pages ou la CI.

Conserver en privé les rendus numérotés, le relevé page par page des écarts, les corrections et la décision authentique du propriétaire. Produire un résumé de contrôle du lot exact pour sa validation : nombres de pages/questions/cartes/termes, SHA-256, références utilisées et limites. Revue pédagogique et accord graphique sont distincts. Un GO déjà reçu pour le lot précis est valable ; ne pas redemander un accord sans changement pertinent.

Pour chaque PDF nouveau ou modifié, `delivery.templateConformance` déclare :

- `contract: "ifsi_pdf_template_v3"` ; `artifacts.sheet` et/ou `artifacts.qcm` selon les octets modifiés ;
- `templateId`, `templateSha256` : valeurs de la référence figée ;
- `artifactSha256`, `pageCount` : octets finaux réels ;
- `pagesChecked` : liste exhaustive `[1, 2, …, N]` ;
- `method: "all_pages_compared_at_100_and_200_percent"`, `reviewedAt` avec fuseau ;
- après accord réellement reçu seulement : `status: "owner_accepted"`, `reviewerRole: "owner"`, `decision: "explicit_graphic_acceptance"` ;
- `checks` : résultat de chaque critère de `reviewChecks` dans la politique ;
- `privateEvidenceSha256` : empreinte du dossier de preuve privé, sans lien, identité, transcription ou rendu privé dans GitHub.

La CI vérifie la mesure des PDF, les références, la couverture des pages et la cohérence de ce reçu. **Elle ne prouve pas qu’une personne a regardé les pages et ne doit jamais fabriquer son accord.** L’auteur doit conserver la preuve authentique en privé. La revue reste en attente si cet accord n’existe pas.

Le reçu entre dans l’empreinte du package de publication. Tout changement du PDF invalide le contrôle et le reçu correspondants, même si son nom est identique ; refaire les contrôles sur les nouveaux octets. Toute modification substantielle de présentation ou de pédagogie exige une nouvelle validation. Toute publication exige un GO portant sur le lot final ; un GO de production seul ne suffit pas.

## Passage ChatGPT ↔ Work

Transmettre le même contrat et les références, l’identité du cours, les PDF finaux, leurs SHA, les contrôles réellement exécutés, le reçu de revue, le statut des sources et le GO exact. Work vérifie les entrées puis réutilise les fichiers conformes ; ne pas régénérer un fichier déjà validé. Si ChatGPT ne peut accéder aux modèles, rendre les pages ou exécuter un contrôle, le signaler comme **non exécuté** et transmettre le blocage à Work avant toute déclaration de conformité. Cette règle s’applique quand les instructions du projet sont effectivement chargées ; elle ne constitue pas une installation automatique dans tous les chats.

## Blocage de publication

Préflights préparation/publication et CI exécutent les tests V3, puis le contrôle différentiel `python tools/pdf-template-v3.py --base <SHA_COMPLET>` sur chaque fiche/QCM écrit nouveau ou modifié. Le contrôle détecte aussi une modification réelle des octets sans mise à jour du manifeste. Absence de PDF local contrôlable, de référence conforme, de revue complète ou de SHA correct : échec bloquant. Tous les TNR historiques restent actifs ; aucun `continue-on-error` ni remplacement des attentes pour masquer un défaut. Le contrôle Pages/Drive réel et l’archivage sans suppression restent obligatoires après publication autorisée.
