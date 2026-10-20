# Pathologies P2 — verrou graphique/médical et préparation HTA / diabète

**Statut : architecture technique uniquement. Aucun contenu de pathologie nouveau ou modifié n'est publié.**

## Constat du contrôle BPCO — 20 octobre 2026

La V1 du pilote privé comporte une fiche de 5 pages et 2 types de schémas, alors que le modèle **de forme** validé comporte **10 compositions infographiques** distinctes. Le PDF initial ne constitue pas une fiche V2 conforme à la forme BPCO. Le contenu des dix infographies demande une relecture médicale et une vérification des annotations avant toute insertion dans la version étudiante.

Points de vigilance scientifique détectés dans les illustrations de revue (ne pas recopier dans une future fiche) :
- **SpO₂ 88–92 %** : objectif de saturation dans des contextes spécifiques d'oxygénothérapie contrôlée, notamment exacerbation de BPCO, à individualiser selon évaluation/gaz du sang et prescriptions ; **pas une cible universelle** chez tout patient BPCO en situation stable.
- **« Alerte en dessous de 88 % » ou « en dessous de 92 % malgré oxygène »** : ne pas transformer de tels chiffres en seuils d'alerte isolés et universels ; raisonner avec état clinique, cible prescrite et évolution.
- **« Vidange complète des poumons à l'expiration normale »** : trompeur, un volume résiduel demeure physiologiquement ; préférer « expiration sans piégeage excessif ».
- **« Hypoxémie dès les stades précoces »** : généralisation incorrecte ; la SpO₂ peut être conservée et une hypoxémie n'est pas nécessaire au diagnostic.
- **Bronchite chronique + emphysème** : composantes/mécanismes possibles, non deux sous-diagnostics présents chez tous les patients ; insister sur la variabilité et les atteintes des petites voies aériennes.
- **Spirométrie** : critères diagnostiques post-bronchodilatateur et interprétation clinique, ne pas produire de courbe débit–volume numérique illustrative comme mesure réelle.

Le texte d'origine de la fiche BPCO utilise une cible 88–92 % **contextualisée à l'exacerbation** ; ce sont surtout certaines **affiches générées indépendamment** qui comportent des formulations trop générales. Garder distinctes correction du texte et correction des infographies.

**Références publiques contrôlées** : 
- [GOLD 2026](https://goldcopd.org/2026-gold-report-and-pocket-guide/) ; [GOLD — Spirometry Quick Guide](https://goldcopd.org/spirometry-quick-guide/)
- [HAS — parcours BPCO](https://www.has-sante.fr/jcms/c_1242507/fr/guide-du-parcours-de-soins-bronchopneumopathie-chronique-obstructive-bpco)
- [NICE — prise en charge BPCO](https://www.nice.org.uk/guidance/ng115/chapter/Recommendations)
- [NICE — oxygène en exacerbation](https://www.nice.org.uk/guidance/qs10/chapter/Quality-statement-6-Emergency-oxygen-during-an-exacerbation)

## Contrat technique P2

`visuals` devient **obligatoire** pour tout lot Pathologies candidat à la publication. Chaque enregistrement contient :
- `id`, `sectionId` dans les dix sections de fiche et `kind: "original_infographic"` ;
- `alt` textuel descriptif, `url` HTTPS du fichier approuvé et `sha256` (64 hex) ;
- `sourceIds` renvoyant aux `sources[].id` effectivement présentes ;
- `graphicalReview: "approved"` **et** `medicalReview: "approved"` renseignés **après** relecture réelle.

`visualAudit` doit contenir :
- `diagramCount` identique au nombre de visuels effectivement attendus, selon inventaire privé ;
- `rawDiagramCount: 0` ;
- `allPdfPagesChecked: true` après rendu et inspection **de chaque page** ;
- `clinicalContentReviewed: true` après revue éditoriale et médicale réelle.

**Attention** : ces métadonnées formelles sont nécessaires mais **ne prouvent pas** que la personne compétente a effectivement validé le fond ; elles ne dispensent jamais des preuves privées, du contrôle effectif des octets et du **GO publication distinct**. Les visuels sont affichés dans la section concernée après activation, jamais sur une fiche séparée d'images brutes.

## Extension planifiée, non produite et non publiée

**HTA — système cardiovasculaire (`courseId: systeme_cardiovasculaire`)**.
Sources publiques de départ : [ESC 2024 — Elevated Blood Pressure and Hypertension](https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/elevated-blood-pressure-and-hypertension/), HAS locale à compléter au contrôle. Visuels potentiels : mesure correcte, facteurs de risque, complications d'organes, rôle infirmier et éducation. Les seuils et cibles doivent tenir compte des modalités de mesure, populations et recommandations.

**Diabète — système endocrinien (`courseId: systeme_endocrinien`)**.
Sources publiques de départ : [HAS 2025 — parcours diabète de type 2](https://www.has-sante.fr/jcms/p_3634754/fr/parcours-de-soins-du-patient-adulte-vivant-avec-), [ADA 2026 — diagnostic/classification](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes). Limiter initialement à **diabète de type 2**, ne pas amalgamer diabète de type 1, gestationnel et autres catégories. Visuels potentiels : insulinorésistance, sécrétion d'insuline, hyperglycémie, complications, surveillance infirmière et éducation.

**Étape requise avant tout catalogue réel** : fiches et visuels complets conformes au modèle BPCO, références tracées, QCM/cas/flashcards cohérents, revue médico-graphique, double contrôle de la matrice, GO publication du lot vérifié, TNR et autorisation de déploiement.

## Périmètre de cette branche

Tests et architecture seulement : pas de BPCO/HTA/diabète source privée, pas d'URL de maquette, pas de donnée clinique non approuvée. Ne pas brancher ce moteur sur `index.html` ni sur `sw.js` avant le GO publication.
