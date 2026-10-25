# IFSI ABC — QA graphique géométrique V2 (pilote, sans publication automatique)

## Portée et hiérarchie

Cette V2 complète **le standard écrit V5.3** de `docs/WRITTEN_REVISION_V153.md`. Elle ne réactive pas les anciennes obligations d'infographies. Pour les nouvelles fiches : texte sélectionnable, fond clair, bandes violettes haut/bas sur chaque page, code couleur pédagogique, tableaux utiles, une seule rubrique « Pièges QCM », puis « Synthèse générale », puis « Définitions et mots-clés » en dernier. Pour les QCM : A–E, une case à cocher **avant** chaque option, questions encadrées, corrigés argumentés regroupés à la fin. Ne modifier aucun ancien cours pour faire passer un test nouveau.

## Trois barrières indépendantes

1. **Génération structurée** : réutiliser le maître V5.3, et non recréer le graphisme au hasard. Aucun PDF généré ne peut être déclaré « graphiquement conforme » sans être relu.
2. **QA automatique sur les véritables octets PDF** : `tools/pdf_graphic_contract_v2.py` lit chaque page avec PyMuPDF ; vérifie bandeaux violets par formes colorées, format A4, texte extractible, taille de police minimale 7,4 pt calibrée sur les modèles approuvés, texte hors page, chevauchement significatif de lignes, absence d'image (format écrit), dernière page du lexique et ordre des rubriques. Pour les pages questions : 5 choix contrôlés indépendamment par le contrat QCM, cases vectorielles à gauche des A–E et traits latéraux de l'encadré de chaque question. Le contrat existant `pdf-bank-coherence.py` reste responsable du texte, des 40 réponses, des 5 options et des corrections, sans dupliquer ces tests.
3. **Revue humaine de la mise en page et du fond** : rendre les **toutes** pages (option `--render-dir` dans le dossier de QA privé), les comparer au maître V5.3 à l'œil, à 100 % puis 200 %, inspecter une éventuelle mauvaise hiérarchie, des espaces vides, un tableau trop chargé, les couleurs, la justesse et la couverture scientifique. Cette appréciation n'est **pas** certifiée automatiquement. L'accord graphique concerne l'empreinte exacte des fichiers relus ; après toute modification du PDF, nouvelle revue.

## Exécution en travail privé avant PR

```sh
python tools/pdf_graphic_contract_v2.py --pdf /chemin/prive/fiche.pdf --role fiche --report /chemin/prive/qa-fiche.json --render-dir /chemin/prive/apercu
python tools/pdf_graphic_contract_v2.py --pdf /chemin/prive/qcm.pdf --role qcm --report /chemin/prive/qa-qcm.json --render-dir /chemin/prive/apercu
python tools/pdf_graphic_contract_v2.py --pdf /chemin/prive/cartes.pdf --role flashcards --report /chemin/prive/qa-flash.json --render-dir /chemin/prive/apercu
python tests/pdf_graphic_contract_v2_test.py
```

Quand le PDF n'est pas accessible en CI (Drive propriétaire privé), exécuter le contrôle localement et conserver ses rapports/rendus **hors GitHub public**. Ne jamais remplacer une preuve physique PDF par un indicateur écrit « PASS ». Tant qu'il n'existe pas de PDF vérifiable, la QA graphique reste **non acquise**.

## CI générique, contrôles ciblés et TNR

`python tools/pdf_graphic_contract_v2.py --all-published` inspecte automatiquement **tous les lots `written_v1` avec `publicArtifacts` accessibles sous `assets/`**, aujourd'hui le pilote D1.1 TD2 (17 + 14 + 7 pages). Ce n'est pas un test limité à un identifiant de cours. Une nouvelle livraison doit déclarer son rôle, son chemin, son nombre de pages et son SHA-256 exact ; en cas de divergence le test échoue. `tools/course-preflight.mjs --stage publication` recueille le résultat `graphic_layout` dans le rapport commun. Le job `tnr` garde toutes les suites historiques et ajoute deux étapes bloquantes : cas synthétiques positifs/négatifs et scan graphique des PDF effectivement versionnés. Le job préflight reste distinct.

### Défauts volontaires du test de mutation

- bandeau supérieur absent ; bandeau inférieur absent ;
- texte de 5 pt ; texte qui déborde de la page ; deux lignes superposées ;
- lexique final absent ; pagination déclarée incorrecte ;
- case QCM absente ; case QCM placée à droite ; encadré de question absent.

Ces mutations doivent **échouer**, tandis que les trois PDF fictifs conformes et le pilote réel doivent **réussir**. Ne pas abaisser les seuils parce qu'un cours réel échoue : étudier d'abord le rendu et la charte.

## Restrictions de preuve

Les PDF graphiquement corrects peuvent avoir de **mauvaises informations médicales**, des omissions, des conseils faux ou une présentation peu ergonomique. Les tests ne démontrent ni l'exactitude scientifique ni la conformité esthétique intégrale au modèle. La validation de couverture source/oral, la revue visuelle humaine, la protection des données privées et le GO distinct de publication/fusion demeurent obligatoires. Cette PR V2 est un **pilote de workflow** ; elle ne publie aucun nouveau cours ni ne modifie les ressources étudiantes existantes.
