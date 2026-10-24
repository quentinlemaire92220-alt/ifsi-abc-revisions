# DIRECTIVE PRIORITAIRE 24/10/2026 — STANDARD ÉCRIT V5.3

**Pour TOUS les nouveaux cours IFSI ABC, la fiche maîtresse est désormais la fiche de révision ÉCRITE V5.3, sans images, schémas ni infographies générés.** Lire `docs/WRITTEN_REVISION_V153.md` et `docs/skills/production-fiches-revision-ecrites-v153.md`. Cette règle prime sur les passages historiques ci-dessous exigeant des schémas ou le modèle Pharmacologie P01 de v1.47.

Une fiche PDF écrite par cours/partie, multipage, sans quota ; bandeaux violets **en haut et en bas de chaque page**, code couleur pédagogique, notes de l'intervenant intégrées sans horodatages, matrice privée support officiel + oral, double lecture, raisonnements et tableaux pertinents ; une seule rubrique « Pièges QCM », suivie de la **synthèse générale** puis de « Définitions et mots-clés » en toute dernière section. Aucune source externe sans accord préalable. QCM, flashcards et vocaux : **règles inchangées**. Préserver toutes les ressources et les validateurs historiques. Nouveau contrat technique `written_v1` / `written_revision`; ne pas forcer d'images factices dans `hybrid_v1`. QA complet et GO séparé avant toute publication ou fusion.

Les anciennes directives qui suivent sont conservées comme **historique**, pas comme instructions nouvelles.

---

## PRIORITÉ COURANTE v1.47 — MÉDIATHÈQUE AVANT GÉNÉRATION (23/10/2026)

Pour les **nouveaux cours**, appliquer d'abord la charte privée v1.47 et `docs/HYBRID_REVISION_V146.md` : **UN SEUL PDF de fiche hybride infographiée** par cours/partie. Les consignes plus anciennes ci-dessous imposant deux PDF distincts sont **historiques**, non applicables par défaut ; conserver les anciens cours, contrats et versions. QCM, flashcards et vocaux inchangés.

**Règle de production visuelle obligatoire :** **CHERCHER** dans la médiathèque médicale privée par notion, organe, mécanisme et cours → **RÉUTILISER** un visuel validé, pertinent et autorisé → **ADAPTER** si besoin en conservant l'original et en revalidant la variante → **CRÉER** seulement si aucun visuel exploitable ne convient → **INDEXER** la création ou variante (ID, notion, cours liés, source, version, droits, statut) dans le catalogue privé.

Un statut technique `active`, une extraction ou une validation du style ne prouvent ni l'exactitude scientifique ni les droits de réutilisation. Vérifier les légendes, flèches, proportions, source médicale et contexte avant intégration ; placer toute image non approuvée en attente de contrôle. **Aucun lien, ID Drive privé ou source confidentielle dans GitHub public.** Revue privée d'abord ; aucun merge ni publication étudiant/application sans GO distinct.

---

## RECTIFICATIF PRIORITAIRE — PILOTE ≠ LIVRABLE FINAL (20/10/2026)

Le pilote « une page de chaque » sert exclusivement à valider la maquette graphique. Pour un VRAI cours, livrer **DEUX COURS COMPLETS** couvrant toutes les notions du support officiel : (1) fiche de révision textuelle complète avec schémas infographiés intégrés au besoin ; (2) **cours intégralement infographié MULTIPAGE**, sans plafond de pages et avec toutes les notions expliquées. Compléter par QCM A–E (1–3 bonnes réponses), flashcards et planches anatomiques si nécessaires. Modèles graphiques cardio/respiratoire. Aucun contenu ne doit être sacrifié pour tenir sur une page.

Le contrat `lean_v1` garde son nom technique pour compatibilité, mais exige désormais `sheetFormat:"complete_infographic"`, `dualSheetCoverage.expectedNotions===classicCovered===infographicCovered`, et audit de toutes les pages. `summaryPanels`, `summaryCoverage`, `infographic_summary` et « synthèse A4 une page » sont des consignes ERRONÉES pour les vraies livraisons et doivent être considérées comme obsolètes. La seule-page s'applique aux PILOTES de revue uniquement. Ne jamais valider des TNR qui testent une réduction de couverture.

