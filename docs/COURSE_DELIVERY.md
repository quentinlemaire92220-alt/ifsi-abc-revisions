# Livraison d’un cours après autocontrôle des livrables

Le lancement d'un package complet déclenche l'exécution de ce processus pour chaque nouveau cours et chaque nouvelle partie, avec autocontrôle des livrables et sans validation graphique intermédiaire systématique. Le modèle de classement est le cours Système respiratoire. Cette procédure complète les chartes pédagogiques sans modifier les supports officiels.

## Dossiers à créer ou réutiliser

Avant la mise à disposition : préparer et autocorriger tout le package, présenter une revue privée de tous les livrables disponibles, puis obtenir la validation du propriétaire et un **GO publication** explicite. Un GO production ou une validation du QCM seul ne valide pas le reste du lot. Voir `PUBLICATION_APPROVAL.md`. Les MP3 non fournis restent explicitement en attente.

| Dossier | Contenu |
| --- | --- |
| 01 - Cours | Support officiel unique ou ensemble explicitement identifié |
| 02 - Fiches de révision | **Deux PDF distincts pour tout nouveau cours / nouvelle partie** : fiche classique (texte + illustrations intégrées) et fiche complète infographiée autonome (DA Système respiratoire) |
| 03 - QCM | QCM avec thèmes, niveaux et corrigé argumenté |
| 04 - Infographies | Infographies illustrées individuelles et pack |
| 05 - Vocaux | Dossier initialement vide ; MP3 créés et renvoyés par Quentin |
| 06 - Planches anatomiques | 01 - Masters ; 02 - Versions validées ; 03 - Exports application |
| 07 - Flashcards | Export de la banque de cartes et version consultable |
| 08 - Scripts vocaux | Fichiers texte brut à convertir en MP3 par Quentin |
| 99 - Archives | Anciennes ressources remplacées |

Créer les dossiers même lorsqu’une ressource est en préparation. Ne pas dupliquer un dossier existant. Conserver les mêmes identifiants Drive lors du remplacement d’un PDF actif et déplacer les anciennes copies isolées dans les archives du cours. Ne jamais placer de transcriptions PLAUD dans les dossiers étudiants ni les indexer dans l'application. Si elles doivent être conservées sur Drive, les isoler dans un dossier strictement privé au propriétaire, sans lien dans les ressources pédagogiques.

## Production et contrôle

1. Vérifier l’UE, le nom du cours, la partie et l’identité du support. Les sections internes d’un même support ne deviennent pas des cours séparés.
2. Pour les nouveaux cours ou parties, préparer obligatoirement **les deux PDF** et les exports individuels depuis une seule matrice de couverture, avec deux contrôles PDF indépendants (voir `docs/DUAL_SHEET_WORKFLOW_V113.md`). Conserver les explications écrites. Recréer les schémas pertinents en infographies originales et les intégrer DIRECTEMENT dans le PDF de la fiche ; l'export séparé est complémentaire. Avant publication, exécuter le garde-fou local décrit dans `docs/PDF_VISUAL_GATE.md` sur le PDF final et la liste des schémas attendus, corriger les anomalies détectées et inspecter les rendus. Une revue distincte de la fidélité médicale (anatomie, connexions, appareillages et légendes) reste obligatoire.
3. Employer la même matrice pour le QCM PDF et le QCM dans l’application : réponses, thème, difficulté et explication. Chaque question annonce de une à trois bonnes réponses ; les questions dépendant d’un visuel absent sont interdites.
4. Générer des flashcards autonomes : question précise, sigles développés, une notion ou une liste cohérente, réponse et explication compréhensibles sans diapo. Les contrôler sur la banque réellement décodée par l’application.
5. Fournir à Quentin des scripts en fichiers texte brut séparés par thème. Reprendre son format : « Vocal N sur M », cours et UE, introduction, questions numérotées, `[pause 1500]`, temps de réflexion de 2500 à 4500 ms, « Réponse : », `[pause]`, définitions, « À retenir », fin et annonce du thème suivant. Utiliser ponctuellement `[strong]` et `[slow]`. Viser une lecture lente de cinq à sept minutes, à vérifier sur le MP3 final. Laisser le dossier `05 - Vocaux` vide. Quentin crée les MP3 et les renvoie ; les renommer `UE_S1_<UE>_<Cours>_PartieNN_Vocal_NN_<Theme>.mp3`, les déposer dans le dossier, vérifier taille/durée/accès, puis les rattacher à l’application. Ne pas envoyer le cours à un service vocal externe et ne pas publier les scripts dans la liste des audios.
6. Vérifier après chaque dépôt Drive le parent, le nom, la taille et l’accès. Pour chaque fiche avec infographies, relancer le contrôle sur le PDF **retéléchargé après publication** via `tools/verify_published_pdf.py` ; en cas de divergence, bloquer la livraison. Inscrire les preuves structurelles `visualAudit` et `publishedVerification` sur la livraison de la partie correspondante, sans publier le PDF ni le rapport détaillé. Renseigner `docs/course-deliveries.json` avec les ressources effectivement disponibles et les éventuels blocages.
7. Relier le même `courseId` aux **deux fiches distinctes**, au QCM, aux infographies, aux vocaux et aux flashcards dans l’application. Les exports locaux des images sont préchargés pour l’usage hors connexion.
8. Exécuter le contrôle `node tests/course-delivery.mjs` et tous les contrôles de la CI. Créer une PR unique regroupant ressources, version, nouveauté étudiante et cache. Fusionner après réussite de la CI, puis vérifier le déploiement.

