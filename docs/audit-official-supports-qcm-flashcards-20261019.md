# Audit de rapprochement — supports officiels du 19 octobre 2026

## Décision
- Trois supports officiels intégrés au Drive et référencés dans le registre applicatif : système cardiovasculaire, chirurgie orthopédique, QCM enseignant rachis/brûlures.
- Banque QCM historique et flashcards dérivées **préservées** : aucune réponse validée ni identifiant de question existant remplacé.
- Le pilote de 10 QCM et 10 flashcards reste **hors publication**, après contrôle contre les banques QCM réellement chargées. La similarité de formulation seule n'est pas suffisante : rapprochement thématique manuel réalisé ci-dessous.
- La fiche chirurgie orthopédique issue de notes/transcription reste **provisoire**. Certaines précisions orales ne sont pas présentes dans le support officiel et nécessitent une validation éditoriale séparée.

## Rapprochement pédagogique du pilote (sous réserve de relecture des réponses)

| Proposition du pilote | QCM existants pertinents | Décision |
|---|---|---|
| Cardio 01 — petite circulation | `cardio_002`, `cardio_003`, `cardio_005` | Déjà traité : pas de doublon |
| Cardio 02 — ondes ECG | `cardio_026` | Déjà traité en partie ; revoir au besoin l'onde T |
| Cardio 03 — débit cardiaque et pression artérielle | 53 QCM cardiovasculaires à comparer au niveau des corrections | Complément possible : vérification ciblée avant intégration |
| Chirurgie 01 — indication PTH et coxarthrose | `v820_chirortho_001`, `v820_chirortho_005` | Déjà traité |
| Chirurgie 02 — surveillance PTH/PTG | `v820_chirortho_017`, `v820_chirortho_018` et QCM postopératoires | Déjà traité en plusieurs questions |
| Chirurgie 03 — cruralgie/sciatique | `v820_chirortho_028`, `v820_chirortho_029` | Déjà traité |
| Chirurgie 04 — hématome après laminectomie | `v820_chirortho_030` | Déjà traité |
| Rachis 01 — courbures | `v820_loco_048` | Déjà traité |
| Rachis 02 — plâtre cruro-pédieux | `v820_trauma_013` | Déjà traité |
| Brûlures 01 — profondeur, étendue, localisation | `v820_brules_004` (âge, surface) | Complément possible : vérifier le recouvrement avec les 38 questions existantes |

Les réponses du document « QCM enseignant — Rachis et brûlures » ne sont **pas accompagnées d'un corrigé officiel** : elles doivent être vérifiées, et ne peuvent pas être présentées comme une grille de réponses professorale validée.

## Contraintes de publication
- Garder les identifiants des QCM/flashcards déjà publiés et leurs scores historiques.
- N'intégrer que les notions absentes après examen des réponses et des cartes effectivement chargées.
- En cas de question corrigée, aligner QCM, score, explication, flashcard et PDF téléchargeable ; ne pas modifier une seule représentation isolée.
- Garder la fiche chirurgie orthopédique historique au statut « provisoire », et son texte d'origine intact tant qu'une fiche recomposée à partir du support officiel et relue n'est pas validée.
- Aucune publication des dix questions du pilote dans `questions-*.json` ou `qextra-*.txt` avant ce contrôle.
