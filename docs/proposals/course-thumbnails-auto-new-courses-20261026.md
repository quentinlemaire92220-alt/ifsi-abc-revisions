# Vignettes automatiques des nouveaux cours — V8.30.140 (préparation)

## Déclenchement
À l'ajout **autorisé au catalogue public** dans `course-registry-v741.json`, le module associe automatiquement un fichier publié par son identifiant. Il ne traite pas les dépôts bruts du dossier « À traiter ».

## Associations automatiques
- Le manifeste SHA-256 `docs/proposals/course-thumbnails-55-assets.json` (nom historique, cardinalité désormais extensible) est la source unique des images publiées.
- Une entrée `assets/course-thumbnails/<courseId>.webp` connue est affichée sans modifier le JavaScript.
- S'il manque une image validée, le cours affiche automatiquement un monogramme d'UE (A1, B3, C1…), en couleur. Ce repère **n'est pas** une image médicale ni un support pédagogique.
- Si le manifeste échoue, l'ancien pictogramme reste visible. Une image introuvable retombe également sur le pictogramme historique.
- Les visuels actuels (55 cours) et tous les supports historiques sont conservés.

## Approbation d'un nouveau visuel
1. Préparer uniquement **une vignette carrée par cours**, WebP 256×256 sans texte (sur demande, ou depuis une banque autorisée).
2. Contrôler graphiquement et médicalement en 256 px et en 62 px, thème clair/sombre.
3. Placer le binaire `assets/course-thumbnails/<courseId>.webp` et renseigner dans l'objet cours `"thumbnail":{"status":"validated","reviewedAt":"2026-10-26","approvedBy":"owner"}` (date à adapter à la validation réelle).
4. Lancer `node tools/sync-course-thumbnails.mjs` : mise à jour du manifeste et de la liste des images précachées. `--check` contrôle les fichiers et empreintes sans écriture.
5. Incrémenter version/build, passer TNR, préflight et test navigateur, puis **GO distinct avant fusion et publication**.

Un fichier non validé ou modifié sans une nouvelle validation est refusé par le synchroniseur. Le passage de « provisoire » à « officiel » ne remplace jamais la vignette automatiquement.

## Frontières
Pas de génération de fiches, QCM, flashcards, vocaux, ni de planches. Aucune publication automatique de cours ou de nouveau visuel. Les 55 visuels actuellement présents restent intacts.
