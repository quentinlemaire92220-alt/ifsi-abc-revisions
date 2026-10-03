(()=>{
'use strict';
const VERSION='7.1';
const esc71=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

function addStyles(){
  if(document.getElementById('v71css'))return;
  const s=document.createElement('style');s.id='v71css';s.textContent=`
  .v71-search{display:grid;gap:9px}.v71-search input{font-size:16px}.v71-results{display:grid;gap:7px;max-height:420px;overflow:auto}
  .v71-result{display:block;width:100%;border:1px solid #e6e0ef;border-radius:13px;padding:10px 11px;background:#fff;color:#242332;text-align:left;text-decoration:none;cursor:pointer}
  .v71-result:hover{border-color:#bbaae8;background:#fbf9ff}.v71-result .kind{display:inline-block;font-size:10px;font-weight:900;border-radius:999px;padding:3px 7px;margin-right:6px;background:#eee8fb;color:#6941c6}.v71-result .sub{font-size:12px;color:#6c6878;margin-top:4px}
  .v71-report{border:1px solid #ead7a6;background:#fffaf0;color:#745600;border-radius:999px;padding:7px 10px;font-weight:800;cursor:pointer;white-space:nowrap}
  .v71-modal{position:fixed;inset:0;z-index:10050;background:#12101ce8;display:flex;align-items:center;justify-content:center;padding:16px}.v71-modal.hidden{display:none!important}.v71-dialog{width:min(96vw,520px);background:#fff;border-radius:20px;padding:17px;box-shadow:0 20px 70px #0008}.v71-dialog h3{margin:0 0 8px}.v71-dialog select,.v71-dialog textarea{width:100%;border:1px solid #e6e0ef;border-radius:13px;padding:11px;background:#fff;font:inherit}.v71-dialog textarea{min-height:95px;resize:vertical}.v71-dialog .actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap}
  .v71-backup{border:1px solid #cfc2ee;background:#faf8ff}.v71-backup-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.v71-backup .small{line-height:1.4}
  @media(max-width:520px){.v71-backup-actions{grid-template-columns:1fr}.v71-report{font-size:11px;padding:6px 8px}}
  `;document.head.appendChild(s);
}

function injectSearch(){
  const home=document.getElementById('home');if(!home||document.getElementById('v71SearchCard'))return;
  const card=document.createElement('div');card.id='v71SearchCard';card.className='card v71-search';
  card.innerHTML='<div><b>🔎 Recherche globale</b><div class="small">Recherche dans les QCM, fiches et infographies.</div></div><input id="v71Search" type="text" autocomplete="off" placeholder="Ex. ADH, PCR, méiose, pneumocyte…"><div id="v71SearchResults" class="v71-results"></div>';
  const createTitle=[...home.querySelectorAll('.section')].find(e=>e.textContent.includes('Créer une série'));
  if(createTitle)home.insertBefore(card,createTitle);else home.appendChild(card);
  document.getElementById('v71Search').addEventListener('input',renderSearch);
}

function searchableQ(q){return [q.question,q.explanation,q.course,q.theme,q.ue,q.id].join(' ')}
function searchableDoc(x){return [x.title,x.label,x.ue].join(' ')}
function renderSearch(){
  const input=document.getElementById('v71Search'),box=document.getElementById('v71SearchResults');if(!input||!box)return;
  const raw=input.value.trim(),term=norm(raw);if(term.length<2){box.innerHTML=raw?'<div class="small">Tape au moins 2 caractères.</div>':'';return}
  const qr=(Array.isArray(Q)?Q:[]).filter(q=>norm(searchableQ(q)).includes(term)).slice(0,12).map(q=>({type:'QCM',title:q.question,sub:`${q.course||q.theme||''}${q.number?' • Q'+q.number:''}`,id:q.id}));
  const sr=(Array.isArray(S)?S:[]).filter(x=>norm(searchableDoc(x)).includes(term)).slice(0,8).map(x=>({type:'Fiche',title:x.label||x.title,sub:x.ue||'',url:x.url}));
  const ir=(Array.isArray(I)?I:[]).filter(x=>norm(searchableDoc(x)).includes(term)).slice(0,8).map(x=>({type:'Infographie',title:x.label||x.title,sub:x.ue||'',url:x.url}));
  const all=[...qr,...sr,...ir].slice(0,25);if(!all.length){box.innerHTML='<div class="small">Aucun résultat.</div>';return}
  box.innerHTML=all.map(r=>r.type==='QCM'?`<button class="v71-result" data-qid="${esc71(r.id)}"><span class="kind">QCM</span>${esc71(r.title)}<div class="sub">${esc71(r.sub)}</div></button>`:`<a class="v71-result" href="${esc71(r.url)}" target="_blank" rel="noopener"><span class="kind">${esc71(r.type)}</span>${esc71(r.title)}<div class="sub">${esc71(r.sub)}</div></a>`).join('');
  box.querySelectorAll('[data-qid]').forEach(b=>b.onclick=()=>{const q=Q.find(x=>x.id===b.dataset.qid);if(q)begin([q])});
}

function enhanceCourseOptions(){
  const sel=document.getElementById('course');if(!sel||!Array.isArray(Q)||!Q.length)return;
  const current=sel.value;
  [...sel.options].forEach(opt=>{
    const course=opt.dataset.course||opt.value;opt.dataset.course=course;opt.value=course;
    const count=Q.filter(q=>(q.course||q.theme)===course).length;opt.textContent=`${course} (${count})`;
  });
  if([...sel.options].some(o=>o.value===current))sel.value=current;
}

function injectReport(){
  const quiz=document.getElementById('quiz');const top=quiz?.querySelector('.card > .row');if(!top||document.getElementById('v71ReportBtn'))return;
  const b=document.createElement('button');b.id='v71ReportBtn';b.type='button';b.className='v71-report';b.textContent='🚩 Signaler';b.onclick=openReport;top.appendChild(b);
  const m=document.createElement('div');m.id='v71ReportModal';m.className='v71-modal hidden';
  m.innerHTML='<div class="v71-dialog"><h3>🚩 Signaler cette question</h3><div id="v71ReportContext" class="small" style="margin-bottom:10px"></div><select id="v71ReportType"><option>Réponse / correction</option><option>Énoncé ou faute</option><option>Schéma / image</option><option>Question ambiguë</option><option>Autre</option></select><textarea id="v71ReportNote" placeholder="Précision facultative…"></textarea><div class="small" style="margin-top:8px">Aucune donnée n’est envoyée automatiquement. Ton téléphone ouvrira le menu de partage ; sinon le message sera copié.</div><div class="actions"><button class="btn outline" id="v71ReportCancel">Annuler</button><button class="btn primary" id="v71ReportShare">Partager le signalement</button></div></div>';
  document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)m.classList.add('hidden')});document.getElementById('v71ReportCancel').onclick=()=>m.classList.add('hidden');document.getElementById('v71ReportShare').onclick=shareReport;
}
function currentQ71(){try{return session?.[i]||null}catch{return null}}
function openReport(){
  const q=currentQ71();if(!q)return;const m=document.getElementById('v71ReportModal');const c=document.getElementById('v71ReportContext');if(c)c.textContent=`${q.course||q.theme||''} • ${q.number?'Q'+q.number:q.id}`;document.getElementById('v71ReportNote').value='';m?.classList.remove('hidden');
}
async function shareReport(){
  const q=currentQ71();if(!q)return;const type=document.getElementById('v71ReportType').value,note=document.getElementById('v71ReportNote').value.trim();
  const text=`🚩 Signalement IFSI ABC\nCours : ${q.course||q.theme||''}\nQuestion : ${q.number?'Q'+q.number:'—'}\nID : ${q.id}\nType : ${type}\nÉnoncé : ${q.question}${note?'\nPrécision : '+note:''}\nAppli : ${location.origin+location.pathname}`;
  try{
    if(navigator.share){await navigator.share({title:'Signalement IFSI ABC',text});document.getElementById('v71ReportModal')?.classList.add('hidden');return}
    await navigator.clipboard.writeText(text);alert('Signalement copié. Tu peux maintenant le coller dans WhatsApp ou un message.');document.getElementById('v71ReportModal')?.classList.add('hidden');
  }catch(e){if(e?.name!=='AbortError'){try{await navigator.clipboard.writeText(text);alert('Signalement copié dans le presse-papiers.')}catch{prompt('Copie ce signalement :',text)}}}
}

