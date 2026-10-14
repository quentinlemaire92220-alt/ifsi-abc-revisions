# Autonomie QCM / Flashcards — nouveaux contenus

Ce TNR vérifie les **banques QCM nouvelles ou modifiées** dans les PR : `qextra-*.txt` et `questions-*.json`. Il compare les identifiants et contenus pédagogiques au commit Git de base.

Il refuse les références telles que « selon le TD », « dans le cours », « page 12 du support », « le TD indique… » dans les champs de questions, propositions, explications et flashcards embarquées (rectos, réponses, corrections).

Les références de provenance destinées à la traçabilité sont séparées des éléments publiés. Le contrôle doit utiliser une matrice de sources **privée**, sans transcriptions PLAUD ou liens Drive internes ajoutés au dépôt public.

**Limites importantes :**
- Il recherche des expressions explicites ; la relecture humaine doit vérifier l’autonomie de la question, la pertinence clinique, le sens exact des réponses et les références implicites.
- Les questions historiques inchangées ne sont pas rejetées rétroactivement, pour ne pas bloquer la CI du dépôt. Toute correction d’une banque publiée nécessite la revue privée de l’ensemble des ressources touchées (PDF QCM, JSON, réponses, flashcards) et un nouveau GO publication.
- Un test vert sur une banque n’atteste pas que le PDF du QCM publié est synchronisé ; ce rapprochement reste obligatoire selon le référentiel privé.
- Les documents de TD peuvent servir à préparer un QCM, mais les étudiants ne doivent pas avoir besoin du TD pour répondre.

Tests : `node tests/qcm-autonomy-contract-test.mjs` (scénarios fictifs) et `node tests/qcm-autonomy-changed.mjs` (différentiel, historique Git requis). Les deux sont appelés par `.github/workflows/tnr.yml`.
