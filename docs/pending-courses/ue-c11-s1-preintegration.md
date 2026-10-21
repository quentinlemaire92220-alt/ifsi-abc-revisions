# UE C1.1 S1 — Santé mondiale et santé en France — préparation technique non publiée

**Statut : revue privée / préparation uniquement — NE PAS FUSIONNER NI PUBLIER.**

Ce changement préinscrit le cours `sante_mondiale_sante_france` sans ressources, URLs ni entrée dans une banque QCM active. L'absence de ressources est intentionnelle ; aucun faux statut `validated:true` ou `complete` n'est déclaré.

## Livrables actuellement conservés hors GitHub public
- Fiche de révision de 16 pages.
- 56 QCM à 5 propositions et 1–3 bonnes réponses, à importer avec explications et identifiants stables.
- 56 flashcards autonomes.
- 9 infographies individuelles de style validé, rassemblées également en un PDF.

Les fichiers de révision, les photos de référence, les originaux de cours, les transcriptions et les rapports de relecture détaillés restent **hors dépôt public**.

## Bloqueurs identifiés (21 octobre 2026)
1. Revue scientifique des neuf infographies pas terminée ; un visuel sur les maladies transmissibles présente la prophylaxie post-exposition VIH sous la forme « 48–72 h », à corriger à partir des recommandations françaises applicables. Ne pas exposer ce visuel aux étudiants en l'état.
2. Le chapitre annoncé sur les inégalités de santé, l'accès et le recours aux soins n'est pas documenté intégralement par les sources reçues : ne pas attester la couverture exhaustive.
3. Vérifier la concordance de tous les chiffres, unités, cartes et graphiques démographiques avec les sources officielles et leur millésime.
4. Les 56 QCM ne sont pas encore importés dans le schéma natif `choices[]` + `answers[]` et la cohérence flashcards/QCM n'a pas été testée dans l'application.
5. Les PDFs n'ont pas encore de liens Drive publiés, donc aucune déclaration de manifeste ni empreinte retéléchargée ne peut être valide.
6. Les TNR du changement et la revue du rendu mobile devront précéder toute fusion ou publication.

## Sortie du statut bloqué
- Recevoir/comparer la version intégrale du support officiel (si disponible), corriger les assertions vérifiables, achever l'audit de couverture.
- Conserver les maquettes approuvées et corriger localement les textes/images concernés, sans changement graphique non demandé.
- Préparer les ressources dans la structure Drive, calculer leurs empreintes réelles, adapter les QCM et flashcards au moteur, enregistrer le manifeste **uniquement lorsque les ressources sont authentifiées**.
- Exécuter les TNR / CI / contrôle éditorial et obtenir un **GO publication** clair avant toute fusion sur `main`.

## Références techniques
`docs/NEW_COURSE_PUBLIC_CONTRACT.md`, `docs/COURSE_DELIVERY.md`, `docs/skills/standard-visuel-fiche-revision-vs-infographie.md`, `docs/PUBLICATION_APPROVAL.md`.

**Cette PR n'est ni la livraison du cours, ni la validation de ses supports.**

## Addendum de contrôle scientifique du 21/10/2026 — version privée V3

Les deux erreurs avérées sur l'infographie 06 ont été corrigées dans le pack privé, **pas dans les fichiers publics** :
- Traitement post-exposition VIH : instaurer dès que possible, idéalement dans les 4 h, au plus tard 48 h après exposition si indiqué (HAS) : https://www.has-sante.fr/jcms/p_3536535/fr/traitement-preventif-post-exposition-au-vih
- Vaccination : le BCG existe pour certaines formes de tuberculose et l'OMS recommande RTS,S et R21 pour certains enfants de zones palustres ; contrairement au texte original de la planche. Source OMS : https://www.who.int/fr/news-room/questions-and-answers/item/q-a-on-rts-s-malaria-vaccine/

**Nouveaux points bloquants détectés** : l'infographie 03 confond formule d'accroissement absolu et taux (%) de croissance ; formule correcte = accroissement / population de départ × 100, avec éventuels ajustements statistiques (Insee : https://www.insee.fr/fr/statistiques/2381468). Une autre formulation présente à tort le vieillissement comme spécifique à la France alors qu'il est mondial, à des rythmes différents (ONU : https://desapublications.un.org/file/20847/download). Les cartes, pyramides et taux des planches demandent une revue systématique des chiffres, des sources et des millésimes. Le cours n'est toujours pas publiable.
