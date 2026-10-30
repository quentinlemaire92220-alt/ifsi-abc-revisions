# UE B1.1 — Les organes des sens : préparation de publication sans vocaux

**État : prépublication, brouillon uniquement.** Ce dossier ne constitue **ni un GO de publication**, ni une acceptation pédagogique/graphique. Il prépare une livraison par PR distincte, sans produire ni diffuser de MP3.

## Dépendance et source de vérité

- Source canonique : PR #275, branche `prep/b11-organes-sens-20261030`, commit observé `332f0c0fc7c3c69dfaa0a0be5e3a8945ac553640`.
- Inventaire : 50 QCM (250 propositions, 1–3 bonnes réponses annoncées par question), 50 flashcards, 59 définitions, 7 planches, fiche écrite de 17 pages.
- Cette branche de prépublication **ne copie pas les banques** tant que #275 n'a pas été intégrée/rebasée : règle de source unique.
- Source officielle et transcription : **conservées hors dépôt**. Ne pas les ajouter au dépôt, dans une issue, ni dans la description des PR.

## Fichiers candidats (hors dépôt GitHub, non servis par l'application)

| Ressource | Pages | SHA-256 exact |
| --- | ---: | --- |
| Fiche écrite V2 | 17 | `f16adf8cbb1a9415446f38eadb849da137e9119ec1504912347b25c0f275563d` |
| QCM corrigés V5 | 24 | `401e59115979cc98fa30c3b1403da4faae8a02efb6726bc7640688a72efca7a4` |
| Planches V7 | 7 | `23946b279755a25f468e1e6fc7843888a453985e60940587850daefff9e9a928` |

Les contrôles techniques PDF réalisés lors de la préparation ont réussi, **mais ces octets ne sont pas encore présents dans la branche**. La CI de cette PR ne prétend pas vérifier leur rendu ou leur SHA par téléchargement.

## Périmètre autorisé à préparer

Fiche écrite, PDF QCM, banque interactive de 50 QCM, 50 flashcards, 59 définitions, 7 planches anatomiques. **Sans vocaux** : 0 MP3, pas de liens audio ni de ressources « vocal » fictives ; trois scripts restent en préparation privée.

Le « oui » du 30/10/2026 autorise la **préparation** de ce périmètre sans attendre les MP3 ; il **ne valide pas** l'exactitude médicale, le graphisme final, ni une publication immédiatement accessible aux étudiants.

## Passage en publication — étapes bloquantes

1. Achever la revue scientifique du support de 56 diapositives et de la transcription (environ 113 minutes), puis des 50 QCM, 50 cartes, 59 termes et 7 schémas. Consigner les réserves et leur levée sans inventer d'avis expert.
2. Comparer la fiche et le QCM **page par page à 100 % et 200 %** aux modèles figés Communication, puis inspecter chaque planche anatomique. Obtenir une acceptation explicite du propriétaire sur **le lot exact, identifié par SHA-256**.
3. Rapprocher la branche publication avec la PR #275, garder une source canonique ; ajouter les fichiers PDF binaires et comparer leurs empreintes avant toute déclaration dans le manifeste public.
4. Construire les références des ressources de la fiche/QCM/planches et les banques étudiant en respectant les schémas de l'app ; aucune entrée dans `course-registry-v741.json`, `questions-*.json`, `sheets-*.json`, `vocabulaire-v1.json` ou `docs/course-deliveries.json` avant la levée des validations.
5. Transférer le cours hors du registre `preparation` **dans le même changement atomique que l'activation**, faute de quoi `tests/course-preparation-stage.mjs` bloque volontairement toute fuite vers les catalogues étudiants. Ne jamais contourner ce contrôle.
6. Rejouer les préflights préparation/publication, le contrat PDF V3 sur les octets du dépôt, les TNR et l'audit P2 ; seulement après GO explicite de fusion/déploiement, vérifier les URL et octets servis sur GitHub Pages.

## Sécurité actuelle

Le manifeste `docs/publication-candidates/organes_des_sens_b11_sans_vocaux.json` garde `studentActivation=false`, `ownerGraphicAcceptance=false`, `publicationApproval=false` et `mergeAuthorized=false`. Le test `tests/organes-sens-publication-candidate.mjs` vérifie que le cours n'a pas été activé par accident. Il n'est **pas** un certificat de conformité des supports.

**Livraison possible sans MP3, mais pas sans validations et accord de publication.**
