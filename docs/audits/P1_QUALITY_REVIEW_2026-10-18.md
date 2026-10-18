# IFSI ABC — audit P1 et revue pédagogique séparée (18 octobre 2026)

**Base initialement auditée :** `main` au commit `7057d1e27f7a9165784876783b1bc23970b2fb2b`, version **8.30.89**. **Base de la PR synchronisée :** `main` V8.30.90 (`334b01d3`), via commit de synchronisation `55f643ce`.

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

- La branche `main` a évolué depuis l'ouverture de cette PR : V8.30.90 (`334b01d3`). La PR a été **synchronisée** avec cette version par un commit à deux parents, tout en restant en **brouillon**.
- Les tests ajoutés refusent également les énoncés vides, les identifiants de cours et de question absents, les thèmes/niveaux manquants, les propositions vides ou dupliquées et les index de réponses incorrects/dupliqués.
- Le détecteur de dépendance visuelle distingue les questions conceptuelles sur la radiographie des références à une image/schéma à consulter.
- **Deux références visuelles potentielles** demeurent à revoir sans modification automatique : `pharmaco_031` et `v820_a1p3_019`. Leur présence en alerte ne prouve pas à elle seule qu'un visuel manque effectivement dans l'application.
- Les seuils de dette contrôlent désormais `short_explanation=289`, `source_dependent_question=108`, `three_of_four=623`, `identical_question=0`, `image_without_figure=2`. Les seuils ne sont **pas** une validation médicale.
- TNR **après synchronisation avec V8.30.90** : [GitHub Actions — passage réussi](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/actions/runs/39125671831) (commit `55f643ce`, 18/10/2026). Les contrôles du nouveau suivi des cours sont conservés.

## Revue pédagogique ciblée — à valider hors GitHub public

### Dépendances à une illustration (P1)

- `v820_a1p3_019` — cours **Épistémologie et savoirs infirmiers**, banque `qextra-12.txt`. L'énoncé actuel demande ce que représentent les « briques » dans **une image pédagogique « briques et ciment »**. Réponse déclarée en banque : **les concepts**. Le corrigé précise l'analogie entre concepts (briques) et propositions (ciment). **Constat :** l'énoncé dépend explicitement de cette image, non rattachée par métadonnée au QCM. **À vérifier avant changement :** la formulation du support officiel ; décider soit d'intégrer l'image autorisée, soit de reformuler une question autonome non triviale en conservant la notion. Ne pas considérer la clé comme validée par le seul audit.
- `pharmaco_031` — question de pharmacologie signalée par l'audit pour référence visuelle. Elle figure aussi dans l'exception explicite de `keepQuestion` dans `sw.js`. **À vérifier :** texte/visuel réellement chargé sur téléphone, présence de la planche, et justification pédagogique de l'exception ; conserver cette entrée en attente plutôt que de la filtrer automatiquement.

### Relecture de fond (P1)

- **289 explications courtes** et **108 formulations dépendantes du support** : prioriser les cours concernés à l'aide du rapport QCM, confronter chaque item au support officiel, puis préparer la correction QCM / PDF / flashcard sur une branche pédagogique distincte.
- **378 QCM bruts avec quatre bonnes réponses** : localiser les originaux, vérifier les cinq propositions avec la source officielle et approuver les remplacements avant de supprimer la normalisation de compatibilité. Aucune correction automatique des bonnes réponses.
- **Six cours sans QCM actif** et **deux sans fiche propre** : vérifier si les cours ont été effectivement dispensés et la pertinence pédagogique de chaque livrable. La présence de documents Drive ne garantit pas leur statut officiel.
- **Douze pointeurs de source officiels non renseignés** et **37 fiches dont le statut est non qualifié** : rapprocher les fichiers avec les métadonnées Drive et le registre de revue privé ; ne renseigner `officialSupport` qu'après preuve de provenance.

**Décision de revue :** corrections médicales et modifications de ressources = **NON APPROUVÉES**. Cette PR est uniquement un garde-fou technique. Chaque lot pédagogique exige revue privée, validation du contenu et GO publication distinct.

### Relecture croisée du lot Épistémologie A1 partie 03 (18/10)

- Le support de CM3 de l'enseignante a été retrouvé et le PDF de QCM complémentaire a été comparé à la banque `qextra-12.txt`. Le **QCM complémentaire** ne remplace pas à lui seul le support de cours pour la validation du fond.
- `v820_a1p3_019` : le corrigé du QCM complémentaire confirme la réponse « concepts » pour la métaphore « briques et ciment ». Proposer une formulation **autonome, sans image indispensable** ; **ne pas changer le corrigé ni les options sans validation**.
- La banque brute `qextra-12.txt` comporte **8 fragments de titres ou pieds de page PDF** dans l'A1 partie 03 : `v820_a1p3_005`, `012`, `014`, `018`, `022`, `024`, `028`, `030`. Il s'agit d'anomalies d'importation et non de faits médicaux ; les textes originaux et les éventuels PDF QCM doivent être synchronisés avant leur correction.
- Cette même partie contient **trois QCM bruts avec quatre bonnes réponses** : `v820_a1p3_001`, `003`, `028`. Ne pas déduire de la normalisation du runtime qu'une correction des quatre choix d'origine a été validée.
- Le QCM d'entraînement complémentaire de pharmacologie comporte un item 31 sur l'acronyme ADME avec quatre choix corrects déclarés. Il faut encore **rapprocher formellement cet item de l'identifiant runtime `pharmaco_031`** : le numéro seul n'est pas une preuve d'identité. Les contenus de pharmacologie en Drive comprennent aussi des matériaux issus de notes et transcriptions ; **ne pas traiter cette synthèse comme support officiel vérifié**.
- **Action proposée pour validation séparée** : nettoyer d'abord les résidus d'extraction ; rendre les énoncés autonomes ; vérifier la grille des réponses contre le véritable support de cours ; synchroniser PDF, JSON, flashcards, score et corrigé avant tout GO publication.

## File de revue pédagogique privée — hors de cette PR

**Priorité 1.** Réviser les 289 explications courtes et les 108 formulations dépendantes du cours, puis comparer PDF et banque applicative. Revoir le ou les items qui demandent réellement une illustration absente et les 378 QCM bruts à quatre bonnes réponses. Les réponses, options et corrections nécessitent vérification sur le support officiel, validation humaine et éventuel nouveau GO publication.

**Priorité 2.** Vérifier cours par cours les six banques manquantes, les deux fiches absentes, les douze liens de source non renseignés et les 37 métadonnées non qualifiées. Ne pas attribuer un support officiel à partir de son seul nom ou d'une capture.

**Reporté à une release approuvée :** retirer la mention « VERSION TEST » de l'interface si elle n'a plus lieu d'être, en synchronisant la version de l'application, le cache PWA et le changelog. Aucun changement visuel ou cache ne fait partie de la PR de contrôle.

## Publication

La création de la branche et de la PR n'autorise ni fusion ni déploiement. Pour un changement pédagogique, suivre `AGENTS.md` et `docs/PUBLICATION_APPROVAL.md` : revue privée du lot, autorisation explicite de publication, TNR et vérification de la copie réellement publiée.