function injectBackup(){
  const sec=document.getElementById('progress');if(!sec||document.getElementById('v71Backup'))return;
  const card=sec.querySelector('.card');if(!card)return;const oldExport=[...card.querySelectorAll('button')].find(b=>b.textContent.includes('Exporter mes résultats'));
  const box=document.createElement('div');box.id='v71Backup';box.className='v71-backup';box.style.cssText='border-radius:14px;padding:12px;margin-top:14px';
  box.innerHTML='<b>💾 Transférer ma progression</b><div class="small" style="margin-top:5px">La synchronisation téléphone ↔ PC n’est pas automatique. Exporte une sauvegarde sur le premier appareil, puis importe ce fichier sur l’autre.</div><div class="v71-backup-actions"><button class="btn secondary" id="v71Export">⬇ Exporter la sauvegarde</button><button class="btn outline" id="v71Import">⬆ Importer une sauvegarde</button></div><input id="v71ImportFile" type="file" accept="application/json,.json" class="hidden">';
  if(oldExport)oldExport.insertAdjacentElement('beforebegin',box);else card.appendChild(box);
  document.getElementById('v71Export').onclick=exportBackup;document.getElementById('v71Import').onclick=()=>document.getElementById('v71ImportFile').click();document.getElementById('v71ImportFile').onchange=importBackup;
}
function exportBackup(){
  const values={};for(let j=0;j<localStorage.length;j++){const k=localStorage.key(j);if(k?.startsWith('ifsiabc_'))values[k]=localStorage.getItem(k)}
  const payload={app:'IFSI ABC Révisions',format:'ifsiabc-local-backup',version:1,exportedAt:new Date().toISOString(),values};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`IFSI_ABC_progression_${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
}
async function importBackup(e){
  const file=e.target.files?.[0];e.target.value='';if(!file)return;
  try{const p=JSON.parse(await file.text());if(p?.format!=='ifsiabc-local-backup'||!p.values||typeof p.values!=='object')throw new Error('format');
    if(!confirm('Importer cette sauvegarde remplacera la progression locale actuelle de cet appareil. Continuer ?'))return;
    const remove=[];for(let j=0;j<localStorage.length;j++){const k=localStorage.key(j);if(k?.startsWith('ifsiabc_'))remove.push(k)}remove.forEach(k=>localStorage.removeItem(k));
    for(const [k,v] of Object.entries(p.values))if(k.startsWith('ifsiabc_')&&typeof v==='string')localStorage.setItem(k,v);
    alert('Sauvegarde importée. L’application va se recharger.');location.reload();
  }catch{alert('Ce fichier ne semble pas être une sauvegarde IFSI ABC valide.')}
}

function setVersion(){
  const u=document.getElementById('update');if(u&&Array.isArray(Q)&&Q.length)u.textContent='Application prête • V7.1 locale : recherche, compteurs, signalement et transfert manuel.';
  const b=u?.parentElement?.querySelector('b');if(b)b.textContent='V7.1 local';
}

let fillPatched=false;
function patchFill(){if(fillPatched)return;try{const prev=fill;fill=function(){prev();setTimeout(enhanceCourseOptions,0)};fillPatched=true}catch{}}
function ready(){addStyles();injectSearch();injectReport();injectBackup();patchFill();enhanceCourseOptions();setVersion();return Array.isArray(Q)&&Q.length>0}
addStyles();injectSearch();injectReport();injectBackup();patchFill();
let tries=0;const t=setInterval(()=>{tries++;if(ready()||tries>120)clearInterval(t)},125);
window.addEventListener('storage',()=>{enhanceCourseOptions();setVersion()});
})();