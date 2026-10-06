(()=>{'use strict';
const V='8.30.10',$=id=>document.getElementById(id),E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let snapshot=null,last=null;
const did=u=>{const s=String(u||''),m=s.match(/\/d\/([^/?]+)/)||s.match(/[?&]id=([^&]+)/);return m?.[1]||null};
const rawDriveId=v=>/^[A-Za-z0-9_-]{20,}$/.test(String(v||''))?String(v):null;
const atlasItems=()=>[
 ...(window.IFSI_V814?.atlas?.()||[]),
 ...(window.IFSI_V815?.atlas?.()||[]),
 ...(window.IFSI_V816?.atlas?.()||[]),
 ...(window.IFSI_V817?.atlas?.()||[]),
 ...(window.IFSI_V822?.atlas?.()||[]),
 ...(window.IFSI_V823?.atlas?.()||[]),
 ...(window.IFSI_V824?.atlas?.()||[]),
 ...(window.IFSI_V829?.atlas?.()||[])
];
const atlasCourseId=x=>x.courseId||({resp:'systeme_respiratoire',urinary:'systeme_urinaire',endo:'systeme_endocrinien',immu:'systeme_immunitaire',nerv:'systeme_nerveux',cardio:'systeme_cardiovasculaire',digest:'systeme_digestif',loco:'appareil_locomoteur'}[String(x.id||'').split('_')[0]]||'');
const anatomyDriveId=x=>rawDriveId(x.file)||did(x.file)||did(x.src)||did(x.zoomSrc);
function idsForResources(){
 const out=[];
 for(const x of (Array.isArray(S)?S:[])){const id=did(x.url);if(id)out.push({id,type:'fiche',courseId:x.courseId,title:x.displayTitle||x.title})}
 for(const x of (Array.isArray(I)?I:[])){const id=did(x.url);if(id)out.push({id,type:'infographie',courseId:x.courseId,title:x.displayTitle||x.title})}
 for(const x of (window.IFSI_V73?.getVocals?.()||[])){if(x.driveId)out.push({id:x.driveId,type:'vocal',courseId:x.courseId,title:x.title})}
 for(const x of atlasItems()){const id=anatomyDriveId(x);if(id)out.push({id,type:'anatomie',courseId:atlasCourseId(x),title:x.title})}
 return out
}
function duplicates(items){const m=new Map();for(const x of items){if(!m.has(x.id))m.set(x.id,[]);m.get(x.id).push(x)}return [...m.entries()].filter(([,v])=>v.length>1).map(([id,v])=>({id,items:v}))}
function answerBalanceAudit(qs){
 const groups=new Map(),letters='ABCDE';
 for(const q of qs){
  const id=q.courseId||q.course||'sans_course',n=Array.isArray(q.choices)?q.choices.length:0,a=Array.isArray(q.answers)?q.answers.slice().sort((x,y)=>x-y):[];
  if(n<2||n>5||!a.length||a.length>4||a.some(x=>x<0||x>=n))continue;
  if(!groups.has(id))groups.set(id,{id,label:q.course||id,n:0,formats:{}});
  const g=groups.get(id);g.n++;
  if(!g.formats[n])g.formats[n]={nq:0,pos:Array(n).fill(0),byCount:{1:[],2:[],3:[],4:[]}};
  const f=g.formats[n];f.nq++;for(const x of a)f.pos[x]++;f.byCount[a.length].push(a.map(x=>letters[x]).join(''));
 }
 const flagged=[];
 for(const g of groups.values()){
  if(g.n<10)continue;const reasons=[];
  for(const [nKey,f] of Object.entries(g.formats)){
   const n=Number(nKey);
   for(const k of [1,2,3,4]){
    const arr=f.byCount[k];if(arr.length<6||k===n)continue;
    const m={};for(const x of arr)m[x]=(m[x]||0)+1;
    const [combo,count]=Object.entries(m).sort((a,b)=>b[1]-a[1])[0]||['',0],share=count/arr.length,threshold=k===4?.55:.45;
    if(share>=threshold)reasons.push(`${n} choix : ${combo} = ${count}/${arr.length} des questions à ${k} bonne(s) réponse(s)`);
   }
   const tot=f.pos.reduce((a,b)=>a+b,0),mean=tot/n,min=Math.min(...f.pos),max=Math.max(...f.pos);
   if(f.nq>=20&&(min===0||max>mean*1.65))reasons.push(`${n} choix : positions ${letters.slice(0,n).split('').join('-')} déséquilibrées : ${f.pos.join(' / ')}`);
  }
  if(reasons.length)flagged.push({id:g.id,label:g.label,n:g.n,reasons});
 }
 return {courses:groups.size,flagged:flagged.sort((a,b)=>b.n-a.n)};
}
function current(){
 const reg=window.IFSI_V741?.getRegistry?.()?.courses||[];
 const audit=window.IFSI_V741?.audit?.()||null;
 const qs=Array.isArray(Q)?Q:[],s=Array.isArray(S)?S:[],i=Array.isArray(I)?I:[],v=window.IFSI_V73?.getVocals?.()||[],a=atlasItems(),resources=idsForResources();
 const courseIds=new Set(reg.map(x=>x.id));
 const invalid=[];
 for(const [type,list] of [['QCM',qs],['fiche',s],['infographie',i],['vocal',v]])for(const x of list)if(x.courseId&&!courseIds.has(x.courseId))invalid.push(type+' : '+(x.id||x.title||x.courseId));
 for(const x of a){const cid=atlasCourseId(x);if(!cid||!courseIds.has(cid))invalid.push('anatomie : '+(x.id||x.title||'?'))}
 const dup=duplicates(resources);
 const infoIds=new Set(resources.filter(x=>x.type==='infographie').map(x=>x.id)),anatomyIds=new Set(resources.filter(x=>x.type==='anatomie').map(x=>x.id));
 const overlap=[...infoIds].filter(x=>anatomyIds.has(x));
 const qcmNoCourse=qs.filter(x=>!x.courseId).length,atlasByCourse={};
 for(const x of a){const cid=atlasCourseId(x);if(cid)atlasByCourse[cid]=(atlasByCourse[cid]||0)+1}
 const balance=answerBalanceAudit(qs);return {courses:reg.length,qcm:qs.length,sheets:s.length,infographics:i.length,vocals:v.length,atlas:a.length,atlasByCourse,audit,invalid,duplicates:dup,anatomyInfoOverlap:overlap,qcmNoCourse,balance,registry:reg};
}
function evaluate(c){
 const errors=[],warnings=[],infos=[],exp=snapshot?.expectedTotals||{},atlasContracts=snapshot?.atlasBoardContracts||{};
 const floor=(key,val,label)=>{if(Number.isFinite(exp[key])&&val<exp[key])errors.push(`${label} : ${val} / ${exp[key]} minimum de référence`)};
 floor('courses',c.courses,'Cours');floor('sheets',c.sheets,'Fiches');floor('infographics',c.infographics,'Infographies');floor('vocals',c.vocals,'Vocaux');
 let atlasExpected=0,atlasOk=true;for(const [courseId,expected] of Object.entries(atlasContracts)){const actual=c.atlasByCourse[courseId]||0;atlasExpected+=expected;if(actual!==expected){atlasOk=false;const label=c.registry.find(x=>x.id===courseId)?.label||courseId;errors.push(`Atlas ${label} : ${actual} / ${expected} planches attendues`)}}
 const extraAtlas=Object.entries(c.atlasByCourse).filter(([id])=>!Object.hasOwn(atlasContracts,id));if(extraAtlas.length)warnings.push(`${extraAtlas.length} atlas hors contrat de référence : ${extraAtlas.map(([id,n])=>id+' ('+n+')').join(', ')}`);
 if(Object.keys(atlasContracts).length){if(c.atlas!==atlasExpected){atlasOk=false;errors.push(`Total planches HD : ${c.atlas} / ${atlasExpected} selon les contrats atlas`)}if(Number.isFinite(exp.hdAtlasBoards)&&atlasExpected!==exp.hdAtlasBoards)errors.push(`Snapshot incohérent : contrats atlas = ${atlasExpected}, total déclaré = ${exp.hdAtlasBoards}`);if(atlasOk)infos.push(`${Object.keys(atlasContracts).length} atlas complets • ${c.atlas}/${atlasExpected} planches HD`)}
 if(Number.isFinite(exp.qcmRuntimeMin)&&c.qcm<exp.qcmRuntimeMin)errors.push(`QCM : ${c.qcm} / ${exp.qcmRuntimeMin} minimum`);
 if(c.audit?.errors)errors.push(`${c.audit.errors} erreur(s) de rattachement courseId`);
 if(c.invalid.length)errors.push(`${c.invalid.length} ressource(s) avec courseId invalide`);
 if(c.duplicates.length)errors.push(`${c.duplicates.length} Drive ID dupliqué(s) entre catalogues actifs`);else infos.push('Aucun Drive ID dupliqué entre les catalogues actifs');
 if(c.anatomyInfoOverlap.length)errors.push(`${c.anatomyInfoOverlap.length} fichier(s) partagé(s) entre Infographies et Anatomie`);else infos.push('Infographies et Anatomie utilisent des ressources distinctes');
 if(c.qcmNoCourse)warnings.push(`${c.qcmNoCourse} QCM sans courseId explicite après chargement`);
 if(c.audit?.warnings)warnings.push(`${c.audit.warnings} ressource(s) non rattachée(s) signalée(s) par le registre`);if(c.balance?.flagged?.length)warnings.push(`${c.balance.flagged.length} cours présentent encore un biais de position des bonnes réponses`);
 infos.push('Contrôle local : aucun scan Google Drive en temps réel');return {ok:!errors.length,errors,warnings,infos};
}
async function loadSnapshot(){if(snapshot)return snapshot;try{const r=await fetch('./resource-audit-v821.json',{cache:'no-store'});if(!r.ok)throw new Error('snapshot indisponible');snapshot=await r.json()}catch(e){snapshot={version:V,auditedAt:'inconnu',expectedTotals:{},atlasBoardContracts:{}}}return snapshot}
function byCourseRows(c){
 const rows=Object.entries(c.audit?.byCourse||{}).filter(([,x])=>x.qcm+x.sheets+x.infographics+x.vocals).sort((a,b)=>a[1].label.localeCompare(b[1].label,'fr'));
 return rows.map(([id,x])=>{const atlas=c.atlasByCourse[id]||0;return `<div class="v821-row"><div><b>${E(x.label)}</b><small>${E(id)}</small></div><span>${x.qcm} QCM • ${x.sheets} fiche${x.sheets>1?'s':''} • ${x.infographics} info • ${x.vocals} vocal${x.vocals>1?'aux':''}${atlas?' • '+atlas+' planche'+(atlas>1?'s':''):''}</span></div>`}).join('');
}
function renderBalance(c){const box=$('v821Balance');if(!box)return;const f=c.balance?.flagged||[];if(!f.length){box.innerHTML='<div class="small">✅ Aucun biais fort détecté avec les seuils statistiques actuels.</div>';return}box.innerHTML=f.map(x=>`<div class="v821-row"><div><b>${E(x.label)}</b><small>${x.n} questions analysées</small></div><span>${x.reasons.map(E).join('<br>')}</span></div>`).join('')}
function render(){
 const box=$('v821AuditCard');if(!box)return;
 if(!last){box.querySelector('#v821Status').innerHTML='<span class="v821-dot wait"></span>Audit prêt';return}
 const {c,e}=last,stamp=snapshot?.auditedAt||'—',state=e.ok?'✅ Catalogue cohérent':'❌ Anomalies détectées';
 box.querySelector('#v821Status').innerHTML=`<span class="v821-dot ${e.ok?'ok':'bad'}"></span><b>${state}</b>`;
 box.querySelector('#v821Meta').textContent=`Référence Drive validée : ${stamp} • contrôle local : ${new Date().toLocaleString('fr-FR')}`;
 box.querySelector('#v821Counts').innerHTML=`
  <span><b>${c.courses}</b><small>cours</small></span><span><b>${c.qcm}</b><small>QCM</small></span><span><b>${c.sheets}</b><small>fiches</small></span><span><b>${c.infographics}</b><small>infographies</small></span><span><b>${c.vocals}</b><small>vocaux</small></span><span><b>${c.atlas}</b><small>planches HD</small></span>`;
 const msgs=[...e.errors.map(x=>'❌ '+x),...e.warnings.map(x=>'⚠️ '+x),...e.infos.map(x=>'✅ '+x)];
 box.querySelector('#v821Issues').innerHTML=msgs.map(x=>`<div>${E(x)}</div>`).join('');
 box.querySelector('#v821Courses').innerHTML=byCourseRows(c);renderBalance(c);
}
async function runAudit(){await loadSnapshot();const c=current(),e=evaluate(c);last={c,e,at:new Date().toISOString()};render();return last}
function css(){if($('v821css'))return;const s=document.createElement('style');s.id='v821css';s.textContent=`
#v821AuditCard{grid-column:1/-1}.v821-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.v821-status{display:flex;align-items:center;gap:7px;font-size:13px}.v821-dot{width:10px;height:10px;border-radius:50%;background:#aaa;display:inline-block}.v821-dot.ok{background:#26a269}.v821-dot.bad{background:#d53b3b}.v821-dot.wait{background:#d09b24}
.v821-counts{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin:10px 0}.v821-counts span{border:1px solid var(--line);border-radius:12px;padding:8px;text-align:center}.v821-counts b{display:block;font-size:17px}.v821-counts small{font-size:9px;color:var(--muted)}
.v821-issues{font-size:11px;line-height:1.6;padding:9px 10px;border-radius:12px;background:color-mix(in srgb,var(--card) 90%,#6bd1d7 10%)}.v821-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:7px 0;border-top:1px solid var(--line);font-size:11px}.v821-row:first-child{border-top:0}.v821-row b,.v821-row small{display:block}.v821-row small{color:var(--muted);font-size:9px}.v821-row>span{text-align:right;color:var(--muted)}
@media(max-width:680px){.v821-counts{grid-template-columns:repeat(3,1fr)}.v821-row{grid-template-columns:1fr}.v821-row>span{text-align:left}}
`;document.head.appendChild(s)}
function inject(){const grid=document.querySelector('#settings87 .v87-grid');if(!grid||$('v821AuditCard'))return false;const d=document.createElement('div');d.id='v821AuditCard';d.className='v87-card';d.innerHTML=`
<div class="v821-top"><div><h3 style="margin:0 0 4px">🔎 Audit catalogue ↔ référence Drive</h3><p style="margin:0;color:var(--muted);font-size:12px">Contrôle structurel local contre la dernière référence Drive validée. Ce n’est pas un scan Drive en direct.</p></div><button id="v821Run" class="btn outline">Auditer</button></div>
<div id="v821Status" class="v821-status" style="margin-top:10px"></div><div id="v821Meta" class="small" style="margin-top:4px"></div>
<div id="v821Counts" class="v821-counts"></div><div id="v821Issues" class="v821-issues">L’audit vérifie les courseId, les doublons Drive, les contrats des 8 atlas et la séparation Infographies / Anatomie.</div>
<details style="margin-top:10px"><summary><b>Équilibre des réponses QCM</b></summary><div id="v821Balance" style="margin-top:7px"></div></details><details style="margin-top:10px"><summary><b>Détail par cours</b></summary><div id="v821Courses" style="margin-top:7px"></div></details>`;
 grid.appendChild(d);$('v821Run').onclick=async()=>{const b=$('v821Run');b.disabled=true;b.textContent='Audit…';await runAudit();b.textContent='Relancer';b.disabled=false};render();setTimeout(runAudit,150);return true}
function init(){css();return inject()}
let tries=0;const t=setInterval(()=>{tries++;if(init()||tries>240)clearInterval(t)},100);
window.addEventListener('ifsi:v741-ready',()=>setTimeout(runAudit,250));
window.IFSI_V821={version:V,runAudit,getLast:()=>last,getSnapshot:()=>snapshot};
})();