# IFSI ABC — Chargement automatique privé Pathologies (V8.30.112)

**Statut : supports BPCO, HTA et diabète de type 2 en revue médicale, non publiés à la promotion.**

## Installation effective dans Supabase

Le 21 octobre 2026, le pack JSON P1 (4 221 297 octets, MD5 `d18b7525c1e19f35bb53eefeec68c2b2`, SHA-256 `330a09b91deed0a0a32992f5912cb769bb98a8ea4218d1563a653b339dda36b4`) a été transféré **directement de la pièce jointe ChatGPT vers Supabase**, sans le publier sur GitHub.

Sa cohérence a été vérifiée avant enregistrement, puis sur la ligne conservée en base :

| Révision privée P1 | Total |
| --- | ---: |
| Pathologies | 3 |
| Planches originales/exports | 18 |
| QCM | 72 |
| Flashcards | 60 |
| Étapes cliniques | 24 |
| Revue médicale | `pending` |

La table `public.pathologies_private_packs` est protégée par RLS `owner_id = auth.uid()` pour SELECT, INSERT, UPDATE et DELETE ; l'accès `anon` est révoqué. Elle contient le pack du compte propriétaire déjà inscrit et confirmé dans Supabase. L'espace temporaire de transfert a été supprimé après validation et contrôle d'intégrité. Les migrations reproductibles sont dans `supabase/migrations/20261021_pathologies_private_packs.sql`.

## Parcours dans l'application

1. Mettre à jour IFSI ABC en **V8.30.112 — build 8412**.
2. Ouvrir **Pathologies → BPCO**, **HTA** ou **Diabète type 2**.
3. Dans **« Mes supports Pathologies — synchronisation privée »**, saisir **l'adresse du compte Supabase propriétaire** et cliquer **« Recevoir mon lien de connexion »**.
4. Ouvrir le Magic Link reçu **dans le même navigateur/profil**. Il passe par la page pilote `pilote-sources-privees.html` déjà autorisée par Supabase, puis revient sur `index.html#pathologies`, sans conserver les jetons dans l'adresse.
5. L'application vérifie le compte via Supabase Auth et récupère automatiquement le pack du compte connecté. Les trois rubriques ouvrent alors leurs 6 planches, QCM, flashcards et cas de revue ; **aucune sélection de fichier JSON n'est nécessaire**.
6. Aux ouvertures suivantes, la session stockée sur l'appareil est rafraîchie si besoin ; le pack est conservé en IndexedDB pour les consultations hors ligne.

Si l'utilisateur ouvre le Magic Link dans un autre profil ou navigateur que la PWA, la session peut ne pas être partagée. Utiliser le même profil Windows/Chrome et reprendre la connexion depuis l'application. Une authentification est requise sur chaque appareil non encore connecté.

## Sécurité et séparation pédagogique

- Les scripts publics `pathologies-cloud-private-v1.js` et `pathologies-auth-callback-v1.js` n'embarquent **que l'adresse du service et une clé Supabase publique** ; aucune clé `service_role`, aucun jeton utilisateur, aucun contenu médical du pack n'est distribué.
- La table Postgres vérifie aussi `reviewOnly:true`, `publicationPermitted:false`, `clinicalReview:pending` et la structure P1 : toute tentative de rendre ce pack `approved` par l'interface est refusée.
- Les lectures et écritures portent le JWT Supabase de l'utilisateur. Les requêtes utilisent `cache:'no-store'` ; le service worker refuse d'intercepter le domaine Supabase et ne précharge aucune image privée.
- Les jetons de session sont conservés dans le `localStorage` de l'origine de l'application pour permettre la reconnexion automatique, comme dans les clients web classiques. Ils restent accessibles aux scripts du même site : ne jamais importer de données patient réelles ni d'informations personnelles sensibles dans ce système de relecture pédagogique.
- Le lecteur n'appelle pas le moteur de scoring, n'alimente pas les statistiques et affiche systématiquement **« NON VALIDÉ MÉDICALEMENT »**.
- Le sélecteur JSON local reste disponible dans un panneau dépliable **« option de secours »**, mais n'est plus obligatoire.

### Vérifications et limites

Le code comporte un test simulé des échanges Auth/REST et du retour Magic Link. Les TNR ne prouvent pas qu'un clic réel dans la boîte mail réussira sur tous les appareils. L'authentification réelle et le téléchargement dans la PWA doivent être essayés après déploiement, avec le compte propriétaire. L'intégration privée n'est pas la validation clinique des supports et n'autorise pas leur diffusion à la promotion.
