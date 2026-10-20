# Pathologies P1 — procédure de revue technique hors publication

## Situation au 20/10/2026

Trois catalogues de **revue privée** sont disponibles hors dépôt : BPCO (pilote historique), HTA et diabète de type 2. Ils sont liés à :
- BPCO : `systeme_respiratoire` ;
- HTA : `systeme_cardiovasculaire` ;
- diabète type 2 : `systeme_endocrinien`.

Il existe un **aperçu local HTML** (hors ligne), avec les six panneaux graphiques originaux/corrigés, QCM, flashcards, cas et sources. **Il n'est pas publié sur GitHub Pages.** Ne jamais commiter ses images ni JSON de revue dans ce dépôt public.

## Nouvelle commande locale pour un audit de préparation

```bash
node tests/pathologies-p1-readiness.mjs --draft /chemin/prive/bpco.json /chemin/prive/hta.json /chemin/prive/dt2.json
```

La commande affiche **uniquement des agrégats**, des codes de blocage et le nombre d'erreurs du moteur. Elle ne recopie jamais des questions, des URL privées, des assertions cliniques ni les chemins de fichiers.

Vérifications incluses : rattachement aux trois cours existants, comptes P1 attendus (24 QCM, 20 flashcards, 8 étapes par pathologie), références individuelles valides, sections de fiche, inventaire des infographies, compatibilité avec le moteur et absence de publication prématurée.

```bash
node tests/pathologies-p1-readiness.mjs --self-test
```

Cette vérification synthétique est intégrée aux TNR. Même un catalogue sans défaut structurel ne démontre **pas** sa qualité clinique. La validation réelle des visuels, des textes et des traitements reste à réaliser **sur les octets du lot final** avec des responsables compétents.

## Bloquants avant activation

1. Réviser médicalement **les trois** pathologies, dont le contenu du pilote BPCO, les libellés incrustés dans les infographies et les contre-exemples des QCM.
2. Les catalogues HTA et DT2 n'ont **pas** encore la totalité des sections `sections`, ni un registre `visuals` reliant les infographies aux sources et empreintes. Le vieux catalogue BPCO contient les sections mais n'a pas non plus de `visuals` conformes et sa liste de sources a des clés historiques à rapprocher.
3. Une part importante des distracteurs des 72 QCM est trop manifestement fausse, ce qui ne favorise pas un entraînement IFSI de difficulté progressive. Les reformuler à partir de concepts médicaux vérifiés sans rendre les réponses multiples contradictoires.
4. Pour la glycémie à jeun : le référentiel HAS 2025 indique un jeûne nocturne de **10–12 heures pour le dépistage**, alors que certains critères diagnostiques internationaux retiennent **au moins 8 heures**. Une carte DT2 exprimée sans référentiel doit préciser le contexte pour ne pas confondre les règles.
5. Recenser les fichiers infographiques approuvés par contenu et les empreintes effectives du lot ; ne jamais attribuer `medicalReview: approved` automatiquement.
6. Obtenir une approbation **distincte**, explicite, de la version médicale/éditoriale finale et le GO publication de ce lot, puis faire les TNR navigateur et service worker.

Le script ne publie rien, n'appelle aucun service tiers, et ne contourne pas la politique de validation de `AGENTS.md` et `docs/PUBLICATION_APPROVAL.md`.
