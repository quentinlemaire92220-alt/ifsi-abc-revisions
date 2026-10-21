/* IFSI ABC — Lecteur personnel de packs Pathologies en revue.
 * AUCUN support clinique n'est livré par ce script. Import local du propriétaire seulement.
 * Aucun scoring ni activation du catalogue médical publié.
 */
(function(root){
'use strict';
const SCHEMA='ifsi-abc-private-pathologies-p1-v1',DB='ifsi-abc-private-pathologies-v1',STORE='packs',KEY='P1';
const IDS=['bpco','hta','dt2'];
const SECTIONS=[['definition','Définition'],['physiopathologie','Physiopathologie'],['riskFactors','Facteurs de risque'],['clinicalSigns','Signes cliniques'],['diagnosis','Diagnostic'],['treatments','Prise en charge'],['nursingCare','Rôle infirmier'],['monitoring','Surveillances'],['complications','Complications'],['keywords','Mots-clés']];
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el=id=>root.document?.getElementById(id);
let pack=null,requestedId=null,importMessage='',st={id:null,tab:'fiche',page:0,index:0,reveal:false};
let dbP;
function valid(data){
 if(!data||data.schema!==SCHEMA||data.reviewOnly!==true||data.publicationPermitted!==false||data.clinicalReview!=='pending')return false;
 if(!Array.isArray(data.items)||data.items.length!==3||data.items.some((x,i)=>x?.id!==IDS[i]))return false;
 return data.items.every(p=>Array.isArray(p.posterPages)&&p.posterPages.length===6&&
  p.posterPages.every((v,i)=>v?.number===i+1&&typeof v.title==='string'&&typeof v.alt==='string'&&
    typeof v.image==='string'&&v.image.startsWith('data:image/webp;base64,')&&
    v.image.length<850000&&/^[A-Za-z0-9+/=]+$/.test(v.image.slice(23)))&&
  p.sections&&SECTIONS.every(([id])=>typeof p.sections[id]==='string')&&
  Array.isArray(p.qcm)&&p.qcm.length===24&&
  Array.isArray(p.flashcards)&&p.flashcards.length===20&&
  Array.isArray(p.cases)&&p.cases.reduce((n,c)=>n+(Array.isArray(c.steps)?c.steps.length:0),0)===8);
}
function database(){
 if(dbP)return dbP;
 dbP=new Promise((resolve,reject)=>{
  if(!root.indexedDB)return reject(new Error('Stockage local non disponible'));
  const req=root.indexedDB.open(DB,1);
  req.onupgradeneeded=()=>req.result.createObjectStore(STORE);
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error('IndexedDB indisponible'));
 });
 return dbP;
}
async function save(data){
 const db=await database();
 await new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(data,KEY);
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
 });
}
async function load(){
 try{
  const db=await database();
  const data=await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).get(KEY);
   req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
  if(valid(data)){
   pack=data;
   if(requestedId)showIfImported(requestedId);
   else attachImport();
   root.IFSI_PATHOLOGIES_CLOUD?.onPage?.();
  }
 }catch{/* Fonctionne même sans IndexedDB, seulement pour la session courante. */}
}
async function clear(){
 pack=null;requestedId=null;importMessage='';
 try{const db=await database();await new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(KEY);
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
 });}catch{/* Il est toujours possible d'abandonner le pack en mémoire. */}
 root.IFSI_PATHOLOGIES?.showCatalog?.();
}
function attachImport(){
 const host=el('pathoReviewImport');if(!host)return;
 const forId=host.dataset?.pathoId||null;
 host.innerHTML='<div class="patho-panel" style="border-style:dashed">'+
 '<h3>🔒 Mes supports Pathologies sur cet appareil</h3>'+
 '<p class="patho-muted">Importe une seule fois le fichier JSON du pack P1, puis connecte ton compte pour le sauvegarder dans ton espace Supabase privé. Rien n’est envoyé à GitHub ou à la promotion. Les corrections provisoires ne comptent pas dans les scores.</p>'+
 '<label class="btn outline" for="pathoPrivateFile">📂 Choisir mon fichier JSON Pathologies</label> '+
 '<input type="file" accept=".json,application/json" id="pathoPrivateFile" style="position:absolute;width:1px;height:1px;opacity:0" aria-label="Choisir un pack personnel">'+
 (pack?'<button type="button" class="btn outline" id="pathoPrivateClear">Effacer mon pack local</button><p class="patho-muted">✅ Pack chargé : 3 pathologies · 18 planches · 156 exercices en relecture</p>':'')+
 '<p id="pathoPrivateMessage" role="status" aria-live="polite">'+E(importMessage)+'</p></div><div id="pathoCloudPanel"></div>';
 root.IFSI_PATHOLOGIES_CLOUD?.attach?.();
 const input=el('pathoPrivateFile'),status=el('pathoPrivateMessage');
 if(input)input.onchange=async()=>{
  const file=input.files?.[0];if(!file)return;
  if(file.size>10000000){importMessage='Fichier trop volumineux (maximum 10 Mo).';status.textContent=importMessage;return;}
  try{
   const data=JSON.parse(await file.text());
   if(!valid(data))throw new Error('Le JSON ne correspond pas au pack personnel P1 attendu (3 pathologies, 18 planches, 156 exercices).');
   pack=data;
   let saved=true;
   try{await save(data);}catch{saved=false;}
   importMessage=saved?'✅ Pack personnel importé et enregistré sur cet appareil.':'✅ Pack personnel importé pour cette session ; stockage durable indisponible.';
   root.IFSI_PATHOLOGIES_CLOUD?.afterLocalImport?.(data);
   // Si le choix du fichier vient de la page BPCO/HTA/DT2, afficher immédiatement la fiche.
   if(forId&&showIfImported(forId))return;
   // Depuis le catalogue, rafraîchir l'état des trois rubriques.
   if(typeof root.IFSI_PATHOLOGIES?.showCatalog==='function')root.IFSI_PATHOLOGIES.showCatalog();
   else attachImport();
  }catch(e){
   importMessage='Import refusé : '+String(e.message||e);
   status.textContent=importMessage;
  }
 };
 el('pathoPrivateClear')?.addEventListener('click',clear);
}
function header(p){
 return '<div class="card patho-wrap"><div class="patho-toolbar"><button type="button" class="btn outline" id="pathoPrivateBack">← Toutes les pathologies</button></div>'+
 '<h2>'+E(p.title)+'</h2>'+
 '<div class="patho-panel" role="status" style="border-style:dashed"><b>🔒 Aperçu personnel — NON VALIDÉ MÉDICALEMENT</b><p>Support de travail, réservé à la relecture. Les réponses et informations médicales peuvent contenir des erreurs. Aucun résultat ne contribue aux statistiques.</p></div>'+
 '<div class="patho-tabs">'+[['fiche','Fiche illustrée'],['qcm','QCM'],['flashcards','Flashcards'],['cas','Cas cliniques']].map(([id,label])=>
 '<button type="button" class="btn '+(st.tab===id?'primary':'outline')+'" data-private-tab="'+id+'">'+label+'</button>').join('')+'</div>';
}
function sheet(p){
 const page=p.posterPages[Math.min(st.page,5)];
 return '<div class="patho-panel"><h3>'+E(page.title)+'</h3><figure class="patho-poster"><img loading="lazy" src="'+page.image+'" alt="'+E(page.alt)+'"><figcaption>'+E(page.alt)+'</figcaption></figure>'+
 '<div class="patho-poster-nav"><button type="button" class="btn outline" data-private-move="-1" '+(st.page===0?'disabled':'')+'>← Précédente</button><span>Planche '+(st.page+1)+' / 6</span><button type="button" class="btn outline" data-private-move="1" '+(st.page===5?'disabled':'')+'>Suivante →</button></div></div>'+
 '<details class="patho-details patho-panel"><summary>Lire la fiche de révision rédigée (provisoire)</summary>'+
 SECTIONS.map(([key,name])=>'<h3>'+E(name)+'</h3><p>'+E(p.sections[key])+'</p>').join('')+'</details>';
}
function qcm(p){
 const q=p.qcm[st.index%p.qcm.length],correct=Array.isArray(q.correct)?q.correct:[];
 return '<div class="patho-panel"><p class="patho-muted">Question '+(st.index+1)+' / '+p.qcm.length+' — corrigé provisoire</p><h3>'+E(q.prompt)+'</h3>'+
 '<ol type="A">'+(q.options||[]).map(x=>'<li>'+E(x)+'</li>').join('')+'</ol>'+
 (st.reveal?'<div class="patho-correction"><b>Propositions attendues selon le brouillon : '+correct.map(i=>'ABCDE'[i]).join(', ')+'</b><p>'+E(q.explanation)+'</p>'+
 '<ul>'+(q.feedback||[]).map((x,i)=>'<li>'+ 'ABCDE'[i]+' — '+E(x)+'</li>').join('')+'</ul></div>':'')+
 '<button type="button" class="btn outline" id="pathoPrivateReveal">'+(st.reveal?'Masquer le corrigé':'Afficher le corrigé provisoire')+'</button></div>'+arrows(p.qcm.length);
}
function cards(p){
 const x=p.flashcards[st.index%p.flashcards.length];
 return '<div class="patho-panel"><p class="patho-muted">Flashcard '+(st.index+1)+' / '+p.flashcards.length+' — provisoire</p><h3>'+E(x.front)+'</h3>'+
 (st.reveal?'<p>'+E(x.back)+'</p>':'')+
 '<button type="button" class="btn outline" id="pathoPrivateReveal">'+(st.reveal?'Masquer la réponse':'Afficher la réponse provisoire')+'</button></div>'+arrows(p.flashcards.length);
}
function cases(p){
 const steps=p.cases.flatMap(c=>(c.steps||[]).map(s=>({s,context:c.context,title:c.title})));
 const x=steps[st.index%steps.length];const s=x.s;
 return '<div class="patho-panel"><p class="patho-muted">Étape '+(st.index+1)+' / '+steps.length+' — situation fictive</p><h3>'+E(x.title)+'</h3><p>'+E(x.context)+'</p><h3>'+E(s.prompt)+'</h3>'+
 '<ol type="A">'+(s.options||[]).map(o=>'<li>'+E(o)+'</li>').join('')+'</ol>'+
 (st.reveal?'<div class="patho-correction"><b>Réponse attendue selon le brouillon : '+('ABCDE'[s.correct]||'?')+'</b><p>'+E(s.explanation)+'</p></div>':'')+
 '<button type="button" class="btn outline" id="pathoPrivateReveal">'+(st.reveal?'Masquer le corrigé':'Afficher le corrigé provisoire')+'</button></div>'+arrows(steps.length);
}
function arrows(length){
 return '<div class="patho-toolbar"><button type="button" class="btn outline" data-private-move="-1" '+(st.index===0?'disabled':'')+'>← Précédent</button><button type="button" class="btn outline" data-private-move="1" '+(st.index===length-1?'disabled':'')+'>Suivant →</button></div>';
}
function render(){
 const p=pack?.items.find(x=>x.id===st.id),host=el('ifsiPathologiesBody');
 if(!p||!host)return false;
 host.innerHTML=header(p)+(st.tab==='fiche'?sheet(p):st.tab==='qcm'?qcm(p):st.tab==='flashcards'?cards(p):cases(p))+'</div>';
 el('pathoPrivateBack')?.addEventListener('click',()=>root.IFSI_PATHOLOGIES?.showCatalog?.());
 host.querySelectorAll('[data-private-tab]').forEach(b=>b.onclick=()=>{st.tab=b.dataset.privateTab;st.index=0;st.page=0;st.reveal=false;render();});
 host.querySelectorAll('[data-private-move]').forEach(b=>b.onclick=()=>{
  const step=Number(b.dataset.privateMove);
  if(st.tab==='fiche')st.page=Math.max(0,Math.min(5,st.page+step));
  else st.index=Math.max(0,st.index+step);
  st.reveal=false;render();
 });
 el('pathoPrivateReveal')?.addEventListener('click',()=>{st.reveal=!st.reveal;render();});
 return true;
}
function showIfImported(id){
 requestedId=id;
 if(!pack?.items.some(x=>x.id===id))return false;
 st={id,tab:'fiche',page:0,index:0,reveal:false};
 return render();
}
function has(id){return !!pack?.items.some(x=>x.id===id);}
function getPack(){return pack;}
async function acceptFromCloud(data){
 if(!valid(data))throw Error('Pack privé distant non conforme.');
 pack=data;
 importMessage='✅ Pack chargé depuis ton compte Supabase privé.';
 try{await save(data);}catch{/* Lecture en mémoire disponible, même sans IndexedDB. */}
 if(requestedId&&showIfImported(requestedId))return true;
 if(root.IFSI_PATHOLOGIES?.showCatalog)root.IFSI_PATHOLOGIES.showCatalog();
 else attachImport();
 return true;
}
root.IFSI_PATHOLOGIES_REVIEW=Object.freeze({attachImport,showIfImported,has,valid,clear,getPack,acceptFromCloud,loaded:()=>!!pack});
if(root.document)load();
})(window);
