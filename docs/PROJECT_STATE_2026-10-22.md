# IFSI ABC — Consolidation P0/P1 au 22 octobre 2026

> **Photographie et décisions de tri préparées uniquement.** Base d'audit : `main` V8.30.116 / build 8416, SHA `37248681f08d846298c9c8b2561f3158864ff43e`. La présente branche **n'est pas fusionnée**. Aucun GO publication étudiant, aucun déplacement Drive, aucun changement Supabase, aucune destruction d'archives.

## Sources de vérité et périmètre

- Centre de pilotage : `docs/PROJECT_CONTROL_CENTER.md`.
- Charte pédagogique privée v1.47, modèle maître **Pharmacologie P01 de 24 pages**, nouveau format `hybrid_v1`.
- `AGENTS.md`, `docs/HYBRID_REVISION_V146.md`, `docs/NEW_COURSE_PUBLIC_CONTRACT.md` : alignements **préparés sur cette branche**, non actifs sur `main`.
- `main` : catalogue approuvé et ressources étudiantes ; les fichiers de travail médicaux, revues et transcriptions restent privés.
- Inventaire GitHub **avant la nouvelle PR de consolidation** : **11 PR ouvertes et 7 issues ouvertes**. Comparaisons `main...branche` des 11 PR : **toutes divergentes**, ce qui exige une reprise ciblée des modifications avant décision.

## P0 — Sécurité, runtime et liens des supports

| Sujet | Constat vérifié | Traitement proposé | Condition de clôture |
| --- | --- | --- | --- |
| Quatre supports officiels affichés deux fois | Le code `main` affichait `officialSupportUrl` et `officialSupportItems` sans déduplication ; PR #189 déjà verte mais non fusionnée | **Correctif repris ici depuis #189**, au rendu uniquement, sans changer `course-registry-v741.json` ; test ciblé et CI | TNR + revue mobile/ordinateur, complément digestif Stomatothérapie conservé ; une seule URL réelle affichée |
| Risque de ressources de travail visibles des étudiants | La PR #129 mélange déduplication, nettoyage des références internes et un ancien registre de 48 cours, contre 50 sur la base de travail | **Ne pas fusionner #129 telle quelle.** Auditer séparément les ressources/permissions réellement visibles, reprendre les seuls retraits prouvés sans changement de contenu pédagogique | Contrôle indépendant en lecteur non propriétaire, inventaire des fichiers publics et empreintes, maintien des 50 cours |
| Module Pathologies / HTA | `main` V8.30.116 déclare un **masquage temporaire public** du module Pathologies ; issue #194 documente encore des erreurs de représentation et de revue HTA | **Conserver le blocage** avant tout retour en ligne ; correction graphique ciblée et revue scientifique privées | Validation de chacune des six planches et du lot médical exact, contrôle des accès et GO publication ciblé |
| Parcours et TNR | TNR IFSI ABC + audit P2 **verts sur les heads des PR #199 et #200** avant fusion ; PR #189 également verte | La nouvelle PR doit lancer la CI sur la branche consolidée ; ne pas déduire la CI `main` ni un test PWA réel de ces seuls résultats | TNR de branche verte + contrôle déploiement post-fusion (non autorisée ici) + recette mobile en conditions réelles (issue #71) |

## Complément d'audit P0 — confidentialité des scripts vocaux (22/10)

**Contrôles actuels, non hérités de la PR #129 :** le registre `course-registry-v741.json` de `main` contient **33 documents complémentaires** dont **10 références de scripts vocaux** : **8 liens directs** vers des fichiers TXT/ZIP et **2 liens vers des dossiers de scripts**. Les métadonnées Drive du propriétaire révèlent une permission `anyone:reader` sur les huit fichiers et une permission `anyone` sur les deux dossiers. Un second compte connecté a pu accéder aux métadonnées des fichiers contrôlés ; le référentiel Work privé témoin a refusé l'accès. Cette comparaison ne remplace pas un test anonyme ni une revue exhaustive des dossiers hérités.

