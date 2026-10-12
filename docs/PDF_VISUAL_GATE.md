# Contrôle PDF : infographies réellement intégrées

Ce contrôle est un **garde-fou structurel**, pas un diagnostic médical automatisé. Il vérifie un PDF **local** sans connexion Drive ni transmission de son contenu à GitHub. Ne commiter ni PDF pédagogique privé, ni manifest détaillé, ni captures de page, ni liens d'accès privés au dépôt public.

## Utilisation obligatoire avant dépôt d'une nouvelle fiche avec infographies

1. À partir du support officiel, inventorier tous les schémas réellement utiles et documenter les exclusions : cela reste une revue intellectuelle, non automatisable par ce script.
2. Produire les infographies médicalement vérifiées puis les intégrer dans la fiche PDF **avant** de créer le manifest de contrôle.
3. Dans un espace local ou Work privé, enregistrer un fichier JSON avec la page cible, la section et la zone de chaque infographie attendue.
4. Exécuter `tools/pdf_visual_gate.py`. En cas de FAIL, corriger la fiche et relancer le contrôle **sans demander un nouveau prompt à l'étudiant**.
5. Inspecter séparément le sens médical des appareils, voies anatomiques, connexions, unités et flèches : le script ne peut pas les certifier.
6. Conserver le PDF complet, les captures, le manifest et le rapport détaillé **hors du dépôt public**. Seul un résumé technique sans noms, pages sources ou liens privés peut être enregistré dans le manifeste de livraison public.

## Commande

```bash
python -m pip install pymupdf==1.26.7
python tools/pdf_visual_gate.py \
  --pdf /chemin/prive/fiche.pdf \
  --manifest /chemin/prive/visuels-attendus.json \
  --report /chemin/prive/rapport-visuel.json \
  --render-dir /chemin/prive/rendus-a-inspecter
```

Le paramètre `--render-dir` est facultatif. Les PNG restent privés ; les ouvrir pour inspecter les pages réellement rendues. Code de sortie 0 = PASS structurel ; 1 = FAIL.

## Exemple de manifest (données fictives)

```json
{
  "version": 1,
  "expected_pages": 2,
  "figures": [
    {
      "id": "schema_01",
      "source_ref": "Support officiel p. 7",
      "page": 1,
      "anchor": "Titre de la section",
      "region": [0.10, 0.25, 0.90, 0.75],
      "kind": "raster"
    }
  ]
}
```

La `page` est numérotée dès 1, la `region` est normalisée de 0 à 1 : gauche, haut, droite, bas. `kind` : `raster`, `vector` ou `auto`. Une zone doit contenir un vrai visuel de taille et de résolution suffisantes, pas seulement le titre ou un cadre.

Le manifest est **une liste d'attendus créée à partir du support** : si un schéma est oublié de cette liste, le script ne pourra pas inventer son existence. Un manifest vide est refusé ; si le cours ne contient aucun schéma pertinent, documenter cette exception séparément.

## Preuve minimale à enregistrer lors d’une première publication ou d’une nouvelle partie

Lorsqu'un nouveau cours est publié pour la première fois et possède des infographies, la livraison GitHub dans `docs/course-deliveries.json` doit fournir un résumé de contrôle sans donnée privée :

```json
"visualAudit": {
  "status": "PASS",
  "pdfSha256": "64_caracteres_hexadecimaux_du_rapport",
  "expectedCount": 5,
  "checkedCount": 5
}
```

La clé `public_record` est générée **automatiquement** dans le rapport lorsque le PDF passe le contrôle. La copier telle quelle comme valeur de `visualAudit` dans le manifeste ; ne jamais inventer un résumé PASS. Les numéros, noms et liens des sources ne sont pas à publier. Le garde-fou de CI vérifie la **cohérence du résumé** ; GitHub Actions ne peut pas examiner le fichier Drive privé lui-même et ne prouve donc pas que ce résumé correspond au PDF publié.

## Capacités et limites

**Détectable automatiquement :** pages introuvables, sections absentes, absence d'image ou de dessin vectoriel suffisant dans les zones déclarées, image trop petite ou de résolution manifestement insuffisante, zone quasi blanche, manifest invalide ou non exhaustif selon sa propre déclaration.

**Non détectable de façon fiable :** justesse anatomique ou appareillage exact, mauvaise étiquette inscrite dans l'image, exactitude des flèches et du texte dans une image, schémas oubliés du manifest, esthétique et difficulté pédagogique. Une **revue médico-graphique distincte** est donc nécessaire. `medical_validation: NOT_AUTOMATICALLY_VERIFIED` figure systématiquement dans le rapport.

Les tests GitHub Actions utilisent uniquement des **PDF fictifs générés en CI** : ils vérifient que l'outil fonctionne et rejette des erreurs simulées. Pour un cours réel, Work doit lui-même exécuter l'outil sur le PDF local, inspecter les rendus et ne publier que le résultat contrôlé.

## Recontrôler le PDF réellement publié après son dépôt Drive

Après le contrôle initial PASS, déposer la fiche PDF dans le dossier Drive final. **Retélécharger ensuite depuis ce même emplacement** une copie binaire dans un espace de travail privé, en utilisant le compte Google Drive autorisé. Ne pas simplement recopier le fichier original local : cela ne prouve pas ce qui se trouve sur Drive.

```bash
python tools/verify_published_pdf.py \
  --published-pdf /espace/prive/retour_drive/fiche.pdf \
  --original-report /espace/prive/rapport-initial.json \
  --manifest /espace/prive/attendus.json \
  --report /espace/prive/rapport-apres-depot.json
```

Le vérificateur calcule SHA-256 sur les **octets du PDF retéléchargé**, compare l'empreinte au rapport initial et relance l'analyse structurelle sur ce fichier. Fichier absent, octets divergents ou inventaire incohérent = FAIL.

Si MATCH, utiliser le champ `public_record` du rapport privé comme `publishedVerification` dans la livraison. Exemple synthétique :

```json
{
  "status": "MATCH",
  "source": "authenticated_drive_download",
  "pdfSha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "expectedCount": 3,
  "checkedCount": 3
}
```

**Limite :** le script prouve la correspondance entre les octets *fournis* et le rapport original, mais ne peut pas attester cryptographiquement que la copie provient bien du bon fichier Drive. L'opérateur privé doit garantir le téléchargement authentifié. La CI GitHub publique ne peut pas lire le PDF privé ; elle ne contrôle que la cohérence des déclarations et exécute des tests synthétiques. Ne jamais publier le PDF, le manifeste détaillé, le chemin privé ou les captures médicales sur GitHub.
