# P3 — Champs de révision complémentaires (pilote technique)

## Objectif

Prévoir une formulation de flashcard différente de la définition lexicale **sans modifier les définitions originales, les QCM ni les identifiants étudiants**.

Un terme de `vocabulaire-v1.json` peut disposer de deux champs **facultatifs** :
- `flashcardFront` : une question autonome à laquelle il faut répondre ;
- `flashcardAnswer` : la réponse correspondante, rédigée et validée.

Ces deux champs sont **indissociables** : si l’un est absent ou vide, la carte conserve automatiquement la question « Que signifie… ? » et la définition d’origine. Le champ `distinction` demeure présent pour les explications. Le module de QCM continue d'utiliser exclusivement `definition` et les choix historiques.

Exemple **fictif** montrant la structure, sans ajout au glossaire publié :

```json
{
  "id": "terme-test",
  "term": "Terme fictif",
  "definition": "Définition de l’exemple.",
  "theme": "Test",
  "courseIds": ["cours-test"],
  "flashcardFront": "Quelle distinction illustre cet exemple fictif ?",
  "flashcardAnswer": "Une réponse fictive cohérente avec la question."
}
```

## Garanties

- Aucune entrée de `vocabulaire-v1.json` n'est modifiée dans cette PR ; **les 18 doublons restent donc inchangés tant que les contenus ne sont pas approuvés**.
- Les identifiants des cartes `voc:<id>`, les associations entre cours, le stockage des progressions, les définitions, l'explication et le comportement par défaut sont conservés.
- Le contrôle `tests/vocabulary-flashcard-prompt-p3.mjs` vérifie les deux modes et les champs incomplets avec une banque fictive. Les TNR existants restent obligatoires.
- Les 18 propositions de reformulation de la PR #147 nécessitent une relecture médicale/pédagogique et le contrôle des sources officielles ; cette infrastructure technique ne constitue pas cette validation.
- Aucune conversion automatique, aucun correctif QCM, aucune fusion ni publication de lot pédagogique n'est autorisée sans GO publication explicite.
