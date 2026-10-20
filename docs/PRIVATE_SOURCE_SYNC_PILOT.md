# Pilote privé : suivi des sources dans IFSI ABC

## Statut
**Non activé : PR technique uniquement.** Ne pas déployer ni annoncer une synchronisation active tant que les prérequis n'ont pas été configurés et testés. La production actuelle reste le raccourci vers Google Sheets.

## Architecture
- GitHub Pages : interface de connexion par Magic Link e-mail + trois champs (Transcript, Captures, Support officiel) : aucune donnée privée affichée avant authentification. Le JavaScript public ne contient ni URL de registre, ni clé privée, ni données du cours.
- Supabase Auth : lien magique standard du fournisseur (sans modification SMTP du modèle e-mail). Au retour vers le GitHub Pages autorisé, le fragment avec jeton est effacé immédiatement de la barre d’adresse, avant le chargement des autres scripts. Seul le jeton d’accès signé est **gardé en mémoire uniquement** ; le jeton de renouvellement n’est pas conservé.
- Supabase Edge Function : contrôle du JWT auprès du serveur Auth et comparaison stricte du UUID avec IFSI_SOURCE_OWNER_UID, variable secrète serveur. Autorisation et origine vérifiées à chaque requête.
- Google Sheets API : compte de service dédié via clé JSON conservée exclusivement dans les secrets serveur. Le compte de service reçoit seulement l'accès au registre nécessaire, **sans partage public**.
- GET : lecture uniquement des identifiants cours/partie, des trois statuts et de l'état de production. Aucune transcription, capture ni lien privé renvoyé.
- PATCH : modification d'une seule cellule D, E ou F de l'onglet privé « Mes sources ». Un statut changé depuis la dernière lecture donne un conflit 409 et exige un rechargement.

**Limite technique :** Google Sheets ne fournit pas de mise à jour conditionnelle atomique d'une cellule. Le contrôle avant écriture détecte les valeurs modifiées mais ne garantit pas l'absence absolue de conflit si deux auteurs enregistrent précisément au même instant.

## Prérequis bloquants, à réaliser par le propriétaire
1. Le compte propriétaire Supabase Auth a déjà été créé et confirmé. **Aucune configuration SMTP ni modification du modèle Magic Link n'est requise.** La Site URL et l'URL de redirection autorisée doivent pointer vers la version publique GitHub Pages. Le bouton privé demande un lien unique par e-mail avec `create_user:false` ; aucune inscription anonyme n'est possible. Vérifier la réception du lien standard et son retour sur le bon domaine avant toute mise en ligne.
2. Le compte propriétaire existant dispose d’un UUID confirmé par Supabase ; le configurer via les **Edge Function Secrets** sous IFSI_SOURCE_OWNER_UID (jamais dans GitHub, le code HTML ou le lien de connexion).
3. Créer un compte de service Google Cloud dédié et activer Sheets API. Partager uniquement le registre privé avec ce compte de service en Éditeur, sans changer la visibilité publique. Enregistrer le JSON du compte dans Supabase Secrets sous IFSI_GOOGLE_SERVICE_ACCOUNT_JSON. Ne jamais partager ce secret dans ChatGPT ni GitHub.
4. Enregistrer IFSI_SOURCE_SHEET_ID dans Supabase Secrets et IFSI_SOURCES_ALLOWED_ORIGIN avec l'origine HTTP exacte du GitHub Pages, sans chemin ou barre finale. SUPABASE_URL et SUPABASE_ANON_KEY sont fournis par Supabase.
5. Déployer explicitement la fonction ifsi-private-sources avec verify_jwt=true **seulement après configuration**. Sur une entrée de test, contrôler accès propriétaire, refus anonyme, refus autre compte, changement D/E/F, mauvais identifiant, état invalide et conflit 409.
6. Exécuter les TNR et revue de sécurité, vérifier fonctionnement PWA, déconnexion et gestion d'erreurs. Ne fusionner/publier qu'avec les secrets prêts et les vérifications réelles réussies.

## Confidentialité
- Aucun secret, UUID propriétaire ou ID de Sheet privé dans GitHub Pages, les logs front, les statistiques ou les QCM.
- Jamais de clé Supabase service_role dans le navigateur.
- Aucune lecture privée tant que l'accès n'est pas effectivement autorisé ; une absence de données n'est jamais traduite par « Absent ».
- La feuille reste la source de vérité ; aucune transcription, capture ni fichier privé n'est copié en base ou dans GitHub.
- « Officiel présent » n'est pas équivalent à « fiche médicalement validée ».
- Conserver toutes les notes locales historiques et les lignes existantes du registre.

## Tests
- node tests/private-source-sync-contract.mjs (inclut le retrait immédiat des jetons de l’URL, la connexion par Magic Link et l’interdiction de création de compte)
- node tests/course-followup-v1.mjs
- TNR globaux GitHub Actions
- **Tests réseau et droits réels à réaliser après configuration** ; des tests statiques verts ne valident pas l'intégration Google.

Le connecteur Google Drive ChatGPT n'est pas un jeton d'authentification serveur réutilisable par GitHub Pages.
