> **NOUVELLE PRIORITÉ v1.49 (28/10/2026) — contrôle de non-régression :** lire et appliquer `docs/skills/controle-non-regression-pedagogique-v149.md` et `docs/PEDAGOGICAL_NON_REGRESSION_V149.md` avant toute création/régénération. Comparer toutes les sources et l'ancienne fiche, y compris ses exemples/nuances, via matrice privée avant/après ; une simple citation de terme n'est pas une explication. Toute notion importante perdue, insuffisamment développée ou source essentielle non rapprochée bloque la validation. Aucune génération automatique lors du dépôt de PLAUD ; aucun changement de la trame V5.3 ni publication implicite.

---

# Verrou prioritaire de trame — 26/10/2026

Pour toute fiche de révision ou QCM, ChatGPT et Work doivent lire et appliquer `docs/PDF_TEMPLATE_CONTRACT_V3.md` et `docs/pdf-template-policy-v3.json` AVANT de produire ou réparer. Ouvrir les PDF Communication référencés et vérifier leurs empreintes ; référence inaccessible = arrêt avant toute conformité déclarée. Le contrôle technique V3, la revue intégrale comparée au modèle et le GO sur les octets finaux sont distincts et bloquants. Conserver l’historique ; ne pas migrer les PDF inchangés. Le reçu `templateConformance` de chaque PDF modifié entre dans le digest du lot. Ne jamais fabriquer une revue ou réécrire automatiquement un accord après correction.

---

## CONTRÔLE GRAPHIQUE V2 — 25/10/2026

Pour tout **nouveau document écrit**, appliquer aussi [GRAPHIC_QA_V2.md](GRAPHIC_QA_V2.md). Les vérifications portent sur les vrais octets PDF et leurs pages (bandeaux, police, marges, cases A–E, ordre des sections), pas uniquement sur des déclarations QA. Les pages restent à relire sur le rendu visuel, avec validation du propriétaire. Le modèle graphique obligatoire demeure la fiche écrite V5.3 sans images. Le pilote Bientraitance est **privé**, fondé pour l'instant uniquement sur une transcription ; aucun GO de diffusion n'est présumé.

---

## PRIORITÉ 24/10/2026 — PRÉPARATION SÉPARÉE DES SUPPORTS PUBLIÉS

Complément de contrôle : [préflight avant PR et publication](COURSE_PREFLIGHT.md), avec contrats QCM autonomes, cohérence PDF/banques/empreintes, version/cache/assets, QA pédagogique distincte de la QA technique et TNR complets toujours bloquants. Aucun contrôle automatique n’inscrit une approbation humaine.

Un cours en production, même avec fiche/QCM/flashcards prêts, reste HORS du catalogue actif tant que la validation pédagogique, la couverture des sources et le GO de publication/fusion n'ont pas été documentés. Le préparer dans `docs/course-preparations.json` et `data/course-preparations/`, garder les PDF et sources sur le Drive propriétaire privé ; ne pas activer de fiche, QCM, lexique ou PDF Github Pages. Contrôle : `node tests/course-preparation-stage.mjs`.

Ne pas marquer une transcription tronquée « complete » ; maintenir une réserve pédagogique explicite. Le test de préparation peut être vert pendant que le contrôle de publication continue d'exiger un package complet, approuvé et vérifié. Le dossier « À traiter » n'est nettoyé qu'APRÈS contrôle du déploiement étudiant, par archivage sans suppression. Détails : `docs/COURSE_PREPARATION_V1.md`.

---

## PRIORITÉ TRANSVERSALE — NETTOYAGE DES SUPPORTS ÉTUDIANTS (24/10/2026)

**TOUT document étudiant final** (fiche PDF, QCM, corrigé, flashcards, vocabulaire, script vocal) doit être exempt de marqueurs techniques : « brouillon », « à valider », « non publié », « privé », numéro de version de génération / édition interne (ex. V5.3), traces QA, noms de scripts, notes de workflow, provenance du générateur. Les conserver seulement dans les manifestes et rapports QA privés, hors des supports étudiants. Conserver UE, date/séance, titre, thèmes et pagination.
Le QCM standard tient dans **UN seul PDF** : questions réparties en **blocs par thème**, chaque question dans un encadré, **case à cocher à gauche de chaque choix A à E**, puis **tous les corrigés argumentés à la fin**. Aucune réponse divulguée dans les pages de questions. Ne jamais modifier silencieusement les banques QCM/flashcards, clés ou argumentations en améliorant la forme.
Contrôle bloquant pré-publication : inspecter texte extrait, métadonnées PDF et rendu de chaque page ; utiliser le garde-fou `tools/student_support_clean_gate.py`. Ces obligations ne modifient pas les ressources historiques déjà publiées et ne déclenchent aucune publication ou fusion automatique.


---

# IFSI ABC — STANDARD MAÎTRE FICHE ÉCRITE v5.3
Date de décision : 24 octobre 2026. Statut : validé pour les **nouvelles productions privées** ; aucune publication implicite.

## Priorité normative
Ce standard remplace, **pour les nouvelles fiches**, l'obligation d'infographies intégrées de la charte v1.47 et de docs/HYBRID_REVISION_V146.md. Le modèle de mise en page de référence est le pilote privé « UE D1.1 — La communication », version **V5.3**, validé le 24/10/2026. Il est un modèle de **forme et d'organisation**, pas une source de faits médicaux. Les anciens fichiers, ressources, cours, lots publiés, preuves de publication et contrôles historiques restent inchangés. Pas de migration automatique.

