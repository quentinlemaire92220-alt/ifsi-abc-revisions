(()=>{
"use strict";
const HOST="https://ywicbdntavuitkcqvmqx.supabase.co";
const PUBLISHABLE_KEY="sb_publishable_eY2KDhhPj660ASV3gxbnnQ_VrCOak3P";
const API=HOST+"/functions/v1/ifsi-private-sources";
const CALLBACK="https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/pilote-sources-privees.html";
const STATES=["À vérifier","Présent","Absent"];
const FIELDS=[["transcript","Transcript"],["captures","Captures"],["official","Support officiel"]];
const $=id=>document.getElementById(id);
let accessToken="",records=[],loading=false;
function status(id,value,type=""){
 const el=$(id);el.textContent=value;el.className="status "+type;
}
function consumeLink(){
 const h=location.hash||"";
 if(!h || (!h.includes("access_token=")&&!h.includes("error=")))return false;
 const values=new URLSearchParams(h.replace(/^#/,""));
 // Clear access_token and refresh_token before any other network request.
 history.replaceState(null,"",location.pathname+location.search);
 if(values.get("error")){status("loginStatus","Lien refusé ou expiré. Demande un nouveau lien.","error");return false}
 const jwt=values.get("access_token")||"";
 if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(jwt)){
  status("loginStatus","Lien incomplet ou invalide. Demande un nouveau lien.","error");return false;
 }
 accessToken=jwt;return true;
}
function authorizedView(yes){$("login").hidden=yes;$("data").hidden=!yes}
async function sendLink(){
 const email=$("email").value.trim();
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){status("loginStatus","Adresse e-mail invalide.","error");return}
 $("send").disabled=true;
 try{
  const r=await fetch(HOST+"/auth/v1/otp?redirect_to="+encodeURIComponent(CALLBACK),{
   method:"POST",cache:"no-store",headers:{apikey:PUBLISHABLE_KEY,"Content-Type":"application/json"},
   body:JSON.stringify({email,create_user:false})
  });
  status("loginStatus",r.ok?"Un lien à usage unique a été demandé. Consulte ta messagerie.":"Impossible d'envoyer le lien. Vérifie la redirection autorisée dans Supabase.",r.ok?"ok":"error");
 }catch{status("loginStatus","Service d'authentification inaccessible.","error")}
 finally{$("send").disabled=false}
}
async function backend(method,payload){
 if(!accessToken)throw Error("Session absente");
 return fetch(API,{method,cache:"no-store",
  headers:{"apikey":PUBLISHABLE_KEY,Authorization:"Bearer "+accessToken,...(payload?{"Content-Type":"application/json"}:{})},
  ...(payload?{body:JSON.stringify(payload)}:{})
 });
}
function render(){
 const body=$("tableBody");body.replaceChildren();
 const search=$("filter").value.trim().toLowerCase();
 let shown=0;
 for(const row of records){
  if(search&&!row.key.toLowerCase().includes(search))continue;
  shown++;
  const tr=document.createElement("tr"),name=document.createElement("td");
  name.textContent=row.key;tr.appendChild(name);
  for(const [field,label] of FIELDS){
   const td=document.createElement("td"),select=document.createElement("select");
   select.setAttribute("aria-label",label+" — "+row.key);
   for(const state of STATES){const option=document.createElement("option");option.value=state;option.textContent=state;select.appendChild(option)}
   select.value=row[field];select.addEventListener("change",()=>save(row,field,select));
   td.appendChild(select);tr.appendChild(td);
  }
  const prod=document.createElement("td");prod.textContent=row.production;tr.appendChild(prod);body.appendChild(tr);
 }
 $("count").textContent=shown+" / "+records.length+" cours";
}
async function refresh(){
 if(loading)return;loading=true;$("refresh").disabled=true;
 status("syncStatus","Vérification des droits et chargement de Google Sheets…");
 try{
  const r=await backend("GET");
  if(r.status===401||r.status===403)throw Error("Accès refusé : compte propriétaire non autorisé (401/403).");
  if(r.status===503)throw Error("Paramètres du serveur absents ou invalides (503).");
  if(!r.ok)throw Error("Lecture privée impossible (HTTP "+r.status+").");
  const payload=await r.json();
  if(!Array.isArray(payload.rows))throw Error("Réponse de Google Sheets inattendue.");
  const seen=new Set();
  records=payload.rows.map(row=>{
   if(!row||typeof row.key!=="string"||!/^[a-z0-9_-]+::p[0-9]{2}$/.test(row.key)||seen.has(row.key))
    throw Error("Identifiant de cours non fiable.");
   seen.add(row.key);
   const item={key:row.key,production:String(row.production||"À vérifier").slice(0,80)};
   for(const [field]of FIELDS)item[field]=STATES.includes(row[field])?row[field]:"À vérifier";
   return item;
  });
  render();status("syncStatus",records.length+" cours chargés. Teste un statut puis vérifie Google Sheets.","ok");
 }catch(e){records=[];render();status("syncStatus",e.message||"Synchronisation inaccessible.","error")}
 finally{loading=false;$("refresh").disabled=false}
}
async function save(row,field,select){
 if(!FIELDS.some(([k])=>k===field))return;
 const expected=row[field],next=select.value;
 if(expected===next)return;
 select.disabled=true;
 try{
  const r=await backend("PATCH",{courseKey:row.key,field,expected,next});
  if(r.status===409){select.value=expected;status("syncStatus","Conflit détecté. Actualise avant de modifier ce cours.","error");return}
  if(!r.ok)throw Error("Écriture refusée (HTTP "+r.status+").");
  const ack=await r.json();
  if(ack.courseKey!==row.key||ack.field!==field||ack.value!==next)throw Error("Accusé de réception incohérent.");
  row[field]=next;status("syncStatus","Statut enregistré pour "+row.key+". Vérifie et restaure sa valeur si c'était un test.","ok");
 }catch(e){select.value=expected;status("syncStatus",e.message||"Impossible d'enregistrer.","error")}
 finally{select.disabled=false}
}
async function logout(){
 const old=accessToken;accessToken="";records=[];render();authorizedView(false);
 status("loginStatus","Déconnecté de la page pilote.","ok");
 if(old)try{await fetch(HOST+"/auth/v1/logout",{method:"POST",cache:"no-store",headers:{apikey:PUBLISHABLE_KEY,Authorization:"Bearer "+old}})}catch{}
}
$("send").addEventListener("click",sendLink);
$("refresh").addEventListener("click",refresh);
$("logout").addEventListener("click",logout);
$("filter").addEventListener("input",render);
if(consumeLink()){authorizedView(true);refresh()}else authorizedView(false);
})();