(()=>{
'use strict';
const VERSION='8.9.1';
let registry=null,lastAudit=null,resourceIndex=new Map(),courseMap=new Map(),aliasCache=new Map(),labelIndex=new Map();
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=()=>courseMap;
const qLabel=q=>q?.course||q?.theme||'';
const infoLabelLocal=t=>typeof window.infoLabel==='function'?window.infoLabel(t):String(t||'').replace(/\.pdf$/i,'').replace(/_/g,' ');

function buildCourseIndexes(){
  courseMap=new Map((registry?.courses||[]).map(c=>[c.id,c]));aliasCache=new Map();labelIndex=new Map();
  for(const c of (registry?.courses||[])){const list=[...new Set([c.label,...(c.aliases||[])].map(norm).filter(Boolean))];aliasCache.set(c.id,list);for(const a of list){if(!labelIndex.has(a))labelIndex.set(a,[]);labelIndex.get(a).push(c)}}
}
function aliases(c){return aliasCache.get(c.id)||[]}
function resolveLabel(label){
  if(!registry)return null;const n=norm(label);if(!n)return null;
  const exact=labelIndex.get(n)||[];
  if(exact.length===1)return {status:'exact',courseId:exact[0].id,course:exact[0]};
  if(exact.length>1)return {status:'ambiguous',courseIds:exact.map(c=>c.id)};
  const contained=[];for(const c of registry.courses){if(aliases(c).some(a=>a.length>=5&&(n.includes(a)||a.includes(n))))contained.push(c)}
  return contained.length===1?{status:'inferred',courseId:contained[0].id,course:contained[0]}:contained.length>1?{status:'ambiguous',courseIds:contained.map(c=>c.id)}:null;
}
function resourceText(x,type){return norm(type==='sheet'?`${x.label||''} ${x.title||''} ${x.ue||''}`:`${infoLabelLocal(x.title||'')} ${x.title||''}`)}
function resolveResource(x,type){
  if(!registry)return {status:'not_ready',courseIds:[]};
  const map=byId();
  if(x?.courseId){return map.has(x.courseId)?{status:'explicit',courseId:x.courseId,courseIds:[x.courseId]}:{status:'invalid_explicit',courseIds:[x.courseId]}}
  const text=resourceText(x,type),scores=[];
  for(const c of registry.courses){let best=0;for(const a of aliases(c)){if(a.length<5)continue;if(text.includes(a))best=Math.max(best,a.length)}if(best)scores.push({id:c.id,score:best})}
  if(!scores.length)return {status:'unmatched',courseIds:[]};
  scores.sort((a,b)=>b.score-a.score);const top=scores[0].score,candidates=scores.filter(x=>x.score===top).map(x=>x.id);
  return candidates.length===1?{status:'inferred',courseId:candidates[0],courseIds:candidates}:{status:'ambiguous',courseIds:candidates};
}
function resolveQuestion(q){
  if(q?.courseId)return byId().has(q.courseId)?{status:'explicit',courseId:q.courseId}:{status:'invalid_explicit',courseIds:[q.courseId]};
  return resolveLabel(qLabel(q))||{status:'unmatched',courseIds:[]};
}
function resolveVocal(v){
  if(v?.courseId)return byId().has(v.courseId)?{status:'explicit',courseId:v.courseId}:{status:'invalid_explicit',courseIds:[v.courseId]};
  return resolveLabel(v?.course)||{status:'unmatched',courseIds:[]};
}
function attachIds(){
  if(!registry)return;
  for(const q of (Array.isArray(Q)?Q:[])){const r=resolveQuestion(q);if(r.courseId&&!q.courseId){q.courseId=r.courseId;q._courseLink='registry'}}
  for(const v of (window.IFSI_V73?.getVocals?.()||[])){const r=resolveVocal(v);if(r.courseId&&!v.courseId){v.courseId=r.courseId;v._courseLink='registry'}}
  for(const x of (Array.isArray(S)?S:[])){const r=resolveResource(x,'sheet');if(r.courseId&&!x.courseId){x.courseId=r.courseId;x._courseLink='registry'}}
  for(const x of (Array.isArray(I)?I:[])){const r=resolveResource(x,'info');if(r.courseId&&!x.courseId){x.courseId=r.courseId;x._courseLink='registry'}}
}
function audit(){
  if(!registry)return null;const qs=Array.isArray(Q)?Q:[],vs=window.IFSI_V73?.getVocals?.()||[],sheets=Array.isArray(S)?S:[],infos=Array.isArray(I)?I:[];
  const report={version:VERSION,registryCourses:registry.courses.length,questions:{total:qs.length,explicit:0,registry:0,unmatched:[],invalid:[]},vocals:{total:vs.length,explicit:0,registry:0,unmatched:[],invalid:[]},sheets:{total:sheets.length,explicit:0,inferred:0,ambiguous:[],unmatched:[],invalid:[]},infographics:{total:infos.length,explicit:0,inferred:0,ambiguous:[],unmatched:[],invalid:[]},byCourse:{}};
  for(const c of registry.courses)report.byCourse[c.id]={label:c.label,qcm:0,vocals:0,sheets:0,infographics:0};
  const count=(bucket,r,item,label,type)=>{if(r.status==='explicit')bucket.explicit++;else if(r.status==='exact'||r.status==='inferred'||r.status==='registry')bucket.registry=(bucket.registry||0)+1;else if(r.status==='invalid_explicit')bucket.invalid.push({label,courseIds:r.courseIds||[]});else if(r.status==='ambiguous')bucket.ambiguous?.push({label,courseIds:r.courseIds||[]});else bucket.unmatched.push({label});if(r.courseId&&report.byCourse[r.courseId])report.byCourse[r.courseId][type]++};
  qs.forEach(q=>count(report.questions,resolveQuestion(q),q,qLabel(q),'qcm'));
  vs.forEach(v=>count(report.vocals,resolveVocal(v),v,`${v.course} — ${v.title}`,'vocals'));
  sheets.forEach(x=>{const r=resolveResource(x,'sheet');if(r.status==='inferred')report.sheets.inferred++;else if(r.status==='explicit')report.sheets.explicit++;else if(r.status==='invalid_explicit')report.sheets.invalid.push({label:x.label||x.title,courseIds:r.courseIds||[]});else if(r.status==='ambiguous')report.sheets.ambiguous.push({label:x.label||x.title,courseIds:r.courseIds||[]});else report.sheets.unmatched.push({label:x.label||x.title});if(r.courseId&&report.byCourse[r.courseId])report.byCourse[r.courseId].sheets++});
  infos.forEach(x=>{const r=resolveResource(x,'info');const label=infoLabelLocal(x.title);if(r.status==='inferred')report.infographics.inferred++;else if(r.status==='explicit')report.infographics.explicit++;else if(r.status==='invalid_explicit')report.infographics.invalid.push({label,courseIds:r.courseIds||[]});else if(r.status==='ambiguous')report.infographics.ambiguous.push({label,courseIds:r.courseIds||[]});else report.infographics.unmatched.push({label});if(r.courseId&&report.byCourse[r.courseId])report.byCourse[r.courseId].infographics++});
  report.errors=report.questions.unmatched.length+report.questions.invalid.length+report.vocals.unmatched.length+report.vocals.invalid.length+report.sheets.invalid.length+report.infographics.invalid.length+report.sheets.ambiguous.length+report.infographics.ambiguous.length;
  report.warnings=report.sheets.unmatched.length+report.infographics.unmatched.length;lastAudit=report;return report;
}
function rebuildResourceIndex(){
  resourceIndex=new Map((registry?.courses||[]).map(c=>[c.id,{questions:[],vocals:[],sheets:[],infographics:[]}]));
  const put=(id,key,item)=>{if(id&&resourceIndex.has(id))resourceIndex.get(id)[key].push(item)};
  for(const q of (Array.isArray(Q)?Q:[]))put(q.courseId,'questions',q);
  for(const v of (window.IFSI_V73?.getVocals?.()||[]))put(v.courseId,'vocals',v);
  for(const x of (Array.isArray(S)?S:[]))put(x.courseId,'sheets',x);
  for(const x of (Array.isArray(I)?I:[]))put(x.courseId,'infographics',x);
}
function resourcesForCourse(courseId){
  const ids=[courseId,...(registry?.courses||[]).filter(c=>c.parentId===courseId).map(c=>c.id)];
  const out={questions:[],vocals:[],sheets:[],infographics:[]};
  for(const id of ids){const r=resourceIndex.get(id);if(!r)continue;out.questions.push(...r.questions);out.vocals.push(...r.vocals);out.sheets.push(...r.sheets);out.infographics.push(...r.infographics)}
  return out
}
function courseIdForLabel(label){return resolveLabel(label)?.courseId||null}
function annotateCourseCards(){document.querySelectorAll('[data-course74]').forEach(el=>{const id=courseIdForLabel(el.dataset.course74);if(id)el.dataset.courseId=id})}
function setVersion(){/* Version globale gérée par app-version-v742.js */}
function lockVersion(){setVersion()}
function diagnosticUI(){
  if(!['1','true'].includes(new URLSearchParams(location.search).get('diag')||'')&&!['1','true'].includes(new URLSearchParams(location.search).get('tnr')||''))return;
  const r=audit();if(!r)return;let box=document.getElementById('v741Diag');if(!box){box=document.createElement('div');box.id='v741Diag';box.className='card';const home=document.getElementById('home');const app=[...(home?.querySelectorAll('.section')||[])].find(x=>x.textContent.trim()==='Application');if(app)app.insertAdjacentElement('beforebegin',box);else home?.appendChild(box)}
  const status=r.errors?'❌ Anomalies':'✅ Rattachements valides';const courseRows=Object.entries(r.byCourse).filter(([,x])=>x.qcm+x.vocals+x.sheets+x.infographics).map(([id,x])=>`<div class="sheet" style="margin:7px 0"><div class="row"><b>${esc(x.label)}</b><code>${esc(id)}</code></div><div class="small">${x.qcm} QCM • ${x.sheets} fiches • ${x.infographics} infographies • ${x.vocals} vocaux</div></div>`).join('');
  const issues=[...r.sheets.ambiguous.map(x=>`Fiche ambiguë : ${x.label}`),...r.infographics.ambiguous.map(x=>`Infographie ambiguë : ${x.label}`),...r.questions.unmatched.map(x=>`QCM sans cours : ${x.label}`),...r.vocals.unmatched.map(x=>`Vocal sans cours : ${x.label}`),...r.sheets.invalid.map(x=>`Fiche courseId invalide : ${x.label}`),...r.infographics.invalid.map(x=>`Infographie courseId invalide : ${x.label}`)];
  box.innerHTML=`<div class="row"><div><b>🧪 Diagnostic V${VERSION}</b><div class="small">${status} • ${r.registryCourses} IDs de cours stables</div></div><span class="badge">${r.errors} erreur${r.errors>1?'s':''}</span></div><div class="small" style="margin-top:8px">Non rattachées (hors registre actuel) : ${r.sheets.unmatched.length} fiches • ${r.infographics.unmatched.length} infographies. Elles sont surveillées par les TNR pour détecter tout nouvel ajout non classé.</div>${issues.length?`<div class="warn" style="margin-top:10px">${issues.slice(0,12).map(esc).join('<br>')}</div>`:''}<details style="margin-top:10px"><summary><b>Voir le détail par cours</b></summary>${courseRows}</details>`;
}
async function boot(){
  try{const res=await fetch('./course-registry-v741.json',{cache:'no-store'});if(!res.ok)throw new Error('registre indisponible');registry=await res.json();buildCourseIndexes();attachIds();rebuildResourceIndex();diagnosticUI();annotateCourseCards();setVersion();const obs=new MutationObserver(()=>annotateCourseCards());const grid=document.getElementById('v74CourseGrid');if(grid)obs.observe(grid,{childList:true,subtree:true});window.dispatchEvent(new CustomEvent('ifsi:v741-ready'));}
  catch(e){console.error('V7.4.1 registre cours',e)}
}
window.IFSI_V741={version:VERSION,getRegistry:()=>registry,audit,resolveLabel,resolveResource,courseIdForLabel,resourcesForCourse,rebuildResourceIndex,getLastAudit:()=>lastAudit};
let tries=0;const timer=setInterval(()=>{tries++;if(Array.isArray(Q)&&Q.length&&Array.isArray(S)&&S.length&&Array.isArray(I)&&I.length&&window.IFSI_V73?.getVocals?.()?.length){clearInterval(timer);boot()}else if(tries>240){clearInterval(timer);boot()}},125);
})();
