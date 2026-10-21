# Plaies et pansements P1 — consolidation V4.2, sans activation

**État : en revue uniquement.** Ce dossier ne change pas l'application ni les documents étudiants : `qextra-50.txt`, `course-registry-v741.json`, `docs/course-deliveries.json`, `build-meta.json`, `sw.js`, `index.html` et les PDF de Drive restent inchangés.

## Sources déjà présentes

- [PR #171](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/171) et [PR #174](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/174) : deux anciennes variantes de livraison V8.30.105, désormais en conflit avec `main` V8.30.112.
- Les deux contiennent **la même banque `qextra-50.txt`**, Git blob SHA `de31dc5abe8e3e5aae191c9ba6039b2b731ec9f6`. Elle a été copiée sans modification vers `qextra-50.json` **en zone candidate inactive**.
- La banque active de la version examinée de `main` était `ada38ebfd4d627eeb918b75193c9c17ee280d1d4`. Ne jamais écraser le fichier actif lors de cette revue.

## Contrôles comparatifs

Sur le contenu exact de la banque candidate : **50 questions, 250 propositions, 86 textes de bonnes réponses et 40 flashcards**. Les IDs et les bonnes réponses *en texte* sont inchangés ; les indices numériques suivent l'ordre des choix. **43 questions** ont au moins un changement de choix, formulation ou explication ; les libellés des questions #20, #21 et #47 ont été ajustés. Ce contrôle n'est **pas** une revue clinique indépendante des nouveaux distracteurs.

Test reproductible : `node tests/plaies-v42-reconciliation.mjs`.

## Quatre PDF Drive et seulement deux contenus différents

Les fichiers ont été téléchargés depuis Drive et leurs **octets** contrôlés le 21/10/2026. Ils sont tous dans le dossier 03 - QCM, avec une permission `anyone:reader` au moment du contrôle. **Les deux paires de copies sont strictement identiques en SHA-256**, malgré des IDs différents :

| Rôle | ID canonique candidat (#174) | ID alternatif (#171) | SHA-256 vérifié |
| --- | --- | --- | --- |
| QCM (12 pages, 96 220 octets) | `1Tc1Lry4cQVDXzW2-YmkXw_MW2WfekXI5` | `1kXsQcaTa2vKKYtMk4Cqms6DTQOApvAdw` | `2089e3f2a7c4f5bbffa06d8624a0cc3e0d8b61b15f2f0251a31f3930aad76571` |
| Corrigé (11 pages, 96 139 octets) | `1-RkE3yi1qEGctKc9mStTNGg-JxYcz18o` | `14XhFreMjuBsSpKrdjZ4KecWea8WzgNL8` | `61f0407301f27e0b724e892c43f084429071fb63dd1621b85f0b1f51058fa1f1` |

Les PDF étudiants étaient déjà accessibles via Drive ; **aucune permission n'a été changée**. Ne pas supprimer, déplacer ni archiver une des copies à ce stade. La décision de retenir les deux IDs canoniques de #174 est **proposée**, pas appliquée au registre.

## Anomalies qui empêchent de fusionner les anciennes branches

1. **#174** emploie un `publicationApproval.bundleSha256` fictif composé de 64 `f` : refuser.
2. **#171** contient plusieurs IDs PDF, parfois différents entre le manifeste et le registre, malgré des contenus PDF égaux : choisir un ID par rôle et synchroniser les déclarations.
3. Les deux branches régressent `build-meta.json` de V8.30.112 vers V8.30.105 et effaceraient des fonctionnalités récentes : **ne jamais merger leurs changements release/PWA/cache tels quels**.
4. L'ancien `publicationApproval` du cours et le registre sont inclus dans l'empreinte globale. **Réutiliser l'ancienne date/empreinte de validation pour un nouveau bundle serait incorrect**, même si les octets des PDF n'ont pas changé.
5. Le GO publication rapporté dans #174 concerne les documents V4.2 exacts ; il ne démontre pas à lui seul que le nouveau bundle reconstruit sur V8.30.112 est autorisé.

## Transition vers la prochaine PR de publication

1. Rebaser la **banque candidate exacte** en fichier actif `qextra-50.txt`, en préservant ses IDs et son contenu ; conserver les 50 cours et toute la version courante.
2. Mettre à jour uniquement les champs QCM du cours dans le registre et le manifeste avec les **IDs PDF canoniques** ; ajouter la preuve SHA-256 des deux fichiers sans recopier les preuves privées dans GitHub.
3. Construire le *vrai* `bundleSha256` à partir du lot qui sera livré. **Ne pas** renseigner `publicationApproval.status: approved` ni modifier `approvedAt` avant une autorisation explicite portant sur ce nouveau lot exact.
4. Vérifier réponse, score, corrigé, mode Erreurs, stats et flashcards ; confronter au PDF et à l'original du cours. Faire une revue pédagogique des distracteurs, notamment Q18-E et Q20/Q21/Q47.
5. Lancer TNR et audit P2, corriger les éventuelles régressions, puis proposer un **GO publication distinct**. Après celui-ci seulement : intégration autorisée, contrôle Drive de la paire choisie, version/PWA, fusion et vérification du déploiement.
6. Une fois l'intégration confirmée, rapprocher et clôturer **alors seulement** les PR #171 et #174. Ne pas créer de nouveau doublon Drive.

## Limites des tests automatisés

Le test de consolidation vérifie le contenu textuel des bonnes réponses, les IDs, les flashcards et la provenance exacte de la candidate. Les vérifications de SHA-256 PDF proviennent de téléchargements authentifiés effectués lors de cet audit ; GitHub Actions n'accède pas automatiquement à ces PDF, ne vérifie pas leur exactitude clinique et ne peut prouver le consentement du propriétaire.

Suivi transversal : [issue #188](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/issues/188).
