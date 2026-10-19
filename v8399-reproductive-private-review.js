(()=>{
'use strict';
// Prévisualisation PRIVÉE des six maquettes R02–R07 : aucun PDF ni URL envoyé sur un serveur.
const DB_NAME='ifsiabc-private-reproductive-preview-v1';
const DB_STORE='documents';
const DB_KEY='atlas-r02-r07';
const MAX_BYTES=40*1024*1024;
const PAGES=[
 ['R02','Testicule et tubes séminifères'],
 ['R03','Voies spermatiques'],
 ['R04','Appareil reproducteur féminin'],
 ['R05','Ovaire et trompe'],
 ['R06','Utérus et col'],
 ['R07','Vulve et périnée']
];
let activeUrl=null,activeBlob=null,activePage=1;
function $(id){return document.getElementById(id)}
function openDb(){
 return new Promise((resolve,reject)=>{
  if(!window.indexedDB)return reject(new Error('Stockage local non pris en charge'));
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE)};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('Impossible d’ouvrir le stockage local'));
 });
}
async function store(operation,value){
 const db=await openDb();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(DB_STORE,operation==='read'?'readonly':'readwrite');
  const s=tx.objectStore(DB_STORE);
  const req=operation==='read'?s.get(DB_KEY):operation==='write'?s.put(value,DB_KEY):s.delete(DB_KEY);
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error('Échec du stockage'));
  tx.oncomplete=()=>db.close();
  tx.onabort=()=>db.close();
 });
}
function closeUrl(){if(activeUrl){URL.revokeObjectURL(activeUrl);activeUrl=null}}
function displayPdf(blob){
 closeUrl();activeBlob=blob||null;
 if(activeBlob)activeUrl=URL.createObjectURL(activeBlob);
 renderPanel();
}
function setStatus(message){const el=$('v8399Status');if(el)el.textContent=message}
function renderPanel(){
 const root=$('v8399ReproPrivate');if(!root)return;
 const viewer=$('v8399Viewer'), actions=$('v8399Actions'), status=$('v8399Status');
 if(!viewer||!actions||!status)return;
 actions.hidden=!activeBlob;
 if(!activeBlob){
  viewer.hidden=true;viewer.replaceChildren();
  status.textContent='Aucun PDF enregistré sur cet appareil. Charge ton export Canva de six pages pour l’examiner ici.';
  return;
 }
 viewer.hidden=false;
 viewer.replaceChildren();
 const heading=document.createElement('b');heading.textContent=PAGES[activePage-1][0]+' — '+PAGES[activePage-1][1];
 const hint=document.createElement('div');hint.className='small';hint.textContent='Page '+activePage+'/6 du PDF local • consultation provisoire, pas un support officiel';
 const frame=document.createElement('iframe');
 frame.className='v8399Pdf';frame.title='Maquette anatomique '+PAGES[activePage-1][0]+' en revue privée';
 frame.loading='lazy';frame.referrerPolicy='no-referrer';
 frame.src=activeUrl+'#page='+activePage+'&view=FitH&toolbar=0';
 viewer.append(heading,hint,frame);
 root.querySelectorAll('[data-v8399-page]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.v8399Page===String(activePage)?'true':'false')});
 status.textContent='PDF présent seulement sur cet appareil. Les six planches restent non validées et exclues des QCM.';
 const open=$('v8399Open');if(open){open.href=activeUrl+'#page='+activePage;open.target='_blank';open.rel='noopener noreferrer'}
}
async function validatePdf(file){
 if(!file||file.size<100||file.size>MAX_BYTES)throw Error('PDF vide ou trop volumineux (maximum 40 Mo)');
 if(file.type && file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name))throw Error('Format attendu : PDF');
 const header=new TextDecoder().decode(await file.slice(0,5).arrayBuffer());
 if(header!=='%PDF-')throw Error('Le fichier sélectionné n’est pas un PDF valide');
}
function mount(){
 const section=document.querySelector('.v82-system[data-v82system="systeme_reproducteur"] .v82-board-list');
 if(!section||$('v8399ReproPrivate'))return;
 if(!$('v8399Style')){
  const style=document.createElement('style');style.id='v8399Style';
  style.textContent='.v8399-private{border:1px solid var(--line,#cfd3d9);background:var(--card,#fff);border-radius:14px;margin-top:12px;padding:14px}.v8399-private p{margin:7px 0}.v8399-buttons{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0}.v8399-buttons button[aria-pressed="true"]{font-weight:800;outline:2px solid currentColor}.v8399Pdf{display:block;width:100%;height:min(76vh,900px);min-height:420px;border:1px solid var(--line,#d5d5d5);border-radius:10px;background:#fff}.v8399-private input[type=file]{max-width:100%;margin:9px 0}.v8399-private [hidden]{display:none!important}@media(max-width:640px){.v8399Pdf{height:66vh;min-height:370px}}';
  document.head.appendChild(style);
 }
 const root=document.createElement('div');root.className='v8399-private';root.id='v8399ReproPrivate';
 root.innerHTML='<b>🔒 Consulter mes planches Canva en privé</b><p class="small">Importe le PDF A4 R02–R07 : le fichier reste dans le stockage de ce navigateur. Il n’est pas envoyé dans GitHub, Drive ou aux autres étudiants.</p><p class="small"><b>À vérifier :</b> les flèches et légendes de plusieurs schémas, notamment la médulla ovarienne sur R05. Ne pas utiliser ces maquettes comme corrigé de QCM.</p><label class="small" for="v8399File">Sélectionner le PDF de revue (6 pages)</label><input id="v8399File" type="file" accept=".pdf,application/pdf" aria-label="Importer le PDF Canva de revue"><div id="v8399Status" class="small" role="status">Recherche du PDF local…</div><div id="v8399Actions" hidden><div class="v8399-buttons" id="v8399Pages"></div><div class="v8399-buttons"><a id="v8399Open" class="btn outline" target="_blank" rel="noopener noreferrer">Ouvrir le PDF</a><button type="button" id="v8399Delete" class="btn outline">Supprimer mon PDF local</button></div></div><div id="v8399Viewer" hidden></div>';
 section.appendChild(root);
 const pageBox=$('v8399Pages');
 PAGES.forEach(([id,label],i)=>{
  const b=document.createElement('button');b.type='button';b.className='btn outline';
  b.dataset.v8399Page=String(i+1);b.textContent=id;
  b.title=id+' — '+label;b.setAttribute('aria-label','Voir '+id+' — '+label);
  b.onclick=()=>{activePage=i+1;renderPanel()};
  pageBox.appendChild(b);
 });
 $('v8399File').addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
   setStatus('Contrôle du PDF…');await validatePdf(file);
   await store('write',file);activePage=1;displayPdf(file);
  }catch(err){setStatus('Impossible de conserver le PDF : '+(err?.message||'erreur de stockage'))}
  e.target.value='';
 });
 $('v8399Delete').onclick=async()=>{
  if(!confirm('Supprimer le PDF de revue enregistré sur cet appareil ?'))return;
  try{await store('delete');activePage=1;displayPdf(null)}catch(err){setStatus('Suppression impossible : '+err.message)}
 };
 store('read').then(x=>{if(root.isConnected)displayPdf(x instanceof Blob?x:null)})
 .catch(()=>{if(root.isConnected)setStatus('Stockage privé indisponible sur ce navigateur. Aucun PDF n’a été diffusé.')});
}
function schedule(){if(document.body)mount()}
function init(){
 schedule();
 const obs=new MutationObserver(schedule);
 obs.observe(document.body,{subtree:true,childList:true});
 window.addEventListener('pagehide',closeUrl);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.IFSI_REPRO_LOCAL_REVIEW={version:'1.0',pages:PAGES.length};
})();
