(()=>{'use strict';
const V='8.23',SECTION='anatomy82',MK='ifsiabc_v7_mode';
const $=id=>document.getElementById(id);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const ST=()=>{try{return typeof st==='function'?st():{}}catch{return {}}};
const SH=a=>{a=[...a];for(let i=a.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const FOUNDATION=[
  {id:'niveaux_organisation',icon:'🧍',subtitle:'Organisation du corps humain'},
  {id:'cellules_tissus',icon:'🔬',subtitle:'Cellules, tissus et organisation'},
  {id:'homeostasie',icon:'⚖️',subtitle:'Équilibres et régulations'}
];
const SYSTEMS=[
  {id:'systeme_respiratoire',icon:'🫁',subtitle:'Respiration et échanges gazeux'},
  {id:'systeme_cardiovasculaire',icon:'❤️',subtitle:'Cœur, circulation, vaisseaux et pression artérielle'},
  {id:'systeme_urinaire',icon:'💧',subtitle:'Fonction rénale et appareil urinaire'},
  {id:'systeme_endocrinien',icon:'🧪',subtitle:'Hormones et régulation'},
  {id:'systeme_nerveux',icon:'🧠',subtitle:'Système nerveux'},
  {id:'systeme_immunitaire',icon:'🛡️',subtitle:'Défenses de l’organisme'},
  {id:'systeme_digestif',icon:'🍽️',subtitle:'Anatomie, glandes annexes et physiologie digestive'},
  {id:'appareil_locomoteur',icon:'🦴',subtitle:'Ostéologie, articulations, rachis et traumatologie'}
];
const FUTURE=[
['🧬','Reproduction'],['👁️','Organes des sens'],['🧴','Peau & téguments']
];
const ALL=[...FOUNDATION,...SYSTEMS];

function css(){
  if($('v82css'))return;
  const s=document.createElement('style');s.id='v82css';s.textContent=`
  .v82-hidden{display:none!important}
  .v82-primary{border:1px solid #d9cfee;background:linear-gradient(145deg,#fff,#f7f3ff);border-radius:22px;padding:16px;box-shadow:0 10px 28px rgba(55,39,94,.08)}
  .v82-primary-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.v82-primary-head h3{margin:0}
  .v82-mainbtn{width:100%;margin-top:12px;border:0;border-radius:18px;padding:16px 18px;background:linear-gradient(135deg,#7046d9,#5d35c5);color:#fff;text-align:left;cursor:pointer;box-shadow:0 9px 22px rgba(94,57,190,.24)}
  .v82-mainbtn b{display:block;font-size:18px}.v82-mainbtn span{display:block;font-size:12px;opacity:.9;margin-top:3px}
  .v82-navgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:10px}
  .v82-nav{border:1px solid #e2daf0;background:#fff;border-radius:17px;padding:13px;text-align:left;cursor:pointer;color:#282331;min-height:106px}
  .v82-nav .ico{font-size:27px;display:block;margin-bottom:8px}.v82-nav b{display:block}.v82-nav small{display:block;color:#736c80;margin-top:4px;line-height:1.3}
  .v82-nav.anat{background:linear-gradient(150deg,#fff,#eefaf7)}.v82-nav.center{background:linear-gradient(150deg,#fff,#f4efff)}
  .v82-pagehead{border:1px solid #d8cfec;background:linear-gradient(135deg,#f7f3ff,#eefaf8);border-radius:23px;padding:17px}
  .v82-pagehead h2{margin:9px 0 4px}.v82-kpis{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
  .v82-kpi{border-radius:999px;background:#fff;border:1px solid #ddd5eb;padding:5px 9px;font-size:11px;font-weight:800}
  .v82-section-title{display:flex;align-items:end;justify-content:space-between;gap:10px;margin-bottom:9px}.v82-section-title h3{margin:0}
  .v82-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.v82-card{border:1px solid var(--line);border-radius:18px;padding:13px;background:var(--card);min-width:0}
  .v82-card-top{display:flex;gap:10px;align-items:flex-start}.v82-icon{font-size:31px;line-height:1}.v82-card h4{margin:0 0 3px;font-size:16px}.v82-card .meta{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}
  .v82-pill{font-size:10px;font-weight:850;padding:4px 7px;border-radius:999px;background:#f0ecf8;color:#5d3ca5}.v82-pill.ok{background:#e8f8f3;color:#087a75}
  .v82-progress{height:7px;background:#ece8f1;border-radius:99px;overflow:hidden;margin-top:9px}.v82-progress span{display:block;height:100%;background:linear-gradient(90deg,#0fa7a0,#6941c6)}
  .v82-actions{display:grid;grid-template-columns:1fr 1fr auto;gap:6px;margin-top:9px}.v82-actions .btn{min-width:0}.v82-share{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:8px 10px;cursor:pointer}
  .v82-future{display:flex;gap:7px;flex-wrap:wrap}.v82-future span{border:1px dashed #d8d0e5;border-radius:999px;padding:7px 10px;color:#77707f;font-size:12px;background:#faf9fc}
  .v82-mixed{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.v82-mixed .btn{flex:1 1 160px}
  .v82-catalog{display:grid;gap:12px;margin-top:12px}.v82-search{width:100%;margin-top:12px}.v82-system{border:1px solid var(--line);border-radius:22px;background:var(--card);overflow:hidden}.v82-system-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px}.v82-system-main{display:flex;align-items:center;gap:11px;min-width:0}.v82-system-icon{font-size:32px}.v82-system-main h3{margin:0 0 3px;font-size:18px}.v82-system-meta{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.v82-board-list{display:grid;gap:12px;padding:0 12px 14px}.v82-board{display:grid;grid-template-columns:92px minmax(0,1fr) auto;align-items:center;gap:12px;border:1px solid var(--line);border-radius:17px;padding:10px;background:var(--card)}.v82-board-thumb{width:92px;height:72px;border-radius:12px;object-fit:contain;background:#fff}.v82-board-icon{width:92px;height:72px;border-radius:12px;background:#f3effb;display:grid;place-items:center;font-size:29px}.v82-board h4{margin:0 0 3px;font-size:15px}.v82-board-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.v82-board-actions .btn{padding:8px 10px;font-size:12px}.v82-toggle{white-space:nowrap}.v82-empty{padding:14px;color:var(--muted);font-size:13px}.v82-resp-list{display:grid;gap:14px;padding:0 13px 15px}.v82-resp-card{display:grid;grid-template-columns:minmax(180px,1.05fr) minmax(240px,1fr);gap:14px;border:1px solid var(--line);border-radius:20px;padding:12px;background:var(--card);box-shadow:0 8px 24px rgba(58,42,97,.06)}.v82-resp-preview{position:relative;border-radius:15px;overflow:hidden;background:#fff;min-height:180px}.v82-resp-preview img{width:100%;height:100%;max-height:250px;object-fit:contain;display:block}.v82-resp-index{position:absolute;left:10px;top:10px;border-radius:999px;padding:5px 9px;background:#f2ecff;color:#6941c6;font-size:11px;font-weight:900}.v82-resp-content{display:flex;flex-direction:column;min-width:0}.v82-resp-content h4{font-size:19px;margin:6px 0 4px}.v82-resp-sub{color:var(--muted);font-size:13px;line-height:1.4}.v82-resp-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.v82-resp-fav{border:0;background:transparent;font-size:23px;cursor:pointer;color:#6e6780;padding:4px}.v82-resp-progress{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:11px;color:var(--muted)}.v82-resp-progressbar{height:6px;background:#ece8f1;border-radius:99px;overflow:hidden;flex:1}.v82-resp-progressbar span{display:block;height:100%;background:linear-gradient(90deg,#0fa7a0,#6941c6)}.v82-resp-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:auto;padding-top:12px}.v82-resp-actions .btn{padding:10px 8px;font-size:12px}.v82-source-note{font-size:10px;color:var(--muted);margin-top:8px}
  #v82Anatomy .card{margin-top:12px}
  body.v72-dark .v82-primary,body.v72-dark .v82-nav,body.v72-dark .v82-pagehead,body.v72-dark .v82-card,body.v72-dark .v82-future span,body.v72-dark .v82-system,body.v72-dark .v82-board,body.v72-dark .v82-resp-card{background:#211e2a;color:#f4f0fb;border-color:#3b3548}body.v72-dark .v82-nav small{color:#bbb3c8}
  @media(max-width:760px){.v82-navgrid,.v82-grid{grid-template-columns:1fr}.v82-nav{min-height:0}.v82-actions{grid-template-columns:1fr 1fr auto}.v82-system-head{align-items:flex-start}.v82-board{grid-template-columns:58px minmax(0,1fr)}.v82-board-thumb,.v82-board-icon{width:58px;height:52px}.v82-board-actions{grid-column:1/-1;justify-content:stretch}.v82-board-actions .btn{flex:1}.v82-toggle{font-size:12px;padding:8px 9px}.v82-resp-card{grid-template-columns:1fr}.v82-resp-preview{min-height:190px}.v82-resp-actions{grid-template-columns:repeat(3,1fr)}}
  `;document.head.appendChild(s)
}
function registry(){return window.IFSI_V741?.getRegistry?.()?.courses||[]}
function course(id){return registry().find(c=>c.id===id)||{id,label:id.replaceAll('_',' ')}}
function resources(id){return window.IFSI_V741?.resourcesForCourse?.(id)||{questions:[],vocals:[],sheets:[],infographics:[]}}
function stats(id){
  const qs=resources(id).questions||[],m=ST().v7QuestionStats||{};let a=0,c=0,seen=0;
  qs.forEach(q=>{const z=m[q.id];if(z?.answered){seen++;a+=z.answered;c+=z.correct||0}});
  return{seen,total:qs.length,rate:a?Math.round(c/a*100):null,answers:a}
}
function totals(){
  const ids=ALL.map(x=>x.id);let q=0,s=0,i=0,v=0;
  ids.forEach(id=>{const r=resources(id);q+=(r.questions||[]).length;s+=(r.sheets||[]).length;i+=(r.infographics||[]).length;v+=(r.vocals||[]).length});
  return{q,s,i,v}
}
function weakSystem(){
  return SYSTEMS.map(x=>({x,st:stats(x.id)})).filter(z=>z.st.answers>0).sort((a,b)=>(a.st.rate??101)-(b.st.rate??101))[0]||null
}
function trackStart(qs,src,courseId=null){
  window.IFSI_V77?.track?.('qcm_start',{resource_type:'qcm',resource_id:src,course_id:courseId,metadata:{source:src,mode:'train',count:qs.length,themes:[...new Set(qs.map(q=>window.IFSI_V79?.themeOf?.(q)||q.theme||'Général'))].slice(0,12)}})
}
function startCourse(id,n=10){
  const qs=resources(id).questions||[];if(!qs.length)return alert('Aucun QCM disponible pour ce système.');
  const pack=SH(qs).slice(0,Math.min(n,qs.length));localStorage.setItem(MK,'train');trackStart(pack,'v82_anatomy_system',id);begin(pack)
}
function mixed(n=20){
  const groups=SYSTEMS.map(x=>SH(resources(x.id).questions||[])).filter(x=>x.length),out=[];let k=0;
  while(out.length<n&&groups.some(g=>g.length)){const g=groups[k%groups.length];if(g.length)out.push(g.shift());k++}
  if(!out.length)return alert('Aucun QCM anatomie disponible.');
  localStorage.setItem(MK,'train');trackStart(out,'v82_anatomy_mixed');begin(SH(out))
}
function openSystem(id){
  const c=course(id);if(!c?.label)return;
  if(typeof window.openCourse74==='function')window.openCourse74(c.label)
}
async function shareSystem(id){
  const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('course',id);
  try{await navigator.clipboard.writeText(u.toString());alert('Lien du système copié ✅')}catch{prompt('Copie ce lien :',u.toString())}
}
function card(def){
  const c=course(def.id),r=resources(def.id),stt=stats(def.id),pct=stt.rate??0;
  return `<div class="v82-card" data-anat-card="${E(def.id)}"><div class="v82-card-top"><span class="v82-icon">${def.icon}</span><div><h4>${E(c.label)}</h4><div class="small">${E(def.subtitle)}</div></div></div><div class="meta"><span class="v82-pill">${r.questions.length} QCM</span><span class="v82-pill">📄 ${r.sheets.length}</span><span class="v82-pill">◫ ${r.infographics.length}</span><span class="v82-pill">🎧 ${r.vocals.length}</span>${stt.rate==null?'':`<span class="v82-pill ok">${stt.rate}%</span>`}</div><div class="v82-progress"><span style="width:${pct}%"></span></div><div class="small" style="margin-top:5px">${stt.seen}/${stt.total} questions vues${stt.rate==null?'':' • '+stt.rate+'% de réussite'}</div><div class="v82-actions"><button class="btn primary" data-open="${E(def.id)}">Ouvrir</button>${r.questions.length?`<button class="btn outline" data-test="${E(def.id)}">10 QCM</button>`:`<button class="btn outline" type="button" disabled>Pas de QCM</button>`}<button class="v82-share" title="Copier le lien" data-share="${E(def.id)}">🔗</button></div></div>`
}
function ensureSection(){
  if($(SECTION))return;
  const app=document.querySelector('.app');if(!app)return;
  const sec=document.createElement('section');sec.id=SECTION;sec.className='hidden';sec.innerHTML='<div id="v82AnatomyBody"></div>';
  const quiz=$('quiz');if(quiz)quiz.insertAdjacentElement('beforebegin',sec);else app.appendChild(sec)
}
let showPatched=false;
function patchShow(){
  if(showPatched||typeof window.show!=='function')return;
  const old=window.show;window.show=function(id){
    $(SECTION)?.classList.add('hidden');
    if(id===SECTION){
      document.querySelectorAll('.app > section').forEach(x=>x.classList.add('hidden'));
      $(SECTION)?.classList.remove('hidden');document.querySelectorAll('nav button').forEach(b=>b.classList.remove('on'));renderAnatomy();return
    }
    return old(id)
  };showPatched=true
}
let expandedSystem='';
const RESP_BOARDS=[
  {id:'resp003',index:1,title:'Voies respiratoires',subtitle:'Fosses nasales, cavité buccale, pharynx, épiglotte, larynx, trachée et bronches principales',src:'https://drive.google.com/thumbnail?id=1_xbRk8WEGKha8Mggn0br5oAFQnxveXtJ&sz=w1200',fallback:'./resp-official-overview-learn.jpg?v=14',generated:true,hd:true},
  {id:'resp013',index:2,title:'Arbre bronchique',subtitle:'Trachée, bronches principales, lobaires, segmentaires, bronchioles et zone respiratoire',src:'https://drive.google.com/thumbnail?id=1G2agsVxnMlIeksAdV0-vguUE5bRKQ65Y&sz=w1200',fallback:'./resp-official-bronchial-learn.jpg?v=14',generated:true,hd:true,testReady:false},
  {id:'resp015',index:3,title:'Alvéoles & échanges gazeux',subtitle:'Bronchiole respiratoire, alvéoles, capillaires et membrane alvéolo-capillaire',src:'https://drive.google.com/thumbnail?id=11A147V9LowK3-PnJASkqmrfU-T1nTVIJ&sz=w1200',generated:true,hd:true,testReady:false}

];
const URINARY_BOARDS=[
  {id:'urinary001',index:1,title:'Appareil urinaire & anatomie du rein',subtitle:'Reins, uretères, vessie, urètre et coupe du rein',src:'https://drive.google.com/thumbnail?id=1oMT0A4FuqrVWaI8GDLIKeI1qc3qxm67V&sz=w1200',generated:true,hd:true,testReady:false},
  {id:'urinary002',index:2,title:'Néphron',subtitle:'Glomérule, capsule de Bowman, tubules, anse de Henlé et tube collecteur',src:'https://drive.google.com/thumbnail?id=1GdqA-Vw5zIWBZFzLTLfOrpatl9ayJ57J&sz=w1200',generated:true,hd:true,testReady:false},
  {id:'urinary003',index:3,title:'Formation de l’urine & miction',subtitle:'Filtration glomérulaire, réabsorption, sécrétion, vessie et miction',src:'https://drive.google.com/thumbnail?id=155CIVMe4XaPcfkcGM8SS2MFW5XdL7Hpl&sz=w1200',generated:true,hd:true,testReady:false}
];

function showAnatomy(){window.show?.(SECTION);scrollTo({top:0,behavior:'smooth'})}
function showSystemBoards(id){expandedSystem=id;showAnatomy();setTimeout(()=>document.querySelector(`[data-v82system="${id}"]`)?.scrollIntoView({behavior:'smooth',block:'start'}),80)}
function boardTitle(x){
  return x.displayTitle||String(x.title||'Planche').replace(/\.pdf$/i,'').replace(/^UE_S1_[A-Z0-9]+_/i,'').replace(/_Infographie_\d+_/i,' — ').replace(/_/g,' ').replace(/\s+/g,' ').trim()
}
function boardsFor(def){
  if(def.id==='systeme_respiratoire')return RESP_BOARDS.map(x=>({...x,interactive:true}));
  if(def.id==='systeme_urinaire')return URINARY_BOARDS.map(x=>({...x,interactive:true}));
  // V8.19 : séparation stricte. Une infographie de cours ne devient jamais une planche anatomique.
  // Les autres atlas sont injectés uniquement par leur module anatomique dédié, alimenté depuis 06 - Planches anatomiques.
  return []
}
function respBoardRow(b){
  const m=window.IFSI_V83?.diagramMastery?.(b.id)||{mastered:0,total:0,pct:0};
  const fav=window.IFSI_V83?.isFavorite?.(b.id);
  return `<article class="v82-resp-card"><div class="v82-resp-preview"><img src="${E(b.src)}" alt="${E(b.title)}" ${b.fallback?`onerror="this.onerror=null;this.src='${E(b.fallback)}'"`:''}><span class="v82-resp-index">Planche ${b.index}</span></div><div class="v82-resp-content"><div class="v82-resp-top"><div><h4>${E(b.title)}</h4><div class="v82-resp-sub">${E(b.subtitle)}</div></div><button class="v82-resp-fav" type="button" data-v82fav="${E(b.id)}" title="Favori">${fav?'★':'☆'}</button></div><div class="v82-resp-progress"><span>${m.mastered}/${m.total} repères maîtrisés</span><div class="v82-resp-progressbar"><span style="width:${m.pct||0}%"></span></div></div><div class="v82-resp-actions"><button class="btn primary" data-v82diagram="${E(b.id)}" data-mode="learn">👁️ Apprendre</button>${b.testReady===false?'<button class="btn outline" type="button" disabled title="Version sans légendes à préparer">🧠 Bientôt</button><button class="btn outline" type="button" disabled title="Version test à préparer">❓ Bientôt</button>':`<button class="btn outline" data-v82diagram="${E(b.id)}" data-mode="train">🧠 S’entraîner</button><button class="btn outline" data-v82diagram="${E(b.id)}" data-mode="test">❓ Tester</button>`}</div><div class="v82-source-note">${b.generated?'🧪 Planche HD intégrée • validation pédagogique finale en cours':'Source : support officiel du cours'}</div></div></article>`
}
function boardRow(def,b){
  return `<div class="v82-board"><div class="v82-board-icon">${def.icon}</div><div><h4>${E(b.title)}</h4><div class="small">${E(course(def.id).label)}</div></div><div class="v82-board-actions"><a class="btn primary" href="${E(b.url)}" target="_blank" rel="noopener">Voir la planche ↗</a></div></div>`
}
function catalogCard(def,term){
  const c=course(def.id),boards=boardsFor(def),hay=normCatalog(`${c.label} ${def.subtitle||''}`),filtered=!term?boards:boards.filter(b=>normCatalog(`${c.label} ${b.title} ${b.subtitle||''}`).includes(term));
  if(term&&!filtered.length&&!hay.includes(term))return '';
  const shown=term?filtered:boards,isOpen=expandedSystem===def.id||!!term;
  if(!boards.length){
    const dedicated=['systeme_cardiovasculaire','systeme_endocrinien','systeme_nerveux','systeme_immunitaire'].includes(def.id);
    return `<section class="v82-system" data-v82system="${E(def.id)}"><div class="v82-system-head"><div class="v82-system-main"><span class="v82-system-icon">${def.icon}</span><div><h3>${E(c.label)}</h3><div class="v82-system-meta"><span class="badge">0 planche</span><span class="small">${E(def.subtitle)}</span></div></div></div><span class="badge" style="background:${dedicated?'#eef4ff':'#fff2d9'};color:${dedicated?'#315a9b':'#805900'}">${dedicated?'Chargement…':'À compléter'}</span></div></section>`
  }
  const interactive=['systeme_respiratoire','systeme_urinaire'].includes(def.id);const content=isOpen?(interactive?`<div class="v82-resp-list">${shown.map(respBoardRow).join('')}</div>`:`<div class="v82-board-list">${shown.map(b=>boardRow(def,b)).join('')}</div>`):'';
  return `<section class="v82-system" data-v82system="${E(def.id)}"><div class="v82-system-head"><div class="v82-system-main"><span class="v82-system-icon">${def.icon}</span><div><h3>${E(c.label)}</h3><div class="v82-system-meta"><span class="badge">${boards.length} planche${boards.length>1?'s':''}</span><span class="small">${E(def.subtitle)}</span></div></div></div><button class="btn ${isOpen?'primary':'outline'} v82-toggle" data-v82toggle="${E(def.id)}">${isOpen?'Masquer':'Voir les planches'}</button></div>${content}</section>`
}
const normCatalog=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function bindAnatomy(){
  $('v82Back')?.addEventListener('click',()=>window.show?.('home'));
  $('v82AnatomySearch')?.addEventListener('input',renderAnatomy);
  document.querySelectorAll('[data-v82toggle]').forEach(b=>b.onclick=()=>{expandedSystem=expandedSystem===b.dataset.v82toggle?'':b.dataset.v82toggle;renderAnatomy()});
  document.querySelectorAll('[data-v82diagram]').forEach(b=>b.onclick=()=>{const id=b.dataset.v82diagram,mode=b.dataset.mode||'learn';if(window.IFSI_V83?.openDiagram)window.IFSI_V83.openDiagram(id,mode);else window.IFSI_V83?.show?.()});document.querySelectorAll('[data-v82fav]').forEach(b=>b.onclick=()=>{window.IFSI_V83?.toggleFavorite?.(b.dataset.v82fav);renderAnatomy()})
}
function renderAnatomy(){
  const b=$('v82AnatomyBody');if(!b)return;
  const value=$('v82AnatomySearch')?.value||'',term=normCatalog(value);
  const cards=SYSTEMS.map(x=>catalogCard(x,term)).filter(Boolean);
  b.innerHTML=`<div class="v82-pagehead"><button id="v82Back" class="btn outline">← Accueil</button><div><h2>🫀 Anatomie & Physiologie</h2><div class="small">Des planches anatomiques classées par cours.</div></div><input id="v82AnatomySearch" class="v82-search" type="search" autocomplete="off" placeholder="Rechercher un système, une planche…" value="${E(value)}"></div><div class="v82-catalog">${cards.join('')||'<div class="card v82-empty">Aucune planche trouvée.</div>'}</div>`;
  bindAnatomy();const input=$('v82AnatomySearch');if(input&&value){input.focus();input.setSelectionRange(value.length,value.length)}
}
function hasResume(){const b=$('v76Resume');return !!b&&!b.disabled}
function primaryAction(){if(hasResume())return window.IFSI_V76?.resumeAction?.();return window.IFSI_V76?.startNow?.()}
function hierarchy(){
  const wrap=$('v76Home');if(!wrap)return false;
  wrap.querySelector('.v76-actions')?.classList.add('v82-hidden');
  let p=$('v82Primary');
  if(!p){
    p=document.createElement('section');p.id='v82Primary';p.className='v82-primary';
    const hero=wrap.querySelector('.v76-hero');hero?.insertAdjacentElement('afterend',p)
  }
  const oldResume=$('v76ResumeText')?.textContent?.trim()||'';
  p.innerHTML=`<div class="v82-primary-head"><div><h3>Que veux-tu faire maintenant ?</h3><div class="small">Les fonctions principales d’abord, le reste dans le Centre de révision.</div></div><span class="badge">V${V}</span></div><button id="v82Continue" class="v82-mainbtn"><b>▶ ${hasResume()?'Continuer ma révision':'Commencer ma révision'}</b><span>${hasResume()&&oldResume?E(oldResume):'Session adaptée à tes priorités du jour'}</span></button><div class="v82-navgrid"><button id="v82Courses" class="v82-nav"><span class="ico">📚</span><b>Mes cours</b><small>QCM, fiches, infographies et vocaux</small></button><button id="v82Anat" class="v82-nav anat"><span class="ico">🫀</span><b>Anatomie & Physiologie</b><small>Réviser le corps humain par système</small></button><button id="v82Center" class="v82-nav center"><span class="ico">🚀</span><b>Centre de révision</b><small>Points faibles, examens, recherche et objectifs</small></button></div>`;
  $('v82Continue').onclick=primaryAction;$('v82Courses').onclick=()=>window.showCourses74?.();$('v82Anat').onclick=showAnatomy;$('v82Center').onclick=()=>window.IFSI_V81?.showHub?.();
  const daily=wrap.querySelector('.v76-today');const badge=daily?.querySelector('.badge');if(badge)badge.textContent='Aujourd’hui';
  const quote=wrap.querySelector('.v76-quote'),more=$('v76More'),change=$('v742Changelog');
  if(quote&&more&&quote.nextElementSibling!==more)more.insertAdjacentElement('beforebegin',quote);
  if(change&&more&&change.previousElementSibling!==more)more.insertAdjacentElement('afterend',change);
  return true
}
function links(){
  const p=new URLSearchParams(location.search),cid=p.get('course');
  if(cid&&ALL.some(x=>x.id===cid)){openSystem(cid);return true}
  if(p.get('view')==='anatomie'){showAnatomy();return true}
  return false
}
function init(){
  css();ensureSection();patchShow();const ok=hierarchy();
  return ok&&!!window.IFSI_V81&&!!window.IFSI_V74&&!!window.IFSI_V741?.getRegistry?.()
}
let tries=0,linked=false;const timer=setInterval(()=>{tries++;if(init()){if(!linked)linked=links();clearInterval(timer)}else if(tries>260)clearInterval(timer)},150);
window.addEventListener('ifsi:v741-ready',()=>{hierarchy();if(!linked)linked=links()});
window.addEventListener('storage',()=>{hierarchy();renderAnatomy()});
window.IFSI_V82={version:V,showAnatomy,showSystemBoards,startSystem:startCourse,startMixed:mixed,openSystem};
})();