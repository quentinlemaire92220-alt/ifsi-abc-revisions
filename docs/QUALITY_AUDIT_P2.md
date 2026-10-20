# P2 — Contrôle qualité automatique GitHub

## Portée

Le workflow `.github/workflows/quality-p2.yml` s'exécute sur chaque PR vers `main`, sur chaque publication (push `main`) et à la demande.

Il vérifie **le runtime local réellement fusionné par le Service Worker**, et non uniquement les fichiers JSON bruts. Il couvre :
- QCM : identifiants uniques, choix/réponses valides, corrigés, rattachement `courseId`, biais statistique éventuel des positions ;
- Flashcards : rectos, versos, rattachement cours/thème, doublons et formulations ambiguës ;
- Catalogue pédagogique : quantités minimales, références des atlas, liens de supports référencés, fiches et doublons d'IDs Drive entre fichiers publiés.

## Deux niveaux de sévérité

**Erreur bloquante** : rupture vérifiable d'un contrat structurel (mauvais index de réponse, 4 bonnes réponses sur 4, corrigé manquant, ressource sans cours connu, identifiant de ressource dupliqué, contrat atlas non respecté). Le job échoue.

**Avertissement** : indicateur à revoir par un humain (biais QCM, flashcard à reformuler, `courseId` implicite, absence de lien vers le support officiel, fiche non cataloguée). Il ne bloque pas seul une PR et n'entraîne aucune modification automatique.

La base d'une PR est auditée avec **la même version de l'algorithme** que la candidate. Le rapport distingue *nouveau*, *déjà présent* et *résolu* par identifiant stable. Les chiffres exacts d'un diagnostic peuvent évoluer après modification de la banque : le contrôle ne remplace pas une revue médicale ou pédagogique.

## Où lire les résultats

- Dans la page du run Actions : **résumé GitHub** avec inventaire et anomalies nouvelles.
- Dans l'artefact `ifsi-quality-p2-<run_id>` : `audit-quality.json`, `audit-quality.md`, et `audit-base.json` sur les PR.
- Les artefacts sont conservés **90 jours**. Le workflow ne committe pas les résultats et ne modifie ni données ni contenus pédagogiques.

Les anciens avertissements persistent jusqu'à correction. Le moteur côté application (Paramètres → Contrôle qualité) reste indépendant et manuel, sans chargement automatique.

## Limitations et confidentialité

Les identifiants Drive ne figurent pas dans les rapports (empreinte courte en cas de doublon). **Aucune API Drive ou Supabase n'est interrogée**, et aucun nom, score étudiant, historique local, pièce officielle privée ou secret n'est lu. Un lien non référencé **n'implique pas** que le fichier soit réellement absent de Drive.

La CI ne certifie ni la justesse clinique, ni la qualité d'une infographie, ni l'authenticité d'un PDF. Les vérifications documentaires et visuelles exigées par les chartes restent obligatoires.

## Non-régression

`node tests/quality-report-p2.mjs` teste les classifications, la comparaison base/PR et la non-divulgation d'un ID Drive.

`node tools/quality-report-p2.mjs --output=quality-artifacts/audit-quality.json` produit un audit local (sans réseau).

La P2 **n'autorise aucune fusion automatique, aucun changement du contenu pédagogique et aucune publication sans GO explicite**.
