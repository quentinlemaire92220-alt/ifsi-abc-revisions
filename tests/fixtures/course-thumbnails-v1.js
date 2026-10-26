/* IFSI ABC — adaptation visuelle des vignettes de cours.
 * PREPARED ONLY — ne pas charger dans index.html avant QA des 55 vrais WebP.
 * Additif: aucune mutation des sources, QCM, scores, badges ou PDF.
 */
(function(){
 'use strict';
 var IDS = new Set([
  "biomolecules",
  "cellules_tissus",
  "homeostasie",
  "parasites_champignons",
  "genetique",
  "niveaux_organisation",
  "physiopathologie_infections",
  "diagnostic_virologie",
  "virus",
  "systeme_urinaire",
  "systeme_endocrinien",
  "systeme_immunitaire",
  "systeme_respiratoire",
  "systeme_cardiovasculaire",
  "prevention_ias_asepsie",
  "systeme_nerveux",
  "infections_neuro_meningees",
  "calculs_doses_mathematiques",
  "systeme_digestif",
  "appareil_locomoteur",
  "traumatologie",
  "histoire_profession_infirmiere",
  "epistemologie_savoirs",
  "ethique_infirmiere",
  "douleur",
  "parametres_vitaux",
  "grands_brules",
  "infections_cutanees",
  "diagnostic_bacteriologie",
  "infections_urinaires",
  "arthrose",
  "chirurgie_orthopedique",
  "rhumatismes_inflammatoires",
  "pathologies_microcristallines_osteoporose",
  "competences_psychosociales",
  "methodes_travail_reussite",
  "vaccination_prs",
  "infections_pulmonaires_bacteriennes",
  "infections_respiratoires_virales",
  "ist_hors_vih",
  "introduction_droit",
  "psychologie_sante",
  "pharmacologie",
  "administration_medicamenteuse",
  "systeme_reproducteur",
  "plaies_pansements",
  "stomatotherapie",
  "droits_patients",
  "pssm",
  "sante_mondiale_sante_france",
  "responsabilite_exercice_professionnel",
  "d1_communication_td1",
  "d1_posture_professionnelle_td2",
  "d1_bientraitance",
  "d1_relation_soignant_soigne_ecoute_active"
]);
 var assetRoot = './assets/course-thumbnails/';
 var processed=0, fallbackCount=0;
 function thumbFor(card) {
   return String(card.dataset.courseId || window.IFSI_V741?.courseIdForLabel?.(card.dataset.course74) || '');
 }
 function apply(){
   var cards=document.querySelectorAll('#v74CourseGrid .v74-course-tile .v74-course-card');
   cards.forEach(function(card){
     var box=card.querySelector('.mku-thumbnail');
     if(!box || box.dataset.pictureProcessed === 'yes') return;
     var id=thumbFor(card);
     if(!IDS.has(id)) return; // never guess: keep existing fallback
     var fallback=box.textContent;
     box.dataset.pictureProcessed='yes';
     var picture=document.createElement('img');
     picture.alt='';
     picture.decoding='async';
     picture.loading='lazy';
     picture.className='ifsi-course-picture';
     picture.src=assetRoot+encodeURIComponent(id)+'.webp';
     picture.addEventListener('error',function(){
       fallbackCount++;
       box.replaceChildren(document.createTextNode(fallback));
       box.classList.remove('ifsi-has-picture');
       box.dataset.pictureProcessed='failed';
     },{once:true});
     box.replaceChildren(picture);
     box.classList.add('ifsi-has-picture');
     processed++;
   });
 }
 var style=document.createElement('style');
 style.textContent='#v74CourseGrid .mku-thumbnail.ifsi-has-picture{overflow:hidden;padding:0;line-height:0}#v74CourseGrid .mku-thumbnail .ifsi-course-picture{width:100%;height:100%;display:block;object-fit:cover;border-radius:inherit}';
 document.head.appendChild(style);
 var compact=window.IFSI_COURSE_COMPACT;
 if(compact && typeof compact.apply==='function'){
   var preceding=compact.apply;
   compact.apply=function(){var r=preceding.apply(this,arguments);apply();return r;};
 }
 window.addEventListener('ifsi:v741-ready',apply);
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true});
 else apply();
 window.IFSI_COURSE_THUMBNAILS = Object.freeze({
   apply:apply,
   status:function(){return {configured:IDS.size,processed:processed,failedImages:fallbackCount};}
 });
})();
