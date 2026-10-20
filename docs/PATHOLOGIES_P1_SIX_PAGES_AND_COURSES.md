# Pathologies P1 — affichage des six planches maître et liens directs vers les cours

**Statut : préparation de l'intégration uniquement. Pas de catalogue publié, pas d'onglet étudiant activé.**

## Affichage fidèle à la validation graphique

La BPCO, l'HTA et le diabète de type 2 restent liés à la **maquette originale à six grandes planches** validée le 20/10/2026. Une série de dix simples blocs textuels ou de schémas vectoriels simplifiés ne remplace pas ces planches.

À l'ouverture future d'une pathologie approuvée, le mode « Fiche » donne accès à **une planche pleine largeur à la fois**, avec « Précédente / Suivante », numéro de page et texte alternatif. Les dix rubriques de définitions et d'explications cliniques restent disponibles dans la section dépliable « Approfondir ». Les autres onglets QCM, Flashcards et Cas cliniques ne sont pas modifiés.

## Métadonnées nouvelles — `posterPages` obligatoire pour P1

Pour chaque pathologie identifiée par `bpco`, `hta` ou `dt2`, déclarer **exactement six** objets `posterPages` ordonnés de 1 à 6 :

```text
posterPages: [
 {id, number:1..6, title, alt, url:"https://...",
  sha256:"64 hex", kind:"original_infographic",
  sourceIds:["identifiant_source_existant"],
  graphicalReview:"approved", medicalReview:"approved"},
 ... 6 objets
]
```

Les valeurs ci-dessus sont un **contrat technique illustratif**, pas un lot réellement approuvé. Aucun fichier graphique, contenu clinique, lien privé ou approbation médicale n'est ajouté dans cette PR.

Le contrôle refuse les pages absentes, dupliquées, hors ordre, sans URL HTTPS, sans SHA-256, sans sources rattachées ou sans la double validation graphique/médicale **réellement justifiée par la revue du fichier exact**. Les autres obligations du moteur et de la charte restent applicables. Les PDF et planches doivent être inspectés visuellement ; le fait de remplir ces champs ne prouve pas à lui seul qu'une validation scientifique a été menée.

## Navigation corrigée

Les `courseIds` sont des IDs du registre IFSI ABC, pas des IDs de planches anatomiques :
- `bpco` → `systeme_respiratoire` → cours « Système respiratoire » ;
- `hta` → `systeme_cardiovasculaire` → cours « Système cardiovasculaire » ;
- `dt2` → `systeme_endocrinien` → cours « Système endocrinien ».

Le bouton utilise `IFSI_V82.openSystem(courseId)` lorsqu'il est disponible, qui appelle le parcours des cours. Sinon, `IFSI_V741.getRegistry()` et `openCourse74(label)` sont utilisés. **Ne plus appeler `showSystemBoards`**, réservé à l'Anatomie.

## Validation de cette étape

- `node tests/pathologies-p1-poster-pages.mjs` : fixtures fictives, six planches, sources, sécurité des URL, double revue et correspondance des liens.
- CI TNR complète, y compris les tests d'absence de catalogue et de refus des brouillons.
- Aucun appel de `IFSI_PATHOLOGIES_BOOT.start()` avec un catalogue réel : l'onglet reste masqué en production.

**Prochaine étape distincte :** compléter les dix rubriques, numériser les six planches **originales** sans simplification, vérifier l'empreinte des octets, relecture médicale approfondie des 156 items d'entraînement, validation du lot exact, puis GO publication explicite.
