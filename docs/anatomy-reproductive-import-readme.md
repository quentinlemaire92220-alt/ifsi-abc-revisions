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

## Revue du PDF Canva effectivement reçu le 19/10/2026

Le fichier Canva exporté comporte bien **6 pages A4**, une page par R02 à R07. Il a permis une revue visuelle concrète, mais **ce n'est pas une attestation de provenance des illustrations ni un ensemble de masters HD natifs**. Les figures principales de plusieurs pages ont une densité effective de l'ordre de **115 ppp** dans le PDF ; augmenter le nombre de pixels du rendu PNG est une opération de rastérisation, pas une amélioration des détails anatomiques d'origine. Les PNG de contrôle sont conservés **hors GitHub** dans la conversation ; ils ne sont pas publiés.

### Écarts constatés dans l'export
- **R02** : l'albuginée n'est pas légendée. L'étiquetage automatique « fruit » par Canva ne constitue pas un constat anatomique : l'illustration visible représente une coupe testiculaire ; vérifier néanmoins les pointages microscopiques.
- **R03** : revoir le pointage de l'ampoule déférentielle par rapport aux vésicules séminales ainsi que le trajet du canal éjaculateur.
- **R04** : vue frontale du tractus féminin ; aucune vue sagittale ni position relative de la vessie et du rectum.
- **R05** : la légende « Trompe utérine » se coupe au milieu d'un mot dans le PDF. Surtout, la flèche « Médulla ovarienne » semble pointer sur un follicule ; correction médicale nécessaire. La portion intramurale n'est pas légendée.
- **R06** : le libellé « Périmétrium » est coupé sur deux lignes ; il manque la distinction entre couches basale et fonctionnelle de l'endomètre.
- **R07** : le libellé « clitoris » est coupé sur deux lignes ; le vestibule n'est pas légendé et les pointages externes nécessitent vérification.

Une transaction **brouillon Canva** a été ouverte pour élargir les zones de texte des trois étiquettes coupées (R05, R06, R07). Ces changements **ne sont pas enregistrés**, et le PDF fourni représente toujours le rendu original. La correction de l'emplacement des flèches et des structures manquantes reste distincte ; un changement de largeur de texte ne vaut aucune validation anatomique.

**Statut après réception :** sources effectivement examinées, emplacements d'assets prêts dans la PR, mais **diffusion bloquée jusqu'à correction des défauts visuels/anatomiques et contrôle de la provenance des images intégrées**.
