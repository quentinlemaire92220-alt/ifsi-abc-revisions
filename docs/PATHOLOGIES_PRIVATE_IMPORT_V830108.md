# Pathologies P1 — import personnel de supports en revue (V8.30.108)

## Objet

Cette fonctionnalité permet **au propriétaire, sur son propre appareil**, de consulter dans la rubrique Pathologies des supports BPCO, HTA, diabète type 2 qui sont encore en **revue médicale**.

Le **JSON de supports, les 18 images et les 156 exercices ne sont ni committés sur GitHub, ni mis en cache par le service worker, ni téléchargés automatiquement, ni envoyés à Supabase ou Google Drive**. Ils sont choisis manuellement par l'utilisateur via le sélecteur de fichier local.

## Utilisation sur le PC

1. Télécharger le ZIP privé `IFSI_ABC_PATHOLOGIES_P1_IMPORT_PRIVE.zip` depuis la conversation, l'extraire localement.
2. Dans IFSI ABC V8.30.108, ouvrir **🩺 Pathologies**.
3. Cliquer **Importer un pack privé (JSON)** et sélectionner `IFSI_ABC_PATHOLOGIES_P1_IMPORT_PRIVE.json` (ne pas sélectionner le ZIP).
4. Sélectionner **Système respiratoire → BPCO**, ou cardiovasculaire → HTA, ou endocrinien → diabète de type 2.
5. Consulter la fiche illustrée à six planches, les dix sections, les 24 QCM, 20 flashcards et huit étapes de cas par pathologie. Afficher les corrigés provisoires à la demande **sans score**.
6. Cliquer **Effacer mon pack local** pour retirer le fichier de l'appareil.

**Sur un autre appareil ou profil navigateur, réimporter le pack :** les données ne sont jamais synchronisées entre terminaux.

## Restrictions et sécurité

- Le module valide strictement `schema:ifsi-abc-private-pathologies-p1-v1`, `reviewOnly:true`, `publicationPermitted:false` et `clinicalReview:pending`.
- Seuls les trois cours connus, six pages par pathologie, 24 QCM, 20 flashcards et 8 étapes cliniques sont autorisés.
- Les images sont intégrées au fichier local de l'utilisateur sous forme de WebP qualité 95, **sans modifications du texte ou des planches originales**, avec conservation des SHA-256 d'origine dans le manifeste du pack.
- Le navigateur stocke les données dans son propre `IndexedDB` et affiche le contenu sans requête réseau ; aucune URL de revue privée ne figure dans la branche publique.
- Les corrections et valeurs médicales ne sont **pas considérées comme médicalement approuvées**. L'import privé n'appelle ni `activate()` ni les mécanismes de notation.
- Le format d'import personnel ne constitue **pas** une approbation d'un lot pédagogique partageable ni un GO publication à la promotion.
- L'application ne doit pas promettre une sécurité de type serveur : le pack est local au navigateur et reste sous le contrôle du propriétaire de l'appareil. Ne pas utiliser sur un PC partagé non maîtrisé.

## Publication étudiante ultérieure

Après une revue clinique réelle des 18 planches, sections et 156 exercices, contrôle des sources et droits de diffusion et validation du lot final exact, utiliser les `posterPages` et validations conformes du moteur Pathologies pour une **publication publique distincte**. Ne pas faire évoluer le lecteur privé en contournement du moteur.
