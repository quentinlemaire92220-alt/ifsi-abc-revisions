# Suivi des cours IFSI ABC — accès depuis Paramètres (v1.1)
Le bouton **Paramètres → Suivi des cours** affiche l'inventaire des ressources **déjà publiques et cataloguées**, à partir du registre et de l'index de cours existants. Les comptes « fiches », « QCM », « flashcards », « infographies », « vocabulaire » et « vocaux » ne garantissent ni la disponibilité des fichiers en temps réel ni leur validation pédagogique.

## Agenda
Les séances reprennent le planning déjà intégré à l'application. Le groupe choisi (B1 par défaut sur cet appareil) filtre les événements en conservant les créneaux communs. Quand l'affectation d'un TD dépend du niveau ou de la répartition du groupe, elle est signalée comme à confirmer. Une séance à venir n'est pas marquée manquante ; une séance annulée conserve son statut. « Marquer revue » ne valide ni le cours ni les sources, c'est une note d'organisation locale.

## Frontière de confidentialité
Le registre privé Google Sheets, les enregistrements et tout renseignement sur la réception ou le contenu des sources personnelles restent **strictement hors de l'application**, du dépôt GitHub public, des requêtes réseau et des statistiques. Aucune URL vers ce registre n'est présente dans les assets publics. L'accès « Suivi » a été déplacé dans Paramètres afin de ne pas encombrer la navigation du bas. **Ce déplacement ne constitue pas une restriction d'accès.** L'application reste publique : tout étudiant peut consulter le catalogue public depuis cet écran, sans accéder au registre privé. Aucune authentification Drive ni connexion à Supabase n'est requise. Les seules notes personnelles de suivi sont conservées dans le \`localStorage\` du navigateur de l'étudiant ; elles ne sont pas partagées. Les contrôles de sources manquantes restent une opération privée.

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