ChatGPT classique par défaut, Work seulement si nécessaire. GO audit → GO production privée → revue pédagogique → GO publication distincte ; aucun merge ni déploiement implicite.


**CONTRÔLE GRAPHIQUE OBLIGATOIRE :** consulter `docs/skills/standard-visuel-fiche-revision-vs-infographie.md`. Pour chaque nouveau pack, produire deux évaluations MANUELLES indépendantes : `REVISION_TEXT_FIRST` (paragraphes et tableaux majoritaires, illustrations ponctuelles et justifiées) et `INFOGRAPHIC_VISUAL_FIRST` (grand schéma anatomique, flèches exactes, zooms et légendes, pas une grille de textes). Aucune validation par simple présence d'image, nombre de pages ou succès TNR ; maquettes non conformes bloquées, sans publication.

# Skill IFSI ABC — Fiches de révision avec infographies originales (v1.0)


## Précision prioritaire — pilote validé Système cardio / respiratoire (20/10/2026)

Pour les prochains cours, **une fiche de révision complète avec schémas infographiés seulement lorsqu'ils apportent une explication utile** est le livrable maître. Modèle de présentation : **Système cardiovasculaire ou Système respiratoire** (pilotes validés). Toutes les définitions, mécanismes, nuances, valeurs et explications de la source officielle restent dans le **texte**, même lorsqu'un visuel résume la notion. Les illustrations complètent le cours et sont créées de manière originale ; une illustration décorative ou sans justification pédagogique ne doit pas être ajoutée pour respecter un quota.

En complément, produire **un second cours complet infographié multipage** autonome, riche en illustrations anatomiques et couvrant toutes les notions, selon la planche validée « Circulation sanguine et trajet du sang ». Son nombre de pages s'adapte librement au cours. Une page pilote n'est qu'un exemple de style. La fiche classique suit au contraire le PDF de révision cardiovasculaire validé (17 pages) : paragraphes et tableaux majoritaires, figures intégrées au besoin. Ces demandes ne suppriment pas les tests de lisibilité et d'exactitude clinique.

Le pilote est une validation **de forme** uniquement. Toute nouvelle matière nécessite une revue source et un contrôle scientifique propres. Les planches anatomiques sont conditionnelles et ne doivent pas être dupliquées.

**Statut : CONTRAT DE PRODUCTION BLOQUANT.** Applicable dès le « Go » à toutes les créations/refontes de fiches de révision, y compris lorsqu'un support officiel arrive après une version provisoire.

**Périmètre : fiche de révision PDF et ses visuels intégrés.** Ce skill ne remplace pas le skill de **planches anatomiques autonomes** (`docs/skills/production-planches-anatomiques-svg.md`; ancien workflow Canva archivé), ni les règles propres aux schémas des QCM. En cas de formulation ancienne contradictoire dans la charte concernant **les images intégrées aux fiches**, le présent contrat et la référence visuelle explicitement validée par l'utilisateur prévalent. Les éventuels schémas de QCM sont traités selon leur propre contrat et les droits de reproduction applicables.

## 1. Règle absolue : transformer, jamais coller

> **Support officiel = référence scientifique et pédagogique ; fiche de révision = texte synthétisé + infographies originales créées pour expliquer le cours.**

