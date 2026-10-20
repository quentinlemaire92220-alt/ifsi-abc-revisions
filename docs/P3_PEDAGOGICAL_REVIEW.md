# P3 — Audit continu des QCM et flashcards

**État : correctifs d'observabilité et de classification des alertes uniquement.** Le lot des **18 flashcards de vocabulaire complémentaires a déjà été publié en V8.30.103 via la PR #152** ; aucun contenu pédagogique n'est redéfini dans cette PR.

## Livrables techniques

- `tools/p3-pedagogical-review.mjs` analyse les QCM et flashcards réellement construits par le runtime local, sans accès aux données privées ou au Drive.
- Le workflow « Audit qualité P2 » produit les rapports JSON et Markdown P3 ; leur conservation dans les artefacts de CI est de 90 jours.
- Les statistiques de concentration de bonnes réponses servent de **signaux de relecture**, jamais de preuve qu'une option est incorrecte.
- Dans Paramètres, les anomalies structurelles restent des erreurs rouges ; les problèmes heuristiques de flashcards deviennent des avertissements orange.

## Ordre de relecture recommandé

1. Identifier les cours présentant une combinaison ou une position de bonne réponse surreprésentée.
2. Consulter le support officiel correspondant à chaque question et comparer énoncé, cinq propositions éventuelles, clé, explication et corrigé.
3. Corriger une clé ou une formulation **uniquement après validation pédagogique spécifique** ; conserver la traçabilité des IDs et les statistiques.
4. Vérifier les nouveaux signalements de flashcards sans réintroduire les 18 doublons de vocabulaire corrigés dans la PR #152.

## Limites

Le calcul s'effectue à partir du catalogue local courant, non à partir des supports de cours officiels. Les seuils sont heuristiques et peuvent signaler des biais statistiques normaux. Aucune modification de réponse, d'énoncé, de support, de QCM ou de flashcard n'est déclenchée automatiquement. Les diagnostics détaillés doivent être relus avant toute décision de correction.

## Confidentialité et publication

Cette PR ne contient ni nouveau texte pédagogique, ni document privé ni autorisation de publication. Les comptes et motifs agrégés sont des métadonnées techniques ; les changements de fond nécessitent une nouvelle validation spécifique.
