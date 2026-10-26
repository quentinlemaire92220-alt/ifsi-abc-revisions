# IFSI ABC — Préparation avant publication (contrat v1)
**Directive ajoutée le 24 octobre 2026.** Ce contrat complète le standard écrit V5.3, sans modifier les ressources déjà publiées.

## Deux états distincts
**Préparé** : une fiche, un QCM, des flashcards ou un lexique peuvent avoir été composés et vérifiés techniquement sans être approuvés sur le fond. Décrire cette production exclusivement dans `docs/course-preparations.json` et, pour les banques non actives, `data/course-preparations/`. Les PDF, sources officielles, transcriptions et scripts vocaux restent dans l'espace Drive propriétaire privé. Ne pas inscrire ce cours au registre étudiant, à `sheets-*.json`, à `questions-*.json`, à `vocabulaire-v1.json`, à `docs/course-deliveries.json`, ni à `assets/`.

**Publié** : après validation des sources, du contenu, du rendu de toutes les pages, des réponses et cartes, et après un GO distinct autorisant la diffusion ET la fusion, une PR de publication dédiée synchronise toutes les banques actives. Les manifestes et les contrôles publics contiennent alors les preuves pertinentes et les empreintes. Les TNR historiques de publication restent inchangés.

## Règles de sûreté
- TNR de préparation : `node tests/course-preparation-stage.mjs` vérifie 5 choix A–E par QCM, 1 à 3 réponses correctes, explications, cartes, lexique, absence de résidus de PDF et absence totale d'inscription dans les listes étudiantes.
- Ne jamais corriger un test de livraison en forçant `validated=true` ou `oralStatus=complete` sans preuve. Une transcription tronquée est notée `incomplete_tail` ; revue orale exhaustive **non acquise**. Si la source manquante ne peut être récupérée, la réserve doit faire l'objet d'une décision pédagogique explicite, sans en effacer la réalité. Ce contrat ne transforme pas une réserve en validation.
- Aucun MP3 tant que le son réel n'existe pas. Les scripts TXT n'ont pas le même statut.
- L'absence de liens Drive privés sur GitHub n'interdit pas les traces de contrôle dans le registre privé ; le dépôt public n'est pas ce registre.
- Une réussite des TNR de préparation ne vaut ni revue médicale, ni acceptation graphique, ni GO de publication.
- **Nettoyage du dossier « À traiter »** : seulement après fusion autorisée, déploiement réussi ET vérification dans l'application. Déplacer les sources vers les archives, jamais les supprimer ; ne pas les dupliquer en supports étudiants.

## Cas Posture professionnelle D1.1 — TD2

Appliquer aussi [le préflight ciblé avant PR et publication](COURSE_PREFLIGHT.md) : QA pédagogique et technique distinctes, PDF/banques/empreintes, versions et assets, puis approbation authentique. Les TNR complets restent bloquants. Une correction du contenu invalide l’empreinte antérieure ; le préflight ne signe jamais le nouveau lot.

Le dossier privé contient la fiche écrite de 17 pages, le QCM de 40 questions et les 40 flashcards, mais la fin de PT02 n'a pas été reçue intégralement ; la validation de l'oral n'est pas exhaustive. Les contenus peuvent être contrôlés techniquement et rapprochés du support écrit, mais ne doivent pas être présentés comme des preuves d'exhaustivité.


## Addendum du 26/10/2026 — Collecte des sources et relances privées

- Le dossier privé « À traiter » est un sas de collecte : supports officiels, captures provisoires facultatives et transcriptions confidentielles. Le dépôt seul ne déclenche jamais fiche, QCM, flashcards, vocal, infographie ou autre livrable ; la production reste à la demande.
- Réserver les captures aux figures, tableaux et consignes utiles lorsque le support officiel manque ; ne jamais les imposer. À réception de l'officiel, comparer, privilégier le support authentique et conserver l'historique.
- Les transcriptions restent exclusivement dans un espace Drive propriétaire conforme aux exigences de confidentialité, hors dossier étudiant.
- Distinguer collecte, attente du support, préparation pédagogique et publication. Un cours déjà traité peut rester en attente de son officiel. Réception ne signifie ni régénération ni publication.
- Commencer le suivi à la date du cours si elle est attestée, sinon à la première date de dépôt attestée de transcription/captures : J+7 vérification conseillée, J+14 relance conseillée, J+21 suivi prioritaire. Tenir compte des vérifications et relances déjà faites et ne pas confondre « À vérifier » avec « Absent ».
- FAC => E-Campus ; IFSI => Yikiforma. Ne pas deviner la provenance du seul code UE ; la qualifier si nécessaire.
- Le calcul actuel existe dans un onglet privé Google Sheets pour les lignes connues, mais l'arrivée de nouveaux fichiers sur Drive n'est pas encore synchronisée automatiquement. Une évolution privée et authentifiée devra être développée séparément ; aucune donnée de suivi privé dans l'application étudiante publique.
- **Ce cadrage ne vaut ni fusion GitHub ni GO publication.** Aucune ressource publique ou contrôle pédagogique existant n'est modifié.

Voir le cadrage complémentaire SOURCE_INTAKE_REMINDERS_V1.md.
