# UE B3.3 S1 — Douleur — préparation technique de l'accès à la fiche hybride (22/10/2026)

**État : EN REVUE PRIVÉE — publication de la nouvelle fiche BLOQUÉE par le contrôle qualité, même avec GO de mise à jour de l'application.**

## Candidat privé identifié (NE PAS déposer dans GitHub public)

- Nom cible : `Douleur_Fiche_Revision_Hybride_Infographiee.pdf`.
- Support officiellement identifié : Catherine Machado, 124 diapositives, source existante à préserver.
- Synthèse privée complétée par PLAUD : 32 pages A4, 67 termes de lexique en texte sélectionnable ; figures intégrées.
- Empreinte **du candidat initial examiné** : `decbbe1e23cce312a379b6a00e4ba4a896a46381c3acbc0d6b27e5d580f875bb`.
- **Problème corrigé dans une copie de travail privée** : anciennes références `/23` encore visibles en pied de certaines des 32 pages.
- Empreinte **de la copie privée à pagination corrigée** : `1617b4550a9d2b1c2f29edb2cfdc44987c1280c39554df15877ebad6ca572bce`. Cette empreinte ne vaut pas approbation scientifique ou graphique.
- Fichier final de 32 pages **non uploadé dans Drive étudiant** : **aucun Drive ID ne doit être inventé** et le lien étudiant historique ne doit pas être modifié pour l'instant.

## Contrats et données inchangés

- `courseId=douleur` inchangé ; fiche historique Drive existante conservée.
- 52 QCM `qextra-51.txt`, réponses, historique et scores inchangés.
- Trois MP3 déjà publiés et règles des vocaux/flashcards inchangés.
- Quatre anciennes infographies + pack de **16 planches** conservés sans réécriture.
- Le statut actuel `publicationScope=infographics_only` dans `docs/course-deliveries.json` **n'autorise pas la publication d'une fiche hybride**.
- La fiche hybride n'est pas une seconde fiche et les 16 planches restent des **archives/ressources historiques**, sans supprimer ni réécrire leurs liens.

## Contrôles bloquants restants

1. Inspection graphique **page par page** contre les **10 pages du modèle pharmacologie v1.46/v1.47**, illustrations anatomiques, flèches, légendes et proportion texte-image comprises ; la revue précédente signale encore une conformité non acquise.
2. Relecture médicale indépendante, notamment posologies, seuils, délais, opioïdes, médicaments chez la femme enceinte et cadre légal infirmier. Recouper les paroles PLAUD et le diaporama sans transformer une transcription approximative en vérité médicale.
3. Matrice sourcée des notions essentielles : précisions orales **explicitement prioritaires** distinctes des priorités déduites, preuve de couverture.
4. Accord graphique du propriétaire sur les **octets exacts** du PDF examiné, enregistré avec SHA-256. Un « Maj application » est un GO d'action, **pas une déclaration mensongère de conformité graphique**.
5. Upload authentifié du PDF révisé et accepté vers Drive étudiant, vérification du téléchargement et empreinte identique, puis ajout d'une **seule ligne `sheetFormat:hybrid_infographic`**, remplacement logique de l'accès principal sans suppression de l'ancien PDF. Aucun autre sous-système QCM/flashcards/vocaux ne doit changer.
6. Exécuter tous les TNR, contrôler accès direct, mobile, hors-ligne et présence des 16 anciennes planches, puis seulement fusionner/déployer le lot approuvé.

## Modification testable de cette PR de préparation

L'interface `index.html` sait afficher le libellé distinct **« Fiche hybride infographiée »** lorsqu'une ressource authentique validée porte `sheetFormat=hybrid_infographic`, sans modifier la présentation des packs historiques. Un test bloque les régressions de ressources Douleur pendant que la validation est en attente.

**Cette PR ne contient ni PDF, ni PLAUD, ni nouveau lien Drive, ni fausse validation ; son merge n'est pas une autorisation de publier Douleur.**
