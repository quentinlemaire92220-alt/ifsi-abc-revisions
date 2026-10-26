# Revue visuelle du lot 55 vignettes — 26 octobre 2026

## GO utilisateur
Le propriétaire a confirmé « Valide Go » pour une vignette distincte sur les 55 cours.
Le GO autorise à finaliser puis déployer **des images conformes** à la planche de référence, pas à publier des visuels approximatifs.

## Résultat réel de la préparation
- Catalogue exact : 55 cours identifiés, aucun cours supprimé.
- Planche de référence : 18 vignettes médicales riches, extraites localement pour revue (non encore chargées dans GitHub).
- Cinq propositions extraites d'autres planches présentent encore des labels/éléments de cartes ou ont une composition différente : **non validées**.
- Trente-deux rendus alternatifs à base de pictogrammes colorés ne sont **pas conformes** à la qualité anatomique 3D de la planche choisie : **rejetés comme livrables finals**.
- En particulier, ne pas substituer des emoji ou un même stéthoscope à 37 illustrations médicales dédiées.
- D1.1 Relation soignant-soigné : personnage masculin aux cheveux validé comme choix stylistique ; aucune prétention à une vraie ressemblance physique.

## Conditions bloquantes pour publication
1. Produire une illustration médicale spécifique et visuellement cohérente **pour chaque cours**.
2. Exporter 55 fichiers `assets/course-thumbnails/<courseId>.webp` sans texte, code UE ou label figé.
3. QA individuel : cadrage à 62 px et mobile, exactitude du sujet, absence de confusions anatomiques, rendu clair/sombre, contraste et netteté.
4. Implémenter le changement à partir des identifiants stables du registre, conserver l'accessibilité clavier/lecteur d'écran et un fallback.
5. Conserver tous les QCM, flashcards, vocaux, fiches, scores, PDF et statuts provisoires.
6. Tester le cache/PWA, TNR complets, faire une revue de l'application réelle et vérifier GitHub Pages après la fusion.
7. Tenir compte de la PR de maquette graphique #230 restée en revue. Ne pas la fusionner automatiquement.

**Décision QA : BLOQUÉ — la PR #237 reste en brouillon, pas de fusion ni publication à ce stade.**

## Nouvelle tentative sous GO — 26/10, lot candidat complet
- 55 images WebP distinctes sont **produites localement** et assemblées dans le ZIP privé `IFSI_ABC_55_vignettes_candidates.zip` (256×256 px, un fichier par ID de cours).
- 18 images restent les originaux extraits de la planche approuvée. Les 37 autres ont été découpées et/ou composées depuis une nouvelle planche illustrative générée à titre d'essai.
- **Contrôle technique local réussi** : 55/55 identifiants présents, 55 empreintes SHA-256 distinctes, format WebP et dimensions identiques, manifeste créé.
- **Contrôle graphique refusé pour le lot** : les scènes de recherche/histoire de la profession, certaines infections et troubles articulaires ne sont pas suffisamment représentatives ; des artefacts de typographie restent dans quelques extraits, en particulier les rangées inférieures de la planche. Répétition partielle de certains motifs anatomiques sous différents cours.
- Ces 37 images sont marquées `candidate_review` et `graphicalValidated=false`, aucune publication étudiante ni transfert de leurs octets dans GitHub.
- Une génération supplémentaire des scènes manquantes a été sollicitée, mais aucun résultat achevé et contrôlé n'est encore disponible dans le dépôt.

**Décision maintenue : pas de fusion, pas d'activation du catalogue 55 avant correction image par image.** La réussite des tests CI préexistants ne prouve pas la conformité visuelle des nouveaux visuels non committés.
