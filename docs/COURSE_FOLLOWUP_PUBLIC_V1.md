# Suivi des cours IFSI ABC — accès depuis Paramètres (v1.3)
Le bouton **Paramètres → Suivi des cours** affiche l'inventaire des ressources **déjà publiques et cataloguées**, à partir du registre et de l'index de cours existants. Les comptes « fiches », « QCM », « flashcards », « infographies », « vocabulaire » et « vocaux » ne garantissent ni la disponibilité des fichiers en temps réel ni leur validation pédagogique.

## Agenda
Les séances reprennent le planning déjà intégré à l'application. Le groupe choisi (B1 par défaut sur cet appareil) filtre les événements en conservant les créneaux communs. Quand l'affectation d'un TD dépend du niveau ou de la répartition du groupe, elle est signalée comme à confirmer. Les simulations et les créneaux asynchrones restent au planning général mais ne figurent plus dans le suivi des révisions. L'ancien bouton « Marquer revue » est remplacé par « Mes sources ↗ ».

## Frontière de confidentialité
Le registre privé Google Sheets, les enregistrements et tout renseignement sur la réception ou le contenu des sources personnelles restent **strictement hors des fichiers distribués de l'application**, du dépôt GitHub public, des requêtes réseau de l'application et des statistiques. Seul le propriétaire peut enregistrer dans son navigateur un **raccourci local** pointant vers ce registre. Aucune URL vers ce registre n'est présente dans les assets publics. L'accès « Suivi » a été déplacé dans Paramètres afin de ne pas encombrer la navigation du bas. **Ce déplacement ne constitue pas une restriction d'accès.** L'application reste publique : tout étudiant peut consulter le catalogue public depuis cet écran, sans accéder au registre privé. Aucune authentification Drive ni connexion à Supabase n'est requise. Le raccourci, s'il est configuré, est conservé dans le `localStorage` de l'appareil. Il n'est pas synchronisé et ne contient aucune donnée de cours. L'accès au tableau de suivi reste soumis aux permissions Google Drive du propriétaire. La collecte, les trois états et les liens des sources sont gérés directement dans l'onglet privé **Mes sources** du registre Drive.

## Définition des statuts
- **À vérifier** : au moins une référence de support, fiche ou banque QCM n'est pas cataloguée ; ce n'est pas la preuve qu'un fichier n'existe pas sur Drive.
- **Inventaire référencé** : les trois catégories précédentes sont cataloguées ; aucune promesse de complétude ou de qualité.
- **À mesurer** : la source de comptage des cartes ou du vocabulaire n'a pas terminé son chargement.
- **Selon pertinence / disponibilité** : zéro infographie individuelle ou vocal n'implique pas un défaut.

## Contrôles
TNR : \`node tests/course-followup-v1.mjs\` + suite GitHub Actions habituelle. Ce changement n'altère ni les QCM, ni les ressources pédagogiques, ni le planning publié.

## Accès et retour
- Rubrique **Paramètres → Ouvrir le suivi des cours**, sans septième onglet dans la navigation principale.
- Bouton **← Paramètres** pour revenir à la rubrique.
- Aucun changement des données locales ou du suivi privé Drive.

## Raccourci vers « Mes sources » (v1.3)

- Sur l'instance publique de l'application, **Paramètres → Suivi des cours → Configurer le lien privé** permet au propriétaire de coller une URL Google Sheets `https://docs.google.com/spreadsheets/d/...` provenant de son registre privé. **Ne jamais coder cette URL dans le dépôt.**
- Le bouton **Mes sources ↗** depuis une carte de cours ou une séance ouvre ce lien dans un nouvel onglet ; les autorisations restent gérées par Google. L'utilisateur retrouve le cours grâce au filtre ou à la recherche dans l'onglet privé Mes sources.
- Les champs **Transcription, Captures, Support officiel** acceptent Présent / Absent / À vérifier ; une absence non prouvée reste À vérifier. Les liens vers fichiers et vers le chat sont enregistrés seulement dans le registre propriétaire.
- La production reprend les états du registre historique mais ne doit jamais être déclarée conforme sur la seule présence d'un fichier.
- L'application **ne lit ni ne synchronise** ces états : un affichage réellement intégré et privé exigera une authentification et une API avec contrôle d'accès avant déploiement. Aucun statut personnel ne doit être simulé à partir des métadonnées publiques.
- Les anciennes notes locales « revue » ne sont pas supprimées ; seule l'ancienne interface a disparu.
