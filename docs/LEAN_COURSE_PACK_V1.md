# IFSI ABC — Production « lean_v1 » : cours complets, pilote d'une page uniquement

**Version corrigée le 20 octobre 2026.** Un exemple d'une page par livrable sert seulement à APPROUVER LE STYLE ; ce n'est pas une restriction de longueur des PDF définitifs.

## Livrables attendus

1. **Fiche de révision classique complète** : toutes les notions du support officiel, explications et schémas infographiés intégrés selon la pertinence ; PDF multipage.
2. **Cours complet infographié** : toutes les notions du même support, illustrées et expliquées au travers d'autant de pages A4 que nécessaire. Ce fichier est distinct de la fiche classique, sans suppression de notions pour tenir sur une page. L'affichage applicatif est « Fiche complète infographiée ».
3. **QCM corrigés argumentés**, 5 choix A–E, 1 à 3 réponses correctes ; flashcards liées à leurs questions QCM et réponses cachées dans l'application.
4. **Planches anatomiques seulement au besoin**, après audit des ressources existantes ; aucune duplication artificielle.

Les vocaux TXT/MP3, lexiques autonomes et exports de toutes les images ne sont pas systématiques. Le cours est analysé une fois, produits et figures sont réutilisés ; Work intervient seulement si la complexité l'exige.

## Source de vérité et production privée

Créer UNE matrice privée sourcée : `title`, `notions:[{id,sourcePage}]`, `sections:[{heading,notionIds,paragraphs,figure?}]`, `infographicPanels:[{heading,body,notionIds,figure?,sourcePages?}]`, `qcmQuestions:[...]`, `flashcards:[{id,qid,front,answers,explanation}]`. Les unions de `notionIds` dans **sections et infographicPanels** doivent chacune recouvrir EXACTEMENT toutes les notions de la matrice officielle. La machine vérifie l'inventaire, pas la véracité médicale du texte : inspection pédagogique, scientifique et visuelle impérative.

```bash
python -m pip install reportlab==4.4.9 Pillow pymupdf==1.26.7
python tools/lean_course_pack.py \\
  --content /chemin/prive/matrice_du_cours.json \\
  --assets-root /chemin/prive/illustrations_validees \\
  --out /chemin/prive/pack_en_revue
```

Sorties `Fiche_Revision.pdf` (cours classique), `Cours_Complet_Infographie.pdf` (cours intégral infographié multipage), `QCM_Corrige.pdf`, `QCM.json`, `Flashcards.json`, `manifest_prive.json`. Le cache vérifié SHA-256 évite toute régénération si fichiers et sources n'ont pas changé. Aucune publication dans Drive ni merge automatique par ce moteur.

## Application : nouveau format compatible

Pour une nouvelle livraison `packFormat:"lean_v1"` (les livraisons anciennes restent inchangées) : une ressource `sheetFormat:"classic"`, une autre `sheetFormat:"complete_infographic"`, deux Drive IDs distincts. La couverture `dualSheetCoverage:{expectedNotions,classicCovered,infographicCovered,medicalReview? | disciplinaryReview?,readabilityReview:"approved"}` exige trois valeurs égales. Les rapports d'audit `visualAudit` / `infographicSheetVisualAudit` et les preuves authentifiées correspondantes attestent les empreintes et le vrai nombre de pages du PDF complet. Le nombre de pages **n'est pas limité**.

Les QCM/correctifs et flashcards suivent leur vérité unique. Anciens manifests et TNR legacy préservés. Les tests ne téléchargent pas les PDF privés et ne remplacent pas l'inspection scientifique ni la preuve Drive.

## Portes de validation

`GO audit` → `GO production` (privé) → revue des **supports complets** → `GO publication` explicite. Une page pilote validée ne constitue ni une revue du cours complet ni une autorisation de publication.
