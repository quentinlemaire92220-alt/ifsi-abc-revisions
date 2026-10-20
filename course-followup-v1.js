(()=>{
'use strict';
// Suivi public : catalogue et planning déjà publiés uniquement.
// Aucun accès réseau aux registres personnels ; pas de synchronisation de l'état local.
const SECTION='courseFollowup';
const K_GROUP='ifsiabc_followup_group_v1',K_SOURCES='ifsiabc_followup_private_sources_v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\u0027':'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const resource=()=>window.IFSI_V741;
const registry=()=>resource()?.getRegistry?.()?.courses||[];
const emptyResources=()=>({questions:[],sheets:[],infographics:[],vocals:[]});
function validSourcesUrl(url){
 return /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-z0-9_-]+(?:\/[a-z0-9_/?#=&.%-]*)?$/i.test(String(url||'').trim());
}
function configuredSourcesUrl(){
 try{const url=localStorage.getItem(K_SOURCES)||'';return validSourcesUrl(url)?url:''}catch{return ''}
}
function configureSources(){
 const previous=configuredSourcesUrl();
 const url=window.prompt?.('Coller le lien Google Sheets de votre registre personnel. Il restera enregistré uniquement sur cet appareil. Laisser vide pour effacer le raccourci.',previous);
 if(url===null||url===undefined)return false;
 const next=String(url).trim();
 if(!next){try{localStorage.removeItem(K_SOURCES)}catch{};return false}
 if(!validSourcesUrl(next)){window.alert?.('Lien refusé : utiliser une URL Google Sheets https://docs.google.com/spreadsheets/d/...');return false}
 try{localStorage.setItem(K_SOURCES,next)}catch{window.alert?.('Enregistrement local impossible sur cet appareil.');return false}
 return true;
}
function openSources(){
 let url=configuredSourcesUrl();
 if(!url){if(!configureSources())return;url=configuredSourcesUrl()}
 if(url)window.open?.(url,'_blank','noopener,noreferrer');
}
function bindSourceActions(){
 document.querySelectorAll('[data-cf-sources]').forEach(button=>button.onclick=()=>openSources());
 if($('cfConfigureSources'))$('cfConfigureSources').onclick=()=>configureSources();
}
function group(){
 try{const v=localStorage.getItem(K_GROUP);return ['A1','A2','B1','B2'].includes(v)?v:'B1'}catch{return 'B1'}
}
function setGroup(v){if(!['A1','A2','B1','B2'].includes(v))return;try{localStorage.setItem(K_GROUP,v)}catch{}}
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
function sessionKey(e,g){return [e.date,e.start,e.end,g,e.title].join('|')}
function eventForGroup(e,g){
 if(!e||!['A1','A2','B1','B2'].includes(g))return false;
 if(e.promo!=='all'&&e.promo!==g[0])return false;
 if(Array.isArray(e.groups)&&e.groups.length)return e.groups.includes(g);
 const label=String(e.groupLabel||'');
 if(new RegExp('\\b'+g[0]+'[12]\\b').test(label)&&!new RegExp('\\b'+g+'\\b').test(label))return false;
 return true;
}
function isAmbiguous(e){return /niveau|cf groupe|selon groupe/i.test(String(e?.groupLabel||''))}
function sourceCourseId(e){
 const all=registry();
 if(e?.courseId&&all.some(c=>c.id===e.courseId))return e.courseId;
 const normalized=v=>norm(v).replace(/[^a-z0-9]+/g,' ').trim();
 const key=normalized(e?.title);
 if(!key)return '';
 const matches=all.filter(c=>[c.label,...(c.aliases||[])].some(v=>normalized(v)===key));
 return matches.length===1?matches[0].id:'';
}
function courseModel(c,r,terms,cards){
 const res=r||emptyResources();
 const hasOfficial=Boolean(c.officialSupportUrl||(c.officialSupportItems||[]).length);
 const sheets=(res.sheets||[]).length,qcm=(res.questions||[]).length;
 const count={sheets,qcm,infographics:(res.infographics||[]).length,vocals:(res.vocals||[]).length,
  vocabulary:Number.isInteger(terms)?terms:null,flashcards:Number.isInteger(cards)?cards:null};
 const hidden=c.showInCourses===false;
 const toReview=(!hasOfficial||!sheets||(!qcm&&!hidden));
 return {id:c.id,label:c.label,ue:c.ue,hidden,hasOfficial,officialUrl:c.officialSupportUrl||c.officialSupportItems?.[0]?.url||null,count,toReview};
}
function visibleModels(){
 const all=registry(),allCards=window.IFSI_V8338_FLASHCARDS?.getDeck?.()||null;
 const readyTerms=window.IFSI_VOCAB?.entries?.()?.length>0;
 return all.filter(c=>c.showInCourses!==false).map(c=>{
  const res=resource()?.resourcesForCourse?.(c.id)||emptyResources();
  const terms=readyTerms?window.IFSI_VOCAB.countForCourse(c.id):null;
  const cards=Array.isArray(allCards)&&allCards.length?allCards.filter(x=>x.kind!=='Vocabulaire'&&x.courseId===c.id).length:null;
  return courseModel(c,res,terms,cards);
 });
}
function weeks(){return window.IFSI_PLANNING?.weeks||[]}
// Le suivi des cours montre les CM/TD/TP pertinents, mais jamais les simulations
// ni les créneaux asynchrones, qui restent visibles au calendrier général.
const NON_REVISION_ACTIVITY=[
 /\bconnexion\b.*\b(?:myschool|mischool|myk|plateforme)\b/,
 /\b(?:myschool|mischool)\b.*\bconnexion\b/,
 /\b(?:temps? d appropriation(?: des connaissances)?|travail personnel|travail en autonomie|temps libre|revisions? autonomes?)\b/,
 /\b(?:presentation plateforme|presentation blason collectif|elections? des delegues|test de personnalite)\b/,
 /\b(?:reunion administrative|inscription administrative|test technique|test de connexion)\b/,
 /\b(?:simulation serious game et quizz|realisation de cas concrets et outil de revision)\b/,
 /\bvisionnage du film sur les objectifs de stage\b/
];
function isRevisionSession(e){
 const title=norm(e?.title).replace(/[^a-z0-9]+/g,' ').trim();
 const type=norm(e?.type).trim();
 const ue=norm(e?.ue).replace(/[^a-z0-9]+/g,' ').trim();
 // Exclusions systématiques demandées : toutes les simulations et tous les asynchrones,
 // indépendamment du contenu, du groupe ou d'un éventuel support pédagogique.
 if(!title||type==='info'||/annul/.test(type)||/asynch/.test(type)||
    /\bsimulation\b/.test(title)||/\bsimulation\b/.test(ue))return false;
 return !NON_REVISION_ACTIVITY.some(rule=>rule.test(title));
}
function eventsForWeek(week,g){return (week?.events||[]).filter(e=>eventForGroup(e,g)&&isRevisionSession(e)).sort((a,b)=>(a.date+' '+a.start).localeCompare(b.date+' '+b.start))}
function css(){
 if($('followupCss'))return;
 const style=document.createElement('style');style.id='followupCss';style.textContent=
 '#courseFollowup{padding:4px 0 145px}#courseFollowup .cf-head{border:1px solid var(--line);border-radius:20px;padding:16px;background:var(--card);margin-bottom:12px}'+
 '#courseFollowup .cf-head h2{margin:0 0 6px}#courseFollowup .cf-meta{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}'+
 '#courseFollowup .cf-pill{background:color-mix(in srgb,var(--card) 90%,var(--p) 10%);color:var(--ink);padding:6px 9px;border-radius:12px;font-size:12px;font-weight:650}'+
 '#courseFollowup .cf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px}'+
 '#courseFollowup .cf-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:13px;min-width:0}'+
 '#courseFollowup .cf-card h3{margin:0;font-size:15px}#courseFollowup .cf-card .cf-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:7px;font-size:12px}'+
 '#courseFollowup .cf-signal{font-size:11px;border-radius:10px;padding:4px 6px;background:color-mix(in srgb,var(--card) 90%,#dfaa46 10%)}'+
 '#courseFollowup .cf-muted{color:var(--muted);font-size:12px;line-height:1.4}'+
 '#courseFollowup .cf-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:11px 0}'+
 '#courseFollowup select,#courseFollowup input{min-width:0;width:100%;border:1px solid var(--line);background:var(--card);color:var(--ink);padding:10px;border-radius:11px}'+
 '#courseFollowup .cf-agenda{display:grid;gap:8px}#courseFollowup .cf-session{display:grid;grid-template-columns:105px 1fr auto;gap:10px;align-items:center}'+
 '#courseFollowup .cf-session button{font-size:11px;padding:8px;white-space:nowrap}'+
  '@media(max-width:600px){'+
 '#courseFollowup .cf-controls{grid-template-columns:1fr 1fr}#courseFollowup .cf-controls input{grid-column:1/-1}'+
 '#courseFollowup .cf-session{grid-template-columns:1fr auto}#courseFollowup .cf-session .cf-when{grid-column:1/-1}}';
 document.head.appendChild(style);
}
function section(){
 if($(SECTION))return true;
 const app=document.querySelector('.app');if(!app)return false;
 const s=document.createElement('section');s.id=SECTION;s.className='hidden';
 app.insertBefore(s,$('settings87')||document.querySelector('.app>nav')||null);return true;
}
function bindBottomNavigation(){
 const nav=$('v87Nav');if(!nav)return false;
 // Accès via Paramètres, pas de septième bouton au pied de page.
 if(!nav.dataset.followupBound){nav.dataset.followupBound='1';
  nav.addEventListener('click',e=>{if(e.target.closest('button'))hide()},true)}
 return true;
}

let ueFilter='all',statusFilter='all',textFilter='';
function renderResources(models){
 let selected=models.filter(m=>(ueFilter==='all'||m.ue===ueFilter)&&
  (statusFilter==='all'||(statusFilter==='attention'?m.toReview:!m.toReview))&&
  (!textFilter||norm(m.label+' '+m.ue).includes(norm(textFilter))));
 const n=x=>x===null?'À mesurer':String(x);
 return '<div class="cf-grid">'+(selected.length?selected.map(m=>{
  const details=[
   ['Support officiel',m.hasOfficial?'Lien catalogué':'Lien non référencé'],
   ['Fiches',n(m.count.sheets)],
   ['QCM',n(m.count.qcm)],
   ['Flashcards',n(m.count.flashcards)],
   ['Infographies',n(m.count.infographics)+' · selon pertinence'],
   ['Vocabulaire',n(m.count.vocabulary)],
   ['Vocaux',n(m.count.vocals)+' · selon disponibilité']
  ];
  const url=m.officialUrl&&/^https:\/\/(drive|docs)\.google\.com\//.test(m.officialUrl)?m.officialUrl:null;
  return '<article class="cf-card"><div class="row"><h3>'+esc(m.label)+'</h3><span class="cf-pill">'+esc(m.ue)+'</span></div>'+
   '<div class="cf-meta"><span class="cf-signal">'+(m.toReview?'À vérifier':'Inventaire référencé')+'</span></div>'+
   details.map(x=>'<div class="cf-row"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('')+
   '<div class="cf-source-row" data-ifsi-source-course="'+esc(m.id)+'"></div>'+
   '<div class="cf-meta"><button class="btn secondary" data-cf-course="'+esc(m.id)+'">Ouvrir le cours</button><button class="btn outline" type="button" data-cf-sources>Mes sources ↗</button>'+
   (url?'<a class="btn outline" target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">Support officiel ↗</a>':'')+
   '</div></article>';
 }).join(''):'<p class="cf-muted">Aucun cours ne correspond aux filtres.</p>')+'</div>';
}
function renderAgenda(){
 const g=group(),w=weeks(),id=$('cfWeek')?.value||w.find(x=>today()>=x.start&&today()<=x.end)?.id||w.at(-1)?.id;
 const week=w.find(x=>x.id===id)||w.at(-1);
 const filtered=eventsForWeek(week,g);
 const options=w.map(x=>'<option value="'+esc(x.id)+'"'+(x.id===id?' selected':'')+'>'+esc(x.label)+' · '+esc(x.range||'')+'</option>').join('');
 const arr=filtered.map(e=>{
  const future=e.date>today();
  const state=future?'À venir':'Date passée';
  const note=isAmbiguous(e)?' · Affectation à vérifier':'';
  const btn='<button class="btn outline" data-cf-sources type="button">Mes sources ↗</button>';
  const linkedCourse=sourceCourseId(e);
  const sourceSlot=linkedCourse?'<div class="cf-source-row" data-ifsi-source-course="'+esc(linkedCourse)+'"></div>':'<div class="cf-muted">Source privée : rattachement du cours à vérifier</div>';
  return '<article class="cf-card cf-session"><div class="cf-muted cf-when">'+esc(e.date)+'<div>'+esc(e.start)+'–'+esc(e.end)+'</div></div>'+
   '<div><b>'+esc(e.title)+'</b><div class="cf-muted">'+esc(e.ue||'Séance')+' · '+esc(e.type||'Cours')+esc(note)+'</div>'+
   '<span class="cf-signal">'+esc(state)+'</span>'+sourceSlot+'</div>'+btn+'</article>';
 }).join('');
 return '<div class="cf-head"><h3>🗓️ Séances du planning</h3><p class="cf-muted">Suivi des séances pédagogiques hors simulations et asynchrones. Les états personnels sont chargés depuis Google Sheets seulement après authentification et autorisation du propriétaire. Les autres visiteurs ne voient aucun statut privé.</p>'+
  '<div class="cf-controls"><select id="cfGroup" aria-label="Groupe">'+['A1','A2','B1','B2'].map(x=>'<option'+(x===g?' selected':'')+'>'+x+'</option>').join('')+'</select>'+
  '<select id="cfWeek" aria-label="Semaine">'+options+'</select></div>'+
  '<div class="cf-agenda">'+(arr||'<p class="cf-muted">Aucune séance pédagogique à réviser pour ce groupe cette semaine.</p>')+'</div></div>';
}
function render(){
 const sec=$(SECTION);if(!sec)return;
 const models=visibleModels(),issue=models.filter(m=>m.toReview).length;
 const ues=[...new Set(models.map(x=>x.ue))].sort();
 const existingWeek=$('cfWeek')?.value||null;
 const controls='<div class="cf-controls">'+
  '<select id="cfUe" aria-label="Filtrer par UE"><option value="all">Toutes les UE</option>'+
  ues.map(x=>'<option'+(ueFilter===x?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select>'+
  '<select id="cfStatus" aria-label="Filtrer par contrôle"><option value="all">Tous les cours</option>'+
  '<option value="attention"'+(statusFilter==='attention'?' selected':'')+'>À vérifier</option>'+
  '<option value="ok"'+(statusFilter==='ok'?' selected':'')+'>Inventaire référencé</option></select>'+
  '<input id="cfSearch" type="search" placeholder="Rechercher un cours" aria-label="Rechercher un cours" value="'+esc(textFilter)+'"></div>';
 sec.innerHTML='<div class="cf-head"><button id="cfBackSettings" class="btn outline" type="button" style="margin-bottom:10px">← Paramètres</button><h2>✅ Suivi des cours</h2>'+
 '<p class="cf-muted">État du catalogue public. Les quantités indiquent les ressources référencées, pas leur conformité pédagogique ni leur disponibilité réelle sur Drive.</p>'+
 '<div class="cf-meta"><span class="cf-pill">'+models.length+' cours visibles</span><span class="cf-pill">'+issue+' à vérifier dans le catalogue</span></div>'+
 '<p class="cf-muted">Un support sans lien catalogué peut exister sur Drive. Les données personnelles restent dans votre registre privé, pas dans l’application publique.</p>'+
 '<div class="cf-meta"><button id="cfOpenSources" class="btn secondary" type="button" data-cf-sources>🔒 Ouvrir mes sources</button><button id="cfConfigureSources" class="btn outline" type="button">Configurer le lien privé</button></div>'+
 '<p class="cf-muted">Le raccourci reste local. Le module privé n’affiche et ne modifie les états que si le propriétaire est authentifié et que le serveur autorise l’accès.</p>'+
 controls+'</div><div id="cfPrivatePanel"></div><div id="cfResourceResults">'+renderResources(models)+'</div>'+renderAgenda();
 if(existingWeek&&weeks().some(w=>w.id===existingWeek)){$('cfWeek').value=existingWeek;updateAgendaOnly()}
 $('cfUe').onchange=e=>{ueFilter=e.target.value;updateResults()};
 $('cfStatus').onchange=e=>{statusFilter=e.target.value;updateResults()};
 $('cfSearch').oninput=e=>{textFilter=e.target.value;updateResults()};
  $('cfBackSettings').onclick=()=>window.IFSI_V87?.showSettings?.();
 bindAgenda();bindSourceActions();window.IFSI_PRIVATE_SOURCES?.mount?.();
 sec.querySelectorAll('[data-cf-course]').forEach(b=>b.onclick=()=>openCourse(b.dataset.cfCourse));
}
function updateResults(){const out=$('cfResourceResults');if(!out)return;out.innerHTML=renderResources(visibleModels());out.querySelectorAll('[data-cf-course]').forEach(b=>b.onclick=()=>openCourse(b.dataset.cfCourse));bindSourceActions();window.IFSI_PRIVATE_SOURCES?.refreshViews?.()}
function openCourse(id){hide();if(window.IFSI_V813?.openCourse)return window.IFSI_V813.openCourse(id);window.showCourses74?.()}
function updateAgendaOnly(){const sec=$(SECTION);if(!sec)return;const replacement=document.createElement('div');replacement.innerHTML=renderAgenda();sec.querySelector('.cf-head:last-child')?.replaceWith(replacement.firstElementChild);bindAgenda();bindSourceActions();window.IFSI_PRIVATE_SOURCES?.refreshViews?.()}
function bindAgenda(){
 $('cfGroup')?.addEventListener('change',e=>{setGroup(e.target.value);updateAgendaOnly()});
 $('cfWeek')?.addEventListener('change',()=>updateAgendaOnly());
 // Les anciennes notes « revue » restent intactes dans le navigateur, mais ne sont plus proposées.
}
function hide(){$(SECTION)?.classList.add('hidden')}
function show(){
 if(!section()||!bindBottomNavigation())return;
 document.querySelectorAll('.app>section').forEach(s=>s.classList.add('hidden'));
 $(SECTION).classList.remove('hidden');render();
 document.querySelectorAll('#v87Nav button').forEach(b=>b.classList.remove('on'));
 $('v87Settings')?.classList.add('on');
 window.scrollTo?.({top:0,behavior:'smooth'});
}
function init(){css();return section()&&bindBottomNavigation()}
let tries=0,t=setInterval(()=>{if(init()||++tries>240)clearInterval(t)},100);
window.addEventListener('ifsi:v741-ready',()=>{if($(SECTION)&&!$(SECTION).classList.contains('hidden'))render()});
window.addEventListener('ifsi:vocabulary-ready',()=>{if($(SECTION)&&!$(SECTION).classList.contains('hidden'))render()});
window.IFSI_COURSE_FOLLOWUP={version:'1.4',show,render,courseModel,eventForGroup,isRevisionSession,eventsForWeek,sessionKey,validSourcesUrl};
})();
