# UE C1.1 S1 — Santé mondiale et santé en France — pré-intégration technique

**Statut : brouillon non publiable — revue pédagogique et GO publication requis.**

## Périmètre de la branche courante

- Référencement du cours `sante_mondiale_sante_france`, `domain:C`, `ue:C1.1` avec alias dans le registre.
- Aucune nouvelle fiche, infographie, banque QCM, flashcard ou URL Drive ne doit être activée dans les manifestes de l'application.
- Deux termes génériques **déjà existants** du glossaire (vaccination, dépistage) sont rattachés au nouveau `courseId`, sans ajouter ni modifier leurs définitions, pour assurer la cohérence des références applicatives.
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


## Contrôle de fidélité aux valeurs du cours — 21/10/2026

**Consigne du propriétaire : garder les valeurs du cours.** Les chiffres et ordres de grandeur de la séance restent ceux du support pédagogique, avec année/périmètre/unité conservés. Il ne faut pas les remplacer automatiquement par des statistiques plus récentes. Une explication mathématique ou une légende peut être corrigée sans changer les valeurs originales.

**Échantillons de contrôle de la fiche de 16 pages, fondée sur 101 captures et une transcription (source officielle intégrale non disponible) :**
- Population mondiale : **8,1 milliards en 2024** (planche 03 courante).
- Monde en 2023 : **≈ 132 millions de naissances** et **≈ 61,7 millions de décès** (fiche p. 5).
- France en 2023 : **639 533 naissances pour la métropole**, avec distinction explicite de la France entière (**677 803**) ; ne pas confondre les périmètres (fiche p. 5).
- Espérance de vie 2023 : **85,7 ans femmes** et **80,0 ans hommes** (fiche p. 6).
- Monde 2023 : **≈ 260 000 décès maternels** ; définition de **42 jours**, objectif ODD 3.1 **<70 pour 100 000 en 2030** (fiche p. 7).
- France 2023 : **≈ 433 136 nouveaux cancers**, estimation datée (fiche p. 14).

**Contrôle des exports Drive dans la version de préparation du 21/10 :**
- Neuf PNG sont pixel par pixel identiques aux neuf pages du PDF courant « 9 planches ».
- Le **PDF courant** affiche sur la planche 03 la distinction correcte entre accroissement en effectif et taux en %, et rappelle que le monde comme la France vieillissent à des rythmes distincts. L'ancienne archive « V3 » comporte une version différente et incorrecte de la planche 03 : ne pas la restaurer par erreur.
- La planche 06 individuelle courante présente le TPE VIH « idéal <4 h, max. 48 h » et mentionne le BCG / RTS,S–R21. Ces libellés ont été constatés visuellement ; l'exactitude médicale intégrale et la concordance avec le cours restent à relire.
- La banque privée vérifiée contient **56 QCM**, cinq propositions, une à trois bonnes réponses, explications et IDs distincts ; **56 flashcards** CSV concordent 1:1 avec le JSON des QCM.

**Livraison :** un ZIP privé de préparation a été constitué à partir des fichiers Drive existants, sans modifier les originaux. Cette validation de structure n'atteste ni un support officiel complet, ni un GO publication. Les ressources restent hors du diff actif de la PR et hors chargement applicatif jusqu'à validation explicite du package.
