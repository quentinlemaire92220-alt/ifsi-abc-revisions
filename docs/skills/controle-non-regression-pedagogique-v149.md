# Skill IFSI ABC — Contrôle de non-régression pédagogique v1.49

**Pour ChatGPT et Work.** À lire **avant** toute nouvelle fiche ou régénération, avec `docs/PEDAGOGICAL_NON_REGRESSION_V149.md`, `docs/WRITTEN_REVISION_V153.md` et `docs/PDF_TEMPLATE_CONTRACT_V3.md`. Source normative : charte propriétaire v1.49 du 28/10/2026. Ne pas supposer ce fichier automatiquement chargé dans tous les chats.

## Déclencheurs

- Nouvelle source PLAUD, support officiel ou captures ajoutés à un cours déjà connu : **rapprochement uniquement**, pas de génération automatique.
- Demande explicite de création/régénération : exécuter les étapes ci-dessous avant de livrer un PDF candidat.
- Reprise d'une ancienne fiche, correction après retour étudiant ou mise à jour d'un cours déjà publié : contrôle avant/après obligatoire.

## Checklist bloquante

1. **Qualifier les sources.** Inventorier support officiel, captures pertinentes, transcriptions PLAUD par partie, éventuelles interruptions, objectifs et notes importantes de l'enseignant. Ne jamais attribuer à l'enseignant une réponse d'étudiant.
2. **Geler l'héritage.** Identifier les PDF antérieurs et leurs versions, préserver intégralement leurs fichiers, indexer les notions essentielles, les explications, exemples, tableaux, pièges QCM, lexique.
3. **Créer la matrice privée.** Pour chaque notion : ID, importance explicite/déduite, support + page, PLAUD + segment privé, ancienne fiche + page, cible + page, profondeur de traitement, statut et décision motivée.
4. **Tester la profondeur.** Une notion seulement citée n'est pas validée si le cours attend un raisonnement. Vérifier définition, mécanisme, indication/limite, situation de soins et rôle IDE **lorsque pertinents** ; ne pas inventer de contenu externe.
5. **Comparer les deux axes.** Vérifier (a) les notions issues des sources et (b) les notions/nuances historiquement présentes. Marquer chaque différence `conservée`, `enrichie`, `corrigée`, `fusionnée`, `manquante`.
6. **Bloquer si nécessaire.** Une perte, une simplification appauvrissante, un seuil erroné, une source essentielle non vérifiée ou une correction non justifiée bloque la validation. Sources tronquées : `BLOQUÉ — COUVERTURE NON DÉMONTRÉE` ; ne pas masquer `incomplete_tail`.
7. **Contrôler le PDF final.** Conserver la trame écrite V5.3, le modèle Communication et tous les contrôles V3 ; inspecter chaque page, puis la synthèse et le lexique sélectionnable. Une conformité graphique ne certifie pas le fond.
8. **Présenter la revue privée.** Livrer le PDF candidat, le résumé des différences, les réserves et les contrôles réellement effectués. Publication Drive étudiant/app et merge GitHub d'un contenu pédagogique : GO distinct, jamais inféré.

## Statut de sortie attendu

- `BLOQUÉ — RÉGRESSION PÉDAGOGIQUE` : omission ou perte de précision injustifiée.
- `BLOQUÉ — COUVERTURE NON DÉMONTRÉE` : source/segment manquant, non rapproché ou contradiction non résolue.
- `PRÊT POUR REVUE PRIVÉE` : couverture vérifiée, sans affirmation d'approbation scientifique ou graphique non obtenue.
- `VALIDÉ POUR LOT PRÉCIS` : seulement après validation authentique documentée du PDF final et des contrôles ; n'autorise pas automatiquement sa publication.

## Interdictions

Pas d'écrasement des versions, pas d'apport médical externe sans GO, pas d'exposition des sources/horodatages/rapports privés dans le dépôt public, pas de faux PASS automatique, pas de régénération déclenchée par un simple dépôt et pas de changement des règles QCM/flashcards/vocaux. L'ancienne fiche hybride peut servir d'héritage de fond ; elle **ne rétablit pas** son ancien modèle graphique lorsque la trame V5.3 s'applique.

> **Cas sentinelle :** « distraction antalgique » — une seule citation n'est pas une explication pédagogique. Contrôler la compréhension et l'application clinique si cette notion appartient aux priorités du cours.
