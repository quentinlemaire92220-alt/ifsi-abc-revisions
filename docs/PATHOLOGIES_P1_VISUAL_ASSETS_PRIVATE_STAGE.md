# Pathologies P1 — contrôle des 18 planches sources (revue privée, 20/10/2026)

**Périmètre :** BPCO, hypertension artérielle et diabète de type 2 ; six planches par pathologie, fidèles au modèle maître illustré. Les images sont gardées **hors dépôt GitHub public**, ainsi que leurs PDF sources, exercices et preuves de revue.

## Résultat de l'intégration locale

Un dossier ZIP de revue privé a été créé à partir des **vrais fichiers existants** :
- BPCO : extraction, sans retouche clinique ni esthétique, des six volets du modèle maître utilisateur à partir du PNG composite original ;
- HTA : rendu image fidèle des six pages du PDF **corrigé** (la comparaison athérosclérose / HTA reste assortie d'une mise en garde) ;
- Diabète de type 2 : rendu image fidèle des six pages du PDF **corrigé** (contexte HAS/ADA à vérifier sur chaque affirmation).
- Les **18 PNG** ont une empreinte SHA-256, une taille et des dimensions contrôlées ; un aperçu local permet de naviguer page par page et de consulter les **72 QCM**, **60 flashcards** et **24 étapes de cas** historiques, en **revue privée uniquement**.

Ces opérations d'extraction **n'ont pas corrigé ni validé médicalement les textes incrustés dans les images**. Aucune infographie ne doit être déclarée `medicalReview:'approved'` uniquement parce que son fichier possède une empreinte correcte.

## Préflight local des octets

```bash
node tests/pathologies-private-assets.mjs --self-test
node tests/pathologies-private-assets.mjs --review /dossier/prive/MANIFESTE_ASSETS_SHA256.json
```

Le script est sans réseau, lit le manifeste privé et vérifie les **18 noms** `assets/{bpco,hta,dt2}/p01...p06.png`, leur ordre/nombre, l'existence des originaux, l'intégrité PNG, les dimensions, les tailles et les empreintes. Il refuse les métadonnées qui prétendent rendre ce package de revue publiable ou valider médicalement les images. Il n'émet aucun contenu clinique.

Le test `--self-test` utilise une figure fictive synthétique et est exécuté dans la CI. **Aucun asset privé n'entre dans la CI publique**.

## Blocages conservés avant publication

| Pathologie | Planches prêtes pour revue | Sections structurées de cours | Exercices à relire | Diffusion |
| --- | --- | --- | --- | --- |
| BPCO | 6/6 extraites | 10/10 à revalider | 52 | Bloquée |
| HTA | 6/6 extraites | 0/10 dans le catalogue pilote | 52 | Bloquée |
| Diabète type 2 | 6/6 extraites | 0/10 dans le catalogue pilote | 52 | Bloquée |

1. Terminer les dix sections HTA/DT2 avec des références vérifiées (ne pas simplement recopier les textes rasterisés sans vérification).
2. Revoir les 18 planches et leurs annotations et associer les sources **vérifiées** à chaque visuel. Pour la BPCO, des affirmations SpO₂ 88–92 % sont hors de leur contexte clinique si elles sont présentées comme objectifs universels.
3. Vérifier les 156 exercices et renforcer les distracteurs problématiques, en conservant les corrections, réponses et statistiques synchronisées.
4. Ne remplir les URLs **HTTPS publiques**, les approbations de revue ni l'empreinte du lot final qu'après revue des fichiers exactement publiables. Un chemin local d'aperçu privé n'est pas un asset public.
5. Obtenir une **validation médicale/éditoriale du package final** et un **GO publication explicite distinct** ; alors seulement soumettre la PR publiant les supports et activer l'onglet Pathologies.

Cette étape d'intégration des fichiers originaux ne modifie pas la charte graphique et ne nécessite pas de reconstituer les planches par des schémas simplifiés.
