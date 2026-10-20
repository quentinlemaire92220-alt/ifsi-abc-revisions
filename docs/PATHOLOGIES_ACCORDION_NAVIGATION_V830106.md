# Pathologies — navigation par système, sans redirection (V8.30.106)

## Demande et comportement attendu

Dans l'application, **Pathologies est un module distinct de Mes cours**.

- L'onglet du bas **🩺 Pathologies** et le raccourci de l'accueil ouvrent le catalogue Pathologies.
- Le catalogue propose un **volet déroulant par système** : respiratoire (BPCO), cardiovasculaire (HTA) et endocrinien (diabète de type 2).
- Le nom d'une pathologie ouvre **sa propre page dans Pathologies**, avec retour au catalogue.
- **Aucune ouverture automatique d'un cours** au clic sur le système ou la pathologie.
- Le cours IFSI associé reste facultatif, dans une section secondaire de la page de la pathologie.
- Un champ de recherche filtre les systèmes et les pathologies.

## Protection pédagogique

Ces trois pages sont pour l'instant des espaces réservés : elles indiquent « Contenu en cours de validation médicale ». Elles **ne présentent pas** de définition, diagnostic, traitement ou correction provenant du lot P1 encore en revue.

Quand les catalogues validés seront publiés, les mêmes volets ouvriront la fiche illustrée (6 planches originales), les QCM, les flashcards et les cas cliniques. Le contrat existant de double validation des visuels et d'approbation de publication n'est pas contourné.

## Contrôles

`tests/pathologies-catalog-accordion.mjs` vérifie : les trois volets HTML `details/summary`, les entrées à sélectionner, la recherche, l'ouverture de la page BPCO sans redirection et le lien de cours uniquement facultatif.

`tests/pathologies-app-integration-v1.mjs` contrôle le rendu de la coque publique et la non-divulgation des contenus cliniques.

Cette PR comprend le passage à la version **V8.30.106 / build 8406**, afin de renouveler le cache PWA après validation CI et fusion.
