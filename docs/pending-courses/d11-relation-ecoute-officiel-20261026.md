# UE D1.1 — Relation soignant-soigné et écoute active — reprise support officiel (26/10/2026)

## Autorisation
GO d'intégration et de publication donné le 26 octobre 2026 pour **ce cours uniquement**. Le lot exact a été récupéré dans Work et ses trois SHA-256 concordent. Le transfert binaire QCM/flashcards via `create_blob` est désormais accepté, sans modification de branche ni du catalogue. La fiche contient des captures du support officiel et les trois PDF échouent au contrôle graphique : les conditions de fusion/publication ne sont pas réunies.

## Périmètre vérifié en privé
- Diaporama officiel : 60 diapositives, reçu le 26/10/2026. Ne pas verser la source officielle ni les transcriptions dans le dépôt public.
- Fiche complète candidate : 21 pages A4, SHA-256 `2181896d9a51001765b1e02a32b2c37b69ec043319d7fdb255a6510a0744dab6`.
- Variante de fiche raccourcie : 8 pages, **non substituée** à la fiche complète.
- QCM : 48 questions, 20 pages, SHA-256 `85ea89d19da45168185d0e3c68b5bc8bdeae5be321fb56f5f85b67cd999e9a58`.
- Flashcards : 48 cartes, 16 pages, SHA-256 `547af5ec03193f93510d0486dfe501a65a731256d792b9126f68dc969c72a204`.
- Banque : 40 questions historiques strictement inchangées, 8 questions supplémentaires (041 à 048), 48/48 à cinq choix A–E et 1 à 3 réponses exactes.
- Vocabulaire : 25 entrées historiques préservées, 9 compléments = 34 entrées sans doublon.
- Script vocal TXT privé préservé ; aucun nouveau MP3 annoncé.

## Bloquants à lever avant fusion
1. Mettre à disposition les **trois PDF finaux aux mêmes octets** sans exposer les captures, transcriptions ni le diaporama brut. Les anciens PDF restent archivés et le `courseId` existant est conservé.
2. Appliquer le contrôle graphique V2/v1.48 honnêtement : la fiche candidate de 21 pages contient deux figures incorporées et ne permet **pas** de déclarer `NO_GENERATED_IMAGES: PASS` ou `PURPLE_BANDS_EVERY_PAGE: PASS` sans vérification/correction. Ne pas inventer une approbation propriétaire de nouveaux octets.
3. Mettre à jour la banque canonique et `questions-5.json` de façon identique ; ajouter seulement les 9 termes à `vocabulaire-v1.json`.
4. Actualiser l'entrée **existante** du registre, puis `docs/course-deliveries.json`, version/cache et toutes les empreintes. Ne retirer `PROVISOIRE` qu'après rapprochement effectivement attesté et accès étudiant testé.
5. Préflight préparation + publication, TNR complets, Audit P2, contrôles PDFs/QCM/flashcards/visuels, puis preuve GitHub Pages/Drive et vérification mobile.
6. Après publication uniquement : clôturer/archiver la ligne « À traiter » sans supprimer les sources privées.

**État : PR de préparation uniquement, zéro modification pédagogique publiée.**

## Contrôles réellement exécutés dans Work — 26/10/2026
- Téléchargements authentifiés : fiche complète 21 p., QCM 20 p., cartes 16 p. ; empreintes identiques à celles ci-dessus. Aucun remplacement par la fiche de 8 p.
- Transfert binaire GitHub accepté pour le QCM : blob `c7a4f81e87c3cc655297668f3cd4abb557705993` ; cartes : `bbfedbe7ac8c0457c3db7787c414777b40354197`. Les deux SHA Git concordent avec `git hash-object` local. Blobs non rattachés à une branche ; leur relecture par le connecteur échoue sur le décodage UTF-8 des PDF. Aucun transfert de la fiche contenant les captures officielles.
- Source officielle reçue : 60 diapositives ; deux transcriptions privées récupérées. Les principaux thèmes sont présents ; aucune validation exhaustive officielle ou des vidéos n'est déclarée.
- Cohérence contrôlée : 48 énoncés, 48 clés (8 à une réponse, 11 à deux, 29 à trois), 48 cartes ; les 40 QCM/cartes historiques (textes, choix, clés, explications) concordent avec la banque actuelle. Lexique final : 34 termes sélectionnables.
- Propreté : 3/3 PDF sans marqueur de génération.
- Graphique V2 sur les fichiers exacts : **FAIL 3/3**. Fiche : bandeau bas absent p. 1, 3, 7, 11, 14, 19, 20, 21 ; petites polices détectées ; images p. 11 et 14. QCM et cartes : absence de bandeau bas et petites polices signalées sur chaque page.
- Inspection visuelle ciblée : p. 11 et 14 sont des captures de diapositives avec leurs repères et logos. Le contrat d'infographies originales interdit leur diffusion ; leur remplacement changerait les octets autorisés et exige une nouvelle revue. Aucune approbation graphique page par page n'est fabriquée.
- Préflights branche actuelle : préparation **5/5**, publication **22/22**. Les **125 étapes exécutables TNR** passent ; audit P2 et son test passent. Ces PASS concernent la branche sans le nouveau lot, et ne valident pas son intégration.
- CI du commit initial `d7423eff109b8ca984e0b7464fc0056e2dea9656` : TNR et Audit P2 terminés en succès.
- GitHub Pages contrôlé par téléchargement réel : **8.30.141 / build 8441**, ancienne fiche **16 p.**, SHA-256 `468f7ad7ebdfa26e8b53cf02b848054c0551aefd36bb8aca7ac6411a81e0a6fb`, banque de ce cours **40 QCM**. Ce contrôle n'est pas une preuve de déploiement du nouveau lot.
- Ligne existante du registre privé « À traiter » actualisée : GO reçu, publication bloquée QA, maintien sans archivage. Statut PROVISOIRE conservé ; historiques, autres cours et sources privées intacts.

**État final de cette reprise : transfert binaire partiellement débloqué ; lot exact non publiable en l'état. Pas de fusion, de changement de version/cache, ni de faux manifeste approuvé.**