## Livrable
Un seul PDF **fiche de révision écrite** multipage par cours/partie, sans image, infographie, planche ni schéma généré. Ne produire **aucune image**, même en pilote, sauf nouvelle demande explicite de l'utilisateur. Le texte, y compris les définitions, est sélectionnable, copiable et utilisable pour les vocaux. Aucune limite fixe de pages : ne sacrifier ni les informations importantes ni la lisibilité. Pas de duplicata de fiche ou de pack infographié.

## Sources et pédagogie
1. Exploiter le support officiel ou les notes/captures provisoires explicitement identifiées ; **lire et confronter toutes les transcriptions orales correspondantes**.
2. Conserver les explications essentielles de l'intervenant, ses exemples, nuances et points soulignés, sous forme de **notes de cours naturelles**. Ne jamais faire apparaître des minutes, des noms techniques de fichiers ou des références à l'enregistrement dans le PDF étudiant.
3. Distinguer **priorité explicitement annoncée** et **priorité pédagogique déduite**, sans inventer des questions de partiel. Distinguer propos de l'intervenant et réponses d'étudiants.
4. Ne **jamais** rechercher ou introduire d'informations externes (web, ouvrages ou autre canal) sans **autorisation préalable explicite**. En cas de contradiction, d'incertitude ou de chiffre douteux : garder une réserve dans le QA privé, demander l'autorisation avant une vérification externe ; ne pas transformer un avis en fait.
5. Si une transcription manque, est mal classée ou est inexploitable : afficher un statut **À compléter / revue orale incomplète** dans le QA privé ; ne pas prétendre à la couverture exhaustive.

## Structure obligatoire
- Repère UE, titre du cours, objectifs et priorités sourcées.
- Développement progressif et suffisamment explicatif : **définir → comprendre → appliquer** ; double niveau de lecture, mots importants mis en valeur, notes de cours intégrées.
- Tableaux comparatifs, étapes ou raisonnements infirmiers, applications pratiques et exemples **uniquement si utiles** ; éviter les rubriques décoratives.
- Encadrés « À retenir » concis, sans répétition mécanique.
- **UNE** rubrique « Pièges QCM / confusions à éviter », regroupée en fin de fiche ; pas d'encadrés QCM dispersés.
- **« Synthèse générale — L'essentiel du cours »** après les pièges QCM : courte, couvre toute la fiche et sert à une relecture rapide ; ce n'est pas une seconde fiche.
- **« Définitions et mots-clés » en TOUTE DERNIÈRE section**, lexique suffisamment riche, organisé clairement et composé de texte sélectionnable. Quand pertinent : sigles, préfixes, racines, suffixes, unités et distinctions.

## Identité graphique stable
Bandeau violet **en haut ET en bas de CHAQUE page** (titre/UE et pagination), intégrés nativement sans superposition de couches. Fond clair, marges et taille de police lisibles, sommaire cliquable sur fiches longues. Usage cohérent, non décoratif :
- Violet : concepts et titres ; bleu : notes de cours et précisions de l'intervenant.
- Vert : points « À retenir » ; orange : situations, exemples, applications.
- Rouge : erreurs, réserves pédagogiques et pièges QCM.
Pas d'images, même pour habiller la page. Conserver la structure de lecture de la V5.3, adapter les sections à chaque cours.

## QA bloquant avant validation
Matrice privée notions essentielles ↔ support officiel (page/diapositive) ↔ oral pertinent (segment/horodatage privé) ↔ section finale, avec priorité explicite/déduite et statut confirmé/complément/contradiction.
- Couverture : **100 % des notions importantes**, objectifs et nuances ; pas de synthèse trop courte, pas d'ajout extérieur non autorisé.
- Dédoublonnage des méthodes, pièges QCM et notes ; exemples correctement attribués ; pas de jugement ou de citation inventés.
- PDF : chaque page rendue et inspectée ; bandeaux haut/bas présents, lisibles et non dupliqués ; absence de débordements/coupures, de calque de texte caché, d'images ; sommaire vers les bonnes pages.
- Ordre : « Pièges QCM » unique → « Synthèse générale » → « Définitions et mots-clés » **en dernier** ; texte réellement extractible.
- Sources privées et horodatages conservés seulement dans le QA privé, non dans GitHub public ni dans les livrables étudiants.
- QCM, flashcards, vocaux et leurs contrats QA **inchangés** ; harmoniser les notions entre ces ressources et la fiche maître sans modifier leurs règles propres.
- Production privée d'abord ; **GO explicite distinct** pour publication Drive étudiant / app, et autorisation distincte pour fusion GitHub / déploiement. TNR vert ≠ revue scientifique ≠ GO de publication.

## Contrat de livraison GitHub
Nouveau contrat **`packFormat: "written_v1"`**, `sheetFormat: "written_revision"` et `schematics: "none"`. Voir `tests/written-sheet-contract.mjs`. Les anciens `hybrid_v1`, `lean_v1` et doubles fiches restent lisibles et contrôlés par les garde-fous historiques. Ne jamais déclarer des infographies factices pour passer la CI. Les futurs moteurs de génération de PDF doivent implémenter ce standard, sans traiter les anciens modèles comme source de faits.
