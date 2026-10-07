# Hygiène du dépôt

Ce document décrit les éléments conservés volontairement hors du runtime actif.

## Archives

- `archive/qextra-08-legacy-calculs.txt` : ancienne banque de 256 QCM de calculs de doses/mathématiques ajoutée le 3 octobre 2026. Elle n'est pas chargée par le Service Worker et reste archivée tant qu'une comparaison complète avec les banques calculs actives n'a pas confirmé qu'elle peut être supprimée.
- `docs/archive/resource-audit-v88.json` : snapshot historique de l'audit ressources V8.8. Il n'est pas utilisé par l'application courante.

## Ressources supprimées

Les anciens fichiers `schema-resp003.svg`, `schema-resp013.svg` et `schema-resp015.svg` ont été supprimés. Le runtime utilise les visuels respiratoires officiels et le TNR interdit déjà la réactivation de ces SVG simplifiés.

## Règles

- Une banque QCM inactive ne doit pas rester à la racine sous un nom `qextra-XX.txt`.
- Toute archive conservée doit être documentée ici.
- Aucun secret, jeton, fichier `.env`, clé privée ou credential ne doit être versionné.
- Les releases doivent passer par une branche courte et une pull request ; `main` doit rester déployable.
