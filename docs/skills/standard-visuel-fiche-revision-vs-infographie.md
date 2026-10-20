# IFSI ABC — Standard visuel validé : fiche de révision ≠ infographie
**Version de travail v1.0 — validée graphiquement le 20 octobre 2026.** À appliquer aux nouvelles productions et aux refontes demandées, pas rétroactivement aux fichiers déjà validés.

## Les DEUX modèles de référence, à ne jamais intervertir

### A. Fiche de révision : référence impérative
**Fichier de référence fourni et validé :** `UE_S1_B1_Systeme_Cardiovasculaire_Partie01_Fiche_Revision_Coeur_Vaisseaux_et_Sang.pdf` (17 pages).

- **Support principalement rédigé** : titres de chapitre et sous-sections numérotées, paragraphes lisibles qui expliquent les mécanismes, définitions, nuances, données importantes, vocabulaire et valeurs du cours.
- **Texte AVANT image** : tableaux de comparaison utiles, encadrés « Priorités pour l'évaluation », « À retenir », « Pièges QCM » ou « Trajet à savoir réciter ». Une image ne doit jamais supprimer un paragraphe important.
- **Visuels ciblés seulement lorsqu'ils clarifient le concept** : quelques schémas / zooms anatomiques **à l'intérieur du chapitre concerné**, dimension proportionnée au texte, légende et source contrôlées.
- **Pas de planche infographique pleine page dans chaque section**, pas de collages de mini-cartes anatomiques à la place des explications, pas de ratio visuel forcé, pas d'illustration décorative.
- **Maquette** : fond blanc, bandeau violet, titres violets hiérarchisés, accent turquoise discret, tableaux violets lisibles, marges régulières, interlignage suffisant. Retenir les pages 1–2 et les passages plus illustrés de la fiche fournie comme référence **de composition**, pas pour copier ses images.
- La fiche est **complète et multipage** : couvrir toutes les notions de la source officielle sans réduire artificiellement le nombre de pages.

**Question de revue obligatoire :** « Si je retire les schémas, est-ce que je peux encore comprendre et réviser le cours par les paragraphes et tableaux ? » Si non : **FICHE À CORRIGER**.

### B. Infographie : référence impérative
**Fichier de référence fourni et validé :** `UE_S1_B1_Systeme_Cardiovasculaire_Partie01_Infographie_01_Circulation_sanguine_et_trajet_du_sang (1).pdf` (planche d'une page).

- **Support principalement visuel** : illustration anatomique centrale détaillée, trajets et mécanismes fléchés, légendes exactes, couleurs médicales cohérentes, zooms utiles, repères et courts blocs pédagogiques.
- **Image AVANT prose** : les éléments graphiques transmettent la notion ; les textes courts guident l'observation, ils ne constituent pas simplement une colonne de paragraphes dans des rectangles.
- Pour un cours complet, **plusieurs planches du même niveau** sont assemblées en un PDF multipage ; aucune notion ne doit manquer, aucun plafond de pages. **Une page de pilote ≠ une seule page définitive.**
- Ne pas multiplier des panneaux répétitifs ou des schémas simplistes : chaque illustration doit résoudre une vraie difficulté d'apprentissage. Les planches anatomiques existantes peuvent être réutilisées si validées et autorisées.
- **Textes, numérotation et flèches sont à construire comme objets éditables contrôlés**, idéalement superposés à l'illustration sans texte généré. Une image produite par génération ne doit **jamais** être considérée comme une légende fiable : vérifier organe, orientation, trajet, couleurs, quantités et valeurs sur la source officielle.

**Question de revue obligatoire :** « Sans lire de longs paragraphes, la grande illustration et les repères suffisent-ils à suivre le mécanisme enseigné ? » Si non : **INFOGRAPHIE À CORRIGER**.

## Méthode de production (source unique de vérité)
1. **GO audit** : source officielle → matrice de notions sourcées (avec pages), inventaire des ressources déjà présentes, identification des illustrations utiles et des planches Anatomie réutilisables ; ne pas traiter une fiche de révision comme une source officielle.
2. **Deux sorties distinctes depuis la même matrice** :
   - `Fiche_Revision.pdf` : prose/paragraphes, tableaux et quelques schémas intégrés facultatifs. Ne pas générer un visuel pour chaque section.
   - `Cours_Complet_Infographie.pdf` : séquence de planches autonomes, anatomie centrale, mécanismes, repères vérifiables et courts textes. La juxtaposition de cartes ou d'une photo décorative avec une colonne de texte n'est pas suffisante.
3. QCM (5 choix A–E, 1–3 réponses, corrigé argumenté) et flashcards (questions autonomes, réponse cachée dans l'app) ; planches anatomiques seulement si nécessaires et non déjà validées. Audio, lexique autonome, exports de tous les dessins uniquement sur demande.
4. **Contrôle croisé de couverture** : toute notion de la source doit être expliquée dans les **deux supports complets**, de façons graphiques différentes. La seule déclaration d'ID dans le manifeste n'atteste ni la justesse ni la présence effective : vérifier chaque PDF.
5. **Contrôle visuel séparé** : (A) échantillons première/milieu/fin, qualité textuelle et équilibre des schémas ; (B) zooms 100–200 % de toutes les planches, anatomicalité, position des flèches et lisibilité des légendes. Rechercher les problèmes détectés précédemment : blocs textuels déguisés en infographies, cartes miniaturisées, flèches contradictoires, caractères générés incorrects, répétitions et troncatures.
6. **Validation scientifique** : croiser légendes, repères, nombres, QCM et réponses avec le support officiel et signaler toute incertitude ; distinguer modèle visuel approuvé et validation scientifique du nouveau cours.
7. **GO production** = fichiers privés ; **GO publication** distinct = seulement après revue, CI/TNR, vérifications Drive/App, et autorisation explicite. Conserver les anciens fichiers et les empreintes des lots validés.

## Contrôles non remplaçables par les tests automatiques
- Les TNR de structure, PDF A4, pageCount, visuels présents, IDs de notions et hashes doivent rester verts ; ils **ne certifient jamais la qualité des dessins ou la vérité médicale**.
- **Deux critères indépendants** doivent figurer dans chaque fiche de revue : `REVISION_TEXT_FIRST` et `INFOGRAPHIC_VISUAL_FIRST`, notés `PASS / À_CORRIGER / BLOQUÉ` par inspection réelle. Un `PASS` auto par comptage d'images est interdit.
- Si la fiche ressemble à une grande infographie, elle est non conforme même si les PDF passent ; si l'infographie est surtout du texte en encadrés, elle est non conforme même si chaque page contient une image.
- Ne jamais qualifier de modèle validé un rendu fictif de tests de pipeline ou un essai d'ImageGen non corrigé médicalement.

## Travail économe
Analyse, matrice, rédaction et vérification d'abord dans ChatGPT classique, réemploi systématique du contenu conforme ; Work seulement pour les opérations techniques lourdes indispensables, avec un mandat ciblé. Ne pas redemander au propriétaire de valider une référence graphique déjà approuvée : lui faire valider seulement une nouvelle production complète, ses écarts ou la publication.
