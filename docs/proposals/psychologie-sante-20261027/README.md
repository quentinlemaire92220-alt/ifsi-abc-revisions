# Prépublication — Psychologie de la santé — UE B2 S1

**Statut : STAGING / PR brouillon / 0 changement au catalogue étudiant.** Une CI verte ici certifie uniquement la préparation technique : elle n'autorise pas à considérer les PDF comme approuvés graphiquement ni à publier ce cours.

Cet espace ne contient que des données pédagogiques générées pour le candidat du 27 octobre 2026. Aucune transcription, capture, URL du Drive privé ou audio provisoire n'est publiée ici.

- QCM : 50 questions / 5 propositions A–E / 1 à 3 bonnes réponses / corrigés argumentés, mappés depuis la banque canonique privée vers `choices[]`, `answers[]` indexées 0–4.
- Flashcards : 59 définitions intégrales, avec correction de l'angoisse n° 34 explicitement signalée par l'enseignante.
- PDF validés comme lots techniques (sans migration des anciens fichiers) : fiche 18 pages SHA-256 `c1cf1233a527e755917e11f5dd06e95d001f8ff4d5fd2da81f6463d281027486` ; QCM 21 pages `e018df4efd9c5e0db34453164e112a5c40d91746f64b059b80bd562e5ff83c89` ; flashcards 13 pages `9bd7e45fc6d49273552db4c66f08407af9a56b919d7cc6275e58065868cd178a`.
- Source : support officiel encore en attente ; signalement provisoire obligatoire.
- Les 10 reformulations dans le QCM interactif ont été alignées sur un **nouveau PDF QCM V2 de 19 pages**, conservé dans Drive privé : 350/350 champs (questions, propositions et explications) vérifiés, aucun changement de réponse juste. Cette parité technique **ne vaut pas accord graphique du propriétaire**. Le PDF QCM historique de 21 pages reste conservé sans remplacement.
- La fiche de 18 pages, les flashcards de 13 pages, le QCM historique de 21 pages et le QCM candidat V2 de 19 pages restent **uniquement dans Drive privé**. Le dépôt contient leurs empreintes de référence et les banques candidates, mais aucun PDF sous `assets/psychologie-sante-20261027/`. Les fichiers étudiants historiques et les vocaux restent inchangés. Le TNR vérifie qu'aucune ressource nouvelle n'a été activée.

## Portes à franchir avant la fusion

1. Confirmer l'exposition des fichiers PDF finaux aux étudiants via un emplacement réellement accessible, et comparer les SHA servis.
2. Intégrer les questions dans le chargeur actif sans doubler les anciennes ressources et intégrer exactement les 59 définitions dans le moteur flashcards.
3. Contrôler les 52 pages en revue visuelle humaine, sans simuler une acceptation.
4. Conserver les deux vocaux déjà publiés. Les quatre nouvelles voix synthétiques restent privées tant que l'écoute complète et la concordance avec le script 03 corrigé ne sont pas validées.
5. Exécuter les TNR de préparation et de publication, la CI, et vérifier les ressources après déploiement.
6. GO conditionnel déjà enregistré le 27/10/2026 ; fusion **uniquement** si les portes ci-dessus sont réellement franchies, notamment la revue graphique du propriétaire et un manifeste de livraison approuvé. La réussite des TNR de staging n'équivaut pas à la réussite du préflight de publication.

**Note d'architecture** : les blocages TNR du lot précédent provenaient d'une activation prématurée (`questions-5.json`, `sheets-3.json`, `course-registry-v741.json`) sans déclaration dans `docs/course-deliveries.json`. Les garde-fous n'ont pas été désactivés : les fichiers actifs, les numéros de version, le catalogue et le test d'inventaire sont rétablis à l'identique de `main`. La livraison publique fera l'objet d'une modification séparée, accompagnée de l'attestation graphique, de l'empreinte exacte et de la preuve d'accessibilité.

## GO graphique et copie nettoyée du 27 octobre 2026

Le propriétaire a répondu **« ok go »** à la question de validation graphique sur le QCM V2 exact de 19 pages, SHA-256 `468bd3a80b4ea5e88f3583d69e94d920f7466b2cb289c616d2c7df4585c667fd`.

L'inspection a révélé ensuite la mention de travail « CANDIDAT V2 » sur les 19 pages. Une nouvelle version strictement identique pour les questions, choix, réponses, explications et pagination a été préparée en privé, avec uniquement le bandeau remplacé par « VERSION RÉVISÉE ». Son SHA-256 est `e5c658567d53b4f6384e0200f1272f83e06a5aec36ce2c665ef85211cec9c9aa`.

**Cette copie nettoyée n'est pas encore signée graphiquement pour ses nouveaux octets.** Le contrôle technique prouve une parité de texte page par page (hors bandeau), pas une nouvelle décision du propriétaire. Les PDF restent hors des assets publics et aucune livraison étudiante n'est déclarée.

Cette branche est un brouillon de préparation technique, non une publication étudiante.

## Nouveau candidat QCM V2 — contrôle du 27/10/2026

- SHA-256 PDF QCM candidat : `468bd3a80b4ea5e88f3583d69e94d920f7466b2cb289c616d2c7df4585c667fd` ; 19 pages A4.
- Drive propriétaire privé : fichiers vérifiés après téléchargement ; identifiants et liens privés exclus du dépôt public. **Aucun accès étudiant**.
- Parité avec la banque interactive : 350/350 champs textuels présents, 50 questions, deux à 2 bonnes réponses et 48 à 3, aucune question à 4 réponses.
- QA machine : 19 pages rendues à 100 % et 200 %, texte sélectionnable, aucun dépassement détecté.
- Revue graphique propriétaire : **EN ATTENTE**. Ne pas créer artificiellement d'acceptation ni de bundle final approuvé.
