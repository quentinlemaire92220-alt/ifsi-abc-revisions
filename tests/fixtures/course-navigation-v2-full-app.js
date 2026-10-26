(function(){
 'use strict';
 var report={attempts:0,jsErrors:[],openedCourses:false};
 var result=document.createElement('output');
 result.id='ifsiRealAppTest';result.dataset.result='pending';result.textContent='Initialisation';
 document.body.appendChild(result);
 window.addEventListener('error',function(e){if(report.jsErrors.length<10)report.jsErrors.push(e.message)},true);
 function fail(msg){
   result.dataset.result='fail';
   result.textContent=String(msg)+' | '+JSON.stringify({attempts:report.attempts,errors:report.jsErrors});
 }
 function pass(msg){result.dataset.result='pass';result.textContent=msg}
 function next(callback){setTimeout(callback,240)}
 function checkBoot(){
   if(result.dataset.result!=='pending')return;
   var v74=window.IFSI_V74,reg=window.IFSI_V741&&window.IFSI_V741.getRegistry&&window.IFSI_V741.getRegistry();
   var grid=document.getElementById('v74CourseGrid');
   var ui=window.IFSI_COURSE_NAV_UI;
   report.attempts++;
   if(!v74||!reg||reg.courses.length<55||!grid||grid.querySelectorAll('.v74-domain-group').length<5||!ui||!ui.status().active){
     if(report.attempts<90)return next(checkBoot);
     return fail('Démarrage incomplet : '+JSON.stringify({hasV74:!!v74,courses:reg&&reg.courses.length,groups:grid&&grid.querySelectorAll('.v74-domain-group').length,ui:ui&&ui.status()}));
   }
   try{
     // showCourses() reconstruit la liste. Patienter une passe de l'observateur après ce rendu.
     if(!report.openedCourses){report.openedCourses=true;v74.showCourses();return next(checkBoot)}
     if(!grid.querySelector('.v8430-domain-switch')){
       if(report.attempts<90)return next(checkBoot);
       throw Error('Menus pédagogiques absents après 90 contrôles : '+JSON.stringify(ui.status()));
     }
     if(document.querySelector('#courses74 .v8430-note'))throw Error('Avertissement permanent inattendu');
     // Contrôler une vraie UE après rendu V74 (mode sombre/clair compatible).
     var ueHead=grid.querySelector('.v8430-ue-switch');
     var ueTitle=ueHead&&ueHead.querySelector('.v74-ue-title');
     var ueName=ueHead&&ueHead.querySelector('.v8430-ue-name');
     var ueCount=ueHead&&ueHead.querySelector('.v74-ue-count');
     var arrow=ueHead&&ueHead.querySelector('.v8430-arrow');
     if(!ueTitle||!ueName||!ueCount||!arrow)throw Error('Structure pédagogique UE incomplète');
     if(getComputedStyle(ueTitle).display!=='grid')throw Error('UE : titre et compteurs non séparés');
     if(arrow.getBoundingClientRect().width<28||arrow.getBoundingClientRect().height<28)throw Error('Flèche de navigation trop petite');
     if(ueCount.getBoundingClientRect().top<=ueName.getBoundingClientRect().top)throw Error('Compteurs UE non placés sous son titre');
     var before=ui.status().passes;
     var cards=grid.querySelectorAll('.v74-course-card').length;
     if(cards<40)throw Error('Seulement '+cards+' cours dans le catalogue');
     grid.querySelectorAll('.v74-course-card').forEach(function(card){
       var tile=card.closest('.v74-course-tile'),actions=tile&&tile.querySelector('.v8433-card-actions');
       if(!actions||!actions.querySelector('.v8433-course-open'))throw Error('Accès au cours non regroupé');
       var bounds=tile.getBoundingClientRect();
       actions.querySelectorAll('a,button').forEach(function(action){
         if(action.closest('button')!==action&&action.closest('button'))throw Error('Action imbriquée dans un bouton');
         if(!tile.contains(action))throw Error('Action hors de sa carte');
         if(!action.getClientRects().length)return;
         var rect=action.getBoundingClientRect();
         if(rect.top<bounds.top||rect.bottom>bounds.bottom+1||rect.left<bounds.left||rect.right>bounds.right+1)throw Error('Action débordant du cadre');
       });
     });
     var first=grid.querySelector('.v74-course-card');
     for(var i=0;i<300;i++){var node=document.createElement('em');first.appendChild(node);node.remove()}
     next(function(){
       try{
         var after=ui.status().passes;
         if(after>before+4)throw Error('Rafales non maîtrisées : '+before+' -> '+after);
         v74.openCourse('Biomolécules');
         next(function(){checkDetail(cards,after)});
       }catch(e){fail(e.stack||String(e))}
     });
   }catch(e){fail(e.stack||String(e))}
 }
 function checkDetail(cards,passes){
   try{
     var detail=document.getElementById('v74CourseDetail');
     var ui=window.IFSI_COURSE_NAV_UI;
     var blocks=Array.from(detail.querySelectorAll(':scope > .v74-resource-block')).map(function(el){
       if(el.classList.contains('v74-original-support'))return 'support';
       if(el.classList.contains('v74-child-supports'))return 'support';
       if(el.classList.contains('v74-qcm-section'))return 'qcm';
       var text=(el.querySelector('.row b')?.textContent||'').toLowerCase();
       if(text.includes('fiches de révision'))return 'fiche';
       if(text.includes('infographie'))return 'infographie';
       if(text.includes('vocau'))return 'vocal';
       return 'complement';
     });
     for(var i=1;i<blocks.length;i++){
       var rank={support:0,fiche:1,qcm:2,infographie:3,vocal:4,complement:5};
       if(rank[blocks[i]]<rank[blocks[i-1]])throw Error('Ordre réel incorrect : '+blocks.join(', '));
     }
     var breadcrumb=detail.querySelector('.v8430-path');
     if(!breadcrumb||!breadcrumb.textContent.toLowerCase().includes('biomédicales'))throw Error('Fil pédagogique biomolécules absent');
     var badge=document.querySelector('.v8430-provisional');
     if(!badge)throw Error('Pastille Provisoire absente du catalogue');
     document.body.classList.add('v72-dark');
     var dark=getComputedStyle(badge).backgroundColor;
     document.body.classList.remove('v72-dark');
     var light=getComputedStyle(badge).backgroundColor;
     if(dark===light)throw Error('Thème sombre identique au clair');

     detail.querySelectorAll('.mku-toggle:not(:disabled)').forEach(function(button){if(button.getAttribute('aria-expanded')==='false')button.click()});
     var compact=detail.querySelector('.v74-resource-list > .v74-resource > .actions .btn');
     if(!compact)throw Error('Aucun bouton de ressource pour tester la compacité');
     var dimensions=compact.getBoundingClientRect();
     if(dimensions.width>190||dimensions.height<(innerWidth<=690?42:34))throw Error('Bouton de ressource trop large ou trop petit : '+dimensions.width+'×'+dimensions.height);
     var resource=compact.closest('.v74-resource');
     if(getComputedStyle(resource).display!=='grid')throw Error('Carte ressource pas en mise en page compacte');
     document.querySelectorAll('#v74CourseGrid .v74-tile-support').forEach(function(link){
       if(!link.getClientRects().length)return;
       var width=link.getBoundingClientRect().width;
       if(width>230||width>=link.parentElement.getBoundingClientRect().width-8)throw Error('Raccourci officiel encore en grand bandeau : '+width);
       if(!link.querySelector('.v8433-emoji'))throw Error('Pictogramme coloré du support absent');
     });
     detail.querySelectorAll('.v74-course-actions .btn').forEach(function(button){
       var rect=button.getBoundingClientRect();
       if(rect.width>280||rect.height>54)throw Error('Bouton QCM trop grand : '+rect.width+'×'+rect.height);
       if(!button.title.includes('questions')||!button.querySelector('.v8433-emoji'))throw Error('Précisions ou icône du QCM perdues');
     });
     detail.querySelectorAll('.v74-resource-block > .row b').forEach(function(heading){
       if(!heading.closest('.mku-toggle')?.querySelector('.mku-icon svg'))throw Error('Icône colorée de rubrique absente : '+heading.textContent);
     });
     if(!ui.status().active)throw Error('Le module s’est désactivé');
     if(ui.status().passes>30)throw Error('Nombre excessif de passages '+ui.status().passes);
     checkAllCourses(cards).catch(function(e){fail(e.stack||String(e))});
   }catch(e){fail(e.stack||String(e))}
 }
 async function checkAllCourses(cards){
   var courses=window.IFSI_V741.getRegistry().courses;
   var missing=0,official=0,qcm=0,flashcards=0,vocab=0;
   for(var course of courses){
     window.IFSI_V74.openCourse(course.label);
     await new Promise(function(resolve){setTimeout(resolve,80)});
     var detail=document.getElementById('v74CourseDetail');
     var linksBefore=Array.from(detail.querySelectorAll('a[href]')).map(function(a){return a.href});
     window.IFSI_COURSE_NAV_UI.refresh();
     await new Promise(function(resolve){setTimeout(resolve,40)});
     var linksAfter=Array.from(detail.querySelectorAll('a[href]')).map(function(a){return a.href});
     if(JSON.stringify(linksBefore)!==JSON.stringify(linksAfter))throw Error('Liens modifiés par le décor graphique : '+course.id);
     var blocks=Array.from(detail.querySelectorAll(':scope > .v74-resource-block'));
     // La présentation validée replie les documents, sans retirer leurs accès.
     if(blocks.some(function(block){return !block.querySelector(':scope > .row .mku-toggle')}))throw Error('Rubrique compacte absente pour '+course.id);
     detail.querySelectorAll('.mku-toggle').forEach(function(button){
       var panel=document.getElementById(button.getAttribute('aria-controls'));
       if(!panel||!button.querySelector('.mku-icon svg'))throw Error('Rubrique sans panneau ou icône colorée pour '+course.id);
       if(button.disabled)return;
       if(button.getBoundingClientRect().height<44)throw Error('Zone cliquable trop petite pour '+course.id);
       button.click();
       if(panel.hidden||button.getAttribute('aria-expanded')!=='true')throw Error('Ouverture de rubrique impossible pour '+course.id);
       button.click();
       if(!panel.hidden||button.getAttribute('aria-expanded')!=='false')throw Error('Fermeture de rubrique impossible pour '+course.id);
     });
     var ranks=blocks.map(function(el){
       if(el.classList.contains('v74-original-support')||el.classList.contains('v74-child-supports'))return 0;
       if(el.classList.contains('v74-qcm-section'))return 2;
       var text=(el.querySelector(':scope > .row b')?.textContent||'').toLowerCase();
       return text.includes('fiches de révision')?1:text.includes('infographies')?3:text.includes('vocaux')?4:5;
     });
     if(ranks[0]!==0||ranks.some(function(rank,i){return i&&rank<ranks[i-1]}))throw Error('Ordre incorrect pour '+course.id+': '+ranks);
     var support=detail.querySelector('.v74-original-support');
     if(!course.officialSupportUrl&&!(course.officialSupportItems||[]).length&&!(course.additionalDocuments||[]).some(function(doc){return doc.type==='official_support'})){
       missing++;
       if(!support.textContent.includes('Support officiel en attente'))throw Error('Attente officielle absente pour '+course.id);
       if(support.querySelector('.v74-official-link')?.textContent.includes('Ouvrir le support officiel'))throw Error('Faux support officiel pour '+course.id);
     }else official++;
     if(course.qcmPdfUrl){
       qcm++;
       if(!Array.from(detail.querySelectorAll('.v74-qcm-section a')).some(function(a){return a.href===course.qcmPdfUrl}))throw Error('PDF QCM mal classé : '+course.id);
       if(Array.from(support.querySelectorAll('a')).some(function(a){return a.href===course.qcmPdfUrl}))throw Error('QCM présenté comme support : '+course.id);
     }
     for(var doc of course.additionalDocuments||[]){
       if(doc.type==='flashcards'||/flashcards/i.test(doc.label)){
         flashcards++;
         if(!Array.from(detail.querySelectorAll('a')).some(function(a){return a.href===doc.url}))throw Error('Accès flashcards perdu : '+course.id);
       }
     }
     if(window.IFSI_VOCAB.countForCourse(course.id)){
       vocab++;
       if(!detail.querySelector('#vgCourseSheet')||!detail.querySelector('#vgCourseQuiz'))throw Error('Lexique perdu : '+course.id);
     }
     if(detail.querySelector('.v8430-course-why'))throw Error('Avertissement permanent dans '+course.id);
   }
   window.IFSI_V74.openCourse('Biomolécules');
   await new Promise(function(resolve){setTimeout(resolve,80)});
   var favoritesBefore=window.IFSI_V74.resourceFavorites().slice().sort();
   var favorite=document.querySelector('#v74CourseDetail [data-docfav]');
   var key=favorite.dataset.docfav;
   favorite.click();
   await new Promise(function(resolve){setTimeout(resolve,80)});
   var favoriteAfter=document.querySelector('#v74CourseDetail [data-docfav="'+key+'"]');
   if(!favoriteAfter.querySelector('.v8433-emoji')||!favoriteAfter.getAttribute('aria-label'))throw Error('Favori sans icône ou nom accessible après clic');
   if(window.IFSI_V74.resourceFavorites().includes(key)===favoritesBefore.includes(key))throw Error('Action favori perdue');
   favoriteAfter.click();
   if(JSON.stringify(window.IFSI_V74.resourceFavorites().slice().sort())!==JSON.stringify(favoritesBefore))throw Error('Favori non restauré');
   // Le rapprochement officiel retire le badge de Relation ; Bientraitance reste provisoire.
   var reconciled=courses.find(function(c){return c.id==='d1_relation_soignant_soigne_ecoute_active'});
   if(!reconciled||reconciled.provisional!==false||reconciled.officialSupport!==true)throw Error('Rapprochement officiel non déclaré');
   window.IFSI_V74.openCourse(reconciled.label);
   await new Promise(function(resolve){setTimeout(resolve,80)});
   if(document.querySelector('#v74CourseDetail .v8430-provisional'))throw Error('Pastille provisoire conservée après rapprochement officiel');
   var provisionalCourse=courses.find(function(c){return c.id==='d1_bientraitance'});
   if(!provisionalCourse||provisionalCourse.provisional!==true)throw Error('Cours témoin provisoire altéré');
   window.IFSI_V74.openCourse(provisionalCourse.label);
   await new Promise(function(resolve){setTimeout(resolve,80)});
   var badge=document.querySelector('#v74CourseDetail .v8430-provisional');
   if(!badge)throw Error('Pastille du cours provisoire absente');
   badge.click();
   var dialog=document.getElementById('v8431ProvisionalDialog');
   if(!dialog.open||!dialog.textContent.includes(provisionalCourse.sourceNote))throw Error('Sources exactes non consultables');
   dialog.querySelector('button').click();
   window.IFSI_V74.openCourse(reconciled.label);
   await new Promise(function(resolve){setTimeout(resolve,80)});
   document.getElementById('vgCourseSheet').click();
   if(!document.querySelector('#vgApp #vgTerms'))throw Error('Navigation lexique impossible');
   window.IFSI_V74.openCourse(reconciled.label);
   await new Promise(function(resolve){setTimeout(resolve,80)});
   document.getElementById('v74Course10').click();
   if(!document.getElementById('course74').classList.contains('hidden')||document.getElementById('quiz').classList.contains('hidden'))throw Error('Navigation QCM bloquée');
   window.IFSI_COURSE_NAV_UI.stop();
   pass('APP COMPLETE OK : '+courses.length+' cours, '+cards+' cartes ; '+missing+' supports en attente, '+official+' officiels, '+qcm+' PDF QCM, '+flashcards+' accès flashcards, '+vocab+' lexiques ; ordre, thèmes, navigation QCM/lexique et pastille au clic vérifiés');
 }
 setTimeout(checkBoot,300);
 setTimeout(function(){if(result.dataset.result==='pending')fail('Délai dépassé au démarrage réel')},24000);
})();
