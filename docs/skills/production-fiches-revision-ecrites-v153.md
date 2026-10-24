## Contrôle obligatoire avant intégration en application

Lire `docs/COURSE_PREPARATION_V1.md`. Pour un nouveau cours encore en QA, déposer le lot dans le Drive propriétaire privé, conserver la banque en `data/course-preparations/` et la fiche de suivi dans `docs/course-preparations.json`. Ne rien inscrire dans `course-registry-v741.json`, `sheets-*.json`, `questions-*.json`, `vocabulaire-v1.json`, `docs/course-deliveries.json` ou les `assets/` de GitHub Pages avant la validation complète et le GO distinct. Une transcription tronquée conserve son statut de réserve. Lancer `node tests/course-preparation-stage.mjs` ; la publication finale exige les TNR complets, les contrôles visuels, la signature du pack et une vérification du site, puis l'archivage des sources sans suppression.

---

## PRIORITÉ TRANSVERSALE — NETTOYAGE DES SUPPORTS ÉTUDIANTS (24/10/2026)

**TOUT document étudiant final** (fiche PDF, QCM, corrigé, flashcards, vocabulaire, script vocal) doit être exempt de marqueurs techniques : « brouillon », « à valider », « non publié », « privé », numéro de version de génération / édition interne (ex. V5.3), traces QA, noms de scripts, notes de workflow, provenance du générateur. Les conserver seulement dans les manifestes et rapports QA privés, hors des supports étudiants. Conserver UE, date/séance, titre, thèmes et pagination.
Le QCM standard tient dans **UN seul PDF** : questions réparties en **blocs par thème**, chaque question dans un encadré, **case à cocher à gauche de chaque choix A à E**, puis **tous les corrigés argumentés à la fin**. Aucune réponse divulguée dans les pages de questions. Ne jamais modifier silencieusement les banques QCM/flashcards, clés ou argumentations en améliorant la forme.
Contrôle bloquant pré-publication : inspecter texte extrait, métadonnées PDF et rendu de chaque page ; utiliser le garde-fou `tools/student_support_clean_gate.py`. Ces obligations ne modifient pas les ressources historiques déjà publiées et ne déclenchent aucune publication ou fusion automatique.


---

# Skill de production IFSI ABC — fiche écrite V5.3

**Version prioritaire à compter du 24/10/2026, pour ChatGPT et Work.**
Lire `docs/WRITTEN_REVISION_V153.md` avant toute production. Utiliser le PDF privé V5.3 « UE D1.1 — La communication » comme **modèle de présentation** lorsqu'il est accessible, jamais comme source médicale.

## Procédure unique reproductible
1. Identifier cours, UE/partie, support officiel, captures provisoires et toutes les transcriptions pertinentes ; relever les incohérences de classement.
2. Dresser en privé la matrice de couverture par notion, objectif, source précise, priorité explicite/déduite, exemple oral, nuance et statut.
3. Rédiger la fiche en préservant toutes les notions importantes et en intégrant naturellement les notes orales ; ne jamais reproduire les horodatages dans la version étudiante.
4. Appliquer le style : bandeaux violets haut et bas **sur chaque page**, violet concepts, bleu notes, vert essentiels, orange exemples, rouge pièges.
5. Ajouter tableaux et cas cliniques uniquement s'ils éclairent une notion. Éviter les méthodes répétées.
6. Une seule rubrique « Pièges QCM » ; puis **une synthèse générale complète mais courte** ; puis **lexique final** en texte sélectionnable.
7. QA contenu + PDF page par page : couverture, sources, cohérence, erreurs, pages, pagination, sommaire cliquable, extraction du texte, absence de visuels générés et couches superposées.
8. Livrer **en revue privée**, sans Drive étudiant / GitHub / app ni fusion automatique ; solliciter un GO ciblé avant publication.

## Garde-fous
- **Interdit** : génération d'image, schéma, planche, infographie, illustration décorative, sans nouvelle autorisation explicite.
- **Interdit** : Internet ou tout apport médical extérieur sans autorisation préalable.
- **Interdit** : inventer des interventions, priorités orales, données, références ou éléments de validation.
- Historique et ressources existantes inchangés ; QCM, flashcards et vocaux gardent leurs propres chartes.
- Si transcription absente, partielle ou mal classée, documenter la réserve dans le QA privé, ne pas certifier une exhaustivité non contrôlée.

Pour le contrat technique utiliser `written_v1` et la validation `tests/written-sheet-contract.mjs`; ne **jamais** faire passer l'ancien contrat `hybrid_v1` avec de fausses images.
