# P1 anatomie — protections techniques et suivi des validations (19/10/2026)

## Portée de cette PR
Branche construite **après la publication V8.30.97**, sans réutiliser l'ancienne branche comme base.
Aucun remplacement de figure, aucun nouveau visuel publié, aucune modification du catalogue des 106 planches.

### Correctifs P1 préparés
1. La planche **resp_atlas_02** (voies aériennes supérieures) a un problème de cadrage et des pointeurs à revérifier. Le visuel est remplacé dans la navigation et dans la visionneuse par un avis de revue. Aucune URL source n'est instanciée sous forme d'image dans les deux vues, y compris la modale cachée. Le lien ressource source historique n'est pas supprimé du code tant que les validations n'ont pas tranché.
2. La planche **urinary001** (ancienne visionneuse de l'appareil urinaire) porte un pointeur de hile rénal jugé douteux. L'aperçu, la vue principale et le zoom sont neutralisés. L'élément source reste référencé dans le module pour faciliter une réparation ultérieure, sans le charger dans le DOM de la planche signalée.
3. Les atlas respiratoire, urinaire, endocrinien, immunitaire et locomoteur affichent une mention **« validation médicale non tracée »** ou **« à confirmer »**. Cette mention indique un problème de preuve documentaire, **pas une erreur médicale établie**. Le total des planches signalées par cette absence de trace dans l'audit antérieur est de 52 (8+8+8+8+20).

### Contrôles requis avant d'envisager une publication de ces protections
- TNR/CI complets avec la version courante de `main`.
- Vérifier sur mobile et ordinateur que les deux figures P1 ne sont pas visibles dans les zones exposées, que les autres atlas s'affichent normalement et que les boutons de zoom ne contournent pas les blocages.
- Contrôler que les favoris et le suivi ne créent pas une fausse validation de repères anatomiques.
- Décision de publication **distincte** pour ce correctif technique P1. Aucun GO implicite pour les assets non relus.

### Travaux NON compris dans cette PR
- Anatomie reproductrice R01 à refaire et R02–R07 uniquement validées graphiquement ; aucun export Canva soumis pour publication, et aucune source privée ajoutée dans GitHub.
- Correction graphique, sources/licences, approbation médicale des deux planches P1 : en attente des preuves officielles.
- Les images de stomathérapie et les 52 validations non tracées demandent des vérifications séparées.
- Ancienne PR #132 : conservée comme dossier de travail historique, **ne pas fusionner telle quelle** après V8.30.97.

### Traçabilité
- Vérification : `tests/anatomy-p1-guards-v8397.mjs`.
- Référence de production : `docs/skills/production-planches-anatomiques-canva.md`.
- Catalogue inchangé : `resource-audit-v821.json` / `atlasBoardContracts`, total attendu 106.
