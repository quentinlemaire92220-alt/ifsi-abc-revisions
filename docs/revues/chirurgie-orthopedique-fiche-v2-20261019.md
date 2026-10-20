# Reprise de la fiche de révision — Chirurgie orthopédique

**État au 20/10/2026 : V5 en revue privée, NON PUBLIÉE.**

## Source scientifique, modèle et règles

- **Cours officiel** : Dr V. Molina, « Traitement chirurgical de l’arthrose » (44 diapositives, UE S1 B1).
- **Compléments oraux** : ancienne fiche provisoire issue de notes/transcription ; ils restent distingués du contenu des diapositives, sans publication de transcription.
- **Modèle graphique** : fiche validée « Système nerveux », et non captures du support de cours.
- **Protocole unique** : `docs/skills/production-fiches-revision-infographies-originales.md`. Les figures officielles sont utilisées pour **vérifier les notions**, jamais copiées dans la fiche. Les dessins créés restent des illustrations pédagogiques originales, non à l’échelle.

## Livrable de référence à relire : V5 (20/10/2026)

Nom : `UE_S1_B1_Chirurgie_Orthopedique_Fiche_Revision_V5_20261020_A_VALIDER.pdf`.

Stockage : dossier **99 - Maquettes à valider**, sur le Drive pédagogique privé. Aucun lien Drive privé n’est publié sur GitHub. Le statut reste à valider et le PDF étudiant préexistant n'est pas remplacé.

- **11 pages A4** et **11 illustrations raster distinctes** réparties dans 5 ensembles anatomiques (hanche/PTH ; genou/PTG ; disque-racine ; cruralgie-sciatique ; techniques chirurgicales du rachis).
- Diagrammes originaux supplémentaires, réalisés en mise en page vectorielle : chemin décisionnel d’indication, consultations avant PTH, étapes de PTG, séquence d’alerte neurologique. **Chaque dessin scientifique n’est utilisé qu'une seule fois.**
- Plus de doublons PTH/PTG ou de sections artificiellement répétées : la maquette V4 comportait 16 pages et plusieurs reprises du même visuel.
- Ordre scientifique : indications d’arthrose ; coxarthrose/PTH ; parcours et surveillance ; gonarthrose/PTG ; gestes et rééducation ; rachis et radiculalgies ; chirurgie vertébrale ; urgence postopératoire ; compléments oraux séparés ; lexique et questions flash.
- Référence originale associée à chaque illustration ; **aucune photo, radiographie, figure, ni capture du support Dr Molina intégrée**.

## Contrôles indépendants réalisés

- Source professorale : 44 pages PDF, 38 images sources distinctes ; maquette : 11 images intégrées toutes **uniques** et **0 hash d’image identique à celles du PDF officiel**.
- Le PDF final comporte 11 pages, du texte sélectionnable et les sources par chapitre, ainsi que l'encart « maquette à valider » sur chaque page.
- Copie du PDF **retéléchargée depuis Drive** comparée à la copie locale : **même SHA-256**, texte et pixels identiques sur chacune des 11 pages.
- SHA-256 du PDF reçu de Drive : `4cda4c9ca0f22baecd4e4315199db3ba257d8c720ecd1ec0ce6239de5c55bc64`.
- **Contrôle pédagogique à valider explicitement** : exactitude des repères anatomiques dessinés et compléments oraux de la page 10. Un test d'image identique ne vaut pas certification clinique.

## Points scientifiques gardés cohérents

- Indication après échec des traitements médicaux et gêne fonctionnelle.
- PTH : tête fémorale/acétabulum, vie indicative 15–20 ans ; risques hématome, infection, luxation, TVP/EP ; suivi et surveillance clinique/biologique.
- PTG : risques, hospitalisation indicative 2–3 jours sans complication, lever avec appui dès J0 et importance de la rééducation.
- Rachis : NCB C5/C6, cruralgie L3/L4, sciatique L5/S1, laminectomie/ostéosynthèse/prothèse discale.
- Après laminectomie : tableau d’hématome compressif neurologique et **appel urgent du chirurgien**.
- Aucun corrigé d’enseignant inventé pour les trois questions d'entraînement sans grille de réponses.

## Versions et publication

| Version | État | Motif |
| --- | --- | --- |
| Fiche provisoire initiale | **Conservée dans l’application** | Aucune approbation de remplacement |
| V2 et V3 | Refusées | Copies de figures du cours officiel |
| V4 | Obsolète | Répétitions de visuels et densité pédagogique insuffisante |
| **V5** | **Seule candidate à la validation** | Visuels originaux dédupliqués et contrôle PDF/Drive réussi |

**Contrat de non-régression** : aucun changement des QCM, flashcards, scores, `sheets-2.json` ou des ressources étudiants. La PR doit rester **en brouillon**, sans fusion, jusqu'à validation visuelle et pédagogique puis **GO publication** distinct. Tout changement après validation exige une nouvelle vérification du lot.
