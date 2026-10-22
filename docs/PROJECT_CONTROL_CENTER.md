# IFSI ABC — Centre de pilotage

> Point d'entrée stable du projet. Ce document **oriente** vers les sources existantes et ne remplace ni les chartes, ni les décisions pédagogiques, ni les autorisations privées de publication.

## 1. Où se trouve la vérité ?

| Domaine | Source de référence | À ne pas confondre |
| --- | --- | --- |
| Application livrée, code, version, tests | GitHub `main`, `build-meta.json`, Actions, `tests/` | Ancien échange ChatGPT, branche ou PR non fusionnée |
| Règles de contribution et production | `AGENTS.md`, `CONTRIBUTING.md`, documents normatifs sous `docs/` | Exemples ou procédures archivés |
| Supports pédagogiques, sources et validations | Google Drive, index courant « Référentiel Work IFSI ABC », chartes pédagogiques et dossier du cours | Captures / transcriptions ≠ support officiel |
| Statuts de livraison | `docs/course-deliveries.json`, contrôles et approbation explicite | Brouillon préparé ≠ contenu autorisé |
| Analytique et services privés | Configuration et données réelles Supabase selon leurs permissions | Déclarations dans le dépôt public ou souvenirs ChatGPT |
| Demandes, décisions, suivi conversationnel | ChatGPT : cadrage et synthèse, confirmés ensuite dans les référentiels | Mémoire ou conversation prise seule pour une preuve de publication |

**Hiérarchie pour décider :** instruction explicite récente du propriétaire > décision validée spécifique au lot > charte et contrat actuellement applicables > exemples et historiques. Aucune priorité documentaire ne dispense de vérifier le support officiel, les permissions et les tests. Si deux règles actuelles paraissent incompatibles, **signaler et isoler l'écart** ; ne pas fabriquer un PASS ou une approbation.

## 2. Documents de référence (sans les recopier)

- `AGENTS.md` : décisions prioritaires et méthodes de production actuellement en vigueur.
- `docs/COURSE_DELIVERY.md` et `docs/NEW_COURSE_PUBLIC_CONTRACT.md` : dossier, ressources, IDs, matrice de couverture, TNR.
- `docs/HYBRID_REVISION_V146.md` : contrat hybride introduit en v1.46, aligné sur la charte maître v1.47.
- `docs/LEAN_COURSE_PACK_V1.md` : uniquement pour l'héritage des anciens packs, pas un modèle de nouveaux cours.
- `docs/PUBLICATION_APPROVAL.md` : preuve du GO publication, portée, empreintes et séparation préparation/diffusion.
- `docs/COURSE_REVISION_ELIGIBILITY.md` : cours réellement éligibles à la production.
- `docs/REPO_HYGIENE.md` et `CONTRIBUTING.md` : nettoyage prudent, branches, PR, CI.
- Index Work et chartes **courants** sur Drive : références pédagogiques privées, sans copier leurs liens dans ce dépôt public.

Les archives demeurent consultables et **ne deviennent pas automatiquement les règles courantes**.

## 3. Contrat pédagogique courant — charte v1.47

Pour un nouveau cours ou une partie nouvelle : **un PDF principal unique de fiche de révision hybride infographiée** (contrat technique `hybrid_v1`, `sheetFormat:"hybrid_infographic"`). Texte synthétique sélectionnable, infographies médicales détaillées intégrées aux notions concernées, tableaux, « À retenir », « Pièges QCM » et enfin « Définitions et mots-clés ». Pas de quota de pages, pas de cours infographié intégral ni de pack de planches séparé systématique. Maître privé actuel : **Pharmacologie P01, 24 pages (charte v1.47)**, à comparer sur **toutes les pages du nouveau PDF**, sans recopier son fond médical.

Les anciennes annexes de dix pages de v1.46 ainsi que les consignes à deux PDF sont **historiques uniquement**. Le schéma `hybrid_v1` et les contrôles sont non rétroactifs : conserver les cours publiés avec `lean_v1`, dual-sheet ou autres anciens packs, et ne pas réécrire leurs approbations.

**QCM, flashcards et vocaux inchangés.** Un QCM maintient les cinq propositions A–E, 1–3 bonnes réponses, la clé `answers` unique synchronisée entre score, affichage, corrigé, erreurs et statistiques. Flashcards à réponse cachée avant retournement ; vocaux et scripts selon contrat existant. Les planches anatomiques autonomes restent possibles seulement lorsqu'un besoin spécifique le justifie.

Pour les sources : **support officiel > oral/transcription privée recoupée > captures/notes provisoires > compléments sourcés**. Séparer l'importance explicitement signalée par l'enseignant des priorités déduites, conserver les réserves scientifiques et ne jamais exposer de transcription/PLAUD en public. Le test technique, même vert, ne valide pas la science ni les visuels.

## 4. Processus qui préserve l'existant

**GO audit → GO production privée → contrôles techniques et scientifiques → revue privée du lot complet → GO publication explicite du lot exact → intégration, TNR, CI, déploiement et vérification.**

- Un GO audit ou production n'est jamais un GO publication.
- Un changement de code/documentation sans contenu pédagogique nouveau peut être proposé en PR sans approbation d'un package de cours, mais **sans fusion implicite**.
- Avant d'ajouter : rechercher le cours, ses ID, ses ressources Drive, le registre et les branches/PR existantes. Modifier l'existant plutôt que doubler.
- Avant toute fusion : vérifier origine et tête de branche, conflits, tests, permissions, diff, impact PWA, mode hors ligne, version et compatibilité mobile.
- Après : vérifier le déploiement réel. Un TNR vert ne vaut pas validation médicale, graphique ni autorisation de publication.
- Aucun secret, transcription, preuve privée, fichier pédagogique non autorisé, donnée personnelle ou lien d'accès privé dans GitHub public.
- Pas de suppression d'archives, de branche, de document Drive ni de PR avant inventaire, correspondances et décision documentée.

## 5. Reprise ChatGPT sans perdre le fil

**À l'ouverture d'une intervention :** (1) lire cette page et `AGENTS.md` ; (2) consulter `build-meta.json`, la CI récente et les PR ouvertes ; (3) consulter `docs/PROJECT_STATE_2026-10-21.md` comme **photographie datée**, jamais comme état actuel ; (4) vérifier l'index Drive courant et le support particulier ; (5) dire ce qui existe, les manques, les risques et l'action minimale ; (6) travailler sur une branche courte, sans republier ni régénérer ce qui est déjà validé.

**Phrase courte pour relancer :**

« Reprends IFSI ABC à partir de `docs/PROJECT_CONTROL_CENTER.md` et `AGENTS.md`. Vérifie la version `main`, les PR/TNR et le référentiel Drive courant, puis traite [demande]. Préserve les contenus et identifiants validés. Pas de fusion ou publication implicite ; signale les validations restant à obtenir. »

## 6. Suivi et mise à jour

- Le présent fichier contient les **règles et les pointeurs stables**.
- `docs/PROJECT_STATE_2026-10-21.md` est une **photographie d'inventaire**, à remplacer par un nouveau fichier daté lors d'une nouvelle revue substantielle.
- Les travaux réellement suivis restent dans les **PR/issues GitHub**, jamais dans une simple promesse de conversation.
- Classer tout chantier : **en production**, **en revue privée**, **bloqué**, **à comparer avec main**, **terminé**, ou **archive**. Ne pas transformer ces statuts en décisions de publication.

Document d'organisation uniquement ; **aucune modification du runtime, du support médical, des permissions Drive ou de Supabase**.
