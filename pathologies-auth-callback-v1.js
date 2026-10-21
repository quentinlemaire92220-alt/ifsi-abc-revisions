/* Retour Magic Link vers IFSI ABC : ne s'active que suite à une demande Pathologies.
 * Le lien Auth est déjà redirigé vers la page pilote, autorisée dans Supabase.
 */
(()=>{
'use strict';
const FLAG='ifsi-pathologies-private-auth-pending-v1';
const SESSION='ifsi-pathologies-private-auth-session-v1';
try{
 const pending=JSON.parse(localStorage.getItem(FLAG)||'null');
 if(!pending?.created||Date.now()-pending.created>30*60*1000){localStorage.removeItem(FLAG);return;}
 const hash=new URLSearchParams(location.hash.replace(/^#/,''));
 const access_token=hash.get('access_token'),refresh_token=hash.get('refresh_token');
 if(!access_token&&!hash.has('error'))return;
 // Efface les tokens de l'URL avant tout autre script ou requête.
 history.replaceState(null,'',location.pathname+location.search);
 localStorage.removeItem(FLAG);
 if(hash.has('error')||!access_token||!refresh_token){
  document.addEventListener('DOMContentLoaded',()=>{
   const p=document.getElementById('loginStatus');if(p)p.textContent='Lien de connexion invalide ou expiré : recommence depuis Pathologies.';
  },{once:true});return;
 }
 if(!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(access_token)||refresh_token.length<12)return;
 const expires_in=Number(hash.get('expires_in')||3600);
 localStorage.setItem(SESSION,JSON.stringify({access_token,refresh_token,expires_at:Math.floor(Date.now()/1000)+Math.max(60,Math.min(expires_in,86400))}));
 location.replace('./index.html#pathologies');
}catch{
 // En cas de stockage désactivé, la page pilote reste disponible.
}
})();
