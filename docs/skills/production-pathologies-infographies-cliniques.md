# Skill IFSI ABC — Pathologies, fiche clinique et infographies originales (v1.0)

**STATUT : CONTRAT DE PRODUCTION BLOQUANT.** La forme des infographies du pilote BPCO validée le 20 octobre 2026 est la référence visuelle commune à **toutes** les pathologies. Appliquer ce skill automatiquement dès le « GO production » sans demander le rappel des consignes.

**Périmètre :** fiches de révision pathologiques (PDF), infographies intégrées et planches séparées, QCM, flashcards, cas cliniques fictifs et raccordement à l'onglet Pathologies. Appliquer également `docs/skills/production-fiches-revision-infographies-originales.md`. Ne pas modifier les règles propres aux **schémas QCM** ni au skill **planches anatomiques autonomes**.

## 1. Modèle maître BPCO : style approuvé ≠ contenu médical approuvé

- **Référence graphique impérative :** dix infographies BPCO présentées le 20/10/2026 (comparaison bronches, mécanismes bronchite/emphysème, obstruction, échanges gazeux, piégeage de l'air, spirométrie, prise en charge, surveillances, exacerbation). Il s'agit d'un **langage de composition**, non de modèles anatomiques à copier et **non** de recommandations cliniques validées.
- Planche didactique originale avec titre fort vert/bleu, fond crème/ivoire, illustration anatomique ou fonctionnelle dominante (non décorative), comparaison ou progression quand elle éclaire réellement le mécanisme, encadrés courts et lisibles, flèches/repères explicites, **« À retenir »** utile.
- Illustrations, texte, flèches, légendes, valeurs, médicaments et dispositifs doivent être **reconstruits pour chaque pathologie**, et contrôlés sur des sources scientifiques adéquates. Ne jamais reprendre par défaut des seuils, conduites, médicaments ou figures de la BPCO pour une autre maladie.
- Conserver l'identité de la fiche IFSI générale (titres, hiérarchie, bandeau UE si applicable) et insérer les infographies **au sein de la bonne section**, sans collage final de planches réduites.

## 2. Règle absolue : chaque schéma de fiche devient une infographie

> **Tout schéma apparaissant dans une fiche Pathologies doit être une infographie originale, vérifiée et contextualisée.**

**INTERDIT :** schéma anatomique brut, coupe isolée, image source recopiée, capture de cours ou d'écran, photographie, radiographie, simple flèche sur image non retravaillée, collage multipanneaux miniaturisé, affiche de textes/pictogrammes décoratifs, schéma sans titre ni clés de compréhension.

**OBLIGATOIRE :** transformer le *concept* en représentation pédagogique nouvelle (anatomie comparée, relations cause/effet, trajet, mécanisme, signes ou raisonnement) avec sujet visuel dominant, repères vérifiés, annotations françaises, légende non ambiguë et conclusion mémorisable. Un tableau, une définition ou un protocole **sans schéma** peut rester en texte ; n'inventer aucun visuel de remplissage.

**Quantité :** aucune règle fixe de « 10 infographies » ou « 6 pages ». Inventorier les schémas et notions réellement illustrables, créer **toutes et seulement les infographies nécessaires**.

## 3. Source de vérité et séparation officielle/complément

1. Inventorier le support officiel de l'UE et ses pages/diapositives, puis la transcription utile non publiable, les notes, et enfin les recommandations médicales externes datées (HAS, sociétés savantes, guides professionnels vérifiables).
2. Si le support officiel décrit l'anatomie sans traiter la pathologie, le signaler : **rappel de cours officiel** ≠ **complément clinique vérifié**. Ne jamais attribuer à l'enseignant un fait absent de ses supports.
3. Distinguer systématiquement : mécanisme, symptômes, diagnostics, examens, traitement et rôle infirmier ; éviter toute prescription universelle ou directive de soins hors protocole/compétences.
4. Chaque infographie comporte un identifiant stable `pathologyId/visualId`, la section cible, l'objectif, une liste exacte des annotations/flèches/mesures, sa source scientifique (titre, date, page ou URL vérifiable), les risques d'erreur à surveiller, et un statut de revue.
5. Pour une figure tierce : respecter licence/attribution ; **aucune** capture, radio, figure ou schéma issu d'un support officiel dans les PDF de fiches (même relooké). Refaire à partir des **notions**.

## 4. Workflow de production en une seule passe

1. **Inventaire** des thèmes/sections et visuels : définition, causes et risques, physiopathologie, symptômes, diagnostic, traitements, soins et surveillances, complications et alertes ; les adapter à la pathologie réelle. Raccorder les `courseIds` existants sans duplications.
2. **Brief par infographie** : concept, source/page, message d'apprentissage, structures anatomiques, orientation/latéralité, relations/flèches, valeurs/unités, annotations obligatoires, éléments interdits, section de la fiche et critères d'acceptation.
3. **Illustrer sans inventer** : générer de préférence l'anatomie **sans texte**, puis ajouter les libellés éditables et sourcés. Conserver proportions, flèches, relations, sens d'écoulement, axes et unités exacts.
4. **Composer la fiche clinique** : texte compréhensible + infographies placées dans leur contexte + points clés + **Définitions des mots-clés** en fin de fiche. Garder lisibilité A4 et écran mobile.
5. **Construire les exercices** depuis une matrice de référence unique : QCM autonomes (pas de 4/4 réponses), corrections par option, flashcards précises, cas patients fictifs progressifs, score et correction cohérents ; jamais de données identifiantes.
6. **Contrôler tous les actifs** (voir §5) et **corriger avant livraison**. Le « Go » autorise la production et l'autocorrection, pas la publication.
7. **Préparer le package privé** : fiche complète illustrée, infographies séparées, QCM/grille/corrigé, flashcards, cas, inventaire sources et état de validation. Aucune mise à disposition dans le dépôt public ou le Drive étudiant avant **GO publication explicite** sur le lot examiné.

## 5. Contrôles bloquants visuels et médicaux

Pour **chaque** schéma/infographie, vérifier et tracer :
- Originalité et fonction pédagogique réelle (illustration dominante, lien explicatif, titre, légende et mémo) ; aucune copie/miniature brute ou planche de texte déguisée.
- Exactitude anatomique : organes, tissus, latéralité, coupes, proportions, relations, flèches et sens des flux. Une figure générée ne vaut pas validation scientifique.
- Exactitude clinique : diagnostics/critères, symptômes, complications, valeurs/units, indications et contre-indications, médicaments/dispositifs, rôle infirmier, alertes et protocoles. Exemple : **ne pas donner une cible de SpO₂ comme universelle** ; conditionner la cible au contexte, à la prescription et aux recommandations applicables.
- Qualité : texte français sans coquilles, pas de contradiction entre illustration, titre, texte et QCM ; pas d'étiquette tronquée, déplacée ou illisible.
- **PDF final :** rendre **chaque page** en image et inspecter à 100 %, à l'échelle réelle A4 et sur mobile ; conserver la preuve privée du contrôle. Refuser les visuels hors-champ, avec pointages douteux, contenu non sourcé ou tout défaut restant.
- Tests automatiques : inventaire `visualId` unique, `sourceId` et source datée, `sectionId` existant, statut de contrôle visuel et médical, zéro schéma brut détecté **dans l'inventaire**. **Le contrôle automatisé ne remplace jamais la revue visuelle/médicale page par page.**

## 6. Validation du LOT P1 BPCO / HTA / diabète de type 2 — 20/10/2026

**Validation utilisateur acquise : FORME et STRUCTURE PÉDAGOGIQUE SEULEMENT.** La référence BPCO à six panneaux illustrés et les déclinaisons HTA et diabète type 2 constituent un **ensemble témoin du modèle graphique**, tel que présenté au propriétaire : six zones denses, codées en couleur, grandes illustrations anatomiques détaillées, coupes et comparatifs significatifs, bandeaux hiérarchisés, texte explicatif court et repères de soin, pictogrammes et mémos. Ne pas remplacer par des ronds simples, schémas vectoriels pauvres, cases vides ou une maquette sobre qui dégrade la densité ou la fonction pédagogique.

**Fidélité des modifications :** conserver l'identité graphique et les six fonctions pédagogiques du témoin. Les corrections doivent être **locales et ciblées** sur les légendes, flèches, dessins anatomiques, valeurs et formulations erronés. Garder un comparatif avant/après ; si la correction impose une recomposition substantielle, représenter le nouveau visuel au propriétaire. Une sortie PDF plus simple mais médicalement correcte ne remplace pas automatiquement la forme approuvée.

**Ne pas confondre :** la validation de la forme ne valide pas les images pixellisées, les textes incrustés, les seuils, les traitements, les exemples infirmiers, le catalogue JSON, le QCM, les cas cliniques, les flashcards ni l'ensemble du lot pour publication. Dans l'HTA, la présence d'une plaque d'athérosclérose dans une artère n'est pas constitutive de toute hypertension artérielle ; dans la BPCO, une cible SpO₂ 88–92 % ne doit pas apparaître comme universelle. Relecture médicale avant **toute utilisation comme fiche scientifique approuvée**.

**Six fonctions pédagogiques du témoin :** 1 définition et généralités ; 2 causes et physiopathologie ; 3 conséquences et signes ; 4 examens, diagnostic et bilan ; 5 traitements et prise en charge ; 6 rôle infirmier, surveillances et complications. Cela guide la composition sans imposer six pages à toutes les maladies.

**QCM et cas :** répartition non prévisible des bonnes réponses entre A/B/C/D(/E) ; interdiction de réponses A systématiquement vraies. Toute permutation doit synchroniser **options, indices justes, explications par proposition, corrigé PDF, score et feedback**. Test de répartition et de cohérence obligatoire sur chaque nouvelle banque et sur les étapes des cas cliniques. La validation de structure seule n'est **pas** une validation des distracteurs ou des explications médicales.

**Publication :** conserver les témoins et matrices de revue en espace privé ; ne pas ajouter ces fichiers au dépôt public ni au Drive étudiant avant la validation médicale détaillée, le contrôle du PDF page par page et un **GO publication explicite** portant sur les octets du package final.

## 6. Livrables et règle de publication

Le modèle maître BPCO fixe **la forme seulement**. Les visuels du pilote restent soumis à relecture médicale, correction des seuils/erreurs et approbation du *contenu final*. Approbation de la charte ≠ « GO publication ».

- Séparer clairement : **FICHE** (infographies originales intégrées), **INFOGRAPHIES AUTONOMES** (extraits complets, si prévus), **QCM** (schémas d'évaluation distincts), **ATLAS ANATOMIQUE** (skill propre).
- Toute erreur médicale, valeur hors contexte, figure brute, visuel absent, droits incertains, correction discordante ou contrôle PDF manquant : **BLOQUER** la livraison/publication.
- Après validation privée du lot et **GO publication explicite**, enregistrer les empreintes d'approbation, respecter `docs/PUBLICATION_APPROVAL.md`, vérifier fichiers/Drive/TNR/CI avant déploiement. Une simple validation de style n'autorise jamais la publication de nouveaux contenus.

**Rappel :** le standard s'étend aux BPCO, HTA, diabète, asthme, insuffisance cardiaque, AVC, etc. sans figer une même anatomie ni un nombre de planches.
