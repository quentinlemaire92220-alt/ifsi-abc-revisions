# Intégration technique Pathologies — coque inactive (P1)

**Statut : infrastructure dans l'application, contenus BPCO / HTA / DT2 NON PUBLIÉS.**

## Décision

Après le « GO intégration / GO fusion » du 20 octobre 2026, le socle technique peut être fusionné sur `main` : il ne contient **aucune donnée clinique nouvelle, aucun JSON privé, aucun PDF de revue**, et n'active aucun accès étudiant aux pathologies non approuvées.

L'onglet n'apparaît **que si un catalogue non vide et conforme est fourni après validation médicale et GO publication explicite**. Ce changement de livraison pédagogique sera une PR future, distincte, avec empreintes réelles des fichiers examinés.

## Composants

- `pathologies-module-v1.js` : moteur existant, validation clinique déclarée, fiches, QCM, flashcards, cas ; aucun montage par défaut. Sa fonction `open()` refuse désormais toute ouverture avant l'activation d'un catalogue.
- `pathologies-boot-v1.js` : vérifie au chargement `window.IFSI_PATHOLOGIES_PUBLISHED_BUNDLE`. Ce nom de variable est réservé au **futur** lot approuvé ; sa valeur n'est définie ni par `index.html`, ni par le service worker, ni par un script de contenu embarqué.
- `index.html` : charge les deux scripts **après** les autres fonctionnalités, sans modifier le HTML de navigation par défaut.
- `sw.js` : peut mettre en cache les deux scripts inactifs pour fonctionnement hors ligne. Aucun paquet de pathologies n'est préchargé.
- `tests/pathologies-app-integration-v1.mjs` : teste l'absence de catalogue, le rejet d'un brouillon, la non-création de l'onglet et le chargement dans l'ordre. Les TNR existants ont été adaptés en conséquence.

## Pour la première publication (étape distincte)

1. Terminer la revue scientifique et éditoriale des **trois** pathologies et des exercices, y compris les distracteurs trop simples, valeurs et textes incrustés dans les images.
2. Relever les empreintes SHA-256 des **véritables octets** des fiches/infographies corrigées et rapprocher les références par item. Ne jamais écrire `medicalReview: approved` sans preuve de revue médicale réelle.
3. Construire les champs structurés `sections` et `visuals` du catalogue P1 conforme au moteur. Recouper `courseIds` avec le registre existant ; vérifier les fichiers et leurs sources.
4. Présenter le pack final à la revue privée, recueillir validation médicale et **GO publication explicite** pour la version vérifiée.
5. Alors seulement : créer le lot publié, définir `window.IFSI_PATHOLOGIES_PUBLISHED_BUNDLE` via une ressource autorisée, synchroniser le service worker, vérifier les contrôles et publier. **Ne pas placer les sources privées dans GitHub.**

**Précision de sécurité :** la validation JavaScript côté navigateur est une défense contre les erreurs, **pas** une preuve indépendante d'approbation. L'interdiction de divulguer des contenus non approuvés repose sur le fait de **ne pas les inclure dans le déploiement** et sur les contrôles de publication / CI.

## Impact étudiant de cette PR

| Composant | Après fusion |
|---|---|
| Scripts moteur et bootstrap | Chargés et disponibles hors ligne |
| Onglet Pathologies | **Invisible** tant qu'aucun lot publié |
| BPCO, HTA, DT2 en public | **Absents** |
| Fiches/QCM/flashcards/cas actuels | Inchangés |
| Tests | Vérifient les cas absents, invalides et la confidentialité de publication |

La validation du style graphique des panneaux reste acquise ; **elle ne vaut pas validation médicale**.
