# UE C1.1 S1 — Santé mondiale et santé en France — pré-intégration technique

**Statut : brouillon non publiable — revue pédagogique et GO publication requis.**

## Périmètre de la branche courante

- Référencement du cours `sante_mondiale_sante_france`, `domain:C`, `ue:C1.1` avec alias dans le registre.
- Aucune nouvelle fiche, infographie, banque QCM, flashcard ou URL Drive ne doit être activée dans les manifestes de l'application.
- Pas de déclaration `validated:true`, de preuve PDF inventée ni de publication automatique.

## Livrables existants à vérifier en espace de travail Drive

- Fiche de révision (annoncée à 16 pages), à comparer au support du cours.
- Cours infographié PDF (9 planches) et 9 planches individuelles.
- QCM corrigés (56 questions, cinq propositions, 1 à 3 bonnes réponses).
- Flashcards (56 cartes).
- Les exemplaires et exports non validés restent **hors chargement par l'application** jusqu'à revue.

## Points bloquants de validation

1. **Revue scientifique** : la planche 06 avait des erreurs de prévention VIH et vaccination ; la planche 03 une confusion de calcul démographique. La version corrigée et tous les exports à publier doivent être contrôlés individuellement.
2. **Couverture** : comparer entièrement le chapitre sur les inégalités et l'accès / recours aux soins au support disponible ; ne pas déclarer l'exhaustivité sans preuve.
3. **Chiffres et visuels** : vérifier les cartes, pyramides, unités, sources et années ; contrôler le rendu mobile et les 9 planches.
4. **QCM et flashcards** : reprendre les 56 questions en conservant `choices[]`, `answers[]`, identifiants stables, explications, corrections et contrôle 1–3 bonnes réponses.
5. **Drive** : des fichiers préparatoires ont été observés avec permission `anyone:reader` (toute personne ayant le lien). Les droits doivent être restreints pendant la revue ; ne jamais communiquer ces liens comme preuve de confidentialité.
6. **Livraison** : le manifeste, les empreintes de fichiers retéléchargés, les TNR, la CI et les deux revues visuelles doivent être achevés avant publication. Un GO publication explicite du package sera exigé.

## Historique et incident du 21/10/2026

Une première version de cette PR contenait prématurément 9 images WebP, des enregistrements de fichiers Drive et `qextra-59.txt`, puis activait leur chargement PWA. Cela provoquait notamment un échec TNR `Snapshot V8.30.59 fiches invalide` et la PR était en conflit avec `main`.

La présente correction **quarantaine le contenu pédagogique** : elle rétablit les manifestes et le Service Worker depuis `main`, tout en gardant le référencement de cours. Les livrables sont préservés dans Drive ou dans l'historique technique antérieur, sans activation en production.

**Important : le retrait des fichiers du dernier commit n'efface pas les commits publics antérieurs de GitHub.** Pour retirer des données sensibles ou non autorisées de l'historique, il faut une opération séparée avec procédure de purge et vérification. Ne pas prétendre que les anciennes versions sont privées.

## Étapes suivantes

- Corriger et valider les supports en privé, restreindre les permissions Drive.
- Après validation, préparer une seconde PR de livraison avec manifestes et preuves réelles, garder la séparation des deux PDF et des catégories de ressources.
- Obtenir un GO publication explicite avant fusion / déploiement du lot.

Références : `docs/NEW_COURSE_PUBLIC_CONTRACT.md`, `docs/COURSE_DELIVERY.md`, `docs/PUBLICATION_APPROVAL.md`.
