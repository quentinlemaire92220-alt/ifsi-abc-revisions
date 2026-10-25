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
   if(!v74||!reg||reg.courses.length!==55||!grid||grid.querySelectorAll('.v74-domain-group').length<5||!ui||!ui.status().active){
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
     if(!document.querySelector('#courses74 .v8430-note'))throw Error('NB Provisoire absent');
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

     var compact=detail.querySelector('.v74-resource-list > .v74-resource > .actions .btn');
     if(!compact)throw Error('Aucun bouton de ressource pour tester la compacité');
     var dimensions=compact.getBoundingClientRect();
     if(dimensions.width>190||dimensions.height<42)throw Error('Bouton de ressource trop large ou trop petit : '+dimensions.width+'×'+dimensions.height);
     var resource=compact.closest('.v74-resource');
     if(getComputedStyle(resource).display!=='grid')throw Error('Carte ressource pas en mise en page compacte');
     if(!ui.status().active)throw Error('Le module s’est désactivé');
     if(ui.status().passes>30)throw Error('Nombre excessif de passages '+ui.status().passes);
     ui.stop();
     pass('APP COMPLETE OK : 55 cours, '+cards+' cartes, ordre '+blocks.join(' > ')+', anti-boucle, thèmes ; '+passes+' passes');
   }catch(e){fail(e.stack||String(e))}
 }
 setTimeout(checkBoot,300);
 setTimeout(function(){if(result.dataset.result==='pending')fail('Délai dépassé au démarrage réel')},24000);
})();
