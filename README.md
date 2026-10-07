# IFSI ABC Révisions

Application web/PWA de révision IFSI : QCM, fiches, infographies, vocaux et atlas anatomiques.

## Source de vérité de la release

La version courante est définie dans `build-meta.json`.

Une release utilisateur doit rester cohérente entre :

- `build-meta.json` ;
- `app-version-v742.js` ;
- le cache-busting de `index.html` ;
- le cache du Service Worker `sw.js` ;
- le changelog de la release ;
- les tests de non-régression.

La CI vérifie automatiquement ces invariants.

## Développement

L’application est statique et ne nécessite pas de build front-end. Les fichiers HTML, JavaScript, JSON et médias sont servis directement.

Les données utilisateur (scores, favoris, préférences) restent dans le stockage local du navigateur.

## Tests

Le workflow GitHub Actions **TNR IFSI ABC** exécute notamment :

- vérification de syntaxe de tous les fichiers JavaScript racine et tests `.mjs` ;
- non-régression QCM/runtime ;
- cohérence UX Cours/Révision ;
- cohérence release/PWA ;
- audit des boutons ;
- audit des rattachements de cours ;
- audit catalogue ↔ référence Drive ;
- vérification de l’installation PWA.

Le fichier `tests/ux-regression.mjs` est volontairement basé sur `build-meta.json` pour éviter de figer les tests sur une ancienne version.

## Audit catalogue

L’écran Paramètres contient un **audit structurel local**. Il compare le catalogue chargé à une référence validée dans `resource-audit-v821.json`.

Ce contrôle :

- vérifie les `courseId` ;
- détecte les Drive ID dupliqués ;
- vérifie la séparation Infographies / Anatomie ;
- contrôle les huit atlas et leurs nombres de planches ;
- analyse certains biais statistiques possibles dans les réponses QCM.

Il **ne scanne pas Google Drive en temps réel**. Un écart avec la référence doit être interprété comme une régression locale potentielle ou un contrat de référence à mettre à jour.

## Workflow Git

Voir `CONTRIBUTING.md`.

Flux recommandé :

`branche courte → Pull Request → TNR verte → Squash and merge → suppression de la branche`.

Ne pas pousser directement une release incomplète sur `main`.

## Hygiène du dépôt

Les archives legacy et les règles de nettoyage sont documentées dans `REPO_HYGIENE.md`. Le workflow TNR exécute aussi `tests/repo-hygiene.mjs` pour empêcher le retour de fichiers obsolètes à la racine et détecter les secrets évidents.

Pour que ces contrôles soient réellement bloquants, **GitHub Actions doit être activé dans les paramètres du dépôt et `main` doit être protégée par un ruleset ou une branch protection**.

## Sécurité du dépôt

Ne jamais commiter de mot de passe, jeton, clé API, fichier `.env` ou autre secret.

Le dépôt étant public, toute donnée ajoutée au Git doit être considérée comme publiquement accessible.
