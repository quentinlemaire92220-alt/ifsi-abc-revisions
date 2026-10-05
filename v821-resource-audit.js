(()=>{'use strict';
const V='8.26',$=id=>document.getElementById(id),E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let snapshot=null,last=null;
const did=u=>{const m=String(u||'').match(/\/d\/([^/]+)/);return m?.[1]||null};
const atlasItems=()=>[
 ...(window.IFSI_V814?.atlas?.()||[]),
 ...(window.IFSI_V815?.atlas?.()||[]),
 ...(window.IFSI_V816?.atlas?.()||[]),
 ...(window.IFSI_V817?.atlas?.()||[]),
 ...(window.IFSI_V822?.atlas?.()||[]),
 ...(window.IFSI_V823?.atlas?.()||[]),
 ...(window.IFSI_V824?.atlas?.()||[])
];
function idsForResources(){
 const out=[];
 for(const x of (Array.isArray(S)?S:[])){const id=did(x.url);if(id)out.push({id,type:'fiche',courseId:x.courseId,title:x.displayTitle||x.title})}
 for(const x of (Array.isArray(I)?I:[])){const id=did(x.url);if(id)out.push({id,type:'infographie',courseId:x.courseId,title:x.displayTitle||x.title})}
 for(const x of (window.IFSI_V73?.getVocals?.()||[])){if(x.driveId)out.push({id:x.driveId,type:'vocal',courseId:x.courseId,title:x.title})}
 for(const x of atlasItems()){if(x.file)out.push({id:x.file,type:'anatomie',courseId:x.courseId||({resp:'systeme_respiratoire',urinary:'systeme_urinaire',endocrine:'systeme_endocrinien',immu:'systeme_immunitaire',nerv:'systeme_nerveux',cardio:'systeme_cardiovasculaire',digest:'systeme_digestif'}[String(x.id||'').split('_')[0]]||''),title:x.title})}
 return out
}
function duplicates(items){const m=new Map();for(const x of items){if(!m.has(x.id))m.set(x.id,[]);m.get(x.id).push(x)}return [...m.entries()].filter(([,v])=>v.length>1).map(([id,v])=>({id,items:v}))}
function current(){
 const reg=window.IFSI_V741?.getRegistry?.()?.courses||[];
 const audit=window.IFSI_V741?.audit?.()||null;
 const qs=Array.isArray(Q)?Q:[],s=Array.isArray(S)?S:[],i=Array.isArray(I)?I:[],v=window.IFSI_V73?.getVocals?.()||[],a=atlasItems(),resources=idsForResources();
 const courseIds=new Set(reg.map(x=>x.id));
 const invalid=[];
 for(const [type,list] of [['QCM',qs],['fiche',s],['infographie',i],['vocal',v]])for(const x of list)if(x.courseId&&!courseIds.has(x.courseId))invalid.push(type+' : '+(x.id||x.title||x.courseId));
 const dup=duplicates(resources);
 const infoIds=new Set(resources.filter(x=>x.type==='infographie').map(x=>x.id)),anatomyIds=new Set(resources.filter(x=>x.type==='anatomie').map(x=>x.id));
 const overlap=[...infoIds].filter(x=>anatomyIds.has(x));
 const qcmNoCourse=qs.filter(x=>!x.courseId).length;
 return {courses:reg.length,qcm:qs.length,sheets:s.length,infographics:i.length,vocals:v.length,atlas:a.length,audit,invalid,duplicates:dup,anatomyInfoOverlap:overlap,qcmNoCourse};
}
function evaluate(c){
 const errors=[],warnings=[],exp=snapshot?.expectedTotals||{};
 const floor=(key,val,label)=>{if(Number.isFinite(exp[key])&&val<exp[key])errors.push(`${label} : ${val} / ${exp[key]} attendus minimum`)};
 floor('courses',c.courses,'Cours');floor('sheets',c.sheets,'Fiches');floor('infographics',c.infographics,'Infographies');floor('vocals',c.vocals,'Vocaux');floor('hdAtlasBoards',c.atlas,'Planches HD');
 if(Number.isFinite(exp.qcmRuntimeMin)&&c.qcm<exp.qcmRuntimeMin)errors.push(`QCM : ${c.qcm} / ${exp.qcmRuntimeMin} minimum`);
 if(c.audit?.errors)errors.push(`${c.audit.errors} erreur(s) de rattachement courseId`);
 if(c.invalid.length)errors.push(`${c.invalid.length} ressource(s) avec courseId invalide`);
 if(c.duplicates.length)errors.push(`${c.duplicates.length} Drive ID dupliqué(s) entre catalogues actifs`);
 if(c.anatomyInfoOverlap.length)errors.push(`${c.anatomyInfoOverlap.length} fichier(s) partagé(s) entre Infographies et Anatomie`);
 if(c.qcmNoCourse)warnings.push(`${c.qcmNoCourse} QCM sans courseId explicite après chargement`);
 if(c.audit?.warnings)warnings.push(`${c.audit.warnings} ressource(s) non rattachée(s) signalée(s) par le registre`);
 return {ok:!errors.length,errors,warnings};
}
async function loadSnapshot(){if(snapshot)return snapshot;try{const r=await fetch('./resource-audit-v821.json',{cache:'no-store'});if(!r.ok)throw new Error('snapshot indisponible');snapshot=await r.json()}catch(e){snapshot={version:V,auditedAt:'inconnu',expectedTotals:{}}}return snapshot}
function byCourseRows(c){
 const rows=Object.entries(c.audit?.byCourse||{}).filter(([,x])=>x.qcm+x.sheets+x.infographics+x.vocals).sort((a,b)=>a[1].label.localeCompare(b[1].label,'fr'));
 return rows.map(([id,x])=>`<div class="v821-row"><div><b>${E(x.label)}</b><small>${E(id)}</small></div><span>${x.qcm} QCM • ${x.sheets} fiche${x.sheets>1?'s':''} • ${x.infographics} info • ${x.vocals} vocal${x.vocals>1?'aux':''}</span></div>`).join('');
}
function render(){
 const box=$('v821AuditCard');if(!box)return;
 if(!last){box.querySelector('#v821Status').innerHTML='<span class="v821-dot wait"></span>Audit prêt';return}
 const {c,e}=last,stamp=snapshot?.auditedAt||'—',state=e.ok?'✅ Catalogue cohérent':'❌ Anomalies détectées';
 box.querySelector('#v821Status').innerHTML=`<span class="v821-dot ${e.ok?'ok':'bad'}"></span><b>${state}</b>`;
 box.querySelector('#v821Meta').textContent=`Inventaire Drive validé : ${stamp} • contrôle local : ${new Date().toLocaleString('fr-FR')}`;
 box.querySelector('#v821Counts').innerHTML=`
  <span><b>${c.courses}</b><small>cours</small></span><span><b>${c.qcm}</b><small>QCM</small></span><span><b>${c.sheets}</b><small>fiches</small></span><span><b>${c.infographics}</b><small>infographies</small></span><span><b>${c.vocals}</b><small>vocaux</small></span><span><b>${c.atlas}</b><small>planches HD</small></span>`;
 const msgs=[...e.errors.map(x=>'❌ '+x),...e.warnings.map(x=>'⚠️ '+x)];
 box.querySelector('#v821Issues').innerHTML=msgs.length?msgs.map(x=>`<div>${E(x)}</div>`).join(''):'<div>✅ Catalogue local conforme au dernier inventaire Drive validé.</div><div>✅ Aucun Drive ID dupliqué.</div><div>✅ Infographies et planches anatomiques restent dissociées.</div><div>ℹ️ Ce contrôle ne scanne pas Google Drive en temps réel.</div>';
 box.querySelector('#v821Courses').innerHTML=byCourseRows(c);
}
async function runAudit(){await loadSnapshot();const c=current(),e=evaluate(c);last={c,e,at:new Date().toISOString()};render();return last}
function css(){if($('v821css'))return;const s=document.createElement('style');s.id='v821css';s.textContent=`
#v821AuditCard{grid-column:1/-1}.v821-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.v821-status{display:flex;align-items:center;gap:7px;font-size:13px}.v821-dot{width:10px;height:10px;border-radius:50%;background:#aaa;display:inline-block}.v821-dot.ok{background:#26a269}.v821-dot.bad{background:#d53b3b}.v821-dot.wait{background:#d09b24}
.v821-counts{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin:10px 0}.v821-counts span{border:1px solid var(--line);border-radius:12px;padding:8px;text-align:center}.v821-counts b{display:block;font-size:17px}.v821-counts small{font-size:9px;color:var(--muted)}
.v821-issues{font-size:11px;line-height:1.6;padding:9px 10px;border-radius:12px;background:color-mix(in srgb,var(--card) 90%,#6bd1d7 10%)}.v821-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:7px 0;border-top:1px solid var(--line);font-size:11px}.v821-row:first-child{border-top:0}.v821-row b,.v821-row small{display:block}.v821-row small{color:var(--muted);font-size:9px}.v821-row>span{text-align:right;color:var(--muted)}
@media(max-width:680px){.v821-counts{grid-template-columns:repeat(3,1fr)}.v821-row{grid-template-columns:1fr}.v821-row>span{text-align:left}}
`;document.head.appendChild(s)}
function inject(){const grid=document.querySelector('#settings87 .v87-grid');if(!grid||$('v821AuditCard'))return false;const d=document.createElement('div');d.id='v821AuditCard';d.className='v87-card';d.innerHTML=`
<div class="v821-top"><div><h3 style="margin:0 0 4px">🔎 Audit catalogue ↔ inventaire Drive</h3><p style="margin:0;color:var(--muted);font-size:12px">Contrôle local contre le dernier inventaire Drive validé (pas un scan Drive en direct).</p></div><button id="v821Run" class="btn outline">Auditer</button></div>
<div id="v821Status" class="v821-status" style="margin-top:10px"></div><div id="v821Meta" class="small" style="margin-top:4px"></div>
<div id="v821Counts" class="v821-counts"></div><div id="v821Issues" class="v821-issues">L’audit vérifie les courseId, les doublons Drive, les catalogues et la séparation Infographies / Anatomie.</div>
<details style="margin-top:10px"><summary><b>Détail par cours</b></summary><div id="v821Courses" style="margin-top:7px"></div></details>`;
 grid.appendChild(d);$('v821Run').onclick=async()=>{const b=$('v821Run');b.disabled=true;b.textContent='Audit…';await runAudit();b.textContent='Relancer';b.disabled=false};render();setTimeout(runAudit,150);return true}
function init(){css();return inject()}
let tries=0;const t=setInterval(()=>{tries++;if(init()||tries>240)clearInterval(t)},100);
window.addEventListener('ifsi:v741-ready',()=>setTimeout(runAudit,250));
window.IFSI_V821={version:V,runAudit,getLast:()=>last,getSnapshot:()=>snapshot};
})();