# Récupération Git ciblée et accès aux ressources

Les jobs TNR et préflight récupèrent deux niveaux de commits avec `filter: blob:none`, puis `tools/prepare-ci-history.mjs` prépare la comparaison exacte. Une PR utilise `pull_request.base.sha` ; un push sur la branche principale utilise `before` ; une nouvelle branche utilise la dernière version de la branche publiée ; un lancement manuel sur cette version utilise son parent. Une base explicite invalide ou inaccessible bloque la suite. Il n'existe aucun repli vers une comparaison vide avec HEAD.

Les révisions historiques déclarées dans `officialRevision.baseSha` sont récupérées séparément, à profondeur un. Les objets réellement lus par leurs contrôles sont vérifiés. Les anciens contrôles et leurs arguments restent présents ; aucune approbation ni ressource pédagogique n'est réécrite. Un nouveau contrôle qui exige un autre commit historique doit déclarer et tester cette dépendance avant utilisation. Aucun téléchargement complet implicite de l'historique n'est autorisé comme secours.

`preflight-reports/git-*.json` conserve la base retenue, la raison, les récupérations, leur durée et l'état shallow. Ces durées ne prouvent pas un gain universel : comparer des exécutions de périmètre comparable, et distinguer récupération, installation et tests.

## Vérifier les accès avant les tests lourds

`node tests/course-resource-access.mjs` s'exécute en tête du préflight et avant les contrôles lourds du TNR. Il utilise les banques décodées par le chargeur de production et les ressources du registre. Pour les cours à sélection explicite, il vérifie la fiche principale, les PDF actifs, la copie directe des vocaux, les identifiants des questions et du vocabulaire, l'absence de doublons et les rattachements au bon cours. Douze défauts simulés vérifient le blocage des accès cassés.

Le test navigateur complet vérifie aussi que les liens actifs, la fiche principale et les boutons audio sont présents dans le cours, et que les anciens liens de flashcards masqués restent dans l'historique. Son déclenchement couvre désormais les catalogues, banques et fichiers de vocabulaire/audio, pas seulement l'habillage graphique.

Une existence locale n'est pas une preuve d'accès HTTP ou de permissions Drive. Après déploiement, les comparaisons des fichiers servis, des empreintes et de HTTP206 pour les MP3 restent obligatoires, ainsi que les essais de lecture, reprise et playlist. Les liens externes historiques sont explicitement non sondés par ce contrôle local.

## Reprise locale

Utiliser un checkout isolé de la version publiée, conserver les octets Git et régler `core.autocrlf=false` dans ce checkout seulement. Définir `IFSI_BASE_SHA` au SHA complet réellement vérifié. Ne pas remplacer les anciens reçus de conformité. Sous Windows, utiliser un répertoire temporaire privé et un profil de navigateur distinct ; conserver les journaux de chaque tentative.

Lancer les contrôles ciblés après une correction, puis la suite complète une fois le candidat stabilisé. Le préflight, les contrôles GitHub, le GO propre au lot et les vérifications après déploiement restent distincts. Ce workflow ne donne aucun GO et ne démarre aucun nouveau cours.
