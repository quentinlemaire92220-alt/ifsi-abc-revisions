# Publication standard des nouveaux vocaux

Décision du propriétaire du 3 novembre 2026 : chaque nouveau vocal réellement fourni et destiné à l’application doit être livré avec une source audio directe compatible avec la playlist et son enchaînement automatique.

Cette étape fait partie de chaque intégration audio. La production de vocaux reste soumise à la demande du propriétaire ; un script TXT ou un dépôt dans Drive ne constitue pas une publication audio dans l’application. Les validations de contenu et le GO de publication du lot restent applicables.

## Préparer les fichiers

1. Identifier le cours, la partie et les épisodes à partir du registre courant. Vérifier le fichier audio effectivement reçu, son format, sa durée et la qualité de lecture. Conserver les réserves et statuts provisoires du cours.
2. Conserver l’original Drive et ses permissions. Préparer une copie publique dans l’hébergement retenu pour l’application ; le GO du lot doit couvrir les fichiers et cette destination, notamment si les sources Drive sont privées. Le GO de la migration historique des 178 vocaux ne signe pas les lots futurs.
3. Copier les MP3 à l’identique. Pour un AAC brut destiné au lecteur web, préparer un M4A par remuxage sans réencodage ; conserver codec, fréquence, canaux et empreinte de l’audio décodé. Une extension renommée ne constitue pas une conversion valide.
4. Conserver en privé les empreintes des sources et copies, les durées mesurées et les reçus utiles. Une copie MP3 doit avoir la même empreinte que sa source ; un remuxage doit conserver exactement l’audio décodé. Les contrats de durée et d’approbation du lot restent ceux de la livraison concernée.

## Raccorder le lecteur et la playlist

- Utiliser le mécanisme direct réellement pris en charge par la version courante : `localAudio` pour les MP3 hébergés avec l’application, ou le manifeste des copies audio pour l’espace audio dédié. Lire les validateurs correspondants avant d’ajouter une entrée.
- Vérifier la capacité de l’hébergement avant de choisir la destination. L’espace `ifsi-abc-audio` contient déjà environ 854 Mo ; le lot historique de 178 copies et ses empreintes doivent être conservés lors de toute extension autorisée. Adapter une extension additive aux contrats réels plutôt que contourner leurs contrôles.
- Réutiliser les identifiants existants lors d’une copie ou correction. Un changement d’hébergement ne crée pas un second vocal et ne remet pas à zéro favoris, écoutés ou positions. Pour un nouvel épisode, mettre à jour les compteurs et rattachements du cours et de sa partie selon le contrat existant.
- Conserver le lien Drive comme secours. Vérifier que la lecture normale utilise bien la copie directe ; une bascule silencieuse sur le lecteur Drive ne prouve pas la compatibilité avec l’enchaînement.
- Charger les médias à la demande. Conserver le manifeste nécessaire au lecteur dans le cache approprié sans ajouter toute la bibliothèque audio au précache de la PWA.

## Vérifier et publier

Avant de déclarer le vocal disponible, vérifier la copie servie : HTTP 200, type audio correct, durée, taille et empreinte attendues, ainsi que la lecture partielle HTTP 206 pour le déplacement dans le fichier.

Tester une playlist mêlant le nouveau vocal à un autre thème : lecture réelle, passage automatique en fin d’audio, précédent/suivant et reprise de position. Contrôler aussi une ressource historique. Un affichage mobile simulé ne prouve pas la lecture sur un téléphone verrouillé ; consigner séparément tout essai sur appareil réel.

Si les copies sont hébergées séparément, les publier et vérifier leurs octets avant d’activer leurs références dans l’application. Si elles font partie du même déploiement, regrouper fichiers, catalogue, manifeste, version et cache dans la même release. Exécuter les préflights, les contrôles concernés, la CI de PR et après fusion, puis comparer la version et les fichiers servis.

Le bilan de chaque intégration audio précise : original Drive conservé, copie directe vérifiée, rattachement au lecteur, enchaînement testé, contrôles/CI, version publiée et éventuelles limites. Garder les preuves détaillées hors du dépôt public. Un problème de copie, de droits ou de lecteur reste signalé dans le bilan et le statut de livraison.
