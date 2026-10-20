# Lot P1 Pathologies — validation de forme, préparation de la revue médicale (20 octobre 2026)

## Décision actée

Le propriétaire a validé la **forme et la structure pédagogique** des trois témoins du lot P1 : BPCO, hypertension artérielle (HTA) et diabète de type 2 (DT2). Cette décision fait du **format BPCO six panneaux riches et anatomiquement illustrés** le standard de composition, étendu au lot HTA/DT2. **Cela n'établit ni validation médicale, ni approbation du package complet, ni GO publication.**

La référence vise **la qualité du graphisme et non seulement le découpage des pages** : six volets colorés à illustration dominante, hiérarchie et contrastes, anatomie explicative, comparaisons utiles, légendes précises, encadrés de synthèse, traitement et rôle infirmier. Corriger localement les erreurs sans retomber sur des schémas vectoriels élémentaires. Toute correction graphique substantielle doit être montrée en comparatif avant/après.

Les fichiers de référence et les banques privées ne doivent **pas** être copiés dans GitHub public. Le procès-verbal détaillé de la revue et les empreintes des assets restent privés.

## Périmètre d'approbation

| Aspect | Statut |
| --- | --- |
| Modèle BPCO à six panneaux | FORME VALIDÉE |
| Déclinaison du format HTA | FORME ET STRUCTURE VALIDÉES |
| Déclinaison du format DT2 | FORME ET STRUCTURE VALIDÉES |
| Anatomie, textes rasterisés, seuils médicaux | REVUE MÉDICALE REQUISE |
| QCM et corrigés | REVUE PÉDAGOGIQUE ET VALIDATION DES PERMUTATIONS REQUISES |
| Flashcards, vocabulaire, cas cliniques | REVUE PÉDAGOGIQUE REQUISE |
| Diffusion étudiante / application | BLOQUÉE jusqu'au GO publication du lot final |

## Écarts bloquants à corriger

1. **Qualité des QCM** : l'archive P1 de revue privée du 20/10/2026 comporte 24 QCM HTA et 24 QCM DT2 ; dans les **48 questions, la proposition A est juste** et B est la deuxième juste pour les questions à deux réponses. Les **16 étapes de cas cliniques** HTA et DT2 ont également leur réponse juste en A. Corriger toutes les permutations, en synchronisant les options, les indices, les explications par option, les exports PDF et les clés de correction. Tester l'absence de biais systématique de position.
2. **HTA visuelle** : le panneau d'artère « avec HTA » représente une plaque/sténose d'athérosclérose qui n'est pas la définition d'une hypertension ; revoir précisément ce dessin ou l'explication sans altérer le style général.
3. **BPCO** : vérifier les formulations sur oxygénothérapie, contexte d'exacerbation, volume résiduel, obstruction et échanges gazeux ; pas de « cible SpO₂ 88–92 % » universelle.
4. **DT2** : confirmer diagnostic et mode de confirmation selon recommandations/situation, distinguer seuil diagnostique HbA1c avec sa source ADA et les modalités retenues localement, traitements individualisés, diagnostic clinique vs valeur isolée ; surveillances/cas d'hypoglycémie.
5. **Images et publications** : les textes sont incrustés dans des images ; contrôler chacun au zoom et fournir le mapping source → texte → repère → illustration. Tout changement d'octets du lot impose une nouvelle revue de la version corrigée.
6. **TNR** : vérifier fiche, QCM, corrigés, score, feedback, statistiques, cartes et cas depuis la même matrice. Le simple fait de passer les TNR structurels ne prouve pas l'exactitude médicale.

## Passage en intégration

Préparer les identifiants stables `bpco` → `systeme_respiratoire`, `hta` → `systeme_cardiovasculaire`, `dt2` → `systeme_endocrinien`. **Ne pas charger de catalogue réel** dans `index.html` ou `sw.js`, ne pas publier les visuels, tant que toutes les validations du lot révisé sont incomplètes.

Appliquer `docs/skills/production-pathologies-infographies-cliniques.md`, `docs/PUBLICATION_APPROVAL.md` et les deux annexes datées du 20/10/2026 dans les chartes Google Drive. Le GO actuel autorise l'autocorrection, les contrôles et la préparation technique.
