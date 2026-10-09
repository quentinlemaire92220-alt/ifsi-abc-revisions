# Audit pédagogique — QCM de mathématiques (09/10/2026)

> **Lecture seule.** Cet audit analyse la banque active telle que reconstruite par l'application (questions-*.json, qextra-*.txt, overrides et filtre des questions non autonomes liées à des schémas). Aucune réponse QCM n'a été modifiée ou fusionnée par cette PR.

## Synthèse vérifiée

- **226 QCM mathématiques actifs**.
- Difficultés explicites : **72 faciles**, **110 moyens**, **44 difficiles** (aucun niveau de difficulté manquant).
- Réponses par QCM : **194 à une bonne réponse**, **21 à deux bonnes réponses**, **11 à trois bonnes réponses**. Aucun QCM de cette banque à quatre bonnes réponses.
- **0 doublon textuel exact** ; **65 paires de questions très similaires** selon un rapprochement lexical, souvent des variantes numériques pédagogiquement distinctes. Ne pas supprimer automatiquement.
- **96 explications de moins de 80 caractères** ; le seuil de 80 caractères est **un signal de revue, pas une preuve d'erreur**. Toutes les explications font au moins 45 caractères selon le test existant.

### Correspondance estimée avec les huit fiches (affectation automatique, non définitive)

| Fiche | Thème | QCM rattachés |
|---|---|---:|
| 01 | Méthodes mathématiques | 29 |
| 02 | Conversions | 35 |
| 03 | Proportionnalité | 28 |
| 04 | Concentrations | 44 |
| 05 | Dilutions et reconstitutions | 18 |
| 06 | Calculs de doses | 28 |
| 07 | Débits de perfusion | 32 |
| 08 | Pousse-seringue électrique | 12 |
| | **Total** | **226** |

### Parcours à 10 niveaux — 2 niveaux vides

| Niveau | Questions |
|---|---:|
| 1 Conversions | 37 |
| 2 Durées et horaires | 28 |
| 3 Pourcentages, pour mille, concentrations | 35 |
| 4 Comprimés, ampoules et doses | 38 |
| 5 Solutions buvables et gouttes | 23 |
| 6 Perfusions et débits | 44 |
| 7 Électrolytes et volumes ajoutés | 15 |
| **8 Reconstitution et horaires de prises** | **0** |
| 9 Dilutions | 6 |
| **10 Problèmes complets type IFSI** | **0** |

Les deux niveaux vides résultent au moins en partie du mécanisme automatique de classification `levelOf` : il classe « dilution » avant « reconstitution » et cherche les termes « dose », « perfusion », etc. avant les cas complexes. Revoir l'ordre des règles ou ajouter un champ `level` explicite sur les questions pertinentes, en préservant le nombre de questions.

## Priorité P0 — 3 erreurs numériques certaines dans les réponses officielles

1. **`cdm2_110` :** « 125 µg en mg ». La banque indique **0,12 mg** comme bonne réponse ; la conversion exacte est **0,125 mg**. La valeur exacte n'apparaît dans aucun des cinq choix. Corriger l'option correspondante **et l'explication**, sans arrondi implicite.
2. **`cdm2_112` :** « 75 mL en litres ». La banque indique **0,07 L** ; le résultat exact est **0,075 L**. Corriger l'option correspondante **et l'explication**.
3. **`cdm2_224` :** « 0,5 g/L pour 250 mL ». La banque indique **0,12 g** ; le résultat exact est **0,125 g** (0,5 × 0,25). Corriger l'option correspondante **et l'explication**.

Ces trois constats sont mathématiques, pas des artefacts d'arrondi : la question demande une conversion ou une masse et **ne prescrit aucun arrondi**. Une revue automatique simple de 288 expressions arithmétiques explicites a retrouvé ces trois erreurs et des écarts d'arrondi habituels annoncés par « environ » ; elle ne garantit pas l'absence d'autres erreurs dans les textes non interprétés automatiquement.

## Priorité P1 — questions dont le contexte dépend d'un autre QCM

- `cdm_062` : « cette même poche… » ; reformuler en redonnant directement le type et le volume utiles.
- `cdm_063` : « les 5 mL de KCl et les 5 mL de NaCl précédents » ; supprimer « précédents » et présenter toutes les données dans l'énoncé.
- `cdm_072` : « le flacon précédent » ; préciser que le flacon contient une solution à 4 % et un facteur de 40 gouttes/mL.
- **`cdm_073` : « avec ce même flacon »** ; énoncé insuffisant quand tiré aléatoirement. Répéter la contenance (30 mL), le nombre total de gouttes (1 200) et la concentration (4 %) ou la masse par goutte (1 mg/goutte) pour que le calcul soit déterminé.

Dans ces QCM, **préserver la bonne réponse mathématique**, mais rendre chaque question autonome.

## Priorité P2 — qualité pédagogique

- **2 niveaux vides (8 et 10)** malgré 226 questions : ne pas proposer de lancer une série vide. Retrouver/attribuer des QCM existants au bon niveau avant de créer inutilement de nouveaux exercices.
- **Électrolytes (KCl / NaCl) et prescription en g/L** : certains QCM sont rangés avec dilutions mais le sujet n'est pas explicité dans les 8 infographies. Ajouter un encadré court et rigoureux à la fiche 05, plutôt qu'une 9e fiche, après validation du support du cours et des protocoles.
- **96 explications courtes (<80 caractères)** : vérifier notamment les questions moyen/difficile ; pour les calculs simples, une formule et une conversion correctes peuvent suffire.
- **65 paires lexicalement proches** : les distinguer des doublons réels (données numériques différentes et travail de calcul utile). **Aucun doublon strict** détecté.

## Conditions de sortie avant mise à jour de production

- Corriger les 3 erreurs avérées, puis exécuter les tests QCM existants et un test math ciblé qui vérifie les **réponses, choix et explications**.
- Conserver une seule vérité pour le score et le corrigé `q.answers` ; ne modifier ni progression, ni réponses d'autres cours.
- Valider que les niveaux 8 et 10 ne sont plus vides ou, à défaut, masquer explicitement les actions qui ne disposent pas de QCM.
- Maintenir toutes les huit fiches de révision, la fiche maître et les QCM non concernés.

**Statut : AUDIT RÉALISÉ — CORRECTIONS DE PRODUCTION NON ENCORE APPLIQUÉES.**
