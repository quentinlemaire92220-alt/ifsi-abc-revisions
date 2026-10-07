# Contribution et workflow Git

## Branche principale

`main` représente la version déployable de l'application. Elle doit rester verte.

Flux attendu :

1. créer une branche courte depuis `main` ;
2. regrouper tous les changements d'un même lot sur cette branche ;
3. ouvrir une pull request vers `main` ;
4. attendre le succès du check **TNR IFSI ABC / tnr** ;
5. fusionner en **Squash and merge** ;
6. supprimer la branche de travail après fusion.

Les changements fonctionnels, de version, de cache PWA et de changelog appartenant à une même release doivent être livrés dans la même pull request afin d'éviter les états intermédiaires incohérents.

## Vérifications obligatoires

La CI contrôle notamment :

- la syntaxe JavaScript ;
- les données et le runtime QCM ;
- les invariants UX Cours/Révision ;
- la cohérence `build-meta.json` / version UI / cache-busting / service worker ;
- le câblage des boutons ;
- le rattachement des cours ;
- l'installation PWA ;
- la synchronisation des ressources.

## Protection recommandée de main

Dans **Settings → Rules → Rulesets** (ou Branch protection rules), protéger `main` avec :

- pull request obligatoire avant fusion ;
- check **TNR IFSI ABC / tnr** obligatoire ;
- branche à jour avant fusion ;
- suppression des branches après fusion ;
- blocage des force-push et suppressions de `main`.

Les administrateurs peuvent conserver un bypass uniquement pour les urgences.

## Réglages GitHub obligatoires

Le workflow versionné ne suffit pas à lui seul. Dans les paramètres GitHub du dépôt :

- GitHub Actions doit être autorisé ;
- `main` doit être couverte par un ruleset ou une branch protection ;
- la pull request doit être obligatoire avant fusion ;
- le check **TNR IFSI ABC / tnr** doit être requis ;
- les force-push et la suppression de `main` doivent être bloqués ;
- la suppression automatique des branches après fusion est recommandée.

Après fusion d'un lot, supprimer sa branche courte. Les branches d'audit, de correctif ou de fonctionnalité déjà fusionnées ne doivent pas rester indéfiniment dans le dépôt.
