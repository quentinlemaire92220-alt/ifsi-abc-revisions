# Compléments MP3 hébergés par l’application

`hostedAudioSupplements` dans `docs/course-deliveries.json` décrit un complément
audio indépendant d’un package pédagogique déjà publié. Ce contrat ne modifie
ni les compléments historiques avec copie Drive (`audioSupplements`), ni leurs
validateurs, ni les premières publications. Il n’impose aucun faux identifiant
Drive à un MP3 dont les octets sont hébergés sous `assets/audio/`.

Chaque entrée `hosted_audio_supplement_v1` contient les identifiants ordonnés,
chemins, tailles, durées mesurées et SHA-256 des MP3, ainsi que le snapshot public
du cours et de ses vocaux historiques et le digest de sa livraison inchangée.
Une seule entrée par cours est admise dans cette version du contrat. Les ajouts
suivent les vocaux historiques sans modifier leurs lignes, identifiants, octets,
numéros ou ordre. Le registre actif inclut le compteur total ; les anciens
dossiers et ressources restent disponibles.

## Préparation locale

L’état `prepared` exige `publicationApproval:null` et `review:{status:"pending"}`.
Le validateur contrôle les MP3 réels et leur périmètre, sans simuler l’écoute.
Les catalogues du candidat local incluent les nouveaux MP3 afin de tester le
lecteur. Cet état ne peut pas être publié.

Les contrôles historiques utilisent `historicalAudioView` pour retrouver
exactement les lignes couvertes par le GO d’origine. Cette vue ne sert jamais au
lecteur étudiant. La nouvelle validation vérifie d’abord chaque ligne exclue,
ses octets et son lien au snapshot. Le contrôle différentiel compare ce snapshot
au commit Git de base ; il refuse toute autre mutation ou réécriture de la
livraison. Le digest historique est recalculé et comparé à sa signature dans le
test d’intégration, sans réécrire la signature.

```sh
node tools/check-hosted-audio-supplements.mjs --stage preparation --base SHA_COMPLET
node tests/hosted-audio-supplement-test.mjs
```

Le deuxième contrôle nécessite `IFSI_BASE_SHA`. Les préflights de préparation et
publication l’exécutent avec la base explicite et conservent les résultats.

## Revue et GO distincts

Après une écoute réellement effectuée et le GO explicite sur les octets finaux,
l’entrée peut devenir `approved`. La revue doit désigner tous les vocaux écoutés,
les SHA-256 correspondants, sa date et l’empreinte de la preuve privée. Les
preuves détaillées restent hors du dépôt. Le GO possède la portée
`hosted_audio_supplement` et le digest retourné par `hostedAudioSupplementDigest`.
Ce digest couvre les métadonnées, la revue, les octets et l’historique désignés.

```sh
node tools/check-hosted-audio-supplements.mjs --stage publication --base SHA_COMPLET
```

`course-publication-approval.mjs` appelle obligatoirement la même validation en
mode publication, avant toute exemption du package historique. L’état préparé
échoue avec `HOSTED_AUDIO_GO_REQUIRED`. Ce contrôle reste bloquant dans la CI et
dans le préflight de publication ; aucun `continue-on-error` n’est ajouté.
Un contrat technique vert ne constitue donc jamais un GO.

Les tests de contrats contiennent des accords synthétiques uniquement en mémoire
pour vérifier le futur parcours accepté et ses refus. Ils n’écrivent aucune
approbation dans le manifeste réel. La préparation ne déclenche aucune opération
Drive, GitHub, fusion ou déploiement.
