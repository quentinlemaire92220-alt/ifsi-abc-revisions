/* IFSI ABC - prototype exercices interactifs, système urinaire. Dessin SVG original. */
(function(){
'use strict';
var SECTION='ifsiExercises',KEY='ifsiabc_exercise_progress_v1';
var diagrams=[
 {id:'kidney-right',number:1,label:'Rein droit',hint:'Le rein droit est situé à droite du patient (à gauche sur une vue de face).'},
 {id:'kidney-left',number:2,label:'Rein gauche',hint:'Le rein gauche est situé à gauche du patient.'},
 {id:'ureters',number:3,label:'Uretères',hint:'Les deux uretères conduisent l’urine des reins jusqu’à la vessie.'},
 {id:'bladder',number:4,label:'Vessie',hint:'La vessie stocke l’urine avant la miction.'},
 {id:'urethra',number:5,label:'Urètre',hint:'L’urètre permet l’évacuation de l’urine vers l’extérieur.'}
];
var associations=[
 {id:'kidneys',term:'Reins',definition:'Filtrent le sang et produisent l’urine',hint:'Les néphrons rénaux participent à la formation de l’urine.'},
 {id:'ureters',term:'Uretères',definition:'Acheminent l’urine vers la vessie',hint:'Les uretères transportent l’urine, sans la stocker.'},
 {id:'bladder',term:'Vessie',definition:'Stocke temporairement l’urine',hint:'La vessie est un réservoir musculaire.'},
 {id:'urethra',term:'Urètre',definition:'Évacue l’urine hors de l’organisme',hint:'L’urètre constitue la voie terminale d’évacuation.'}
];
var state={kind:'diagram',chosen:{},left:null,locked:false};
var $=function(id){return document.getElementById(id);};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c];});}
function options(items,selected){return '<option value="">— Choisir un terme —</option>'+items.map(function(x){return '<option value="'+esc(x.id)+'"'+(selected===x.id?' selected':'')+'>'+esc(x.label||x.definition)+'</option>';}).join('');}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}}
function save(kind,correct,total){try{var x=read();if(!x[kind])x[kind]={attempts:0,best:0};x[kind].attempts++;x[kind].best=Math.max(x[kind].best,correct);x[kind].total=total;localStorage.setItem(KEY,JSON.stringify(x));}catch(e){/* Exercices disponibles sans stockage. */}}
function score(kind,chosen){
 var items=kind==='diagram'?diagrams:associations,correct=0,mistakes=[];
 items.forEach(function(x){var answer=chosen[x.id];if(answer===x.id)correct++;else mistakes.push({id:x.id,expected:x.label||x.definition,selected:answer||null,hint:x.hint});});
 return {correct:correct,total:items.length,mistakes:mistakes};
}
function svg(){
 return '<svg viewBox="0 0 420 410" role="img" aria-label="Schéma original : deux reins, deux uretères, vessie et urètre. Les repères 1 à 5 sont à identifier." xmlns="http://www.w3.org/2000/svg">'+
 '<rect width="420" height="410" rx="20" fill="#f6f3fc"/>'+
 '<path d="M183 38 Q136 49 135 100 L135 157 Q135 197 167 195 Q185 190 180 166 Q154 133 180 104 Q201 67 183 38Z" fill="#e78c9c" stroke="#a34867" stroke-width="4"/>'+
 '<path d="M237 38 Q284 49 285 100 L285 157 Q285 197 253 195 Q235 190 240 166 Q266 133 240 104 Q219 67 237 38Z" fill="#e78c9c" stroke="#a34867" stroke-width="4"/>'+
 '<path d="M174 168 C168 207 171 236 185 258 S198 294 197 312" stroke="#d8a23a" stroke-width="10" fill="none" stroke-linecap="round"/>'+
 '<path d="M246 168 C252 207 249 236 235 258 S222 294 223 312" stroke="#d8a23a" stroke-width="10" fill="none" stroke-linecap="round"/>'+
 '<path d="M178 303 Q210 280 242 303 Q253 343 230 361 L190 361 Q167 343 178 303Z" fill="#ffe29b" stroke="#c18d30" stroke-width="4"/>'+
 '<path d="M210 360 L210 391" stroke="#c18d30" stroke-width="12" stroke-linecap="round"/>'+
 '<g fill="#6941c6" stroke="#fff" stroke-width="3"><circle cx="113" cy="96" r="18"/><circle cx="306" cy="96" r="18"/><circle cx="275" cy="248" r="18"/><circle cx="263" cy="329" r="18"/><circle cx="259" cy="382" r="18"/></g>'+
 '<g fill="#fff" font-size="17" font-weight="bold" text-anchor="middle" font-family="system-ui"><text x="113" y="102">1</text><text x="306" y="102">2</text><text x="275" y="254">3</text><text x="263" y="335">4</text><text x="259" y="388">5</text></g>'+
 '<g stroke="#6941c6" stroke-width="2" fill="none"><path d="M132 96 L146 96"/><path d="M288 96 L275 96"/><path d="M257 248 L243 235"/><path d="M245 329 L231 329"/><path d="M241 382 L218 382"/></g>'+
 '<text x="210" y="24" text-anchor="middle" font-size="12" fill="#59546b" font-family="system-ui">Vue de face — droite du patient à gauche</text></svg>';
}
function css(){
 if($('ifsiExerciseStyle'))return;
 var s=document.createElement('style');s.id='ifsiExerciseStyle';s.textContent=
 '.ifsi-exercise{display:grid;gap:14px}.ifsi-exercise svg{display:block;width:100%;max-width:420px;height:auto;margin:auto}.ifsi-exercise-tabs{display:flex;gap:8px;flex-wrap:wrap}.ifsi-exercise-tabs button{flex:1;min-width:125px}.ifsi-exercise-row{display:grid;grid-template-columns:110px 1fr;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line)}.ifsi-exercise-row select{min-width:0;width:100%}.ifsi-exercise-bubble{background:#6941c6;color:white;border-radius:50%;width:30px;height:30px;display:inline-grid;place-items:center;margin-right:9px;font-weight:900}.ifsi-match{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ifsi-match>div{display:grid;gap:8px;align-content:start}.ifsi-match button{min-height:65px;padding:10px;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:12px;text-align:left;cursor:pointer}.ifsi-match button.active{outline:3px solid #6941c6}.ifsi-match button.paired{border:2px solid #0fa7a0;background:#edf9f7}.ifsi-match button:disabled{cursor:default;opacity:.9}.ifsi-exercise-feedback{margin-top:10px;border-radius:12px;border:1px solid var(--line);padding:12px;background:var(--card)}.ifsi-exercise-feedback li{margin:8px 0}.ifsi-exercise-notice{font-size:13px;color:var(--muted);line-height:1.5}body.v72-dark .ifsi-match button,body.v72-dark .ifsi-exercise-feedback{background:var(--card);color:var(--ink)}@media(max-width:520px){.ifsi-match{gap:7px}.ifsi-match button{font-size:12px}.ifsi-exercise-row{grid-template-columns:85px 1fr}}';
 document.head.appendChild(s);
}
function ensure(){
 if($(SECTION))return;
 css();
 var host=document.querySelector('.app'),s=document.createElement('section');s.id=SECTION;s.className='hidden';s.innerHTML='<div id="ifsiExerciseBody"></div>';
 var quiz=$('quiz');if(quiz)quiz.insertAdjacentElement('beforebegin',s);else host.appendChild(s);
 var parent=$('v76Home')||$('home');if(parent&&!$('ifsiExerciseEntry')){var entry=document.createElement('div');entry.id='ifsiExerciseEntry';entry.className='card';entry.innerHTML='<div class="row"><div><b>🧩 Exercices interactifs</b><p class="small" style="margin:5px 0 0">Système urinaire : schémas à compléter et associations</p></div><button type="button" class="btn primary" id="ifsiExerciseOpen">S’entraîner →</button></div>';parent.appendChild(entry);$('ifsiExerciseOpen').onclick=open;}
}
function open(){
 ensure();document.querySelectorAll('.app > section').forEach(function(s){s.classList.add('hidden');});
 $(SECTION).classList.remove('hidden');
 document.querySelectorAll('nav button').forEach(function(b){b.classList.remove('on');});
 render();window.scrollTo&&window.scrollTo(0,0);
}
function reset(kind){state={kind:kind||state.kind,chosen:{},left:null,locked:false};render();}
function pair(left,right){if(state.locked)return;state.chosen[left]=right;state.left=null;render();}
function render(){
 if(!$('ifsiExerciseBody'))return;
 var d=state.kind==='diagram',base='<div class="card ifsi-exercise"><div class="row"><div><span class="badge">Prototype • Système urinaire</span><h2 style="margin:9px 0 0">Exercices interactifs</h2></div><button type="button" id="ifsiExBack" class="btn outline">← Retour</button></div>'+
 '<div class="ifsi-exercise-tabs"><button type="button" class="btn '+(d?'primary':'outline')+'" id="ifsiExDiagram">Schéma à compléter</button><button type="button" class="btn '+(!d?'primary':'outline')+'" id="ifsiExMatch">Relier les notions</button></div>';
 if(d){
  base+='<p class="ifsi-exercise-notice">Complète les cinq repères du dessin anatomique original. Les intitulés sont volontairement mélangés.</p>'+svg()+'<div>';
  diagrams.forEach(function(item){base+='<label class="ifsi-exercise-row" for="ifsi-slot-'+item.number+'"><span><span class="ifsi-exercise-bubble">'+item.number+'</span>Repère</span><select id="ifsi-slot-'+item.number+'" data-exslot="'+esc(item.id)+'" '+(state.locked?'disabled':'')+'>'+options([diagrams[3],diagrams[0],diagrams[4],diagrams[1],diagrams[2]],state.chosen[item.id])+'</select></label>';});
  base+='</div>';
 }else{
  base+='<p class="ifsi-exercise-notice">Sélectionne un organe à gauche, puis sa fonction à droite. Tu peux modifier les associations avant validation.</p><div class="ifsi-match"><div>';
  associations.forEach(function(x){var paired=Boolean(state.chosen[x.id]);base+='<button type="button" data-exleft="'+esc(x.id)+'" class="'+(state.left===x.id?'active ':'')+(paired?'paired':'')+'" '+(state.locked?'disabled':'')+'>'+esc(x.term)+(paired?' ✓':'')+'</button>';});
  base+='</div><div>';
  [associations[2],associations[0],associations[3],associations[1]].forEach(function(x){var owned=Object.keys(state.chosen).find(function(id){return state.chosen[id]===x.id;});base+='<button type="button" data-exright="'+esc(x.id)+'" class="'+(owned?'paired':'')+'" '+(state.locked?'disabled':'')+'>'+esc(x.definition)+(owned?' ✓':'')+'</button>';});
  base+='</div></div><div class="ifsi-exercise-notice" role="status">'+(state.left?'Choisis maintenant une fonction dans la colonne de droite.':'Associations réalisées : '+Object.keys(state.chosen).length+' / 4')+'</div>';
 }
 base+='<button type="button" id="ifsiExSubmit" class="btn primary full" '+(state.locked?'disabled':'')+'>Valider mes réponses</button><button type="button" id="ifsiExRetry" class="btn outline full">Recommencer</button><div id="ifsiExResult" role="status" aria-live="polite"></div></div>';
 $('ifsiExerciseBody').innerHTML=base;
 $('ifsiExBack').onclick=function(){if(typeof window.show==='function')window.show('home');else {$(SECTION).classList.add('hidden');$('home')?.classList.remove('hidden');}};
 $('ifsiExDiagram').onclick=function(){reset('diagram');};$('ifsiExMatch').onclick=function(){reset('match');};
 $('ifsiExRetry').onclick=function(){reset(state.kind);};
 $('ifsiExSubmit').onclick=validate;
 if(d)document.querySelectorAll('[data-exslot]').forEach(function(el){el.onchange=function(){state.chosen[el.dataset.exslot]=el.value;};});
 else {
  document.querySelectorAll('[data-exleft]').forEach(function(el){el.onclick=function(){state.left=el.dataset.exleft;render();};});
  document.querySelectorAll('[data-exright]').forEach(function(el){el.onclick=function(){if(!state.left)return;var right=el.dataset.exright;Object.keys(state.chosen).forEach(function(id){if(state.chosen[id]===right)delete state.chosen[id];});pair(state.left,right);};});
 }
 if(state.locked)renderResult();
}
function renderResult(){
 var r=score(state.kind,state.chosen),out=$('ifsiExResult');if(!out)return;
 var html='<div class="ifsi-exercise-feedback"><b>'+r.correct+' / '+r.total+' bonnes réponses</b>';
 if(!r.mistakes.length)html+='<p>✅ Toutes les associations sont correctes !</p>';
 else{html+='<p>Corrigé pédagogique :</p><ul>';r.mistakes.forEach(function(x){html+='<li><b>'+esc(x.expected)+'</b> — '+esc(x.hint)+'</li>';});html+='</ul>';}
 out.innerHTML=html+'</div>';
}
function validate(){
 if(state.locked)return;
 var items=state.kind==='diagram'?diagrams:associations;
 if(items.some(function(x){return !state.chosen[x.id];})){window.alert('Complète tous les repères ou toutes les associations avant de valider.');return;}
 state.locked=true;var r=score(state.kind,state.chosen);save(state.kind,r.correct,r.total);render();
 try{window.dispatchEvent(new CustomEvent('ifsi:exercise-complete',{detail:{kind:state.kind,correct:r.correct,total:r.total,courseId:'systeme_urinaire'}}));}catch(e){}
}
function init(){
 ensure();
 var old=window.show;
 if(typeof old==='function'&&!old._ifsiExerciseWrapped){var wrap=function(id){if($(SECTION))$(SECTION).classList.add('hidden');return old.apply(this,arguments);};wrap._ifsiExerciseWrapped=true;window.show=wrap;}
}
window.IFSI_EXERCISES={open:open,reset:reset,score:score,diagrams:diagrams,associations:associations};
init();
})();
