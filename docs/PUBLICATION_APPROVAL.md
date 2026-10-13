# Validation du package avant publication

Le flux d'un cours est **production → contrôles et autocorrections → revue privée de tous les livrables → validation du propriétaire et GO publication → Drive étudiant et application**.

## Deux autorisations distinctes

- `GO production` : autorise la fabrication, les tests et la préparation privée du lot.
- `GO publication`, ou instruction explicite équivalente : autorise la mise à disposition du package effectivement examiné. La validation d'un seul PDF ne vaut pas validation de l'ensemble. Une réponse ambiguë doit être clarifiée avant publication.

Cette règle s'applique aux nouveaux cours, aux nouvelles parties et aux mises à jour pédagogiques. Elle ne demande aucune approbation intermédiaire pour les brouillons ordinaires. Les changements de code ou de procédure sans livraison pédagogique n'exigent pas une approbation de package de cours.

## Package de revue

Présenter les fichiers disponibles avec leurs nombres et versions : fiche complète avec ses infographies intégrées, QCM avec grille et corrigé, infographies séparées, vocabulaire, flashcards, planches anatomiques et scripts vocaux. Indiquer séparément les MP3 reçus et ceux encore attendus. Donner un bilan des contrôles réels et des blocages.

Conserver la revue dans un espace privé dont les droits ont été vérifiés. La validation des scripts permet de publier un lot sans MP3 si le propriétaire approuve explicitement cette portée ; le statut reste `awaiting_mp3`. L'arrivée ultérieure de MP3 déclenche des contrôles et une nouvelle autorisation pour cette mise à disposition.

## Enregistrement public minimal

Pour un lot pédagogique nouveau ou modifié, `docs/course-deliveries.json` doit contenir :

```json
"publicationApproval": {
  "status": "approved",
  "authorization": "explicit_go_publication",
  "scope": "course_package",
  "approvedAt": "2026-10-13T12:00:00Z",
  "bundleSha256": "empreinte_SHA256_du_lot_de_publication"
}
```

Ce bloc est renseigné seulement après un message explicite du propriétaire. La date ci-dessus est un exemple ; elle ne constitue pas une validation. Ne pas commiter la conversation, son contenu, des adresses personnelles, les liens de revue privés ou les PDF. La preuve complète de l'autorisation et la liste des livrables examinés restent privées.

L'empreinte lie l'approbation aux ressources du cours, aux banques QCM déclarées, aux images locales et aux résumés de contrôle PDF. Le contenu des flashcards rattachées aux questions fait partie de cette empreinte. Les anciens cours inchangés ne sont pas soumis rétroactivement à cette nouvelle obligation.

Renseigner aussi `artifactSha256s`, un objet associant chaque identifiant de fichier Drive du lot à l'empreinte SHA-256 de ses octets réellement examinés. Cela couvre notamment les supports, PDF, exports de flashcards et scripts. Le contrôle refuse un fichier référencé sans empreinte de revue. Le téléchargement authentifié et le contrôle après dépôt restent des opérations privées à exécuter ; la CI ne les effectue pas elle-même.

La commande de contrôle affiche l'empreinte attendue lorsqu'une approbation manque :

```sh
IFSI_BASE_SHA=<commit_de_base> node tests/course-publication-approval.mjs
```

Un contenu modifié, un nouveau MP3 ou un PDF dont l'empreinte change invalide la validation précédente. Représenter les éléments touchés et obtenir l'autorisation avant d'enregistrer une nouvelle empreinte. Ne jamais actualiser automatiquement le bloc d'approbation pour faire passer la CI.

## Ce que la CI atteste

La CI refuse un lot pédagogique suivi dans le manifeste lorsqu'il est nouveau ou modifié sans approbation explicite déclarée, ou lorsque l'empreinte approuvée diffère du lot proposé. Les contrôles existants continuent de refuser les premières publications et parties absentes du manifeste.

La CI ne peut pas prouver l'identité de la personne qui a donné l'accord, lire sa conversation privée, vérifier les droits Drive en temps réel ou garantir l'exactitude médicale. L'opérateur doit vérifier ces points. Aucun champ JSON ne remplace l'accord réel.

Après le GO publication : déposer les finales autorisées dans Drive étudiant, vérifier les copies retéléchargées, vérifier le manifeste et les TNR, attendre la CI verte, puis contrôler la version déployée. La CI verte seule n'autorise pas la publication.
