# Audit fonctionnel des boutons — V8.28 build 8281

Date : 2026-10-05

## Périmètre

Audit des chemins d’action visibles de l’application : Accueil, navigation principale, Centre de révision, QCM, Cours, Vocaux, Calculs, Anatomie/Atlas et Paramètres.

L’audit combine :
- lecture des gestionnaires `onclick` / `addEventListener`;
- vérification des boutons dynamiques `data-*`;
- contrôle des transitions d’écran ;
- contrôle des dépendances entre modules ;
- assertions automatiques dans `tests/button-audit.mjs`.

## Résultat synthétique

| Écran | Action | Statut |
|---|---|---|
| Accueil | Continuer / Commencer ma révision | OK |
| Accueil | Mes cours | OK |
| Accueil | Anatomie & Physiologie | OK |
| Accueil | Centre de révision | OK |
| Accueil | Rechercher | CORRIGÉ |
| Accueil | Réglages | OK |
| Révision | 5 / 10 / 20 min | OK |
| Révision | Points faibles | OK |
| Révision | Examen blanc 20 / 30 / 50 | OK |
| Révision | Avant partiel + Lancer | OK |
| Révision | Objectif du jour | OK |
| Révision | Recherche avancée | OK |
| Révision | Retour Accueil | OK |
| QCM | Sélection de réponses | OK |
| QCM | Valider | OK |
| QCM | Suivante / Résultat | OK |
| QCM | Précédente en mode compatible | OK |
| QCM | Refaire mes erreurs | OK |
| QCM | Signaler | OK |
| Cours | Ouvrir un cours | OK |
| Cours | 10 QCM / Tous les QCM | OK |
| Cours | Fiche / Infographie | OK |
| Cours | Vocal | OK |
| Cours | Favoris | OK |
| Calculs | Continuer mon parcours | OK |
| Calculs | Étape suivante | OK |
| Calculs | 20 QCM mixtes | OK |
| Vocaux | Écouter | OK |
| Vocaux | Reprendre | OK |
| Vocaux | Écouté / Favori | OK |
| Anatomie | Voir / masquer les planches | OK |
| Anatomie | Ouvrir une planche | OK |
| Anatomie | Apprendre / S’entraîner / Tester | OK |
| Anatomie | Favori | OK |
| Anatomie | Agrandir / zoom + / - / reset / fermer | OK |
| Paramètres | Mode sombre | OK |
| Paramètres | Chronomètre | OK |
| Paramètres | Statistiques anonymes | OK |
| Paramètres | Export résultats | OK |
| Paramètres | Sauvegarde complète | OK |
| Paramètres | Vérifier la mise à jour | CORRIGÉ |
| Paramètres | Proposer une amélioration | CORRIGÉ |
| Paramètres | Recharger | OK |
| Barre basse | Accueil / Cours / Anatomie / Révision / Paramètres | OK |

## Anomalies trouvées et corrigées

### 1. Recherche depuis l’accueil

Le bouton **Rechercher** ouvrait le Centre de révision puis tentait de donner le focus à `v81S`. Depuis la simplification V8.28, la recherche avancée est repliée par défaut : le champ existait mais restait invisible.

Correction : ajout de `IFSI_V828.openSearch()`, ouverture explicite du bloc puis focus sur le champ.

### 2. Vérification des mises à jour dans Paramètres

`v87-settings.js` utilisait encore une version locale `8.27`. Avec une application en V8.28, le bouton pouvait annoncer à tort qu’une mise à jour V8.28 était disponible à chaque contrôle.

Correction : la version installée est désormais lue depuis `window.IFSI_APP_VERSION` avec fallback V8.28.

### 3. État de la barre de navigation dans les atlas

Le bouton **Anatomie** de la barre basse ne reconnaissait que `anatomy82` et `anatomy83`. Les atlas dédiés respiratoire, urinaire, endocrinien, immunitaire, nerveux, cardiovasculaire et digestif pouvaient donc laisser **Accueil** visuellement sélectionné.

Correction : tous les écrans Atlas actifs sont intégrés au calcul de l’onglet actif.

### 4. Bouton « Proposer une amélioration »

Le fallback de recherche du bouton de feedback pouvait, si le bouton historique `v72SuggestBtn` était absent, retrouver le bouton **Proposer une amélioration** lui-même et provoquer une récursion.

Correction : exclusion explicite de `v86Improve` et `v87Improve` du fallback.

### 5. Centre de révision qui restait devant le QCM

Corrigé dans la première passe V8.28 : tout appel à un écran autre que `v81Hub` masque maintenant le Centre de révision. Les séries Express, Points faibles, Examen blanc et Avant partiel ouvrent donc réellement le QCM.

## Contrôle automatique ajouté

Le fichier `tests/button-audit.mjs` vérifie à chaque push le câblage des actions principales, notamment :
- Révision ;
- Accueil ;
- Paramètres ;
- navigation ;
- Cours ;
- Vocaux ;
- Calculs ;
- Anatomie et les 7 atlas.

Le workflow `.github/workflows/tnr.yml` exécute cet audit automatiquement.

## Dette technique non bloquante

Deux anciens générateurs internes contiennent encore des boutons qui ne sont plus rendus par l’interface actuelle :
- l’ancien `card(def)` de `v82-nav-anatomy.js` ;
- les helpers `synthHtml()` / `vocalHtml()` de `v83-anatomy-interactive.js`.

Ils ne sont pas accessibles à l’utilisateur et ne provoquent pas de bouton mort dans l’interface actuelle. Ils pourront être supprimés lors d’un nettoyage structurel ultérieur.
