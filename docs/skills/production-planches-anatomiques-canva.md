> **ARCHIVE / MÉTHODE DE SECOURS depuis le 20/10/2026.** La production anatomique IFSI ABC suit désormais en priorité **`docs/skills/production-planches-anatomiques-svg.md`** (image médicale originale sans texte + calque de flèches et légendes SVG éditables + exports contrôlés). Ne plus utiliser Canva pour les nouvelles planches par défaut. Les règles de revue médicale, de provenance/licence et de GO publication restent obligatoires.

---

# Skill IFSI ABC — produire des planches anatomiques par Canva et sources médicales (v1.0)

**Date** 19/10/2026. **Statut** Procédure de production reproductible pour revue privée, pas approbation pédagogique automatique.
**Références** Standard Work IFSI ABC v1.17 ; charte consolidée v1.31 ; exemple de qualité : `Cellules et tissus / Planche_05_Cellule_humaine_HD.png`.
**Finalité** Éviter les blocages répétitifs des générateurs d'images tout en produisant des planches anatomiques fiables et d'un rendu comparable à Cellules. Canva est un **outil de mise en page et de composition** ; sa génération n'est jamais une source de vérité anatomique.

## Entrées
1. Cours officiel et pages anatomiques citées, vérification des droits de reproduction des figures d'origine.
2. Tableau des planches attendues : identifiant Rxx, titre, vue, organes/repères obligatoires, erreurs sensibles à exclure, emplacement anatomique, statut clinique.
3. Fichier visuel de référence validé **Cellule humaine** : une grande illustration dominante, tissus/volumes détaillés, légendes lisibles reliées avec des pointages précis, fond aéré, français correct, usage mobile/HD.
4. Sources d'illustrations sous licences identifiées. Exemples à examiner : Servier Medical Art (CC BY 4.0) ou UNIGE (CC BY-SA 4.0), attribution et compatibilité à vérifier **pour chaque figure utilisée**.

## Recette Canva (l'exécution peut être confiée à une intégration Canva)
1. Définir **une seule planche / une page A4 portrait**, pas un poster multipanneau. Pour une série, préparer le plan complet mais générer et vérifier chaque page séparément : Canva avait initialement produit 4 pages seulement sur 6.
2. Demander une **grande figure médicale détaillée** (pas un assemblage de captures PDF agrandies), avec relief et orientation claire. Employer un vocabulaire anatomique clinique et un contexte d'enseignement neutre. La mise en page Canva ne prouve pas l'exactitude scientifique.
3. Fournir la liste exhaustive de repères **déjà rapprochée des pages du cours**, avec titres/UE/courseId/source, flèches non inventées, erreurs à exclure. Générer le texte français dans des blocs éditables pour permettre les corrections.
4. Consigner le nom et la licence des illustrations réellement retenues. Pour toute image générée sans preuve de provenance, **statut droit de redistribution à confirmer** : pas d'export dans le dépôt public.
5. Après production, vérifier avec `get_design` le **nombre réel de pages**, `get_design_content` les intitulés/repères, et une revue visuelle de chaque page à taille normale et en zoom. Ne pas confondre approbation du style et validation des flèches.
6. Corriger les fautes avec une transaction d'édition et montrer la version modifiée avant `commit`. Exemple de défauts déjà détectés : « Tome utérine » (→ « Trompe utérine »), « spermatozöides » (→ « spermatozoïdes »), « citoris » (→ « clitoris »), « 4 % » parasite, « Périmètre » en contexte de tunique séreuse (→ « Périmétrium »).
7. Comparer face à face au master Cellules ; source en définition native et rendu mobile lisible, pas de simple upscale. Traiter les étiquettes qui ne sont pas associées à une pointe claire comme non vérifiées.
8. Matrice Rxx : `visualReview`, `anatomicalReview`, `licenseReview`, `approval`, `publicationStatus`. Conserver la distinction `style_validated` ≠ `clinical_approved`.
9. Séparer master éditable Canva, exports PNG/HD et PDF, version muette éventuelle. Toute version muette ou mode Tester reste désactivé jusqu'au contrôle clinique des versions légendées. **Aucun nouveau QCM** créé automatiquement.
10. Revue privée → validation formelle du package et droits → GO publication explicite → dépôt dans les bons dossiers Drive et index application, CI/TNR, consultation mobile, synchronisation et contrôle du nombre réel de planches.

## Sécurité et diffusion
- Aucune URL de revue privée Canva, token de collaboration, transcription, document non licencié, capture du cours, ni planche non approuvée dans **GitHub public**.
- Le module de suivi dans l'application peut afficher un catalogue des maquettes **en revue** (0 planche validée) ; l'URL Canva reste en `localStorage` sur l'appareil du propriétaire, jamais en dur dans le JS/JSON public. Le lien n'est pas un mécanisme d'accès protégé, mais il évite sa diffusion publique dans le code.
- Ne pas ajouter les brouillons Canva au compteur d'atlas approuvés, au parcours QCM ou à l'entraînement. Les messages « à valider » ne sont jamais « validé ».
- Un GO de mise à jour de l'application ne remplace ni l'autorisation de redistribution des illustrations ni la relecture médicale.
- Si un générateur de figures échoue, **basculer directement sur des illustrations médicales préexistantes et sous licence compatible**. Ne pas répéter des tentatives de blocage technique.

## Application au système reproducteur (19/10/2026)
- R01 : premier pilote insuffisant, **à refaire**.
- R02–R07 : six **maquettes graphiques** dans un même projet Canva, textes de première passe corrigés, orientation et pointages médicaux non approuvés ; pas de master HD validé.
- Production canalisée en `docs/anatomy-p1-clinical-matrix.json`. Les pages sources du cours officiel servent à la revue des légendes.
- Le niveau graphique approuvé par le propriétaire ne vaut PAS certification anatomique des légendes ni licence de réutilisation des images Canva.
