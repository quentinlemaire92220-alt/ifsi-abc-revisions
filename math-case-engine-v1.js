/* IFSI ABC — moteur générique d'exercices pratiques. Aucun cas de cours dans ce fichier. */
(()=>{
'use strict';
const COURSE='calculs_doses_mathematiques',SECTION='ifsiMathCases',STORE='ifsiabc_math_cases_progress_v1';
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=null,observer=null;
let state={mode:'guided',answers:{},hints:{},notes:'',locked:false};
function reset(){state={mode:'guided',answers:{},hints:{},notes:'',locked:false};}
function parseNumber(x){const s=String(x??'').replace(/\s/g,'');if(!/^[+-]?\d+(?:[.,]\d+)?$/.test(s))return null;const n=Number(s.replace(',','.'));return Number.isFinite(n)?n:null;}
function parseTime(x){const m=String(x??'').trim().match(/^(\d{1,2})\s*(?:h|:)\s*(\d{1,2})$/i);if(!m)return null;const h=+m[1],min=+m[2];return h<24&&min<60?String(h).padStart(2,'0')+':'+String(min).padStart(2,'0'):null;}
function evaluate(field,value){
 if(!String(value??'').trim())return {ok:false,kind:'empty',feedback:'Aucune réponse saisie.'};
 const actual=field.type==='time'?parseTime(value):parseNumber(value);
 if(actual===null)return {ok:false,kind:'format',feedback:field.type==='time'?'Indique un horaire valide, par exemple 20:30.':'Saisis un nombre, avec virgule ou point pour les décimales.'};
 const expected=field.type==='time'?parseTime(field.correct):parseNumber(field.correct);
 const ok=field.type==='time'?actual===expected:Math.abs(actual-expected)<=Number(field.tolerance??0.001);
 if(ok)return {ok:true,kind:'correct',feedback:'Bonne réponse.'};
 const error=(Array.isArray(field.commonErrors)?field.commonErrors:[]).find(e=>{
  const suspect=field.type==='time'?parseTime(e.when):parseNumber(e.when);
  return suspect!==null&&(field.type==='time'?actual===suspect:Math.abs(actual-suspect)<0.001);
 });
 return {ok:false,kind:'incorrect',feedback:error?.feedback||'Vérifie la formule, les données utilisées et les unités.'};
}
function validCase(c){
 if(!c||typeof c!=='object'||c.courseId!==COURSE||typeof c.id!=='string'||!c.id||typeof c.title!=='string'||!c.title||!Array.isArray(c.questions)||!c.questions.length)throw Error('Fichier non conforme au cours de mathématiques.');
 const ids=new Set();
 for(const q of c.questions){
  if(!q.id||!q.prompt||!Array.isArray(q.fields)||!q.fields.length)throw Error('Question incomplète.');
  for(const f of q.fields){
   if(!f.id||!f.label||!f.unit||!['number','time'].includes(f.type)||f.correct==null||!f.explanation||ids.has(f.id))throw Error('Champ manquant ou identifiant dupliqué.');
   if((f.type==='time'?parseTime(f.correct):parseNumber(f.correct))===null)throw Error('Réponse attendue invalide.');
   ids.add(f.id);
  }
 }
 return c;
}
function loadCase(c){const validated=validCase(c);current=validated;reset();if($('ifsiMathBody'))render();return validated.id;}
function result(){const fields=current?.questions?.flatMap(q=>q.fields)||[];return {correct:fields.filter(f=>evaluate(f,state.answers[f.id]).ok).length,total:fields.length};}
function save(){
 const s=result();
 try{const all=JSON.parse(localStorage.getItem(STORE)||'{}');const prior=all[current.id]||{attempts:0,best:0};all[current.id]={attempts:prior.attempts+1,best:Math.max(prior.best,s.correct),total:s.total};localStorage.setItem(STORE,JSON.stringify(all));}catch(_){}
 try{window.IFSI_V77?.track?.('math_case_complete',{resource_type:'math_case',resource_id:current.id,course_id:COURSE,metadata:{correct:s.correct,total:s.total,mode:state.mode}});}catch(_){}
}
function styles(){
 if($('ifsiMathCaseStyle'))return;
 const el=document.createElement('style');el.id='ifsiMathCaseStyle';
 el.textContent='.ifsi-case{display:grid;gap:14px;max-width:960px;margin:0 auto}.ifsi-case *{box-sizing:border-box}.ifsi-case .case-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ifsi-case .case-box{border:1px solid var(--line);border-radius:12px;padding:12px}.ifsi-case .case-field{display:grid;gap:7px;border-top:1px solid var(--line);padding:14px 0}.ifsi-case .case-input{display:flex;align-items:center;gap:8px}.ifsi-case .case-input input{width:100%;min-width:0;font-size:17px;padding:12px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink)}.ifsi-case .case-input small{min-width:100px;color:var(--muted)}.ifsi-case textarea{width:100%;min-height:95px;padding:10px;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:9px}.ifsi-case .case-hint,.ifsi-case .case-feedback{padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--card);line-height:1.5}.ifsi-case .case-good{border-color:#389c87}.ifsi-case .case-bad{border-color:#cc6767}.ifsi-case .case-actions{display:flex;gap:9px;flex-wrap:wrap}.ifsi-case .case-actions button{flex:1}.ifsi-case .case-note{font-size:12px;color:var(--muted)}@media(max-width:580px){.ifsi-case .case-grid{grid-template-columns:1fr}.ifsi-case .case-input small{min-width:80px}.ifsi-case .case-actions{display:grid}}';
 document.head.appendChild(el);
}
function ensure(){
 const app=document.querySelector('.app');if(!app)return false;styles();
 if(!$(SECTION)){
  const s=document.createElement('section');s.id=SECTION;s.className='hidden';s.innerHTML='<div id="ifsiMathBody"></div>';
  const quiz=$('quiz');if(quiz)quiz.insertAdjacentElement('beforebegin',s);else app.appendChild(s);
 }
 return true;
}
function onMath(){const t=document.querySelector('#v74CourseDetail .v74-course-head h2')?.textContent||'';return /calculs? de doses|math[eé]matiques/i.test(t);}
function mount(){
 if(!onMath()||!ensure())return false;
 const head=document.querySelector('#v74CourseDetail .v74-course-head');
 if(!head||$('ifsiMathEntry'))return false;
 const card=document.createElement('div');card.className='card';card.id='ifsiMathEntry';
 card.innerHTML='<div class="row"><div><b>🧮 Exercices pratiques — pilote</b><div class="small">Saisie libre, méthode, correction détaillée. Import local d’un cas privé.</div></div><button class="btn primary" type="button" id="ifsiMathOpen">Tester →</button></div>';
 head.insertAdjacentElement('afterend',card);$('ifsiMathOpen').onclick=open;return true;
}
function open(){
 if(!ensure())return;
 document.querySelectorAll('.app > section').forEach(s=>s.classList.add('hidden'));
 $(SECTION).classList.remove('hidden');
 document.querySelectorAll('nav button').forEach(b=>b.classList.remove('on'));
 render();window.scrollTo?.(0,0);
}
function back(){
 if(typeof window.show==='function')window.show('course74');
 else{$(SECTION)?.classList.add('hidden');$('course74')?.classList.remove('hidden');}
}
function items(x){return Array.isArray(x)?'<ul>'+x.map(y=>'<li>'+esc(y)+'</li>').join('')+'</ul>':'<p>'+esc(x||'')+'</p>';}
function fieldHTML(f){
 const val=state.answers[f.id]??'',hint=state.hints[f.id]||0,ev=state.locked?evaluate(f,val):null;
 let html='<div class="case-field"><label for="math_'+esc(f.id)+'"><b>'+esc(f.label)+'</b></label>'+
 '<div class="case-input"><input id="math_'+esc(f.id)+'" data-case-input="'+esc(f.id)+'" inputmode="'+(f.type==='time'?'text':'decimal')+'" placeholder="'+(f.type==='time'?'HH:MM':'Ta réponse')+'" value="'+esc(val)+'" '+(state.locked?'disabled':'')+'><small>'+esc(f.unit)+'</small></div>';
 if(!state.locked&&state.mode==='guided'){
  if(hint<3)html+='<button class="btn outline" type="button" data-case-hint="'+esc(f.id)+'">'+['💡 Afficher un indice','📐 Voir la formule','📖 Voir la méthode'][hint]+'</button>';
  if(hint>=1)html+='<div class="case-hint">'+esc(f.hint||'Identifie les données utiles.')+'</div>';
  if(hint>=2)html+='<div class="case-hint"><b>Formule :</b> '+esc(f.formula||'Analyse les unités.')+'</div>';
  if(hint>=3)html+='<div class="case-hint"><b>Méthode :</b> '+esc(f.method||f.explanation)+'</div>';
 }
 if(ev)html+='<div class="case-feedback '+(ev.ok?'case-good':'case-bad')+'"><b>'+(ev.ok?'✅ Correct':'⚠️ À revoir')+'</b> — '+esc(ev.feedback)+'<p><b>Réponse attendue : '+esc(f.correct)+' '+esc(f.unit)+'</b></p><p>'+esc(f.explanation)+'</p></div>';
 return html+'</div>';
}
function render(){
 const root=$('ifsiMathBody');if(!root)return;
 if(!current){
  root.innerHTML='<div class="ifsi-case"><div class="card"><div class="row"><h2>🧮 Exercices pratiques — test privé</h2><button class="btn outline" id="ifsiMathBack" type="button">← Retour au cours</button></div><p>Importe un cas au format JSON depuis ton appareil. Ce fichier est lu localement : il n’est pas déposé dans le dépôt public.</p><label for="ifsiMathImport"><b>Fichier d’exercice à tester</b></label><input id="ifsiMathImport" type="file" accept=".json,application/json"><p id="ifsiMathError" role="status"></p></div></div>';
  $('ifsiMathBack').onclick=back;
  $('ifsiMathImport').onchange=async e=>{try{const f=e.target.files?.[0];if(!f)return;if(f.size>120000)throw Error('Fichier supérieur à 120 Ko.');loadCase(JSON.parse(await f.text()));}catch(err){$('ifsiMathError').textContent='Import impossible : '+err.message;}};
  return;
 }
 const score=result();
 let html='<div class="ifsi-case"><div class="card"><div class="row"><div><div class="small">UE B3 • PILOTE PRIVÉ</div><h2>'+esc(current.title)+'</h2></div><button id="ifsiMathBack" class="btn outline" type="button">← Retour</button></div><h3>Situation clinique</h3><p>'+esc(current.situation||'')+'</p><div class="case-grid"><div class="case-box"><b>📋 Prescription</b>'+items(current.prescription)+'</div><div class="case-box"><b>💊 Matériel disponible</b>'+items(current.materials)+'</div></div>'+(current.assumptions?.length?'<p class="case-note"><b>Hypothèses :</b> '+esc(current.assumptions.join(' • '))+'</p>':'')+'</div>';
 html+='<div class="card"><h3>À toi de résoudre le problème</h3><p class="case-note">Tu peux consulter l’énoncé ci-dessus à tout moment.</p><div class="case-actions"><button type="button" class="btn '+(state.mode==='guided'?'primary':'outline')+'" data-case-mode="guided">Mode guidé</button><button type="button" class="btn '+(state.mode==='autonomous'?'primary':'outline')+'" data-case-mode="autonomous">Mode autonome</button></div>';
 current.questions.forEach(q=>{html+='<h3>'+esc(q.prompt)+'</h3>';q.fields.forEach(f=>html+=fieldHTML(f));});
 html+='<label for="ifsiMathNotes"><b>Mon brouillon (facultatif)</b></label><textarea id="ifsiMathNotes" '+(state.locked?'disabled':'')+' placeholder="Écris ici tes conversions et formules…">'+esc(state.notes)+'</textarea>';
 if(state.locked)html+='<div class="case-feedback"><b>Résultat : '+score.correct+' / '+score.total+'</b> — réponses figées.</div>';
 html+='<div class="case-actions"><button class="btn primary" type="button" id="ifsiMathSubmit" '+(state.locked?'disabled':'')+'>Corriger mes réponses</button><button class="btn outline" type="button" id="ifsiMathRestart">Recommencer</button></div><p class="case-note">Support théorique de révision : ne remplace pas les protocoles cliniques institutionnels.</p></div></div>';
 root.innerHTML=html;
 $('ifsiMathBack').onclick=back;
 root.querySelectorAll('[data-case-input]').forEach(e=>e.oninput=()=>{state.answers[e.dataset.caseInput]=e.value;});
 root.querySelectorAll('[data-case-hint]').forEach(e=>e.onclick=()=>{state.notes=$('ifsiMathNotes')?.value??state.notes;state.hints[e.dataset.caseHint]=Math.min(3,(state.hints[e.dataset.caseHint]||0)+1);render();});
 root.querySelectorAll('[data-case-mode]').forEach(e=>e.onclick=()=>{state.notes=$('ifsiMathNotes')?.value??state.notes;state.mode=e.dataset.caseMode;render();});
 $('ifsiMathNotes').oninput=e=>{state.notes=e.target.value;};
 $('ifsiMathSubmit').onclick=()=>{state.notes=$('ifsiMathNotes')?.value??state.notes;state.locked=true;save();render();};
 $('ifsiMathRestart').onclick=()=>{reset();render();};
}
function init(){
 if(!ensure())return;
 const previous=window.show;
 if(typeof previous==='function'&&!previous._ifsiMathCaseWrapped){
  const wrapped=function(){if($(SECTION))$(SECTION).classList.add('hidden');return previous.apply(this,arguments);};
  wrapped._ifsiMathCaseWrapped=true;window.show=wrapped;
 }
 const box=$('v74CourseDetail');
 if(box&&typeof MutationObserver==='function'){observer=new MutationObserver(mount);observer.observe(box,{childList:true});}
 mount();
}
window.IFSI_MATH_CASES={loadCase,open,back,mount,parseNumber,parseTime,evaluate,validCase,result};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();