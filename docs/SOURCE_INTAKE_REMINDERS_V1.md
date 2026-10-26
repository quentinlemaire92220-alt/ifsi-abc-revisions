
# IFSI ABC — Suivi des supports officiels attendus (cadrage v1)

Date : 26/10/2026. Ce document ne contient aucune donnée, nom de fichier ou URL de source privée.

## Entrées et production
- Un cours comporte des supports (captures facultatives, support officiel si reçu) et des transcriptions privées ; seule la production explicitement demandée par l'utilisateur peut créer une fiche, un QCM, des flashcards ou un vocal.
- Les captures préservent temporairement les notions visuelles en attendant le support officiel. Elles ne le remplacent pas dans la hiérarchie des sources.
- Le statut de réception d'un support officiel est Présent, Absent confirmé ou À vérifier. « À vérifier » n'est pas une absence prouvée.
- Le suivi de réception et le statut de production sont indépendants.

## Champs du registre privé
Clé cours/partie (stable), UE, intitulé, origine FAC/IFSI/à qualifier, plateforme, date du cours si attestée, première réception attestée des captures ou transcriptions, présence de chaque source, état de l'officiel, dernière vérification de la plateforme, dernière relance, nombre de jours, action conseillée, prochaine échéance et notes de preuve.

## Décisions temporelles
- Prendre comme point de départ la date authentifiée du cours. Si elle manque, utiliser la première réception documentée de source. Ne pas inventer de date.
- Avant J+7, attendre ; J+7, vérifier E-Campus (FAC) ou Yikiforma (IFSI) ; J+14, préparer une relance ; J+21, suivi prioritaire.
- Après une relance réellement enregistrée, espacer la prochaine échéance de sept jours ; une vérification enregistrée et une relance ne sont pas équivalentes.
- Lorsque le support officiel est confirmé présent, arrêter le compteur, conserver l'historique et proposer un rapprochement avec les sources/ressources anciennes uniquement si utile.
- Si la provenance FAC/IFSI reste inconnue, afficher « À qualifier » : ne pas présumer la plateforme, l'enseignant destinataire ou le délai réel de mise en ligne.

## Implémentation à ce stade
- Suivi calculé dans un nouvel onglet du registre privé existant, alimenté pour les dossiers « À traiter » où l'on sait qu'une transcription ou des captures sont présentes sans support officiel confirmé.
- Les dates déjà renseignées sont les premières dates ATTESTÉES dans l'historique consulté ; elles peuvent être plus récentes que la première capture réelle. Les dates de cours et les origines non établies restent vides/à qualifier.
- Le tableau ne crée aucune notification autonome et ne découvre pas automatiquement chaque nouveau fichier dans Drive. Les nouveaux cours doivent être inscrits dans ce suivi jusqu'à réalisation d'un collecteur privé avec accès authentifié.
- Ne jamais exposer ces lignes, les transcriptions, leurs liens ou des métadonnées privées via GitHub, GitHub Pages, Supabase public ou le catalogue des étudiants.

## Critères de recette pour une automatisation future
1. Bornes J+6, J+7, J+13, J+14, J+20 et J+21 ; inconnues et dates futures.
2. Contrôle des changements « À vérifier » vers « Présent » ; fin des relances ; historiques conservés.
3. Respect d'un délai de sept jours après une relance ; contrôles sans message intempestif.
4. Un même cours avec deux sources reçues n'est pas dupliqué ; parties différentes restent distinctes.
5. Aucune fabrication automatique de livrables à partir d'un dépôt ; aucun identifiant privé dans un build étudiant.
6. Toute future intégration app nécessite une authentification propriétaire, des règles d'accès et des tests de confidentialité, puis un GO publication distinct.
