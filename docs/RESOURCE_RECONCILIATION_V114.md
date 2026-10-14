# Audit de rattachement et conformité des ressources existantes — IFSI ABC v1.14

**État : diagnostic / lecture seule, aucun remplacement ni publication de cours.** Base : `main` v1.14 au 14 octobre 2026. L’inventaire vivant est calculé par `tools/workflow-resource-inventory.mjs`.

## Comment actualiser l'inventaire cours par cours

```bash
node tools/workflow-resource-inventory.mjs --markdown
node tools/workflow-resource-inventory.mjs --json
node tests/workflow-resource-inventory-test.mjs
```

Le résultat fournit par `courseId` le nombre de PDF et autres fiches, les types déclarés, les QCM et flashcards du runtime, le vocabulaire, les infographies individuelles, les vocaux et la présence d'un **lien de source** dans le registre. La CI exécute les contrôles de non-régression du rapport. Elle **ne télécharge pas** les PDF privés : elle ne valide ni exactitude médicale, ni exhaustivité du support, ni qualité graphique, ni liens Drive en temps réel.

## Inventaire historique — constats initiaux

| Élément | État |
|---|---|
| Registre | 47 `courseId` (dont un cours Traumatologie masqué derrière son parent) |
| Fiches dans le catalogue | 57 : **48 PDF, 8 PNG et 1 SVG** ; 44 cours avec au moins une fiche sous leur propre ID |
| Format des fiches v1.14 | **57/57 non typées** `classic` ou `complete_infographic` ; cela ne prouve pas l'absence d'une fiche complète déjà produite |
| Infographies individuelles | 162 cataloguées pour 34 cours ; zéro infographie est acceptable s'il est pédagogiquement justifié |
| Vocaux | 58 ressources cataloguées dans 11 cours ; les MP3 restent distincts des scripts vocaux |
| Vocabulaire | 309 termes indexés ; la couverture réelle des notions reste à auditer |
| QCM et flashcards | Dernière CI : 41 cours ont des QCM avec flashcards générées ; six autres n'ont pas de QCM de cours dans le runtime |
| Source officielle | 35 cours avec URL ou liste de support renseignée dans le registre ; 12 autres **sans lien catalogué**, et non nécessairement sans support sur Drive |
| Manifeste de production | 2 entrées historiques détaillées : Plaies et pansements et Stomatothérapie |

Un contrôle manuel par métadonnées Drive a retrouvé les **57 identifiants de fiches du catalogue**. Leur ouverture réelle, couverture et qualité v1.14 n'ont pas été validées. Aucun fichier historique ne doit être déclaré conforme v1.14 sur ce seul motif.

## P1 — corriger la traçabilité avant toute régénération

1. **Traumatologie** : `parentId=appareil_locomoteur` et `showInCourses=false` sont intentionnels. La fiche mixte Locomoteur/Traumatologie existe chez le parent. Vérifier le découpage, l'accès effectif et la couverture des 96 QCM historiques avant de déplacer une ressource ou de créer un doublon.
2. **Diagnostic bactériologique** : 3 infographies et des contenus annexes présents ; aucune fiche active ni banque QCM rattachée au `courseId`. Le dossier Drive existe, mais une fiche officielle/recréée ne doit pas être inventée.
3. **Infections urinaires** : support de cours et trois infographies retrouvés sur Drive ; aucune fiche active ni QCM dans le catalogue. Confirmer la source, puis produire le manque avec revue privée.
4. **Psychologie de la santé** : une fiche active non issue du support officiel (`officialSupport=false`), deux infographies et vocabulaire existent ; QCM et flashcards de cours absents. Ne pas exiger de planche Anatomie. Vérifier d'abord la couverture de la fiche depuis la source réellement autorisée.
5. **Administration médicamenteuse** : fiche, 5 infographies et 6 vocaux existants ; aucun QCM ni flashcard de cours actuellement dénombré. Examiner les notions calculatoires et les cas pratiques avant génération.
6. **Deux autres cours sans QCM de cours** : Méthodes de travail et Vaccination/PRS. Décider explicitement si des QCM pertinents sont nécessaires ; ne pas en inventer par automatisme.

## P1/P2 — classement, versionnement et qualité

- **Typage des fiches** : contrôler chaque PDF avant de définir `sheetFormat`; ne pas transformer 57 entrées en `classic` sans distinguer les cas. La fiche complète infographiée est un second **PDF autonome**, non un pack d'illustrations individuelles.
- **Candidats Drive à rapprocher** : fichiers nommés « Fiche_Systeme_Urinaire_Complete_Infographies_Illustrees.pdf » et « Fiche_Systeme_Nerveux_Complete_Infographies_Illustrees_A_Valider.pdf ». Ils **ne sont pas publiables directement** : revoir provenance, orientation, contenu, portrait-guide, exactitude et statut. Ne pas exposer les liens privés dans ce dépôt public.
- **Mathématiques** : huit fiches illustrées PNG et un mémo maître SVG sont volontairement classés en fiches et non dans les infographies séparées. Ne pas les étiqueter PDF ; une fiche PDF complète infographiée distincte n'est pas encore certifiée.
- **Stomatothérapie** : vérifier que les planches digestives et urinaires complémentaires sont accessibles en priorité sous Anatomie et que l'appareillage n'est pas représenté de manière erronée. Les vocaux enregistrés MP3 étaient en attente pour ce cours ; ne pas déduire de scripts la présence de MP3.
- **Plaies et pansements** : fiche PDF classique et six infographies présentes ; vocalises/MP3 réellement livrés et second PDF autonome restent à examiner.
- **Métadonnées support** : 37 fiches sans `officialSupport` explicite ; 14 à `false`, six à `true`. Une absence d'indicateur n'autorise pas à marquer le support « officiel ».

## Priorités d'exécution proposées

**Lot A (lecture + rattachement, sans contenu nouveau).** Vérifier pour chaque cours le type et l'accès des fiches, distinguer support officiel / captures / notes / transcription, identifier les fichiers déjà prêts sur Drive ; corriger les labels et URLs **uniquement avec source vérifiée**, sur une PR à TNR verts.

**Lot B (création pédagogique).** Sélectionner les six cours sans QCM. Pour chaque contenu manquant, préparer fiche classique, fiche complète infographiée et exercices pertinents à partir du support réel. Pas de faux schémas ni de doublons. Revue privée des deux PDF et des questions.

**Lot C (migration v1.14 progressive).** Pour chaque cours, conserver les ressources utiles, enregistrer les deux fiches distinctes seulement après validation, les exports individuels si pertinents et le statut non-applicable documenté sinon. Vérification médicale/conceptuelle, lecteur vocal, liens, TNR, puis GO publication séparé.

### Limites et sécurité

Ce diagnostic est un inventaire de **présence et de rattachement**. Il n'est **pas** un certificat de conformité des 47 cours. La preuve des URL officielles, le contenu précis des PDF, la couverture des banques de QCM et l'exactitude des schémas exigent des contrôles dédiés, surtout pour les appareillages. La réussite des TNR GitHub ne prouve pas l'accès aux fichiers Drive privés. La skill locale Work/SOL et les données Supabase restent hors périmètre. Aucune migration ni publication n'est déclenchée par ce rapport.