**Correctif sur la branche #201** : la liste étudiante « Documents du cours » masque les dix liens de scripts, préserve les **23** autres documents et déduplique également les supports de sous-cours. Test de non-régression dédié `tests/student-resource-visibility-ui-v1.mjs` branché à la CI.

**Statut : CONFIDENTIALITÉ ENCORE NON RÉSOLUE.** Un filtre UI ne révoque pas les droits Drive ; les liens continuent d'exister dans le JSON public jusqu'à correction du manifeste selon les approbations existantes. La connexion Drive disponible ici ne fournit **pas de fonction de retrait de permission**, donc aucune ACL n'a été modifiée ou prétendue corrigée.

**Portes P0 séparées avant clôture** :
1. Propriétaire : revoir les permissions des huit fichiers et deux dossiers et **révoquer explicitement `anyone`** lorsque ces ressources sont des sources de travail privées ; préserver le partage des PDF officiels, fiches, QCM, MP3 destinés aux étudiants.
2. Contrôler les éventuels héritages de dossier et ouvrir les liens en navigateur **non connecté**, puis avec compte étudiant.
3. Préparer une **PR de nettoyage des références privées dans le manifeste public**, avec inventaire conservé dans l'espace privé et respect des garde-fous d'approbation (pas de faux hash, pas de migration des cours, pas de suppression des originaux).
4. Vérifier les accès négatifs et positifs et les TNR ; ne pas annoncer « sécurisé » sur le seul passage de #201.

## P1 — Réconciliation des 11 PR historiques encore ouvertes

