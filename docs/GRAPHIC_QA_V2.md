> Priorité 26/10/2026 : appliquer aussi [le contrat de trame V3](PDF_TEMPLATE_CONTRACT_V3.md), références figées et revue liée aux octets. Les contrôles historiques ci-dessous restent obligatoires.

# IFSI ABC — Contrôle graphique des nouvelles fiches écrites V2

## Finalité et priorité
Le standard de production reste **écrit V5.3**, tel que décrit dans `docs/WRITTEN_REVISION_V153.md`. V2 renforce la **vérification du PDF réel** et ne réintroduit ni image générée ni seconde fiche. Préserver les anciens cours et les contrôles publiés.

La CI n'a pas le droit de fabriquer une approbation humaine, ni de conclure à l'exactitude scientifique par un simple contrôle de pages. Les revues graphique et pédagogique sont distinctes.

## Conformité mesurée dans les octets du PDF
`python tools/pdf-graphics-v2.py <fichier.pdf> --kind revision|qcm|flashcards --report <rapport_prive.json>`

Le test lit le PDF via PyMuPDF et inspecte chaque page :
- taille A4 réelle ; bandeaux **violets haut et bas** dessinés sur la page ;
- présence de texte sélectionnable, absence d'images matricielles dans les nouvelles fiches écrites ;
- blocs de texte dans les marges ; tailles de corps non inférieures à la limite mesurable ;
- absence de certaines marques internes de production dans les documents étudiants ;
- fiche écrite : rubrique unique **Pièges QCM → Synthèse générale → Définitions et mots-clés** ;
- QCM : les cases **dessinées à gauche** des libellés A–E et un ensemble de corrigés à la fin ;
- rapport détaillé par page et code d'anomalie (aucune case « PASS » auto-déclarée ne vaut preuve).

**Limite explicite** : la géométrie, les couleurs et le texte extrait ne prouvent pas à eux seuls la qualité esthétique, l'équilibre des blancs, la pertinence des tableaux ni la justesse de la terminologie médicale. Toute page doit toujours être **rendue et examinée visuellement**, et les références médicales vérifiées sur les sources reçues.

## Passage de la CI
- `python tests/pdf-graphics-v2-test.py` : fichiers PDF *fictifs* avec défauts injectés (bandeau absent, taille de police, débordement, mauvaise pagination, mauvaises sections, absence de case QCM).
- `python tools/pdf-graphics-v2-batch.py --base <SHA>` : contrôle des PDF **réellement nouveaux ou modifiés** pour les lots écrits dans le manifeste de publication. Les PDF historiques inchangés ne sont pas migrés.
- Le préflight `tools/course-preflight.mjs` exécute la validation V2 dans ses étapes préparation et publication. Les TNR complets restent bloquants : aucune suppression, aucun `continue-on-error` ni modification opportuniste des attendus.

Quand un nouveau PDF privé n'est pas présent dans la CI publique, exécuter le test graphique **dans l'espace privé de production**, conserver le rapport auprès de l'original, puis confronter toutes ses pages rendues au modèle V5.3. Le résultat de ce contrôle privé ne se substitue pas au GO étudiant.

## Contrôle en situation réelle — D1.1 Bientraitance
Le premier pilote V2 est **La bientraitance, de quoi parle-t-on ?**, issu du dossier privé « À traiter ». Source récupérée : une transcription orale de la séance (environ 1 h 13). Le support officiel écrit et les séquences vidéo analysées à l'oral ne figurent pas dans le dossier reçu.

Le PDF pilote **12 pages** est placé dans le dossier de cours privé. Il n'est pas copié dans `assets/`, ni déclaré dans les catalogues étudiants. Les questions et flashcards ne sont pas fabriquées pour simuler un lot complet.

**Réserves de revue pédagogique** : la transcription formule une distinction *care/cure* ambiguë ; elle ne doit pas être « corrigée » silencieusement ni présentée comme une définition validée. La datation historique évoquée oralement sans vérification externe n'est pas inscrite comme fait établi. Les mises en scène vidéo sont rapportées comme commentaires oraux, jamais comme des images effectivement inspectées.

## Porte de validation
1. Sources réellement reçues et matrice notions ↔ segments.
2. PDF V5.3 généré à partir d'un modèle commun, texte vérifiable et rendu de toutes les pages.
3. QA graphique V2 **sur l'artefact exact** + revue pédagogique et visuelle.
4. Révision QCM, flashcards et vocaux si produits ; cohérence avec les PDF et la banque canonique.
5. Préflight groupé, puis tous les TNR historiques.
6. GO explicite pour diffusion **et** fusion ; comparaison des SHA-256, vérification Pages.
7. Après disponibilité étudiante vérifiée seulement, archivage sans suppression du cours « À traiter ».

Si le PDF change après accord, réexécuter les contrôles et renouveler la revue visuelle sur les nouveaux octets.
