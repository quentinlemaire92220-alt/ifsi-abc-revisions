# Lot candidat — UE D1.1 « Relation soignant-soigné et écoute active »

**Statut : PR de relecture uniquement ; aucune intégration étudiante ni GO graphique final.**

## Sources reçues
- Transcription PT01 : jusqu’à 01:14:00 (pause annoncée).
- Transcription PT02 : jusqu’à 00:34:25, avec fin de séance.
- Le support écrit / diaporama annoncé par la formatrice n’a pas été reçu ; les éventuelles séquences vidéo projetées ne sont pas inspectées.
- Sources brutes et script vocal conservés hors GitHub public, dans le Drive propriétaire.

## PDFs exacts du lot soumis à validation
Ces trois fichiers proviennent des octets originaux disponibles dans le Drive et sont volontairement placés sous `review-candidates/`, **pas** sous `assets/` de l’application.

| Rôle | Pages | Taille | SHA-256 |
|---|---:|---:|---|
| Fiche écrite V5.3 | 16 | 75 613 octets | `468f7ad7ebdfa26e8b53cf02b848054c0551aefd36bb8aca7ac6411a81e0a6fb` |
| QCM argumentés | 20 | 79 170 octets | `43d1ae24ab8a3ad3abd10fbb31883ac4bd22bf73c882310fccd48093cba8faf7` |
| Flashcards | 9 | 61 139 octets | `d3a153611fffd268fe888c70dda89c5c45dbb8e3dabb792b993f8bc0911a43b7` |

## Contrôles opérés sur les fichiers exacts
- Les 45 pages sont au format A4 avec bandeaux haut/bas violets, sans image matricielle et avec texte sélectionnable.
- Aucun texte hors de la page, ni champ de corps inférieur à 9 pt, n’a été détecté par extraction géométrique.
- Le QCM contient 40 questions à cinq réponses A–E ; chaque question a **une à trois** bonnes réponses ; 40 corrigés argumentés.
- Les textes des 40 questions, propositions, clés, justifications, 40 cartes/rectos/versos et explications sont **identiques** entre les PDF et la banque de données fournie (comparaison des textes après normalisation typographique, aucun écart).
- Le lexique de préparation compte 25 entrées.
- Le script vocal est un **TXT privé**, aucun MP3 n’est déclaré.

## Ce que ce rapport NE valide PAS
- **Pas d’accord graphique explicite du propriétaire sur ces 45 pages ni les trois SHA**. La relecture visuelle de l’ensemble reste bloquante avant mise en ligne.
- **Pas de vérification scientifique exhaustive** en l’absence du support officiel ; ne pas annoncer l’exhaustivité.
- Un résultat mécanique « PASS » ne constitue ni une attestation esthétique, ni un accord de publication.
- Aucun enregistrement vocal / MP3 n’est disponible.

## Publication future — seulement après validation
1. Comparer les 45 pages au modèle graphique écrit V5.3 et accepter les trois SHA ci-dessus.
2. Valider les contenus et le périmètre restreint aux transcriptions, puis donner un GO explicite de **publication provisoire**.
3. Incorporer les données QCM/flashcards/lexique depuis la PR #221, sans perte ni doublon.
4. Déplacer **les mêmes blobs Git** depuis `review-candidates/` vers `assets/`, renseigner `course-registry-v741.json`, `questions-5.json`, `sheets-3.json`, `vocabulaire-v1.json`, `docs/course-deliveries.json` et les métadonnées de version.
5. Apposer une `publicationApproval` correspondant à l’empreinte canonique **réellement calculée** du lot et un `visualOwnerReview` correspondant au GO réel, puis exécuter le préflight et les TNR complets. Ne jamais remplir une approbation par défaut.
6. Après déploiement GitHub Pages et contrôle de l’application : statut visible **PROVISOIRE — support officiel manquant** ; conserver les sources et le cours dans « À traiter » jusqu’à rapprochement du support écrit.

Le correctif distinct de classement des fichiers QCM (PR #220) est déjà intégré à la V8.30.124.
