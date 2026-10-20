(()=>{
'use strict';
// Pilot only: deploy behind an owner-authorized Supabase Edge Function.
// Public project URL/publishable key are not credentials. Never embed private sheet IDs.
const ROOT='https://ywicbdntavuitkcqvmqx.supabase.co';
const PUBLIC_KEY='sb_publishable_eY2KDhhPj660ASV3gxbnnQ_VrCOak3P';
const API=ROOT+'/functions/v1/ifsi-private-sources';
const STATES=['À vérifier','Présent','Absent'];
const FIELDS=[['transcript','Transcript'],['captures','Captures'],['official','Support officiel']];
let accessToken='',rows=new Map(),status='locked',userId='',message='';
const $=id=>document.getElementById(id);
function safeKey(id){return /^[a-z0-9_-]+$/.test(String(id))?String(id):''}
function normalizeRow(row){
 if(!row||!/^([a-z0-9_-]+)::p[0-9]{2}$/.test(row.key))return null;
 const clean={key:row.key,production:String(row.production||'À vérifier').slice(0,80)};
 for(const [field]of FIELDS)clean[field]=STATES.includes(row[field])?row[field]:'À vérifier';
 return clean;
}
function sourceRecord(courseId){return rows.get(safeKey(courseId)+'::p01')||null}
function renderState(){
 const host=$('cfPrivatePanel');if(!host)return;
 const stateLabel=status==='ready'?'Connecté — statuts privés chargés':
  status==='loading'?'Chargement des sources…':
  status==='denied'?'Accès refusé : ce compte n’est pas encore autorisé.':
  status==='error'?'Synchronisation indisponible : aucun statut non vérifié ne sera présenté comme acquis.':
  'Connexion privée nécessaire pour afficher les sources.';
 host.innerHTML='<div class="cf-head" id="cfOwnerSourcePanel">'+
  '<h3>🔒 Mes sources pédagogiques</h3>'+
  '<p class="cf-muted">Transcript · Captures · Support officiel. Données chargées uniquement après authentification ; aucun statut n’est transmis aux statistiques.</p>'+
  '<div class="cf-meta"><span id="cfOwnerState" class="cf-signal"></span></div>'+
  (accessToken?'<div class="cf-meta"><button class="btn outline" type="button" id="cfOwnerReload">Actualiser</button><button class="btn outline" type="button" id="cfOwnerLogout">Déconnexion</button></div>':
   '<div class="cf-controls"><input id="cfOwnerEmail" type="email" autocomplete="email" placeholder="Adresse du compte privé" aria-label="Adresse du compte privé">'+
   '<button class="btn secondary" id="cfOwnerSend" type="button">Recevoir un code</button></div>'+
   '<div class="cf-controls"><input id="cfOwnerCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="12" placeholder="Code reçu par e-mail" aria-label="Code de connexion">'+
   '<button class="btn secondary" id="cfOwnerVerify" type="button">Se connecter</button></div>')+
  '<p class="cf-muted" id="cfOwnerMessage" role="status"></p></div>';
 $('cfOwnerState').textContent=stateLabel;
 $('cfOwnerMessage').textContent=message;
 if(accessToken){
  $('cfOwnerReload').onclick=()=>reload();
  $('cfOwnerLogout').onclick=()=>{accessToken='';rows=new Map();userId='';status='locked';message='Déconnecté.';renderState();refreshViews()};
 }else{
  $('cfOwnerSend').onclick=()=>sendOtp();
  $('cfOwnerVerify').onclick=()=>verifyOtp();
 }
 refreshViews();
}
async function sendOtp(){
 const email=$('cfOwnerEmail')?.value?.trim()||'';
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){message='Adresse e-mail invalide.';renderMessage();return}
 const button=$('cfOwnerSend');button.disabled=true;
 try {
  const res=await fetch(ROOT+'/auth/v1/otp',{method:'POST',cache:'no-store',
   headers:{apikey:PUBLIC_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({email,create_user:true})});
  message=res.ok?'Code demandé. Consulte ta messagerie ; aucun accès n’est accordé avant vérification.':'Impossible d’envoyer le code. Réessaye plus tard.';
 }catch{message='Service de connexion inaccessible.'}
 finally{button.disabled=false;renderMessage()}
}
function renderMessage(){if($('cfOwnerMessage'))$('cfOwnerMessage').textContent=message}
async function verifyOtp(){
 const email=$('cfOwnerEmail')?.value?.trim()||'';
 const token=$('cfOwnerCode')?.value?.trim()||'';
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||!/^[0-9]{6,12}$/.test(token)){
  message='Saisis ton adresse et le code numérique reçu.';renderMessage();return;
 }
 $('cfOwnerVerify').disabled=true;
 try{
  const r=await fetch(ROOT+'/auth/v1/verify',{method:'POST',cache:'no-store',
   headers:{apikey:PUBLIC_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({email,token,type:'email'})});
  const result=await r.json();
  if(!r.ok||!result.access_token||!result.user?.id)throw Error('auth failed');
  // Deliberately memory-only: no localStorage, sessionStorage, cookies or analytics.
  accessToken=result.access_token;userId=result.user.id;rows=new Map();
  status='loading';message='Compte authentifié. Vérification des autorisations privées…';renderState();
  await reload();
 }catch{accessToken='';status='locked';message='Code refusé ou expiré.';renderState()}
}
async function privateFetch(method,body){
 if(!accessToken)throw Error('not authenticated');
 return fetch(API,{method,cache:'no-store',
  headers:{apikey:PUBLIC_KEY,Authorization:'Bearer '+accessToken,...(body?{'Content-Type':'application/json'}:{})},
  ...(body?{body:JSON.stringify(body)}:{})});
}
async function reload(){
 if(!accessToken)return;
 status='loading';message='Lecture du registre en cours…';renderState();
 try{
  const res=await privateFetch('GET');
  if(res.status===403){status='denied';rows=new Map();message='Compte connecté, mais non inscrit dans la liste des propriétaires autorisés. Identifiant à enregistrer côté serveur : '+userId;renderState();return}
  if(!res.ok)throw Error('load failed');
  const data=await res.json();
  if(!Array.isArray(data.rows))throw Error('invalid response');
  const next=new Map();
  for(const r of data.rows){const item=normalizeRow(r);if(item&&!next.has(item.key))next.set(item.key,item)}
  rows=next;status='ready';message='Statuts chargés depuis Google Sheets. En cas de conflit, recharge les valeurs.';
 }catch{rows=new Map();status='error';message='Lecture privée impossible. Aucun statut personnel affiché.'}
 renderState();
}
function selectStatus(record,field,label){
 const wrapper=document.createElement('label');wrapper.style.cssText='display:flex;justify-content:space-between;align-items:center;gap:9px;font-size:12px;margin:6px 0';
 const caption=document.createElement('span');caption.textContent=label;wrapper.appendChild(caption);
 const select=document.createElement('select');select.setAttribute('aria-label',label+' — '+record.key);
 for(const state of STATES){
  const option=document.createElement('option');option.value=state;option.textContent=state;select.appendChild(option);
 }
 select.value=record[field];select.addEventListener('change',()=>updateSource(record.key,field,record[field],select.value,select));
 wrapper.appendChild(select);return wrapper;
}
async function updateSource(courseKey,field,expected,next,select){
 if(status!=='ready'||!FIELDS.some(f=>f[0]===field)||!STATES.includes(next))return;
 select.disabled=true;
 try{
  const r=await privateFetch('PATCH',{courseKey,field,expected,next});
  if(r.status===409){message='La source a été modifiée ailleurs : actualisation obligatoire.';await reload();return}
  if(!r.ok)throw Error('update failed');
  const row=rows.get(courseKey);if(row)row[field]=next;
  message='Modification enregistrée dans Google Sheets.';renderMessage();refreshViews();
 }catch{
  select.value=expected;message='Enregistrement impossible. Le statut précédent a été conservé.';renderMessage();
 }finally{select.disabled=false}
}
function refreshViews(){
 document.querySelectorAll('[data-ifsi-source-course]').forEach(node=>{
  const id=safeKey(node.dataset.ifsiSourceCourse);node.replaceChildren();
  // Never clutter the public catalogue with private placeholders.
  if(status!=='ready'){node.hidden=true;return}
  node.hidden=false;
  const record=sourceRecord(id);
  if(!record){const t=document.createElement('small');t.textContent='Sources : cours non rapproché du registre privé';node.appendChild(t);return}
  for(const [field,label]of FIELDS)node.appendChild(selectStatus(record,field,label));
  const t=document.createElement('small');t.textContent='Production (registre) : '+record.production;node.appendChild(t);
 });
}
function mount(){renderState()}
window.IFSI_PRIVATE_SOURCES={mount,refreshViews,normalizeRow,sourceRecord,states:STATES};
})();