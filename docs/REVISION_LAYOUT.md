# Composition adaptative des nouvelles fiches IFSI ABC

Objectif : réduire les pages inutilement vides **sans jamais rendre les infographies illisibles**. Le contrôle de contenu médical et la fidélité au support officiel restent distincts.

## Deux outils complémentaires

- `tools/revision_compose.py` : compose un PDF **nouveau** à partir de sections pédagogiques et de figures originales déjà validées, sans supprimer de paragraphes. Une illustration horizontalement lisible reste dans sa section ; une grande planche verticale peut avoir une page dédiée. Une figure ne descend jamais sous sa largeur pédagogique minimale, ni sous 110 DPI au rendu PDF.
- `tools/revision_layout_gate.py` : mesure les zones blanches des pages texte et distingue les pages portant une grande infographie. Signale les pages sous-utilisées, sans déclarer une planche médicale fausse ou bloquer une page dédiée justifiée.

Le compositeur n'est **pas** un outil permettant de reprendre un ancien PDF fermé et de réorganiser son contenu tout seul. Ne pas l'utiliser si les données structurées ne décrivent pas fidèlement le cours (tableaux, formules, listes complexes, schémas spécifiques). Dans ce cas, conserver le générateur complet en usage et appliquer le contrôleur de mise en page, puis modifier la source avant un nouvel export. Il ne faut JAMAIS perdre une donnée pour économiser une page.

## Commandes de travail privé

```bash
python -m pip install pymupdf==1.26.7 reportlab==4.4.9 Pillow
python tools/revision_compose.py \
  --content /chemin/prive/fiche-structuree.json \
  --assets-root /chemin/prive/figures \
  --output /chemin/prive/fiche-comptee.pdf

python tools/revision_layout_gate.py \
  --pdf /chemin/prive/fiche-comptee.pdf \
  --report /chemin/prive/audit-composition.json
```

Exemple de source simplifiée, à réserver aux fiches qui n'ont pas de tableaux/formules complexes :

```json
{
  "title": "Fiche de révision - cours fictif",
  "sections": [
    {
      "heading": "Fonctionnement d'un organe",
      "paragraphs": [
        "Description complète et vérifiée du mécanisme.",
        "Explication du rôle de chaque structure."
      ],
      "figure": {
        "path": "figure_01.png",
        "caption": "Circuit anatomique original",
        "min_width_pt": 420,
        "mode": "auto"
      }
    }
  ]
}
```

`mode: auto` permet une figure dans le flux si lisible. `mode: dedicated` réserve une page à une planche complexe. `min_width_pt` ne doit pas être diminué pour faire entrer artificiellement une planche. Le compositeur refuse les figures très allongées : scinder et revalider la planche, sans inventer des annotations.

## Critère de contrôle avant revue privée

1. Inventorier les schémas attendus depuis le support officiel ; choisir `auto` ou `dedicated` sur la base de la lisibilité des légendes.
2. Générer la fiche **entière**, avec tous les textes, tableaux, et formules indispensables, via un moteur compatible avec sa complexité.
3. Exécuter le contrôleur de composition. Réduire les blancs inutiles en modifiant la source et la pagination, mais autoriser un espace restant lorsqu'une grande figure ne peut pas tenir dans la section sans devenir illisible.
4. Rendre les pages en images et inspecter les textes, les images, les légendes coupées et les limites d'appareillage. Exécuter le garde-fou existant `tools/pdf_visual_gate.py` sur la matrice des schémas et la revue médicale indépendante.
5. Présenter le **package complet en revue privée** et attendre le GO publication avant toute ressource étudiante ou changement pédagogique public.

## Constats du pilote Stomatothérapie (13 octobre 2026)

Fiche réelle de 19 pages, 7 pages de grandes illustrations (non incluses dans GitHub). L'outil signale 9 pages de texte sous-utilisées, dont 7 immédiatement suivies d'une planche médicale plein format : il est dangereux d'en déduire qu'on peut réduire de force les illustrations. Les deux autres peuvent justifier une réorganisation des paragraphes. Ceci est un **audit**, pas une correction de la fiche publiée.

## Limites

Les tests CI génèrent exclusivement des documents fictifs. Les fichiers officiels, captures, sources privées et rapports détaillés ne doivent jamais être ajoutés au dépôt public. L'installation privée `$ifsi-abc-course` sur le PC n'a **pas été modifiée** par cette PR : son adoption de ce nouveau contrôle doit être vérifiée lors de l'essai réel en mode Work.

Le rapport de mise en page est un contrôle de densité, pas une mesure de vérité médicale ni de qualité didactique automatique. Le déclencheur de publication reste la validation du package par le propriétaire.
