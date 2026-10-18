# IFSI ABC — audit P1 et revue pédagogique séparée (18 octobre 2026)

**Base auditée :** `main` au commit `7057d1e27f7a9165784876783b1bc23970b2fb2b`, version **8.30.89**.

**Portée de cette PR :** contrôles et traçabilité techniques uniquement. Pas de changement de contenu médical, de banque QCM, de lien Drive d'étudiant, de calendrier, de fichier MP3, de version de production, ni de publication automatique.

## Constats vérifiés

- Catalogue : 48 cours (43 visibles), 59 fiches, 163 infographies, 58 vocaux référencés, 340 termes de vocabulaire.
- 2 560 QCM actifs, répartis sur 42 cours selon le chargeur réel du Service Worker (audit GitHub Actions du 17/10/2026).
- Anciennes alertes actives à traiter après relecture pédagogique : 289 explications de moins de 80 caractères ; 108 formulations dépendantes du cours ; 623 questions à trois réponses sur quatre propositions.
- Le rapport historique comptait comme « identiques » des énoncés génériques sans comparer choix, réponses ni cours. Le contrôle correctif recherche désormais l'identité complète de la question.
- Une question portant sur les propriétés attendues d'une radiographie ne nécessite pas forcément une image : le contrôle différencie désormais référence à une figure fournie et question conceptuelle sur l'imagerie.
- Six cours sans QCM actif propre : `diagnostic_bacteriologie`, `infections_urinaires`, `methodes_travail_reussite`, `vaccination_prs`, `psychologie_sante`, `administration_medicamenteuse`.
- Deux cours visibles sans fiche propre : `diagnostic_bacteriologie` et `infections_urinaires`. `traumatologie` est un sous-cours volontairement masqué rattaché au locomoteur.
- 12 cours sans pointeur de support officiel au registre, **ce qui ne prouve pas l'absence de support Drive** : `systeme_cardiovasculaire`, `infections_neuro_meningees`, `calculs_doses_mathematiques`, `parametres_vitaux`, `diagnostic_bacteriologie`, `chirurgie_orthopedique`, `competences_psychosociales`, `methodes_travail_reussite`, `vaccination_prs`, `psychologie_sante`, `pharmacologie`, `administration_medicamenteuse`.
- Métadonnées des 59 fiches : 8 portent `officialSupport=true`, 14 portent `officialSupport=false`, et 37 restent non qualifiées. **Non renseigné ne signifie ni officiel ni provisoire**.
- Le contrôle de banque brute antérieur signalait 378 QCM à quatre bonnes réponses : leur adaptation dans le runtime ne vaut pas validation pédagogique des originaux.

## Changements techniques inclus

1. Contrôle des nouveaux QCM/modifications : règles 1 à 3 bonnes réponses, 4/5 choix, justification suffisante et figure explicitement rattachée lorsqu'un visuel est demandé ; les contenus historiques non modifiés ne sont pas réécrits.
2. Plafond de non-régression pour les alertes historiques du runtime ; le compteur pourra diminuer mais ne doit pas augmenter silencieusement.
3. Audit plus exact des doublons et références visuelles, avec fixtures de tests.
4. Vérification de la provenance : une fiche provisoire ne devient pas « support officiel » sans preuve ; les liens de fiches et sources sont distincts.

## Revue technique complémentaire — 18 octobre 2026

- La branche `main` a évolué depuis l'ouverture de cette PR : V8.30.90 (`334b01d3`). La PR reste en **brouillon** et peut nécessiter une synchronisation explicite avant toute fusion.
- Les tests ajoutés refusent également les énoncés vides, les identifiants de cours et de question absents, les thèmes/niveaux manquants, les propositions vides ou dupliquées et les index de réponses incorrects/dupliqués.
- Le détecteur de dépendance visuelle distingue les questions conceptuelles sur la radiographie des références à une image/schéma à consulter.
- **Deux références visuelles potentielles** demeurent à revoir sans modification automatique : `pharmaco_031` et `v820_a1p3_019`. Leur présence en alerte ne prouve pas à elle seule qu'un visuel manque effectivement dans l'application.
- Les seuils de dette contrôlent désormais `short_explanation=289`, `source_dependent_question=108`, `three_of_four=623`, `identical_question=0`, `image_without_figure=2`. Les seuils ne sont **pas** une validation médicale.
- TNR de la branche : [GitHub Actions — passage réussi](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/actions/runs/39124070617) (commit `34c396fc`, 18/10/2026).

## File de revue pédagogique privée — hors de cette PR

**Priorité 1.** Réviser les 289 explications courtes et les 108 formulations dépendantes du cours, puis comparer PDF et banque applicative. Revoir le ou les items qui demandent réellement une illustration absente et les 378 QCM bruts à quatre bonnes réponses. Les réponses, options et corrections nécessitent vérification sur le support officiel, validation humaine et éventuel nouveau GO publication.

**Priorité 2.** Vérifier cours par cours les six banques manquantes, les deux fiches absentes, les douze liens de source non renseignés et les 37 métadonnées non qualifiées. Ne pas attribuer un support officiel à partir de son seul nom ou d'une capture.

**Reporté à une release approuvée :** retirer la mention « VERSION TEST » de l'interface si elle n'a plus lieu d'être, en synchronisant la version de l'application, le cache PWA et le changelog. Aucun changement visuel ou cache ne fait partie de la PR de contrôle.

## Publication

La création de la branche et de la PR n'autorise ni fusion ni déploiement. Pour un changement pédagogique, suivre `AGENTS.md` et `docs/PUBLICATION_APPROVAL.md` : revue privée du lot, autorisation explicite de publication, TNR et vérification de la copie réellement publiée.
