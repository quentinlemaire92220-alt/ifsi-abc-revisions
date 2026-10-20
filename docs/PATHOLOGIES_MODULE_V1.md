# Onglet Pathologies — socle clinique (pilote)

**État au 20 octobre 2026 : architecture technique préparée, aucun contenu pathologique publié.**

## Finalité

Proposer une bibliothèque clinique progressive pour les étudiants IFSI : compréhension, reconnaissance des signes, rôle infirmier, entraînement QCM/flashcards et raisonnement sur situations fictives. Il ne s'agit pas d'un second catalogue de cours : les fiches sont reliées aux cours par \`courseIds\`, les fichiers maîtres restent dans leurs emplacements de référence.

## Déploiement en deux phases

1. **Technique, avant revue clinique :** \`pathologies-module-v1.js\` et son contrat de contrôle sont présents sur une branche. Le script n'est **ni chargé dans \`index.html\`, ni préchargé par le service worker**. Aucune navigation étudiante n'est créée.
2. **Pédagogie, uniquement après relecture et GO publication explicite :** constituer le package de la première pathologie (BPCO), faire contrôler les sources, les infographies originales, l'exactitude médicale et les corrélations avec les cours existants. Ne publier qu'après validation de toutes les pièces selon \`AGENTS.md\` et \`docs/PUBLICATION_APPROVAL.md\`.

Après validation de la BPCO, préparer un déploiement technique cohérent (catalogue, \`index.html\`, \`sw.js\`, métadonnées de version, changelog et TNR). La PR présente n'autorise ni la fusion ni l'activation et ne constitue **pas** un GO publication.

## Package BPCO à présenter à la revue privée

- Fiche de révision illustrée au modèle Système nerveux : définitions, mécanismes, causes/risques, manifestations, examens, traitements, rôle infirmier, surveillances, complications et glossaire final.
- Illustrations originales de mécanisme (sans reprise de figures officielles), à intégrer au fil des explications et à contrôler médicalement et graphiquement.
- QCM sourcés avec 4 ou 5 propositions, **1 à 3** réponses justes, aucune réponse 4/4, corrigé général et justification de chaque proposition.
- Flashcards de mémorisation autonomes et contextualisées.
- Cas clinique de patient **fictif**, progressif, avec priorisation, données cliniques pertinentes, surveillances, alertes et corrections argumentées.
- Rattachement explicite au cours Système respiratoire et aux UE concernées, sans déplacer ni dupliquer les supports.

## Contrat technique

\`IFSI_PATHOLOGIES.validate(pathology)\` vérifie l'identité, l'année (1/2/3), les liens de cours, les dix sections de fiche, les sources typées \`official\` / \`verified_complement\`, les QCM, les flashcards, les cas et les métadonnées d'approbation. Une publication est rejetée si l'approbation explicite **et l'empreinte du lot** sont absentes.

\`IFSI_PATHOLOGIES.evaluate(question, selection)\` fige la réponse, distingue « Ta réponse » de « Bonne réponse », puis fournit une explication spécifique pour **chaque proposition choisie à tort ou oubliée**. Les tentatives sont enregistrées **localement** et séparément des statistiques QCM générales, pour éviter de modifier des scores historiques.

\`IFSI_PATHOLOGIES.activate(catalog)\` refuse tout catalogue contenant un élément non conforme. L'API existe mais **aucun code de production n'appelle activate à ce stade** : le module reste invisible des étudiants.

Le JavaScript offre quatre vues : Fiche, QCM, Flashcards (réponse cachée jusqu'au clic), Cas clinique progressif. Les liens et les chaînes de contenu sont échappés à l'affichage et les liens tiers sont HTTPS.

## Validation et précautions

- Le test \`node tests/pathologies-module-v1.mjs\` vérifie les contrôles de structure, d'approbation, les erreurs QCM, les réponses multiples et l'absence d'activation publique.
- Les tests existants de cohérence catalogue, navigation, QCM, sécurité, PWA et publication doivent rester verts.
- **Non couvert à ce stade :** revue médicale BPCO, export PDF, inspection infographies, tests d'accessibilité navigateur et validation du catalogue réel. Ils doivent être réalisés *avant* activation.
- Ne pas importer des dossiers patients, transcriptions nominatives, captures officielles ou brouillons pédagogiques dans le dépôt public.

## Suite après validation du pilote

Étendre le même modèle à HTA et diabète, en conservant un seul registre et une progression par année plutôt qu'une collection parallèle de QCM.
