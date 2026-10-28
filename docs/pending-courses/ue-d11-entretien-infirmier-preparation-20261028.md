# UE D1.1 S1 — L’entretien infirmier | préparation de l’application

Séance : 14 octobre 2026. Branche dédiée créée le 28 octobre 2026.
ID futur : `entretien_infirmier` ; partie `p01`.

## Travaux effectués

- Banque canonique **en préparation uniquement** : 50 QCM à cinq choix, entre 1 et 3 réponses justes, avec explications, et 50 flashcards indépendantes.
- Manifest `docs/course-preparations.json` : `validated=false`, `studentPublication=false`, `approval=null`.
- Fichiers de revue **conservés hors GitHub**, dans la zone privée du propriétaire : une fiche de révision de 13 pages, un QCM PDF de 17 pages, les flashcards PDF de 9 pages, cinq MP3 et cinq scripts.
- Le support officiel de 28 pages et les deux transcriptions demeurent privés. Aucun de ces fichiers, source, URL ou rapport de QA privé n’est ajouté dans le dépôt.

## Verrous avant publication

1. Terminer la revue sémantique exhaustive support officiel ↔ deux transcriptions ↔ fiche (charte v1.49.1), ainsi que la correspondance PDF/banque et le contrôle de non-régression.
2. Comparer **toutes les pages** de la fiche et du QCM avec les modèles figés Communication à 100 % et 200 % et obtenir l'acceptation **graphique explicite du propriétaire** sur les SHA exacts. Les rendus techniques seuls ne valent pas cet accord.
3. Écouter chaque MP3 et vérifier prosodie, pauses, cohérence avec les scripts ; laisser les MP3 hors catalogue tant que l'écoute n'est pas validée.
4. Après les validations et pour un lot inchangé, réaliser une PR de publication distincte avec : `course-registry-v741.json`, banques interactives, fichiers étudiants réellement accessibles (jamais les liens privés), manifeste `docs/course-deliveries.json`, empreintes, reçu V3, version/build/cache et éventuelles références audio.
5. Exécuter les préflights préparation puis publication, les TNR, la CI et le contrôle du site servi avant de confirmer la livraison. Conserver les ressources existantes et archiver les sources uniquement **après** validation du déploiement.

**Autorisation :** instruction de mise à jour de l'application reçue le 28/10/2026. Elle ne constitue pas, à elle seule, une preuve que le propriétaire a réellement inspecté l'intégralité des PDF ou écouté les MP3. Ne jamais fabriquer un statut d'acceptation pour contourner un test.

**État :** PR de préparation en brouillon. Aucun cours, PDF, audio ou question ajouté au catalogue public ; aucun déploiement.