- **INTERDIT** dans la fiche : captures de diapositives ou de PDF, photographies cliniques, radiographies, dessins, diagrammes ou schémas provenant directement du cours officiel, même redimensionnés, recadrés, nettoyés, recolorés ou renommés « infographie ».
- **OBLIGATOIRE** : identifier le message scientifique du visuel source (structures, relations, geste, mécanisme, signes, chronologie), puis **concevoir une nouvelle illustration didactique** à partir de ces notions, sans reproduire graphiquement le support. Refaire chaque flèche, repère, perspective et libellé en vérifiant sa justesse.
- On ne convertit **pas** une photo en infographie en lui ajoutant un titre, un filtre, un cadre ou des légendes ; on **représente autrement** la notion enseignée.
- La création originale ne doit pas inventer des structures, techniques, dispositifs, diagnostics, chiffres ni indications absents des sources. Si une source ne permet pas de dessiner une relation sans supposer, préférer une explication vérifiable, ou signaler une question de validation.
- Les visuels pédagogiques créés ne sont jamais présentés comme des « schémas officiels du professeur ». Vérifier les conditions de licence et de publication des ressources tierces éventuellement utilisées.

## 2. Référence graphique obligatoire

**Modèle de fiche principal désormais : `UE_S1_B1_Systeme_Cardiovasculaire_Partie01_Fiche_Revision_Coeur_Vaisseaux_et_Sang.pdf` (17 pages)**, explicitement revalidé par l'utilisateur le 20/10/2026. Structure textuelle, encadrés de priorités, paragraphes, tableaux violets, rares illustrations utiles, sans obligation de figure par section. Le modèle Système nerveux reste une source secondaire d'inspiration compatible ; **le modèle d'infographie DISTINCT** est `UE_S1_B1_Systeme_Cardiovasculaire_Partie01_Infographie_01_Circulation_sanguine_et_trajet_du_sang (1).pdf`.

- Bandeau violet de l'UE, titres lisibles avec accent turquoise, mise en page aérée mais dense, typographie française propre, tableaux et mémos seulement s'ils facilitent la compréhension.
- **L'illustration pédagogique est insérée dans la section de la fiche qui explique le concept**, en complément du texte : pas de pack d'images collé en fin de document, pas de page de garde détournée, pas de collage de miniatures multipanneaux.
- Une vraie infographie comporte une illustration dominante, des relations visuelles, des flèches/repères utiles et peu de texte **vérifié**. Une grille de rectangles textuels avec pictogrammes décoratifs **ne constitue pas** une infographie.
- Adapter le nombre d'infographies aux notions **réellement illustrables** ; ne pas en imposer artificiellement à chaque page. Éviter les doubles qui réexpliquent exactement le même concept ou remplacent simplement un tableau.
- Les schémas d'organes doivent rester anatomiquement lisibles et être **redessinés de manière autonome**, sans tracer ni couper une image provenant du support officiel.

## 3. Workflow automatique sans aller-retour de consignes

1. **Lire les sources dans cet ordre** : support officiel de l'intervenant, puis compléments oraux / transcript lorsque disponibles, puis notes. Respecter l'ordre du cours et distinguer les apports non attestés par le support écrit ; ne jamais publier de transcript brut.
2. **Inventorier uniquement les visuels pédagogiquement utiles** : ne pas associer automatiquement une infographie à chaque notion/diapositive. Établir brièvement : section de fiche, source scientifique (diapo/page), objectif d'apprentissage, repères requis, pièges médicaux à éviter.
3. **Produire les infographies originales** : une composition cohérente par sujet. Si le générateur produit une planche multipanneaux, des textes médicaux erronés ou des éléments trop petits, **ne pas l'insérer en l'état**. Privilégier la génération d'illustrations sans texte puis l'ajout de libellés éditables, contrôlés séparément. Recomposer plutôt que rogner un dessin.
4. **Rédiger et assembler la fiche** au style cardiovasculaire textuel validé (17 pages) : paragraphes complets, tableaux, illustrations seulement où elles clarifient le mécanisme, mémos, éventuels pièges QCM justifiés, et obligatoirement **« Définitions des mots-clés »** en fin de fiche.
5. **Contrôle bloquant avant livraison** : rendre le PDF final **page par page en images**, inspecter toutes les pages à 100 % et en format mobile ; vérifier les visuels face aux notions du cours, leurs flèches/légendes, le contraste, le texte lisible et sélectionnable, l'absence de coupure, de duplication et de captures/photos/schémas du support source. Toute erreur entraîne correction puis nouvel export/contrôle.
6. **Revue de conformité et traçabilité** : noter le nombre **réel** d'infographies distinctes, leur place dans la fiche, leur provenance **scientifique** (cours officiel) et leur statut « illustration originale à visée pédagogique ». Les écarts et ajouts provenant seulement de l'oral restent identifiés comme tels.
7. **Livraison privée puis publication séparée** : déposer la maquette et les preuves de contrôle en espace de relecture ; ne pas écraser l'ancienne version. Seul un **GO publication** distinct après validation déclenche l'archivage, les métadonnées courseId/Drive, les TNR GitHub, la PR/fusion et la mise à disposition aux étudiants.

