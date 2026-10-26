# UE D1.1 — Relation soignant-soigné et écoute active — reprise support officiel (26/10/2026)

## Autorisation
GO d'intégration et de publication donné le 26 octobre 2026 pour **ce cours uniquement**. La présente branche ne publie pas les fichiers : le transfert binaire authentifié vers GitHub a été bloqué par le connecteur, et les contrôles bloquants ne peuvent donc pas être déclarés réussis.

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