## Disponibilité et blocages

Le statut `complete` exige toutes les ressources prévues, dont les MP3 effectivement retournés. Avant ce retour, le statut `awaiting_mp3` exige les scripts prêts et le dossier vocal vide ; les autres ressources peuvent être publiées dans l’application. Les MP3 sont intégrés lors d’une mise à jour suivante. Une autre livraison partielle doit rester explicitement `partial`, préciser la ressource manquante et son blocage, et ne pas annoncer de pack complet. Le contrôle de livraison refuse toute omission silencieuse. Un dossier vide n’est pas une ressource audio produite.

Cette procédure est la règle de travail à appliquer à chaque validation. Elle ne surveille pas automatiquement les conversations : le lot est enregistré après la validation, puis les contrôles de publication s’exécutent en CI.

## Suite d'un cours déjà publié : suivi par partie

Lorsqu'un cours existant reçoit une nouvelle partie, ne pas créer de second `courseId`. Dans l'entrée de ce cours, déclarer **`partDeliveries`** avec un objet par partie nouvelle ou complétée. Le nouveau test `tests/course-delivery-parts.mjs` compare la branche au commit Git de base et refuse les fiches, infographies, vocaux et questions QCM ajoutés sans rattachement explicite à une partie.

Exemple public **synthétique** (ne pas y mettre les URL privées) :

```json
{
  "partDeliveries": [{
    "partId": "p02",
    "validated": true,
    "status": "awaiting_mp3",
    "sheetResourceIds": ["exemple_fiche_p02"],
    "infographicResourceIds": ["exemple_info_p02_01"],
    "qcmQuestionIds": ["exemple_p2_001"],
    "vocalIds": [],
    "visualAudit": {"status":"PASS","pdfSha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","expectedCount":1,"checkedCount":1},
    "publishedVerification": {"status":"MATCH","source":"authenticated_drive_download","pdfSha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","expectedCount":1,"checkedCount":1}
  }]
}
```

Le hash d'exemple ci-dessus est **fictif** : ne le réutiliser dans aucune vraie livraison. Les preuves doivent provenir des rapports locaux sur le vrai PDF avant publication puis sur sa copie Drive authentifiée. Si la partie ne contient réellement aucun schéma, et qu'une nouvelle fiche est ajoutée, indiquer `schematics: "none"` avec une justification documentaire privée.

En cas de plusieurs banques QCM associées au même `courseId`, renseigner `qcmBanks` (tableau de chemins locaux) dans le manifeste, conserver les identifiants stables et mettre à jour `qcmCount` comme total des banques ; les TNR vérifient désormais l'unicité de chaque ID. Les nouvelles questions des banques déclarées et les modifications des fichiers `qextra-*.txt` sont repérées par le garde-fou. Les tests d'intégration de l'application doivent aussi charger toutes les banques, sinon le TNR échoue.

Le résumé public n'apporte pas de preuve cryptographique de provenance Google Drive dans la CI publique : l'opérateur vérifie les autorisations et le téléchargement effectif dans son espace privé. La validité médicale demeure un contrôle distinct.

## Relais ChatGPT classique ↔ Work (20/10/2026)

Consulter `docs/skills/orchestration-chatgpt-classique-work.md` et `AGENTS.md` avant toute production en lot, rangement en masse ou préparation d'une nouvelle livraison. ChatGPT classique vérifie le support officiel, le `courseId` et les ressources déjà existantes, puis fournit un plan ciblé. Work produit/contrôle les deux fiches distinctes et les ressources associées, évite les doublons, prépare les mouvements Drive et la PR technique sans publication. Le dossier de revue est privé ; le classement définitif dans Drive étudiant, l'archivage associé et toute fusion/déploiement du lot attendent un **GO publication** distinct.

Le bilan de relais doit préciser : inchangés/créés/corrigés, liens de revue réellement testés, éléments bloqués, supports officiels ou provisoires, état des MP3, identifiants app, TNR/CI, état de la PR et périmètre d'approbation. Garder les références privées uniquement dans le suivi privé. La documentation dans ce dépôt définit une méthode et ne constitue pas une approbation de publication.
