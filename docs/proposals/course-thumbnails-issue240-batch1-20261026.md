# Issue #240 — lot correctif 1 : propositions de vignettes (26/10/2026)

## Portée et état
Deux nouveaux visuels **candidats** ont été produits en privé, contrôlés à 256 × 256 et 62 × 62 px, en format WebP, sans titre incrusté. Ils sont livrés dans le ZIP de revue fourni dans la conversation (hors dépôt public). **Ils n'ont pas été publiés sur GitHub Pages et ne doivent pas être annoncés comme validés.**

| Course ID | Fichier candidat | Taille | SHA-256 | Décision |
| --- | --- | ---: | --- | --- |
| `grands_brules` | `grands_brules.webp` | 9 102 octets | `12bc67ae6831126ae7f18db812d6b69e0941c5e0c0790c2f5b5622551ca92d21` | Revue clinique/graphique nécessaire |
| `diagnostic_bacteriologie` | `diagnostic_bacteriologie.webp` | 7 322 octets | `600ef0633a315d08d748cf37304d0d5dc2acb272360727323a93302e53726586` | Revue clinique/graphique nécessaire |

**Objet des remplacements** :
- `grands_brules` : section anatomique de la peau avec lésions thermiques profondes représentées de manière didactique et non réaliste.
- `diagnostic_bacteriologie` : gélose et agrandissement de bactéries en bâtonnets, pour éviter l'agent visuel à spicules du visuel actuellement publié.

## Contrôles effectués
- [x] Correspondance exacte aux IDs du catalogue existant.
- [x] Fichiers originaux conservés sur `main` tant que les candidats ne sont pas approuvés.
- [x] Format WebP, dimensions 256×256, empreintes SHA-256.
- [x] Aucun texte incrusté dans les crops retenus.
- [x] Aperçu 62 px fourni dans le comparatif privé.
- [ ] Relecture visuelle et précision scientifique par image.
- [ ] Import binaire validé dans `assets/course-thumbnails/` : **pas encore effectué**.
- [ ] Actualisation du manifeste `course-thumbnails-55-assets.json`.
- [ ] Versionnement/cache du Service Worker, tests TNR, navigateur et Pages.
- [ ] Contrôle mobile/clair/sombre du site après remplacement.

## Règles de livraison
Ne jamais remplacer les ressources QCM, flashcards, PDF, vocaux, lexique ou progression. Une PR publique de code devra contenir uniquement les images approuvées, leurs métadonnées et les ajustements de version/cache nécessaires, être soumise aux CI et rester non fusionnée jusqu'à validation visuelle.

## Sujets encore ouverts
PSSM (écoute et soutien non stigmatisant), niveaux d'organisation, infection neuro-méningée, infections respiratoires, infections urinaires, IST et incohérences graphiques recensées dans l'[issue #240](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/issues/240). **Aucun visuel supplémentaire déclaré validé.**
