# Livraison complète après validation d’une fiche et de son QCM

La validation utilisateur de la fiche et du QCM déclenche l’exécution de ce processus pour chaque nouveau cours et chaque nouvelle partie. Le modèle de classement est le cours Système respiratoire. Cette procédure complète les chartes pédagogiques sans modifier les supports officiels.

## Dossiers à créer ou réutiliser

| Dossier | Contenu |
| --- | --- |
| 01 - Cours | Support officiel unique ou ensemble explicitement identifié |
| 02 - Fiches de révision | Fiche validée, détails écrits et illustrations intégrées |
| 03 - QCM | QCM avec thèmes, niveaux et corrigé argumenté |
| 04 - Infographies | Infographies illustrées individuelles et pack |
| 05 - Vocaux | Dossier initialement vide ; MP3 créés et renvoyés par Quentin |
| 06 - Planches anatomiques | 01 - Masters ; 02 - Versions validées ; 03 - Exports application |
| 07 - Flashcards | Export de la banque de cartes et version consultable |
| 08 - Scripts vocaux | Fichiers texte brut à convertir en MP3 par Quentin |
| 99 - Archives | Anciennes ressources remplacées |

Créer les dossiers même lorsqu’une ressource est en préparation. Ne pas dupliquer un dossier existant. Conserver les mêmes identifiants Drive lors du remplacement d’un PDF actif et déplacer les anciennes copies isolées dans les archives du cours. Ne conserver ni transcripts PLAUD ni transcriptions brutes dans Drive.

## Production et contrôle

1. Vérifier l’UE, le nom du cours, la partie et l’identité du support. Les sections internes d’un même support ne deviennent pas des cours séparés.
2. Conserver les explications écrites. Créer ou réutiliser les infographies illustrées validées et les exporter aussi séparément.
3. Employer la même matrice pour le QCM PDF et le QCM dans l’application : réponses, thème, difficulté et explication. Chaque question annonce de une à trois bonnes réponses ; les questions dépendant d’un visuel absent sont interdites.
4. Générer des flashcards autonomes : question précise, sigles développés, une notion ou une liste cohérente, réponse et explication compréhensibles sans diapo. Les contrôler sur la banque réellement décodée par l’application.
5. Fournir à Quentin des scripts en fichiers texte brut séparés par thème. Reprendre son format : « Vocal N sur M », cours et UE, introduction, questions numérotées, `[pause 1500]`, temps de réflexion de 2500 à 4500 ms, « Réponse : », `[pause]`, définitions, « À retenir », fin et annonce du thème suivant. Utiliser ponctuellement `[strong]` et `[slow]`. Viser une lecture lente de cinq à sept minutes, à vérifier sur le MP3 final. Laisser le dossier `05 - Vocaux` vide. Quentin crée les MP3 et les renvoie ; les renommer `UE_S1_<UE>_<Cours>_PartieNN_Vocal_NN_<Theme>.mp3`, les déposer dans le dossier, vérifier taille/durée/accès, puis les rattacher à l’application. Ne pas envoyer le cours à un service vocal externe et ne pas publier les scripts dans la liste des audios.
6. Vérifier après chaque dépôt Drive le parent, le nom, la taille et l’accès. Renseigner `docs/course-deliveries.json` avec les ressources effectivement disponibles et les éventuels blocages.
7. Relier le même `courseId` à la fiche, au QCM, aux infographies, aux vocaux et aux flashcards dans l’application. Les exports locaux des images sont préchargés pour l’usage hors connexion.
8. Exécuter le contrôle `node tests/course-delivery.mjs` et tous les contrôles de la CI. Créer une PR unique regroupant ressources, version, nouveauté étudiante et cache. Fusionner après réussite de la CI, puis vérifier le déploiement.

## Disponibilité et blocages

Le statut `complete` exige toutes les ressources prévues, dont les MP3 effectivement retournés. Avant ce retour, le statut `awaiting_mp3` exige les scripts prêts et le dossier vocal vide ; les autres ressources peuvent être publiées dans l’application. Les MP3 sont intégrés lors d’une mise à jour suivante. Une autre livraison partielle doit rester explicitement `partial`, préciser la ressource manquante et son blocage, et ne pas annoncer de pack complet. Le contrôle de livraison refuse toute omission silencieuse. Un dossier vide n’est pas une ressource audio produite.

Cette procédure est la règle de travail à appliquer à chaque validation. Elle ne surveille pas automatiquement les conversations : le lot est enregistré après la validation, puis les contrôles de publication s’exécutent en CI.
