# Intégration des 6 planches anatomiques du système reproducteur — préparation (19/10/2026)

L'utilisateur a validé la direction graphique et donné son GO d'intégration. **Ce GO ne constitue pas une preuve de licence des images tierces ni une inspection des flèches.** La V8.30.98 reste en production et ne publie pas encore de figures reproductrices.

## Inventaire Canva vérifié
Un même document Canva de 6 pages A4 contient les maquettes R02 à R07, dans cet ordre. Il reste **R01 à produire**, indépendamment. Chaque page porte une mention de revue/validation anatomique. Les métadonnées de Canva montrent des **images PNG importées**, pas une attestation sur l'auteur de leur illustration. Le visuel principal de R02 (588 × 859 px) et son encart (387 × 411 px) sont automatiquement identifiés par l'outil comme des fruits ; cela peut être une erreur de classification mais interdit une validation médicale automatique. Les résolutions natives des autres images anatomiques principales vont d'environ 629 × 1027 à 954 × 914 px.

## Points non confirmés
- R02 : albuginée non présente dans les libellés et confusion visuelle potentielle sur deux images ; **inspection obligatoire**.
- R03 : légendes principales présentes ; contrôle du trajet réel des spermatozoïdes et des flèches urètre/uretère/canal déférent.
- R04 : topographie vessie/rectum absente des légendes, vue sagittale non démontrée.
- R05 : partie intramurale absente, correspondance franges/fimbriae à vérifier.
- R06 : couches basale et fonctionnelle de l'endomètre absentes.
- R07 : vestibule absent des libellés ; vérifier les trois repères des orifices.
- Les droits des PNG importés ne sont pas établis par leur passage dans Canva. Une modification de mise en page n'efface pas les droits de l'image source.

## Livrables nécessaires
- **Six exports séparés**, R02–R07, PNG haute définition ou WebP converti après vérification du rendu, numérotation et titres cohérents.
- Pour chacune : revue anatomique des flèches et repères, contrôle du rapport qualité/résolution, liste des éléments utilisés et de leur provenance (création originale, génération Canva IA, ressource Canva sous licence ou image tierce autorisée). Crédit/licence si imposés.
- Rapprochement des légendes avec le support officiel UE B1, en indiquant le statut d'un label seulement si sa pointe est effectivement vérifiée.
- Création des entrées dans `06 - Planches anatomiques / 02 - Versions validées` puis `03 - Exports application`, avec les IDs Drive réellement retournés.
- Manifest final `docs/anatomy-reproductive-import-v1.json` : remplacer les `imagePath:null` par les paths approuvés, ajouter dimensions et empreintes SHA256, passer les statuts à approuvé seulement avec preuves documentées. Ajouter les images au catalogue/runtime et aux tests PWA après cela.

## Blocage technique de l'outil actuel
La connexion Canva disponible permet de voir, éditer et regrouper les pages mais **ne fournit pas de commande pour exporter directement les pages en PNG HD**. Impossible d'inventer des fichiers téléchargés ou des liens publics. L'utilisateur peut exporter dans Canva via **Partager → Télécharger → PNG**, sélectionner les six pages, puis remettre les fichiers exportés dans la conversation (ou un dossier Drive accessible), afin d'enchaîner les contrôles, corrections nécessaires et l'import.

## Garanties
- Le manifeste préparatoire ne contient ni URL Canva privée ni copie des images.
- Aucun nouveau QCM, flashcard ni schéma muet ne sera activé à partir d'un visuel non validé.
- `tests/anatomy-reproductive-import-gate.mjs` empêche une déclaration `appPublication: approved` sans validation médicale, provenance/licence, fichier réel, empreinte, et Drive ID.
- Cette préparation ne modifie pas la release publique V8.30.98, le total des 106 planches ni les protections anatomiques déjà intégrées.
