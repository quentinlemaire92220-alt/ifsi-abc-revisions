# Skill IFSI ABC — relais ChatGPT classique ↔ Work (v1.0)

**Date : 20/10/2026 · Statut : protocole d'orchestration des supports.**
Ce document complète les contrats existants de création, de contrôle et de publication ; il n'est ni une charte graphique ni une autorisation générale de publication. Les références pédagogiques détaillées restent dans le référentiel Drive privé.

## 1. Responsabilités

| Étape | Pilote | Résultat vérifiable |
| --- | --- | --- |
| Audit d'entrée | ChatGPT classique ; Work si aucun audit exploitable n'est fourni | UE, semestre, partie, `courseId`, sources et provenance ; inventaire des ressources déjà présentes |
| Cadrage / demandes ciblées | ChatGPT classique | Delta : conserver, corriger, produire, archiver, en attente |
| Production et réparation | Work | Fichiers et deux PDF distincts ; QCM, flashcards, vocabulaire, scripts, figures, cas cliniques selon le cours |
| Contrôle technique et médico-graphique préparatoire | Work | Matrice de couverture, rendu/inspection des PDF réels, cohérence QCM, identifiants, TNR |
| Revue et arbitrage humain | ChatGPT classique + propriétaire | Liens de revue **privés**, écarts et acceptation explicite du périmètre |
| Classement Drive volumineux et intégration | Work, **après autorisation de publication** | Dossiers/doublons/archives, manifests, PR/CI et liens publics vérifiés |
| Suivi final | ChatGPT classique | Synthèse des ressources publiées, des MP3 en attente, des anomalies et des prochaines actions |

Le traitement de quelques fichiers et les audits Drive peuvent rester dans ChatGPT classique. Work assure la génération, les modifications importantes et le classement en masse. Si un audit classique frais et sourcé existe, Work le réutilise après vérification, sans répéter inutilement la lecture entière.

## 2. Contrat d'entrée pour chaque cours

Renseigner : `UE`, `semestre`, `courseId`, `partId` le cas échéant, statut des sources (officiel/provisoire), plan du cours, inventaire Drive/application, ressources déjà validées, liste des manquants/corrections, référence visuelle validée, points sensibles et éventuel GO production.

- Une mise à jour du support officiel déclenche **un rapprochement**, pas une régénération par défaut.
- Préserver les versions validées ; ne changer que les éléments justifiés. Conserver un avant/après pour les corrections visibles.
- Ne pas divulguer les transcriptions privées, les liens de revue, la matrice de traçabilité détaillée ni les pièces non autorisées dans ce dépôt public.
- Une demande Pathologies applique aussi `docs/skills/production-pathologies-infographies-cliniques.md` ; les planches anatomiques appliquent `docs/skills/production-planches-anatomiques-svg.md`.

## 3. Contrat de production par Work

Appliquer `docs/skills/production-fiches-revision-infographies-originales.md` et le standard courant. La fiche classique garde ses explications exhaustives et intègre des infographies pédagogiques originales : modèle **Système nerveux**, complété par le pilote **Système urinaire** validé le 20/10/2026. Le PDF complet infographié est un second fichier autonome ; ses règles visuelles spécifiques ne s'appliquent pas par défaut à la fiche classique. Une image, un guide ou un bandeau ne remplacent pas les notions écrites.

Les QCM destinés à l'application suivent le contrat **5 choix A–E et 1 à 3 réponses correctes** jusqu'à évolution explicite du moteur et des TNR. Réutiliser une vérité unique pour affichage, grille, corrigé, score, mode Erreurs, statistiques et flashcards liées. Le contenu doit être fidèle au support officiel, sans invention médicale et sans contradiction clinique non résolue.

Contrôler chaque PDF final après intégration des visuels : pages réelles, textes, repères, proportions, flèches, cadrage, lisibilité et exactitude médicale. Un contrôle automatisé réussi ne vaut pas validation visuelle ni scientifique.

## 4. Classement et sortie privée

Ranger selon le contrat `docs/COURSE_DELIVERY.md` et les neuf dossiers 01–08 et 99 ; ne pas créer de doublons de dossiers ou fichiers ; versions remplacées vers les archives **au stade autorisé**. Les scripts TXT et les MP3 doivent être distingués ; un MP3 absent reste « en attente ». Les sources PLAUD et les données de suivi privées ne sont jamais copiées dans le Drive étudiant ni dans GitHub public.

À la fin d'un cycle de production, transmettre au contrôleur :
1. identité du cours et état de la source officielle ;
2. ressources inchangées / nouvelles / corrigées, avec versions et empreintes lorsqu'elles existent ;
3. liens réellement ouvrables de **revue privée** et tableaux de couverture ;
4. contrôles PDF, vérification QCM, CI/TNR effectués ou explicitement non exécutés ;
5. préparation Drive/app, branche et PR éventuelle, sans fusion ;
6. anomalies et arbitrages encore ouverts, MP3 non reçus ;
7. statut **DRAFT_REVIEW_ONLY**, jusqu'au GO publication explicite.

## 5. Deux portes de validation

**GO production** : permet la préparation, le travail privé et les contrôles. Il ne permet pas la publication étudiante, les merges ou les déploiements.

**GO publication** : autorisation distincte, datée et limitée au package effectivement revu et approuvé ; suivre `docs/PUBLICATION_APPROVAL.md`. Toute modification postérieure invalide l'accord pour l'élément modifié. Ne jamais extrapoler un GO reçu pour un cours à d'autres cours.

**Ne jamais publier d'informations pédagogiques privées dans une PR.** Une PR contenant exclusivement ce protocole technique ne constitue ni livraison ni publication d'un cours.
