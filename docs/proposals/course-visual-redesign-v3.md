# IFSI ABC — Refonte visuelle des cours V3 (revue préalable)

## Contexte
L'utilisateur a indiqué que V8.30.130 est fluide mais ne correspond pas à la maquette graphique validée. Cette étape matérialise une direction visuelle nettement différente **sans publication** et sans modifier la navigation fonctionnelle V2.

## Référence
Prototype HTML interactif de revue avec les 55 entrées de catalogue et modes clair/sombre ; captures de contrôle Chromium produites séparément en desktop et mobile. Les éventuels compteurs du prototype historique sont **illustratifs**, et ne remplacent pas les vrais compteurs affichés par l'application.

## Direction proposée
- Domaine : grands en-têtes propres, contours subtils, hiérarchie accentuée, chevron distinct à droite.
- UE : code dans un petit cartouche, titre pédagogique complet, compteurs décalés sous le titre.
- Cartes de cours : accent vertical, moins de badges concurrents, lecture prioritaire du titre et de la progression.
- Détail : en-tête de bibliothèque, chemin pédagogique discrètement teinté, ressources ordonnées et visuellement séparées.
- Ressources individuelles : **titre sur toute la largeur**, puis petite action et favori en pied de carte (évite les titres écrasés à gauche).
- Deux thèmes et une colonne mobile. Respect des états clavier et préférence de réduction des mouvements.
- Aucune introduction d'images décoratives, d'icônes inventées ou de chiffres arbitraires dans le code applicatif.

## Isolation et risques
- Feuille CSS candidate enregistrée dans \`tests/fixtures/course-visual-redesign-v3.css\` : elle n'est **pas chargée** par \`index.html\`, ni présente dans le Service Worker.
- Aucune mutation de \`v74-pack.js\`, \`course-navigation-ui-v2.js\`, des registres ou contenus QCM/fiches/vocaux/Drive.
- Évite les conflits de code avec PR #189 et PR #159. Avant future activation, réconcilier les dernières modifications de \`main\` et exécuter les TNR.
- Les navigateurs supportant \`:has()\` sont déjà utilisés par le CSS applicatif existant.

## Avant une PR d'activation
- [ ] Revue/validation explicite de la maquette **sur écran ordinateur et mobile en deux thèmes**.
- [ ] Reproduire l'apparence exacte sur la V2 dans un environnement de prévisualisation chargé avec les vrais 55 cours.
- [ ] Vérifier les titres et badges « Provisoire », ressources officielles absentes, recherche, scores, QCM, favoris et lecteurs vocaux.
- [ ] Test de démarrage à froid et changement de cours, sans gel.
- [ ] Contrôles de débordement/focus/contraste. Tests navigateur et TNR complets.
- [ ] PR d'activation séparée avec version/cache PWA et nouveau GO explicite pour fusion et publication.

**Cette PR est un dossier de conception, pas une release. Ne pas fusionner ni publier automatiquement.**