| PR | Statut de la revue | Décision préparée |
| --- | --- | --- |
| [#189](../pull/189) | Correctif d'affichage utile ; test protégé, pas de changement pédagogique | **Repris sur la présente branche à jour**. Après revue de la nouvelle PR, décider de la clôture de #189, mais pas avant |
| [#129](../pull/129) | Dédupliquait et protégeait des ressources, mais modifiait un ancien registre | **Bloquer la fusion** ; reprendre la confidentialité dans un lot isolé après inventaire lecteur |
| [#159](../pull/159) | Pilote privé Auth Supabase + registre Sheets ; revue bout-en-bout incomplète | **Bloqué** : vérifier propriétaire, JWT, secrets, ACL/RLS, accès non propriétaire et écriture en conflit ; aucune publication UI |
| [#125](../pull/125) | Correctifs UX/QCM/flashcards et navigateur testés sur ancienne base ; branche très divergente | **Comparer les comportements à V8.30.116**, reprendre uniquement les anomalies encore reproductibles ; ne jamais fusionner l'ancien catalogue |
| [#124](../pull/124) | Garde-fous QCM/provenance, certaines mesures sur données historiques | **Comparer les tests au runtime actuel** ; conserver le suivi pédagogique sans réécriture de réponses |
| [#132](../pull/132) | Sécurité des atlas et matrice des sept planches | **Revue clinique requise** ; préserver les planches non validées et les repères existants |
| [#140](../pull/140) | Import R02–R07, licences/exports HD et qualité non entièrement résolus | **Bloqué**, ne pas publier les assets non vérifiés |
| [#146](../pull/146) | Erreurs anatomiques R03/R05 documentées, essais Canva | **Revue anatomique et flèches réelles** requises, sans validation fictive |
| [#164](../pull/164) | Spécification SVG R03/R05 ; pas encore une correction graphique finale | **À réunir avec le plan clinique #132/#140/#146** avant toute future PR d'atlas |
| [#139](../pull/139) | Chirurgie orthopédique V5 : documentation de revue privée, 11 pages | **Validation pédagogique/graphique** et comparaison à la fiche active avant publication |
| [#74](../pull/74) | Ancien audit lecture seule des QCM mathématiques (9/10) | **Comparer au contrôle QCM courant**, conserver la preuve puis clôturer uniquement si entièrement couvert |

**Aucune des onze PR ci-dessus n'est fusionnée ni fermée par cette consolidation.** Les PR [#171](../pull/171) et [#174](../pull/174) de Plaies et pansements sont déjà fermées **sans fusion** ; ne pas les recompter comme ouvertes ni supposer leur contenu livré. Les PR [#199](../pull/199), [#200](../pull/200) et [#195](../pull/195) sont déjà **fusionnées**, sans extrapoler leurs autorisations au-delà de leur périmètre.

## Issues encore ouvertes — classement des actions

| Issue | État | Suite |
| --- | --- | --- |
| [#188](../issues/188) Pilotage | **Ouverte**, inventaire initial de 12 PR à réactualiser | Suivre les onze PR historiques et la nouvelle consolidation, tracer toute résolution |
| [#192](../issues/192) Douleur | **Partiel / revue privée** : fiche hybride de 32 pages et 67 définitions non validée pour les étudiants | Revue médicale/visuelle complète, support officiel, accord sur les octets avant GO publication distinct |
| [#194](../issues/194) Pathologies HTA | **Bloquée** : QCM/flashcards privés et six planches restant à valider | Corriger les repères et faire relire ; conserver le masquage étudiant |
| [#70](../issues/70) Difficulté QCM | **Dette pédagogique historique** : 1 749 difficultés inférées à l'audit précédent | Recalculer la banque active actuelle avant toute estimation ou retouche |
| [#89](../issues/89) Corrigés QCM | **Dette éditoriale** : courts corrigés et questions dépendantes du support (ancien audit) | Priorité aux questions à haut enjeu et aux supports officiels ; clés inchangées sans revue |
| [#68](../issues/68) 4/4 archives | **Dette des archives**, 53 anciennes versions supplantées au runtime selon audit historique | Préserver les versions actives et assainir l'archive après preuve de correspondance |
| [#71](../issues/71) PWA Android | **Validation réelle non fournie** | Parcours mobile Chrome/PWA, cache/offline, QCM, audio, planning, reprise réseau |

## P1 — Alignement v1.47 préparé

- Le modèle visuel v1.46 (`pharmacologie_v1.46_10_pages`) était encore **exigé** par `tests/hybrid-sheet-contract.mjs` et écrit dans `tools/hybrid_course_pack.py`.
- Le catalogue de livraisons `docs/course-deliveries.json` ne déclare **aucun `hybrid_v1` actuellement**, ce qui permet de préparer la nouvelle référence sans migration de support publié.
- Sur la branche de consolidation : nouvel identifiant `pharmacologie_v1.47_24_pages` pour les futures fiches ; TNR JS/Python alignés et ancien modèle refusé dans les tests synthétiques. `packFormat:hybrid_v1` reste inchangé ; les contrats anciens restent intacts.
- Les anciennes instructions à deux PDF sont requalifiées comme **historiques** dans le centre de pilotage et les documents de contrat. L'ancien fichier `HYBRID_REVISION_V146.md` conserve son chemin stable pour ne pas briser les liens.

## Portes de validation avant toute fusion/publication

1. Faire passer **la CI/TNR du dernier commit de cette branche** et le contrôle P2 (pas seulement les TNR des PR historiques).
2. Vérifier le différentiel : **aucun changement** des QCM/flashcards/vocaux, du registre des cours, des fichiers PDF/MP3, des permissions Drive/Supabase, du scoring et des documents d'approbation.
3. Vérifier visuellement la déduplication sur ordinateur/mobile et un accès non propriétaire pour chaque catégorie de ressource.
4. Contrôler avec le responsable pédagogique le modèle v1.47, les réserves médicales et la confidentialité ; ne pas assimiler l'adoption graphique à une revue scientifique.
5. Obtenir le **GO explicite de fusion** pour cette PR technique ; tout lot pédagogique futur exige en plus son propre **GO publication** avec empreintes vérifiées.

**Statut de ce rapport : inventaire/PR préparatoire, aucune fermeture d'issue, aucune fusion, aucun déploiement.**
