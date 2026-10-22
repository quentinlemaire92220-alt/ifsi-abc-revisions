/* IFSI ABC — Synchronisation PRIVÉE P1 : aucun support médical embarqué.
 * L'accès aux données repose sur Supabase Auth + RLS owner_id = auth.uid().
 * Première transmission depuis le fichier local obligatoire ; lectures suivantes automatiques.
 */
(function(root){
'use strict';
const HOST='https://ywicbdntavuitkcqvmqx.supabase.co';
const KEY='sb_publishable_eY2KDhhPj660ASV3gxbnnQ_VrCOak3P'; // Clé publique, jamais une clé service_role.
const SESSION_KEY='ifsi-pathologies-private-auth-session-v1';
const PENDING_KEY='ifsi-pathologies-private-auth-pending-v1';
const CALLBACK='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/pilote-sources-privees.html';
const TABLE=HOST+'/rest/v1/pathologies_private_packs';
let refreshing=null, loading=null, statusText='';
const $=id=>root.document?.getElementById(id);
const safe=txt=>String(txt??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function store(){try{return root.localStorage}catch{return null}}
function getSession(){
 try{
  const s=JSON.parse(store()?.getItem(SESSION_KEY)||'null');
  return s&&typeof s.access_token==='string'&&typeof s.refresh_token==='string'&&Number.isFinite(s.expires_at)?s:null;
 }catch{return null}
}
function setSession(s){
 const result={access_token:s.access_token,refresh_token:s.refresh_token,expires_at:s.expires_at||Math.floor(Date.now()/1000)+(s.expires_in||3600)};
 if(!result.access_token||!result.refresh_token)throw Error('Jetons de connexion incomplets');
 const db=store();if(!db)throw Error('Stockage de session indisponible sur cet appareil');
 db.setItem(SESSION_KEY,JSON.stringify(result));
 return result;
}
function say(message){statusText=message;const node=$('pathoCloudStatus');if(node)node.textContent=message}
async function refresh(){
 if(refreshing)return refreshing;
 refreshing=(async()=>{
  const old=getSession();if(!old)throw Error('Connecte-toi pour synchroniser tes supports.');
  const response=await fetch(HOST+'/auth/v1/token?grant_type=refresh_token',{method:'POST',cache:'no-store',
   headers:{'apikey':KEY,'Content-Type':'application/json'},
   body:JSON.stringify({refresh_token:old.refresh_token})});
  if(!response.ok){store()?.removeItem(SESSION_KEY);throw Error('Session expirée : reconnecte-toi.');}
  return setSession(await response.json());
 })();
 try{return await refreshing;}finally{refreshing=null;}
}
async function token(){
 const s=getSession();if(!s)throw Error('Connexion privée non établie.');
 return (s.expires_at<Math.floor(Date.now()/1000)+90?await refresh():s).access_token;
}
async function request(endpoint,method='GET',payload=null,extra={}){
 let jwt=await token();
 const run=jwt=>fetch(endpoint,{method,cache:'no-store',headers:{apikey:KEY,Authorization:'Bearer '+jwt,...(payload?{'Content-Type':'application/json'}:{}),...extra},
 ...(payload?{body:JSON.stringify(payload)}:{})});
 let response=await run(jwt);
 if(response.status===401){jwt=(await refresh()).access_token;response=await run(jwt);}
 return response;
}
async function verifyOwner(){
 const r=await request(HOST+'/auth/v1/user');
 if(r.status===401||r.status===403)throw Error('Compte Supabase non autorisé.');
 if(!r.ok)throw Error('Vérification de la connexion impossible (HTTP '+r.status+').');
 const user=await r.json();
 if(!user.id||!user.email_confirmed_at)throw Error('Compte Supabase non confirmé.');
 return true;
}
async function sendLink(email){
 const mail=String(email||'').trim();
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail))throw Error('Adresse e-mail invalide.');
 const response=await fetch(HOST+'/auth/v1/otp?redirect_to='+encodeURIComponent(CALLBACK),{
  method:'POST',cache:'no-store',headers:{apikey:KEY,'Content-Type':'application/json'},
  body:JSON.stringify({email:mail,create_user:false})
 });
 if(!response.ok)throw Error('Lien de connexion non envoyé. Vérifie la redirection Supabase et ton compte.');
 store()?.setItem(PENDING_KEY,JSON.stringify({created:Date.now()}));
 say('Un lien de connexion a été demandé. Ouvre-le sur cet appareil puis reviens dans Pathologies.');
}
async function sync(){
 if(loading)return loading;
 loading=(async()=>{
  try{
   if(!getSession()){attach();return false;}
   await verifyOwner();
   say('Connexion privée confirmée, recherche des supports…');
   const response=await request(TABLE+'?select=payload&pack_key=eq.p1&limit=1');
   if(!response.ok)throw Error('Lecture privée indisponible (HTTP '+response.status+').');
   const rows=await response.json();
   if(!Array.isArray(rows))throw Error('Réponse de synchronisation inattendue.');
   if(rows.length){
    const pack=rows[0].payload;
    if(!root.IFSI_PATHOLOGIES_REVIEW?.valid?.(pack))throw Error('Pack distant invalide ou toujours en attente de contrôle technique.');
    await root.IFSI_PATHOLOGIES_REVIEW.acceptFromCloud(pack);
    say('✅ Supports chargés depuis ton espace privé Supabase.');
    return true;
   }
   const local=root.IFSI_PATHOLOGIES_REVIEW?.getPack?.();
   if(local&&root.IFSI_PATHOLOGIES_REVIEW.valid(local)){
    await upload(local);
    say('✅ Première sauvegarde privée effectuée : chargement automatique activé.');
    return true;
   }
   say('🔒 Connexion établie. Aucun pack distant : sélectionne une seule fois ton fichier JSON P1 pour le sauvegarder.');
   return false;
  }catch(e){say('Synchronisation privée : '+String(e.message||e));return false}
  finally{loading=null;attach();}
 })();
 return loading;
}
async function upload(pack){
 if(!root.IFSI_PATHOLOGIES_REVIEW?.valid?.(pack))throw Error('Pack P1 non conforme aux règles de revue privée.');
 if(!getSession())throw Error('Connecte-toi avant de sauvegarder les supports sur Supabase.');
 await verifyOwner();
 const r=await request(TABLE+'?on_conflict=owner_id,pack_key','POST',[{pack_key:'p1',payload:pack}],
 {'Prefer':'resolution=merge-duplicates,return=minimal'});
 if(!r.ok)throw Error('Sauvegarde privée refusée (HTTP '+r.status+'). Vérifie la connexion et les droits.');
 say('✅ Pack conservé dans ton espace privé : il se chargera automatiquement après connexion.');
 return true;
}
async function afterLocalImport(pack){
 if(!getSession()){say('Pack enregistré localement. Connecte-toi pour synchroniser automatiquement tes autres appareils.');return false;}
 try{return await upload(pack);}
 catch(e){say('Le pack reste sur cet appareil, mais la synchronisation a échoué : '+String(e.message||e));return false;}
}
function attach(){
 const host=$('pathoCloudPanel');if(!host)return;
 const connected=!!getSession();
 host.innerHTML='<div class="patho-panel" style="border-style:dashed">'+
 '<h3>☁️ Mes supports Pathologies — synchronisation privée</h3>'+
 (connected?'<p>Compte Supabase connecté. Les supports personnels sont isolés par compte et ne sont pas publiés à la promotion.</p>'+
 '<button class="btn outline" type="button" id="pathoCloudSync">↻ Charger mes supports privés</button> '+
 '<button class="btn outline" type="button" id="pathoCloudLogout">Se déconnecter</button>':
 '<p>Connecte-toi une fois avec ton compte Supabase. Après le premier envoi sécurisé du pack, il sera automatiquement retrouvé sur tes appareils.</p>'+
 '<input type="email" autocomplete="email" id="pathoCloudEmail" placeholder="Adresse du compte Supabase" aria-label="Adresse du compte privé">'+
 '<button class="btn outline" type="button" id="pathoCloudLogin">Recevoir mon lien de connexion</button>')+
 '<p id="pathoCloudStatus" class="patho-muted" role="status" aria-live="polite">'+safe(statusText)+'</p></div>';
 $('pathoCloudLogin')?.addEventListener('click',async()=>{
  const button=$('pathoCloudLogin');button.disabled=true;
  try{await sendLink($('pathoCloudEmail')?.value);}catch(e){say(String(e.message||e))}
  finally{button.disabled=false}
 });
 $('pathoCloudSync')?.addEventListener('click',sync);
 $('pathoCloudLogout')?.addEventListener('click',()=>{
  store()?.removeItem(SESSION_KEY);say('Compte déconnecté. Les supports déjà enregistrés localement restent sur cet appareil.');attach();
 });
}
function onPage(){
 attach();
 if(getSession()&&!loading)sync();
}
function onReturn(){
 if(root.location?.hash==='#pathologies'){
  root.history?.replaceState(null,'',root.location.pathname+root.location.search);
  root.IFSI_PATHOLOGIES?.open?.();
 }
}
root.IFSI_PATHOLOGIES_CLOUD=Object.freeze({attach,onPage,sync,afterLocalImport,getSession,sendLink,upload});
if(root.document&&root.IFSI_APP_FEATURES?.pathologies===true){
 Promise.resolve().then(onReturn).then(()=>{if(getSession())sync();});
}
})(window);
