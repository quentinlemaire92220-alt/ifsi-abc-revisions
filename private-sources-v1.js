(()=>{
'use strict';
// Pilot only: deploy behind an owner-authorized Supabase Edge Function.
// Public project URL/publishable key are not credentials. Never embed private sheet IDs.
const ROOT='https://ywicbdntavuitkcqvmqx.supabase.co';
const PUBLIC_KEY='sb_publishable_eY2KDhhPj660ASV3gxbnnQ_VrCOak3P';
const API=ROOT+'/functions/v1/ifsi-private-sources';
const RETURN_URL='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
const STATES=['À vérifier','Présent','Absent'];
const FIELDS=[['transcript','Transcript'],['captures','Captures'],['official','Support officiel']];
let accessToken='',rows=new Map(),status='locked',message='';
const $=id=>document.getElementById(id);
function safeKey(id){return /^[a-z0-9_-]+$/.test(String(id))?String(id):''}
function normalizeRow(row){
 if(!row||!/^([a-z0-9_-]+)::p[0-9]{2}$/.test(row.key))return null;
 const clean={key:row.key,production:String(row.production||'À vérifier').slice(0,80)};
 for(const [field]of FIELDS)clean[field]=STATES.includes(row[field])?row[field]:'À vérifier';
 return clean;
}
function sourceRecord(courseId){return rows.get(safeKey(courseId)+'::p01')||null}
function acceptMagicLinkRedirect(){
 // An implicit Magic Link returns a short-lived signed access token in the URL fragment.
 // Consume it before loading analytics; never persist the access or refresh token.
 const hash=window.location?.hash||'';
 if(!hash || (!hash.includes('access_token=') && !hash.includes('error=')))return false;
 const p=new URLSearchParams(hash.startsWith('#')?hash.slice(1):hash);
 window.history?.replaceState?.(window.history.state||null,'',window.location.pathname+window.location.search);
 if(p.has('error')){
   status='locked';message='Lien expiré ou refusé. Demande un nouveau lien de connexion.';return false;
 }
 const token=p.get('access_token')||'';
 if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)){
   status='locked';message='Lien de connexion invalide. Demande un nouveau lien.';return false;
 }
 accessToken=token;status='loading';
 message='Identité confirmée. Vérification des droits du propriétaire en cours…';
 return true;
}
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
   '<button class="btn secondary" id="cfOwnerSend" type="button">Recevoir un lien de connexion</button></div>')+
  '<p class="cf-muted" id="cfOwnerMessage" role="status"></p></div>';
 $('cfOwnerState').textContent=stateLabel;
 $('cfOwnerMessage').textContent=message;
 if(accessToken){
  $('cfOwnerReload').onclick=()=>reload();
  $('cfOwnerLogout').onclick=()=>{
    const oldToken=accessToken;
    accessToken='';rows=new Map();status='locked';message='Déconnecté.';renderState();
    // Revoke server-side session in addition to clearing the memory-only token.
    fetch(ROOT+'/auth/v1/logout',{method:'POST',headers:{apikey:PUBLIC_KEY,Authorization:'Bearer '+oldToken}}).catch(()=>{});
  };
 }else{
  $('cfOwnerSend').onclick=()=>sendMagicLink();
 }
 refreshViews();
}
async function sendMagicLink(){
 const email=$('cfOwnerEmail')?.value?.trim()||'';
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
   message='Adresse e-mail invalide.';renderMessage();return;
 }
 const button=$('cfOwnerSend');button.disabled=true;
 try{
  const res=await fetch(ROOT+'/auth/v1/otp?redirect_to='+encodeURIComponent(RETURN_URL),{
   method:'POST',cache:'no-store',
   headers:{apikey:PUBLIC_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({email,create_user:false})
  });
  message=res.ok?'Si ce compte est autorisé, un lien à usage unique vient d’être envoyé. Consulte ta messagerie.':'Impossible d’envoyer le lien maintenant. Réessaye plus tard.';
 }catch{message='Service de connexion inaccessible.'}
 finally{button.disabled=false;renderMessage()}
}
function renderMessage(){if($('cfOwnerMessage'))$('cfOwnerMessage').textContent=message}
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
  if(res.status===403){status='denied';rows=new Map();message='Compte authentifié, mais accès propriétaire refusé.';renderState();return}
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
function mount(){renderState();if(accessToken)reload()}
acceptMagicLinkRedirect();
window.IFSI_PRIVATE_SOURCES={mount,refreshViews,normalizeRow,sourceRecord,states:STATES,acceptMagicLinkRedirect};
})();