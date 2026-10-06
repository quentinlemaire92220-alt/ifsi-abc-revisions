## Objectif

Décrire le problème résolu et le résultat attendu.

## Vérifications

- [ ] Le changement est limité au lot annoncé.
- [ ] La CI **TNR IFSI ABC** est verte.
- [ ] Les données QCM conservent une seule source de vérité pour les bonnes réponses.
- [ ] Les changements Cours/Révision respectent la séparation produit actuelle.
- [ ] Les changements de ressources conservent des `courseId` valides et des Drive ID uniques.

### Si la modification est visible par l’utilisateur

- [ ] `build-meta.json` est mis à jour.
- [ ] La version affichée est alignée.
- [ ] Le cache PWA/cache-busting est renouvelé.
- [ ] Un changelog de release est ajouté.
- [ ] Les tests de cohérence release passent.

### Si la modification concerne l’audit ou les ressources

- [ ] La référence `resource-audit-v821.json` est mise à jour seulement si le changement est volontaire.
- [ ] Les contrats atlas restent cohérents.
- [ ] Le test `tests/resource-sync-v821.mjs` passe.

## Risques / notes

Indiquer ici les migrations, limites ou points à surveiller.
