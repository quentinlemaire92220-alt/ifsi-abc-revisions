# Prépublication — Psychologie de la santé — UE B2 S1

**Statut : STAGING / PR brouillon / 0 changement au catalogue étudiant.** Une CI verte ici certifie uniquement la préparation technique : elle n'autorise pas à considérer les PDF comme approuvés graphiquement ni à publier ce cours.

Cet espace ne contient que des données pédagogiques générées pour le candidat du 27 octobre 2026. Aucune transcription, capture, URL du Drive privé ou audio provisoire n'est publiée ici.

- QCM : 50 questions / 5 propositions A–E / 1 à 3 bonnes réponses / corrigés argumentés, mappés depuis la banque canonique privée vers `choices[]`, `answers[]` indexées 0–4.
- Flashcards : 59 définitions intégrales, avec correction de l'angoisse n° 34 explicitement signalée par l'enseignante.
- PDF validés comme lots techniques (sans migration des anciens fichiers) : fiche 18 pages SHA-256 `c1cf1233a527e755917e11f5dd06e95d001f8ff4d5fd2da81f6463d281027486` ; QCM 21 pages `e018df4efd9c5e0db34453164e112a5c40d91746f64b059b80bd562e5ff83c89` ; flashcards 13 pages `9bd7e45fc6d49273552db4c66f08407af9a56b919d7cc6275e58065868cd178a`.
- Source : support officiel encore en attente ; signalement provisoire obligatoire.
- Les 10 reformulations dans le QCM interactif sont autonomes mais diffèrent textuellement du PDF QCM signé ; réconciliation pédagogique et documentaire encore requise avant la vraie livraison.
- La branche conserve les trois PDF comme candidats non reliés au catalogue. Les fichiers étudiants historiques et les vocaux sont inchangés. Le TNR de cette branche vérifie explicitement qu'aucune ressource nouvelle n'a été activée.

## Portes à franchir avant la fusion

1. Confirmer l'exposition des fichiers PDF finaux aux étudiants via un emplacement réellement accessible, et comparer les SHA servis.
2. Intégrer les questions dans le chargeur actif sans doubler les anciennes ressources et intégrer exactement les 59 définitions dans le moteur flashcards.
3. Contrôler les 52 pages en revue visuelle humaine, sans simuler une acceptation.
4. Conserver les deux vocaux déjà publiés. Les quatre nouvelles voix synthétiques restent privées tant que l'écoute complète et la concordance avec le script 03 corrigé ne sont pas validées.
5. Exécuter les TNR de préparation et de publication, la CI, et vérifier les ressources après déploiement.
6. GO conditionnel déjà enregistré le 27/10/2026 ; fusion **uniquement** si les portes ci-dessus sont réellement franchies, notamment la revue graphique du propriétaire et un manifeste de livraison approuvé. La réussite des TNR de staging n'équivaut pas à la réussite du préflight de publication.

**Note d'architecture** : les blocages TNR du lot précédent provenaient d'une activation prématurée (`questions-5.json`, `sheets-3.json`, `course-registry-v741.json`) sans déclaration dans `docs/course-deliveries.json`. Les garde-fous n'ont pas été désactivés : les fichiers actifs, les numéros de version, le catalogue et le test d'inventaire sont rétablis à l'identique de `main`. La livraison publique fera l'objet d'une modification séparée, accompagnée de l'attestation graphique, de l'empreinte exacte et de la preuve d'accessibilité.

Cette branche est un brouillon de préparation technique, non une publication étudiante.
