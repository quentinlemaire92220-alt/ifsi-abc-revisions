# IFSI ABC — État du projet au 21 octobre 2026

> Photographie à la date indiquée, établie depuis GitHub et le catalogue documentaire. Vérifier de nouveau les données en ligne avant décision. **Ce document n'autorise aucune fermeture, fusion, suppression ni publication.**

## Socle vérifié

- Dépôt : `quentinlemaire92220-alt/ifsi-abc-revisions` (public), branche de production `main`, branche protégée.
- Révision de `main` vérifiée : `228b267f895d117a3d6f64c79e3344dfed816cd9`.
- `build-meta.json` : **8.30.112**, build **8412**, 21/10/2026.
- Derniers contrôles de ce commit consultés : **TNR IFSI ABC**, **Audit qualité P2**, **GitHub Pages** réussis le 21/10/2026. Vérifier les nouveaux checks avant toute intervention.
- Inventaire à cet instant : **29 branches dont main, 12 PR ouvertes, 4 issues ouvertes**. L'arbre `main` compte **589 entrées** (fichiers et dossiers), dont **272 fichiers à la racine** : occasion de rationaliser l'organisation, **pas une preuve de code mort**.
- Drive possède déjà les référentiels Work en **v1.17** et leurs archives. Ne pas les recréer ni effacer les versions précédentes.

## Cours C1.1 S1 — état déjà intégré

- [PR #184](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/184) : pré-intégration fusionnée le 21/10.
- [PR #186](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/186) : intégration du lot fusionnée le 21/10 avant le succès des checks de `main`.
- D'après la description de la PR #186 : deux PDF, neuf infographies, 56 QCM et 56 flashcards fondés sur des captures/transcription ; **support officiel intégral indisponible**, statut pédagogique partiel/provisoire. Vérifier séparément la visibilité effective de chaque pièce et les preuves Drive. Conserver les **valeurs du cours**, sans mise à jour externe implicite.
- Ne pas rouvrir ce chantier comme « non ajouté » simplement parce qu'une ancienne conversation l'indiquait.

## Portefeuille des 12 PR ouvertes — revue, pas suppression

| Domaine | PR | Orientation initiale |
| --- | --- | --- |
| Plaies et pansements / publication | [#174](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/174), [#171](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/171) | **P1** : #174 est en conflit (`mergeable_state: dirty`) et cible une ancienne version 8.30.105. Comparer les deux PR et le `main` actuel, préserver les autorisations existantes, finir les tests ; ne pas merger de force ni fermer #171 avant comparaison. |
| Éviter doublons / données internes | [#129](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/129) | **P1** : comparer à `main` pour identifier le correctif utile restant et les ressources à protéger ; contrôler confidentialité. |
| Registre privé et authentification | [#159](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/159) | **Bloqué** tant que configuration Auth/Secrets et revue des accès côté serveur ne sont pas réalisées ; aucune publication par simple TNR verte. |
| Correctifs P1 / garde-fous | [#125](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/125), [#124](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/124) | Comparer les changements à la version actuelle avant reprise, réutiliser ce qui est déjà livré. |
| Anatomie / atlas reproducteur | [#132](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/132), [#140](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/140), [#146](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/146), [#164](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/164) | Regrouper la revue **par repère et par preuve scientifique**, pas par ordre de création ; les SVG/annotateurs doivent être validés avant diffusion. |
| Chirurgie orthopédique | [#139](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/139) | Attente de revue pédagogique/graphique ; ne pas régénérer les PDF validés. |
| QCM maths | [#74](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/pull/74) | Audit historique, comparer les conclusions aux tests et banques actuels ; conserver comme preuve tant que non réconcilié. |

## 4 issues encore ouvertes

- [#70](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/issues/70) : difficultés QCM estimées à valider pédagogiquement.
- [#89](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/issues/89) : corrections trop courtes et formulations dépendant des supports.
- [#68](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/issues/68) : anciennes questions 4/4 en archives.
- [#71](https://github.com/quentinlemaire92220-alt/ifsi-abc-revisions/issues/71) : vrais tests PWA Android / hors connexion.

Les volumes mentionnés dans les issues sont **historiques**, pas des métriques recalculées le 21/10.

## Ordre de travail recommandé

1. **Protéger l'existant** : inventaire des ressources et permissions, aucun déplacement/suppression non vérifié, pas de secrets ou sources privées dans le Git public.
2. **Réconcilier les PR** : lister les différences encore pertinentes versus `main`, détecter chevauchements et conflits, décider « reprendre / clôturer plus tard / bloquer » avec justification et sans action destructrice automatique.
3. **Stabiliser la livraison** : garder le runtime et les TNR verts ; auditer les écarts de contrats (formats de cours, doublons, ressources, PWA, PDF) sans transformer des contrôles documentaires en approbation médicale.
4. **Simplifier progressivement** : regrouper la documentation active derrière le centre de pilotage, archiver par étapes après preuve de non-utilisation, ouvrir des PR atomiques ; contrôler la CI à chaque étape.
5. **Revoir dans Drive** les liens et versions courants **sans déplacer les fichiers pour la seule esthétique** et en conservant les droits privés/publics actuels.

## Risques et limites de cette photographie

- Plusieurs PR proviennent de versions antérieures à 8.30.112 ; elles peuvent se chevaucher ou être dépassées. **Leur état ouvert ne prouve pas qu'elles soient nécessaires.**
- Une CI verte n'atteste ni l'exactitude clinique, ni un support complet, ni la sécurité d'accès à un document Drive.
- Le statut GitHub et les nombres changent : **toujours relire les données en direct**.
- Audit d'inventaire et documentation **seulement** : pas de test utilisateur mobile, pas de migration ni d'audit exhaustif des permissions réalisé lors de cette première passe.
