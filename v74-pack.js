(()=>{
'use strict';
const VERSION='8.11';
const DOC_FAV_KEY='ifsiabc_v74_resource_favorites_v1';
const Q_FAV_KEY='ifsiabc_favorites_v1';
const VOCAL_KEY='ifsiabc_vocals_v1';
let selectedCourse='';
const $74=id=>document.getElementById(id);
const esc74=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm74=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const readJSON74=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const writeJSON74=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const qCourse=q=>q?.course||q?.theme||'';
const vocals74=()=>window.IFSI_V73?.getVocals?.()||[];
const vocalState74=()=>window.IFSI_V73?.getState?.()||readJSON74(VOCAL_KEY,{listened:[],favorites:[],lastId:null});
const qFavs74=()=>new Set(readJSON74(Q_FAV_KEY,[]));
const docFavs74=()=>new Set(readJSON74(DOC_FAV_KEY,[]));
const docKey74=(type,url)=>`${type}|${url}`;

function addStyles74(){
  if($74('v74css'))return;
  const s=document.createElement('style');s.id='v74css';s.textContent=`
  #v71SearchCard{display:none!important}.v74-search{display:grid;gap:9px}.v74-search-results{display:grid;gap:7px;max-height:460px;overflow:auto}.v74-search-item{display:block;width:100%;border:1px solid var(--line);border-radius:13px;padding:10px 11px;background:var(--card);color:var(--ink);text-align:left;text-decoration:none;cursor:pointer}.v74-search-item .kind{display:inline-block;font-size:10px;font-weight:900;border-radius:999px;padding:3px 7px;margin-right:6px;background:#eee8fb;color:#6941c6}.v74-search-item .sub{font-size:12px;color:var(--muted);margin-top:4px}
  .v74-dashboard{border:1px solid #cfc2ee;background:linear-gradient(135deg,#fff,#f7f3ff)}.v74-dashboard-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:11px}.v74-action{border:1px solid var(--line);border-radius:14px;padding:11px;background:var(--card);color:var(--ink);text-align:left;cursor:pointer}.v74-action b{display:block;margin-bottom:3px}.v74-action .small{line-height:1.3}.v74-action:disabled{opacity:.55;cursor:not-allowed}.v74-priority{margin-top:10px;border-radius:14px;padding:11px;background:#eef9ff;border:1px solid #cae7f5}.v74-priority button{margin-top:8px}
  .v74-course-grid{display:grid;gap:16px}.v74-domain-group{border:1px solid var(--line);border-radius:20px;background:var(--card);overflow:hidden}.v74-domain-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:linear-gradient(135deg,#f7f3ff,#eefaf8);border-bottom:1px solid var(--line)}.v74-domain-title{display:flex;align-items:center;gap:10px}.v74-domain-badge{display:inline-flex;align-items:center;justify-content:center;padding:7px 11px;border-radius:999px;background:#6941c6;color:#fff;font-weight:900;font-size:12px}.v74-domain-name{font-weight:900;font-size:16px}.v74-domain-meta{font-size:11px;color:var(--muted);font-weight:800;margin-top:2px}.v74-domain-body{display:grid;gap:12px;padding:12px}.v74-ue-group{display:grid;gap:9px}.v74-ue-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;border-radius:13px;background:#f8f6fc}.v74-ue-title{display:flex;align-items:center;gap:9px}.v74-ue-code{display:inline-flex;align-items:center;justify-content:center;min-width:52px;padding:6px 9px;border-radius:999px;background:#6941c6;color:white;font-weight:900;font-size:12px}.v74-ue-label{font-weight:900;font-size:15px}.v74-ue-count{font-size:11px;color:var(--muted);font-weight:800}.v74-ue-cards{display:grid;gap:9px}.v74-course-card{border:1px solid var(--line);border-radius:16px;padding:14px;background:var(--card);cursor:pointer;text-align:left}.v74-course-card:hover{border-color:#bbaae8}.v74-course-card h3{margin:5px 0 8px;font-size:16px}.v74-course-meta{display:flex;gap:6px;flex-wrap:wrap}.v74-pill{font-size:11px;font-weight:800;border-radius:999px;padding:4px 8px;background:#f2eff8;color:#5c3ba7}.v74-pill.ok{background:#eaf8ef;color:#216e3b}.v74-master{height:7px;background:#ede9f3;border-radius:99px;overflow:hidden;margin-top:10px}.v74-master>span{display:block;height:100%;background:linear-gradient(90deg,var(--a),var(--p))}
  .v74-back{margin-bottom:8px}.v74-course-head h2{margin:4px 0}.v74-resource-block{margin-top:12px}.v74-resource-list{display:grid;gap:8px;margin-top:8px}.v74-resource{border:1px solid var(--line);border-radius:14px;padding:11px;background:var(--card)}.v74-resource .actions{display:grid;grid-template-columns:1fr auto;gap:7px;margin-top:8px}.v74-resource .actions .btn{min-width:0}.v74-star{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:8px 11px;font-size:17px;cursor:pointer;color:#6941c6}.v74-star.on{background:#fff7d6;border-color:#f0c952;color:#7b5a00}.v74-course-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
  .v74-fav-section{margin-top:14px}.v74-fav-list{display:grid;gap:8px}.v74-fav-empty{color:var(--muted);font-size:13px}.v74-docfav{margin-top:7px}.v74-count{font-size:12px;font-weight:850;color:var(--p)}
  body.v72-dark .v74-dashboard{background:#211e2a;border-color:#3b3548}body.v72-dark .v74-priority{background:#232d35;border-color:#354b58}body.v72-dark .v74-search-item,body.v72-dark .v74-action,body.v72-dark .v74-course-card,body.v72-dark .v74-resource,body.v72-dark .v74-star{background:#211e2a;color:#f4f0fb;border-color:#3b3548}body.v72-dark .v74-domain-group,body.v72-dark .v74-domain-head,body.v72-dark .v74-ue-head{background:#211e2a;color:#f4f0fb;border-color:#3b3548}body.v72-dark .v74-star.on{background:#3a3150;color:#f4d77d}
  @media(min-width:700px){.v74-ue-cards{grid-template-columns:repeat(2,1fr)}.v74-resource-list{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:560px){.v74-dashboard-grid,.v74-course-actions{grid-template-columns:1fr}.v74-resource .actions{grid-template-columns:1fr auto}}
  `;document.head.appendChild(s);
}

function courseAliases74(course){
  const n=norm74(course);const out=[n];
  const rules=[
    [/biomol/,['biomolecules','biomolecule']],
    [/cellul/,['cellules','cellule']],
    [/homeost/,['homeostasie']],
    [/parasite|champignon/,['ecologie microbienne parasites champignons','parasites champignons']],
    [/diagnostic.*virolog/,['diagnostic virologie','diagnostic virologique']],
    [/physiopath.*infection/,['physiopathologie infections','physiopathologie infection']],
    [/immun/,['systeme immunitaire','immunitaire']],
    [/endocr/,['systeme endocrinien','endocrinien']],
    [/respir/,['systeme respiratoire','respiratoire']],
    [/urin/,['systeme urinaire','urinaire']],
    [/genet/,['information genetique','genetique']],
    [/niveaux.*organisation|organisation.*corps/,['niveaux organisation','niveaux organisation corps humain']],
    [/^virus$|ecologie.*virus/,['ecologie microbienne virus']],
    [/ias|aseps/,['ias asepsie hygiene','prevention des ias','asepsie hygiene ias']],
    [/neuro.*mening/,['infections neuro meningees','neuro meningees']],
    [/systeme nerveux|nerveux/,['systeme nerveux']]
  ];
  for(const [r,a] of rules)if(r.test(n))out.push(...a);
  return [...new Set(out.map(norm74).filter(Boolean))];
}
function resourceText74(x,type){return norm74(type==='sheet'?`${x.label||''} ${x.title||''} ${x.ue||''}`:`${x.title||''}`)}
function registryCourse74(course){
  const list=window.IFSI_V741?.getRegistry?.()?.courses||[];
  return list.find(c=>c.id===course)||list.find(c=>norm74(c.label)===norm74(course))||null;
}
function courseId74(course){return registryCourse74(course)?.id||window.IFSI_V741?.courseIdForLabel?.(course)||null}
function resourceMatchesCourse74(x,course,type){
  const id=courseId74(course);if(id&&x?.courseId)return x.courseId===id;
  const text=resourceText74(x,type),aliases=courseAliases74(course);if(aliases.some(a=>a.length>=4&&text.includes(a)))return true;
  const stop=new Set(['systeme','cours','partie','fondamentaux','fonctionnement','corps','humain','sciences','biomedicales']);
  const tokens=norm74(course).split(' ').filter(t=>t.length>=5&&!stop.has(t));if(!tokens.length)return false;return tokens.filter(t=>text.includes(t)).length>=Math.min(2,tokens.length);
}
function allCourses74(){
  const reg=window.IFSI_V741?.getRegistry?.()?.courses||[];
  if(reg.length){
    return reg.filter(c=>c.showInCourses!==false).filter(c=>{const d=courseData74(c.label);return d.qs.length||d.vs.length||d.sheets.length||d.infos.length}).map(c=>c.label).sort((a,b)=>a.localeCompare(b,'fr'));
  }
  const q=[...new Set((Array.isArray(Q)?Q:[]).map(qCourse).filter(Boolean))],v=vocals74().map(x=>x.course).filter(Boolean);
  return [...new Set([...q,...v])].sort((a,b)=>a.localeCompare(b,'fr'));
}
function courseData74(course){
  const id=courseId74(course),bundle=id?window.IFSI_V741?.resourcesForCourse?.(id):null;
  const qs=bundle?.questions||(Array.isArray(Q)?Q:[]).filter(q=>id?(q.courseId===id):qCourse(q)===course),vs=bundle?.vocals||vocals74().filter(v=>id?(v.courseId===id):norm74(v.course)===norm74(course));
  const sheets=bundle?.sheets||(Array.isArray(S)?S:[]).filter(x=>resourceMatchesCourse74(x,course,'sheet'));
  const infos=bundle?.infographics||(Array.isArray(I)?I:[]).filter(x=>resourceMatchesCourse74(x,course,'info'));
  const stats=typeof st==='function'?st():{};const qstats=stats.v7QuestionStats||{};const seen=qs.filter(q=>(qstats[q.id]?.answered||0)>0);let ans=0,cor=0;for(const q of qs){ans+=qstats[q.id]?.answered||0;cor+=qstats[q.id]?.correct||0}
  const errors=new Set(stats.errors||[]);const err=qs.filter(q=>errors.has(q.id)).length;const rate=ans?Math.round(cor/ans*100):null;
  const vsState=vocalState74(),listened=new Set(vsState.listened||[]);const listenedCount=vs.filter(v=>listened.has(v.id)).length;
  return {course,qs,vs,sheets,infos,seen:seen.length,ans,cor,rate,err,listenedCount};
}
function weakestCourse74(){
  const labels=[...new Set((Array.isArray(Q)?Q:[]).map(q=>q.courseId||qCourse(q)).filter(Boolean))];
  const candidates=labels.map(x=>courseData74(registryCourse74(x)?.label||x)).filter(d=>d.qs.length&&d.ans>0);
  if(!candidates.length)return null;return candidates.sort((a,b)=>(a.rate??101)-(b.rate??101)||b.err-a.err)[0];
}

function injectSections74(){
  const app=document.querySelector('.app');if(!app)return;
  if(!$74('courses74')){const s=document.createElement('section');s.id='courses74';s.className='hidden';s.innerHTML='<div class="card"><button class="btn outline v74-back" data-v74home>← Accueil</button><div class="row"><div><h2 style="margin:0">📚 Mes cours</h2><div class="small">Ressources rangées par domaine puis par UE.</div></div><span class="badge">Par UE</span></div><input id="v74CourseSearch" type="text" placeholder="Rechercher un cours…" style="margin-top:12px"></div><div id="v74CourseGrid" class="v74-course-grid"></div>';const quiz=$74('quiz');if(quiz)quiz.insertAdjacentElement('beforebegin',s);else app.appendChild(s)}
  if(!$74('course74')){const s=document.createElement('section');s.id='course74';s.className='hidden';s.innerHTML='<div id="v74CourseDetail"></div>';const quiz=$74('quiz');if(quiz)quiz.insertAdjacentElement('beforebegin',s);else app.appendChild(s)}
  if(!$74('favorites74')){const s=document.createElement('section');s.id='favorites74';s.className='hidden';s.innerHTML='<div class="card"><button class="btn outline v74-back" data-v74home>← Accueil</button><div class="row"><div><h2 style="margin:0">⭐ Mes favoris</h2><div class="small">QCM, fiches, infographies et vocaux réunis.</div></div><span id="v74FavTotal" class="badge">0</span></div></div><div id="v74FavoritesBody"></div>';const quiz=$74('quiz');if(quiz)quiz.insertAdjacentElement('beforebegin',s);else app.appendChild(s)}
  document.querySelectorAll('[data-v74home]').forEach(b=>b.onclick=()=>window.show('home'));
  if($74('v74CourseSearch'))$74('v74CourseSearch').oninput=renderCourses74;
}

let showPatched74=false;
function patchShow74(){
  if(showPatched74||typeof window.show!=='function')return;const base=window.show;const custom=['courses74','course74','favorites74'];
  window.show=function(id){
    custom.forEach(x=>$74(x)?.classList.add('hidden'));
    if(custom.includes(id)){
      ['home','sheets','infographics','vocals','quiz','result','progress'].forEach(x=>$74(x)?.classList.add('hidden'));$74(id)?.classList.remove('hidden');document.querySelectorAll('nav button').forEach(b=>b.classList.remove('on'));return;
    }
    base(id);renderDashboard74();
  };showPatched74=true;
}

function injectSearch74(){
  const home=$74('home');if(!home||$74('v74SearchCard'))return;const card=document.createElement('div');card.id='v74SearchCard';card.className='card v74-search';card.innerHTML='<div><b>🔎 Recherche globale</b><div class="small">QCM, cours, fiches, infographies et vocaux.</div></div><input id="v74Search" type="text" autocomplete="off" placeholder="Ex. ADH, système respiratoire, PCR, méiose…"><div id="v74SearchResults" class="v74-search-results"></div>';
  const create=[...home.querySelectorAll('.section')].find(e=>e.textContent.includes('Créer une série'));if(create)home.insertBefore(card,create);else home.appendChild(card);$74('v74Search').oninput=renderSearch74;
}
function searchDocLabel74(x,type){return x.displayTitle||(type==='sheet'?(x.label||x.title||'Fiche'):(typeof infoLabel==='function'?infoLabel(x.title):x.title))}
function renderSearch74(){
  const input=$74('v74Search'),box=$74('v74SearchResults');if(!input||!box)return;const raw=input.value.trim(),term=norm74(raw);if(term.length<2){box.innerHTML=raw?'<div class="small">Tape au moins 2 caractères.</div>:'.replace('>:','>'):'';return}
  const results=[];
  for(const c of allCourses74())if(norm74(c).includes(term))results.push({kind:'Cours',title:c,sub:'Toutes les ressources',course:c});
  for(const q of (Array.isArray(Q)?Q:[]))if(norm74(`${q.question} ${q.explanation||''} ${qCourse(q)} ${q.theme||''}`).includes(term))results.push({kind:'QCM',title:q.question,sub:`${qCourse(q)}${q.number?' • Q'+q.number:''}`,qid:q.id});
  for(const x of (Array.isArray(S)?S:[]))if(norm74(`${x.displayTitle||''} ${x.label||''} ${x.title||''} ${x.ue||''}`).includes(term))results.push({kind:'Fiche',title:searchDocLabel74(x,'sheet'),sub:x.ue||'',url:x.url});
  for(const x of (Array.isArray(I)?I:[]))if(norm74(`${x.displayTitle||''} ${x.title||''}`).includes(term))results.push({kind:'Infographie',title:searchDocLabel74(x,'info'),sub:'Visuel Drive',url:x.url});
  for(const x of vocals74())if(norm74(`${x.title} ${x.course}`).includes(term))results.push({kind:'Vocal',title:x.title,sub:`${x.course} • Vocal ${String(x.number).padStart(2,'0')}`,vid:x.id});
  const priority={Cours:0,QCM:1,Vocal:2,Fiche:3,Infographie:4};results.sort((a,b)=>priority[a.kind]-priority[b.kind]);const all=results.slice(0,30);if(!all.length){box.innerHTML='<div class="small">Aucun résultat.</div>';return}
  box.innerHTML=all.map((r,j)=>r.url?`<a class="v74-search-item" href="${esc74(r.url)}" target="_blank" rel="noopener"><span class="kind">${esc74(r.kind)}</span>${esc74(r.title)}<div class="sub">${esc74(r.sub)}</div></a>`:`<button class="v74-search-item" type="button" data-v74result="${j}"><span class="kind">${esc74(r.kind)}</span>${esc74(r.title)}<div class="sub">${esc74(r.sub)}</div></button>`).join('');
  box.querySelectorAll('[data-v74result]').forEach(b=>{const r=all[+b.dataset.v74result];b.onclick=()=>{if(r.course)openCourse74(r.course);else if(r.qid){const q=Q.find(x=>x.id===r.qid);if(q)begin([q])}else if(r.vid){window.showVocals?.();setTimeout(()=>window.IFSI_V73?.play?.(r.vid),80)}}});
}

function injectDashboard74(){
  const home=$74('home');if(!home||$74('v74Dashboard'))return;const card=document.createElement('div');card.id='v74Dashboard';card.className='card v74-dashboard';const grid=home.querySelector('.grid');if(grid)grid.insertAdjacentElement('afterend',card);else home.prepend(card);renderDashboard74();
}
function favoriteCounts74(){const q=qFavs74().size,v=(vocalState74().favorites||[]).length,d=docFavs74().size;return {q,v,d,total:q+v+d}}
function renderDashboard74(){
  const box=$74('v74Dashboard');if(!box)return;const stats=typeof st==='function'?st():{},errors=(stats.errors||[]).length,resume=readJSON74('ifsiabc_resume_v1',null),vs=vocalState74(),last=vocals74().find(v=>v.id===vs.lastId),fav=favoriteCounts74(),weak=weakestCourse74();
  box.innerHTML=`<div class="row"><div><b style="font-size:18px">🧭 Mon parcours</b><div class="small">Continue là où tu en es ou révise par cours.</div></div><span class="badge">${fav.total} favori${fav.total>1?'s':''}</span></div><div class="v74-dashboard-grid"><button class="v74-action" id="v74ResumeSeries" ${resume?'':'disabled'}><b>▶ Série en cours</b><div class="small">${resume?`Question ${(resume.index||0)+1} / ${(resume.ids||[]).length}`:'Aucune série interrompue'}</div></button><button class="v74-action" id="v74ResumeVocal" ${last?'':'disabled'}><b>🎧 Dernier vocal</b><div class="small">${last?esc74(last.title):'Aucun vocal consulté'}</div></button><button class="v74-action" id="v74Errors" ${errors?'':'disabled'}><b>↻ Erreurs à revoir</b><div class="small">${errors?`${errors} question${errors>1?'s':''}`:'Aucune erreur en attente'}</div></button><button class="v74-action" id="v74Courses"><b>📚 Mes cours</b><div class="small">Fiches, infographies, vocaux et QCM</div></button><button class="v74-action" id="v74Favorites"><b>⭐ Mes favoris</b><div class="small">${fav.q} QCM • ${fav.v} vocaux • ${fav.d} ressources</div></button></div>${weak?`<div class="v74-priority"><b>🎯 À renforcer : ${esc74(weak.course)}</b><div class="small">${weak.rate}% de réussite sur les réponses enregistrées • ${weak.err} erreur${weak.err>1?'s':''} à revoir.</div><button class="btn outline" id="v74WeakOpen">Ouvrir ce cours</button></div>`:''}`;
  const r=$74('v74ResumeSeries');if(r&&!r.disabled)r.onclick=()=>window.resumeSession?.();const rv=$74('v74ResumeVocal');if(rv&&!rv.disabled)rv.onclick=()=>{window.showVocals?.();setTimeout(()=>window.IFSI_V73?.play?.(last.id),80)};const er=$74('v74Errors');if(er&&!er.disabled)er.onclick=()=>startErrors();$74('v74Courses').onclick=showCourses74;$74('v74Favorites').onclick=showFavorites74;if(weak&&$74('v74WeakOpen'))$74('v74WeakOpen').onclick=()=>openCourse74(weak.course);
}

function courseMeta74(label){
  const c=registryCourse74(label)||{};return {ue:c.ue||'Autres',domain:c.domain||'',id:c.id||''}
}
function ueOrder74(ue){const order=['A1','A2','B1','B2','B3','C1','C2','D1','D2','E1','E2','E3','T'];const i=order.indexOf(ue);return i<0?999:i}
function domainName74(domain){
  return ({A:'Sciences humaines, sociales et droit',B:'Sciences biologiques et médicales',C:'Sciences et techniques infirmières',D:'Communication et relation de soins',E:'Méthodes et outils pour la formation'})[domain]||'Autres enseignements'
}
function renderCourses74(){
  const grid=$74('v74CourseGrid');if(!grid)return;
  const term=norm74($74('v74CourseSearch')?.value||'');
  const courses=allCourses74().filter(label=>{
    const m=courseMeta74(label);return !term||norm74(`${label} ${m.domain} ${m.ue}`).includes(term)
  });
  const domains=new Map();
  for(const label of courses){
    const meta=courseMeta74(label),domain=meta.domain||'Autres',ue=meta.ue||'Autres';
    if(!domains.has(domain))domains.set(domain,new Map());
    const ues=domains.get(domain);if(!ues.has(ue))ues.set(ue,[]);
    ues.get(ue).push({label,meta,data:courseData74(label)})
  }
  const domainOrder=['A','B','C','D','E','T','Autres'];
  const sortedDomains=[...domains.entries()].sort((a,b)=>{
    const ia=domainOrder.indexOf(a[0]),ib=domainOrder.indexOf(b[0]);
    return (ia<0?999:ia)-(ib<0?999:ib)||a[0].localeCompare(b[0],'fr')
  });
  grid.innerHTML=sortedDomains.map(([domain,ues])=>{
    const ueEntries=[...ues.entries()].sort((a,b)=>ueOrder74(a[0])-ueOrder74(b[0])||a[0].localeCompare(b[0],'fr'));
    const all=ueEntries.flatMap(x=>x[1]),qcm=all.reduce((n,x)=>n+x.data.qs.length,0);
    return `<section class="v74-domain-group">
      <div class="v74-domain-head"><div class="v74-domain-title"><span class="v74-domain-badge">DOMAINE ${esc74(domain)}</span><div><div class="v74-domain-name">${esc74(domainName74(domain))}</div><div class="v74-domain-meta">${all.length} cours • ${qcm} QCM</div></div></div></div>
      <div class="v74-domain-body">${ueEntries.map(([ue,items])=>`<div class="v74-ue-group">
        <div class="v74-ue-head"><div class="v74-ue-title"><span class="v74-ue-code">UE ${esc74(ue)}</span><div class="v74-ue-count">${items.length} cours • ${items.reduce((n,x)=>n+x.data.qs.length,0)} QCM</div></div></div>
        <div class="v74-ue-cards">${items.map(({label:c,data:d})=>{const pct=d.rate??0;return `<button class="v74-course-card" type="button" data-course74="${esc74(c)}"><div class="row"><span class="badge">${d.qs.length} QCM</span><span class="v74-count">${d.rate===null?'Pas encore testé':d.rate+'%'}</span></div><h3>${esc74(c)}</h3><div class="v74-course-meta"><span class="v74-pill">📄 ${d.sheets.length} fiche${d.sheets.length>1?'s':''}</span><span class="v74-pill">◫ ${d.infos.length} info</span><span class="v74-pill">🎧 ${d.vs.length} vocal${d.vs.length>1?'aux':''}</span>${d.err?`<span class="v74-pill">↻ ${d.err} erreur${d.err>1?'s':''}</span>`:''}${d.listenedCount?`<span class="v74-pill ok">✓ ${d.listenedCount}/${d.vs.length} vocaux</span>`:''}</div><div class="v74-master"><span style="width:${pct}%"></span></div></button>`}).join('')}</div>
      </div>`).join('')}</div>
    </section>`
  }).join('')||'<div class="card small">Aucun cours trouvé.</div>';
  grid.querySelectorAll('[data-course74]').forEach(b=>b.onclick=()=>openCourse74(b.dataset.course74));
  window.IFSI_V81?.refreshBadges?.()
}
function showCourses74(){window.show('courses74');renderCourses74()}
window.showCourses74=showCourses74;

function resourceCard74(x,type){
  const label=searchDocLabel74(x,type),key=docKey74(type,x.url),fav=docFavs74().has(key),course=registryCourse74(x.courseId);return `<div class="v74-resource"><div><b>${esc74(label)}</b></div><div class="small">${esc74(course?.label||x.ue||'')} • ${type==='sheet'?'Fiche de révision':'Infographie'}</div><div class="actions"><a class="btn primary" href="${esc74(x.url)}" target="_blank" rel="noopener">Ouvrir ↗</a><button class="v74-star ${fav?'on':''}" type="button" data-docfav="${esc74(key)}">${fav?'★':'☆'}</button></div></div>`;
}
function renderCourse74(){
  const box=$74('v74CourseDetail');if(!box||!selectedCourse)return;const d=courseData74(selectedCourse),qFav=qFavs74(),vf=new Set(vocalState74().favorites||[]);const mastery=d.rate??0;
  box.innerHTML=`<div class="card v74-course-head"><button class="btn outline v74-back" id="v74BackCourses">← Mes cours</button><div class="row"><div><div class="small">PARCOURS DE RÉVISION</div><h2>${esc74(d.course)}</h2></div><span class="badge">${d.qs.length} QCM</span></div><div class="v74-course-meta"><span class="v74-pill">${d.seen}/${d.qs.length} questions vues</span><span class="v74-pill">${d.rate===null?'Pas encore de score':d.rate+'% réussite'}</span><span class="v74-pill">${d.err} erreurs</span>${d.vs.length?`<span class="v74-pill ok">🎧 ${d.listenedCount}/${d.vs.length} écoutés</span>`:''}</div><div class="v74-master"><span style="width:${mastery}%"></span></div>${d.qs.length?`<div class="v74-course-actions"><button class="btn primary" id="v74Course10">▶ 10 QCM</button><button class="btn secondary" id="v74CourseAll">📚 Tous les QCM</button></div>`:''}</div>
  ${d.sheets.length?`<div class="card v74-resource-block"><div class="row"><b>📄 Fiches de révision</b><span class="badge">${d.sheets.length}</span></div><div class="v74-resource-list">${d.sheets.map(x=>resourceCard74(x,'sheet')).join('')}</div></div>`:''}
  ${d.infos.length?`<div class="card v74-resource-block"><div class="row"><b>◫ Infographies</b><span class="badge">${d.infos.length}</span></div><div class="v74-resource-list">${d.infos.map(x=>resourceCard74(x,'info')).join('')}</div></div>`:''}
  ${d.vs.length?`<div class="card v74-resource-block"><div class="row"><b>🎧 Vocaux</b><span class="badge">${d.vs.length}</span></div><div class="v74-resource-list">${d.vs.map(v=>`<div class="v74-resource"><div class="row"><div><b>${esc74(v.title)}</b><div class="small">Vocal ${String(v.number).padStart(2,'0')}</div></div><span>${vf.has(v.id)?'♥':''}</span></div><div class="actions"><button class="btn primary" type="button" data-vocal74="${esc74(v.id)}">▶ Écouter</button><button class="v74-star ${vf.has(v.id)?'on':''}" type="button" data-vocalfav74="${esc74(v.id)}">${vf.has(v.id)?'★':'☆'}</button></div></div>`).join('')}</div></div>`:''}
  ${d.qs.length?`<div class="card v74-resource-block"><div class="row"><b>⭐ QCM favoris de ce cours</b><span class="badge">${d.qs.filter(q=>qFav.has(q.id)).length}</span></div><div class="small" style="margin-top:7px">Les questions peuvent être ajoutées aux favoris directement pendant un QCM.</div></div>`:''}`;
  $74('v74BackCourses').onclick=showCourses74;if($74('v74Course10'))$74('v74Course10').onclick=()=>begin(shuffle(d.qs).slice(0,Math.min(10,d.qs.length)));if($74('v74CourseAll'))$74('v74CourseAll').onclick=()=>begin(d.qs);
  box.querySelectorAll('[data-docfav]').forEach(b=>b.onclick=()=>{toggleDocFavorite74(b.dataset.docfav);renderCourse74()});box.querySelectorAll('[data-vocal74]').forEach(b=>b.onclick=()=>{window.showVocals?.();setTimeout(()=>window.IFSI_V73?.play?.(b.dataset.vocal74),80)});box.querySelectorAll('[data-vocalfav74]').forEach(b=>b.onclick=()=>{window.IFSI_V73?.toggleFavorite?.(b.dataset.vocalfav74);setTimeout(()=>{renderCourse74();renderDashboard74()},30)});
}
function openCourse74(course){selectedCourse=course;window.show('course74');renderCourse74()}
window.openCourse74=openCourse74;

function toggleDocFavorite74(key){const f=docFavs74();f.has(key)?f.delete(key):f.add(key);writeJSON74(DOC_FAV_KEY,[...f]);renderDashboard74();renderFavorites74();enhanceResourceCards74()}
function removeQFavorite74(id){const f=qFavs74();f.delete(id);writeJSON74(Q_FAV_KEY,[...f]);try{fill()}catch{}renderDashboard74();renderFavorites74()}
function renderFavorites74(){
  const box=$74('v74FavoritesBody');if(!box)return;const qf=qFavs74(),vf=new Set(vocalState74().favorites||[]),df=docFavs74();const qs=(Array.isArray(Q)?Q:[]).filter(q=>qf.has(q.id)),vs=vocals74().filter(v=>vf.has(v.id)),sheets=(Array.isArray(S)?S:[]).filter(x=>df.has(docKey74('sheet',x.url))),infos=(Array.isArray(I)?I:[]).filter(x=>df.has(docKey74('info',x.url)));const total=qs.length+vs.length+sheets.length+infos.length;if($74('v74FavTotal'))$74('v74FavTotal').textContent=total;
  const qhtml=qs.map(q=>`<div class="v74-resource"><b>${esc74(q.question)}</b><div class="small">${esc74(qCourse(q))}${q.number?' • Q'+q.number:''}</div><div class="actions"><button class="btn primary" type="button" data-favqopen="${esc74(q.id)}">▶ Réviser</button><button class="v74-star on" type="button" data-favqremove="${esc74(q.id)}">★</button></div></div>`).join('');
  const vhtml=vs.map(v=>`<div class="v74-resource"><b>${esc74(v.title)}</b><div class="small">${esc74(v.course)} • Vocal ${String(v.number).padStart(2,'0')}</div><div class="actions"><button class="btn primary" type="button" data-favvopen="${esc74(v.id)}">▶ Écouter</button><button class="v74-star on" type="button" data-favvremove="${esc74(v.id)}">★</button></div></div>`).join('');
  box.innerHTML=`<div class="card v74-fav-section"><div class="row"><b>QCM</b><span class="badge">${qs.length}</span></div><div class="v74-fav-list" style="margin-top:8px">${qhtml||'<div class="v74-fav-empty">Aucun QCM favori.</div>'}</div></div><div class="card v74-fav-section"><div class="row"><b>🎧 Vocaux</b><span class="badge">${vs.length}</span></div><div class="v74-fav-list" style="margin-top:8px">${vhtml||'<div class="v74-fav-empty">Aucun vocal favori.</div>'}</div></div><div class="card v74-fav-section"><div class="row"><b>📄 Fiches</b><span class="badge">${sheets.length}</span></div><div class="v74-resource-list">${sheets.length?sheets.map(x=>resourceCard74(x,'sheet')).join(''):'<div class="v74-fav-empty">Aucune fiche favorite.</div>'}</div></div><div class="card v74-fav-section"><div class="row"><b>◫ Infographies</b><span class="badge">${infos.length}</span></div><div class="v74-resource-list">${infos.length?infos.map(x=>resourceCard74(x,'info')).join(''):'<div class="v74-fav-empty">Aucune infographie favorite.</div>'}</div></div>`;
  box.querySelectorAll('[data-favqopen]').forEach(b=>b.onclick=()=>{const q=Q.find(x=>x.id===b.dataset.favqopen);if(q)begin([q])});box.querySelectorAll('[data-favqremove]').forEach(b=>b.onclick=()=>removeQFavorite74(b.dataset.favqremove));box.querySelectorAll('[data-favvopen]').forEach(b=>b.onclick=()=>{window.showVocals?.();setTimeout(()=>window.IFSI_V73?.play?.(b.dataset.favvopen),80)});box.querySelectorAll('[data-favvremove]').forEach(b=>b.onclick=()=>{window.IFSI_V73?.toggleFavorite?.(b.dataset.favvremove);setTimeout(()=>{renderFavorites74();renderDashboard74()},30)});box.querySelectorAll('[data-docfav]').forEach(b=>b.onclick=()=>toggleDocFavorite74(b.dataset.docfav));
}
function showFavorites74(){window.show('favorites74');renderFavorites74()}
window.showFavorites74=showFavorites74;

function enhanceResourceCards74(){
  const defs=[['sheetList','sheet',()=>Array.isArray(S)?S:[]],['infoList','info',()=>Array.isArray(I)?I:[]]];for(const [listId,type,get] of defs){const list=$74(listId);if(!list)continue;for(const card of list.querySelectorAll('.sheet')){if(card.querySelector('.v74-docfav'))continue;const a=card.querySelector('a[href]');if(!a)continue;const item=get().find(x=>x.url===a.href||x.url===a.getAttribute('href'));if(!item)continue;const key=docKey74(type,item.url),b=document.createElement('button');b.type='button';b.className='btn outline full v74-docfav';const on=docFavs74().has(key);b.textContent=on?'★ Retirer des favoris':'☆ Ajouter aux favoris';b.onclick=()=>{toggleDocFavorite74(key);b.textContent=docFavs74().has(key)?'★ Retirer des favoris':'☆ Ajouter aux favoris'};card.appendChild(b)}}
}
let resourceRenderPatched74=false;
function patchResourceRender74(){
  if(resourceRenderPatched74)return;try{if(typeof window.renderSheets==='function'){const rs=window.renderSheets;window.renderSheets=function(){rs();enhanceResourceCards74()}}if(typeof window.renderInfographics==='function'){const ri=window.renderInfographics;window.renderInfographics=function(){ri();enhanceResourceCards74()}}resourceRenderPatched74=true}catch{}
}

function injectNews74(){const home=$74('home');if(!home||$74('v74News'))return;const c=document.createElement('div');c.id='v74News';c.className='card';c.innerHTML='<b>🧭 Nouveau V7.4 : parcours par cours</b><div class="small" style="margin-top:5px">Chaque cours regroupe QCM, fiches, infographies et vocaux. L’accueil propose maintenant la prochaine action utile et tous les favoris sont réunis.</div>';const app=[...home.querySelectorAll('.section')].find(x=>x.textContent.trim()==='Application');if(app)app.insertAdjacentElement('beforebegin',c);else home.appendChild(c)}
function setVersion74(){const u=$74('update');if(u)u.textContent='Application prête • V7.4 locale : parcours par cours, accueil personnalisé, recherche globale et favoris unifiés.';const b=u?.parentElement?.querySelector('b');if(b)b.textContent='V7.4 local'}
function lockVersion74(){let n=0;const t=setInterval(()=>{setVersion74();if(++n>=50)clearInterval(t)},250)}

let fillPatched74=false;
function patchFill74(){if(fillPatched74)return;try{const prev=window.fill;window.fill=function(){prev();setTimeout(()=>{renderDashboard74();renderCourses74();enhanceResourceCards74()},0)};fillPatched74=true}catch{}}
function dataReady74(){return Array.isArray(Q)&&Q.length&&Array.isArray(S)&&S.length&&Array.isArray(I)&&I.length&&vocals74().length}
function finalize74(){patchResourceRender74();patchFill74();enhanceResourceCards74();renderDashboard74();renderCourses74();setVersion74();lockVersion74()}
addStyles74();injectSections74();patchShow74();injectSearch74();injectDashboard74();injectNews74();
let tries74=0;const timer74=setInterval(()=>{tries74++;if(dataReady74()||tries74>200){clearInterval(timer74);finalize74()}},250);
window.addEventListener('storage',()=>{renderDashboard74();renderCourses74();renderFavorites74();if(selectedCourse)renderCourse74();enhanceResourceCards74()});
window.IFSI_V74={version:VERSION,showCourses:showCourses74,openCourse:openCourse74,showFavorites:showFavorites74,resourceFavorites:()=>[...docFavs74()],courses:allCourses74};
})();
