# Issue #240 — lot correctif publié sous GO (26/10/2026)

## Portée
GO explicite « Ok On envoie tout » : remplacer exactement **quatre** vignettes du catalogue, et aucune ressource pédagogique.

| Cours | Illustration de vignette | Taille WebP 256×256 | SHA-256 |
| --- | --- | ---: | --- |
| `grands_brules` | Flamme (aucune lésion) | 2 892 octets | `b3d9721343ef3ca30a18f57346c82a8cb5966a08ca4758ff36a56b690233c545` |
| `diagnostic_bacteriologie` | Boîte de Petri, colonies et bacilles | 3 210 octets | `6db64643e9be59123bc8abd3babb507b899ba81c2b058b275ac8670b6e454b2e` |
| `pssm` | Symbole de soutien et d'écoute | 1 722 octets | `3b1f22f136d088f911189df79f1aea94248fc00becdf7656e174a0a87c7dfe4b` |
| `niveaux_organisation` | Cellule → tissu → organe → organisme | 2 100 octets | `6be49341a235ea09e0037348f45f74a497d81abf21bf3223b1e61c7aa169b484` |

Visuels carrés, sans texte intégré, contrôlés en revue à 256 px et 62 px. Illustrations stylisées pour l'interface : ne pas les considérer comme des schémas médicaux détaillés.

## Contrôles à exécuter avant fusion
- [x] Quatre blobs différents créés et empreintes Git vérifiées contre les fichiers sources
- [x] Correspondance aux identifiants stables du catalogue
- [x] 51 autres visuels conservés, aucune modification QCM/flashcards/vocaux/PDF
- [x] Manifeste SHA-256 mis à jour, version V8.30.139 et cache PWA renouvelé
- [ ] TNR, préflight publication, audit et test navigateur : vérifier résultats GitHub
- [ ] Vérifier après déploiement GitHub Pages la version et les 4 URL d'image

Autres anomalies graphiques : [issue #240](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/issues/240). Cette livraison **ne ferme pas** les autres problèmes du catalogue.
