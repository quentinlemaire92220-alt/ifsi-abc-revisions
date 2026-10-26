> **MISE À JOUR APRÈS FUSION — 26 octobre 2026**  
> Ce rapport décrit le **stade de préparation V7** ; ses mentions « non publié » ne sont plus actuelles. La PR [#237](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/237) a été fusionnée sur `main` (commit `d1cb57e40bf5b73556e47143b3ae43520a8e23b9`) avec 55 fichiers WebP, module activé et cache PWA ; les tests sur la PR, les TNR et le déploiement GitHub Pages [#40300859757](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/actions/runs/40300859757) ont réussi. **Une première revue des 55 fichiers WebP a mis en évidence des non-conformités visuelles et sémantiques ; voir [l'issue corrective #240](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/issues/240). La validation graphique finale reste ouverte.** Voir `docs/proposals/course-thumbnails-55-qa-20261026.md` pour le suivi à jour. Les détails ci-dessous sont conservés à titre d'historique.

---

# Revue graphique — 55 vignettes, itération 7 (26/10/2026)

## Portée
**Lot privé, non publié.** Les 55 illustrations médicales et cliniques sont disponibles dans un ZIP de contrôle attaché à la conversation, **pas** sous `assets/course-thumbnails/` du dépôt public. Ne pas annoncer l'intégration GitHub Pages.

## Constat établi sur les octets du lot
- 55 fichiers WebP 256×256 px, 55 identifiants exacts du registre, **55 SHA-256 distincts**.
- 18 sources de la planche approuvée maintenues.
- 12 nouvelles illustrations médicales indépendantes introduites pour orthopédie, os, soins, vaccination, histoire infirmière, recherche, écoute et bientraitance.
- Correction des limites des planches multi-colonnes ; remappage spécifique de « Physiopathologie des infections » (agents pathogènes) et « Santé mondiale » (globe).
- Contrôle automatisé de similarité des pixels sur les 55 fichiers : **0 paire** sous le seuil moyen RGB 0,075 (32×32 px), contre **25 paires** lors du lot précédent. Cela ne garantit pas une validation humaine ou une pertinence médicale parfaite.
- Sous contrôle humain restent notamment : grands brûlés vs infections cutanées (coupe de peau), infections respiratoires bactériennes/virales, et précision des illustrations anatomiques. Pas de contenu médical des fiches touché.

## Intégration technique préparée sans activation
- `tests/fixtures/course-thumbnails-v1.js` : prototype additif. Ciblage par les IDs du registre, pas par un titre approximatif ; repli vers l'ancienne vignette en cas d'image absente.
- `tests/course-thumbnails-ui-review.mjs` : tests d'identifiants, syntaxe, non-mutation et absence d'activation.
- La mise en racine du prototype faisait échouer le préflight d'une publication sans nouvelle version ; elle a été retirée, sans contournement du contrôle. Les contrôles verts sont restés applicables.

## Étapes avant la publication autorisée
1. Finaliser la revue médicale/graphique visuelle, 55 fichiers, un à un.
2. Ajouter les octets WebP dans `assets/course-thumbnails/` (aucun asset n'est encore committé), activer le module dans `index.html` et `sw.js`.
3. Incrémenter la version et le build conformément aux garde-fous, lancer le test ciblé `node tests/course-thumbnails-ui-review.mjs` après adaptation au mode publié, puis la CI, TNR, navigateur et vérification du site déployé.
4. Préserver 55 cours, leur ordre, badges, sources, fiches, QCM, flashcards, lexique et MP3.

**Statut : meilleure maquette de 55 images constituée ; aucun déploiement public avant contrôle des assets et intégration réelle.**
