# Éligibilité d'une séance à la révision — IFSI ABC

## Principe
Un événement au planning **ne constitue pas** à lui seul un nouveau cours. Le suivi des cours et la décision de créer une fiche ne doivent prendre en compte que les séances ayant un contenu pédagogique identifiable : notions, compétences, gestes, raisonnement clinique ou exercices réellement enseignés et vérifiables.

## Séances à exclure du suivi des révisions
- Connexion, activation, prise en main de plateforme (MySchool / Mischool, MyK) et tests techniques.
- Temps d'appropriation des connaissances, travail personnel ou créneaux de révision en autonomie, **même libellés TD**.
- Réunions, élections, formalités, présentations purement administratives.
- **Toutes les séances asynchrones**, même lorsqu'un support ou un cours est associé : MySchool, E-campus, ateliers en autonomie, films, quiz et exercices.
- **Toutes les simulations**, qu'elles soient CM, TD, TP ou rattachées à une UE Simulation, y compris les ateliers de soins simulés.
- Séances annulées.

Ces éléments **restent dans le calendrier général**, sans être présentés comme des contenus ou des fiches manquantes.

## Séances à conserver
- CM et cours théoriques.
- TD/TP apportant un contenu ou une compétence, **hors simulations** : enseignements de pansements, calculs, raisonnement, PSSM, etc.
- Les autres séances pédagogiques en présentiel ou synchrones qui répondent aux critères de révision.

## Production des ressources
Une séance conservée dans le suivi n'autorise pas automatiquement la création d'une fiche : confronter d'abord l'intitulé au catalogue existant, rechercher le support de référence, dédoublonner les cours communs et appliquer la charte/skill de production. Pour un TD, un cas pratique ou des exercices peuvent être plus pertinents qu'une nouvelle fiche. Les exclusions concernent le **suivi des séances**, pas la suppression des fiches de cours existantes ni des activités du calendrier.

Implémentation : course-followup-v1.js / isRevisionSession. TNR : tests/course-followup-v1.mjs. Le module planning-v1.js conserve **tous** les événements, sans perte d'information.