## 4. Test d'acceptation / refus automatique

| Critère de la fiche | Acceptation | Refus bloquant |
| --- | --- | --- |
| Origine du visuel | Nouvelle illustration pédagogique conçue à partir de notions du cours | Capture, photo, radio, schéma extrait, image source modifiée ou simplement détourée |
| Fonction pédagogique | Dessin dominant expliquant une structure, relation, geste ou mécanisme | Cartes textuelles décorées, collection de captures, vignettes minuscules |
| Fidélité | Anatomie, flèches, légendes et données contrôlées selon le support officiel | Erreur scientifique, équipement inventé, texte généré non vérifié |
| Mise en page | Texte majoritaire ; schéma seulement lorsqu'utile ; modèle de fiche cardiovasculaire validé | Hors-sujet, collage final séparé ou reproduction graphique de diapositives |
| Contrôle final | Toutes les pages PDF vues, lisibles, sans doublon ni débordement | Aperçu seulement, contrôle de quelques pages ou défaut restant |

## 5. Application obligatoire aux fiches « Pathologies » (modèle BPCO validé le 20/10/2026)

**Contrat spécialisé prioritaire : `docs/skills/production-pathologies-infographies-cliniques.md`.** Pour la fiche Pathologies uniquement, **tout schéma est remplacé par une infographie pédagogique originale**, conforme à la forme du pilote BPCO : illustration explicative dominante, texte et légendes français revus, flèches utiles, composition lisible et encadré de mémorisation. Les schémas bruts, figures isolées et captures sont interdits.

**La forme validée n'est pas une validation scientifique.** Chaque infographie est liée à son thème et à sa source officielle ou complémentaire vérifiée. Les seuils, prises en charge, gestes et traitements doivent être vérifiés médicalement pour la maladie et le contexte, et non copiés du pilote. Le nombre de visuels dépend exclusivement du contenu nécessaire ; les QCM et planches anatomiques suivent leurs propres contrats.

Avant revue du lot, contrôler **toutes les pages** du PDF final et tracer l'inventaire schéma→infographie ; une seule figure non conforme bloque la livraison. La publication pédagogique reste soumise à un GO publication distinct.

### Extension au Lot P1 Pathologies validé pour la FORME (20/10/2026)

Le témoin BPCO six panneaux et les déclinaisons HTA/diabète de type 2 sont validés comme **format visuel**. Pour cette catégorie, la conformité implique également la **fidélité à la densité graphique et à la richesse des illustrations anatomiques**, non seulement « présence d'une infographie ». Ne jamais remplacer une composition médicale illustrative par des cercles, silhouettes simplifiées ou panneaux quasi vides. Corriger la science dans l'infographie initiale autant que possible, vérifier le rendu avant/après, sans dégrader la qualité approuvée. **La validation graphique ne vaut ni validation clinique, ni publication.** Appliquer le skill spécialisé Pathologies.

**Règle pratique finale :** un « Go » suffit ; **ne pas redemander ces instructions**. Si une condition d'acceptation échoue, corriger avant toute proposition de validation. Aucun compteur, score de QCM, flashcard ou élément publié ne doit être modifié par la seule refonte visuelle.
