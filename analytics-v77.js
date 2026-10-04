(()=>{
'use strict';
const VERSION='7.7';
const ENDPOINT='https://ywicbdntavuitkcqvmqx.supabase.co/rest/v1/analytics_events';
const API_KEY='sb_publishable_eY2KDhhPj660ASV3gxbnnQ_VrCOak3P';
const OPTOUT='ifsiabc_analytics_optout_v1';
const SESSION='ifsiabc_analytics_session_v1';
let resultVisible=false;

const $=id=>document.getElementById(id);
const enabled=()=>localStorage.getItem(OPTOUT)!=='1';
const safe=(v,n=180)=>String(v??'').slice(0,n);
function sessionId(){
  let id=sessionStorage.getItem(SESSION);
  if(id)return id;
  id=(crypto.randomUUID?crypto.randomUUID():`${Date.now().toString(16)}-0000-4000-8000-${Math.random().toString(16).slice(2,14).padEnd(12,'0')}`);
  sessionStorage.setItem(SESSION,id);
  return id;
}
function courseId(){
  try{if(Array.isArray(session)&&session[0]?.courseId)return session[0].courseId}catch{}
  const label=$('course')?.value||'';
  return window.IFSI_V741?.courseIdForLabel?.(label)||null;
}
function driveId(href=''){const m=String(href).match(/\/d\/([^/]+)/);return m?.[1]||null}
async function track(event_type,data={}){
  if(!enabled()||!navigator.onLine)return false;
  const body={
    event_type,
    course_id:safe(data.course_id||courseId()||'',80)||null,
    resource_type:data.resource_type||null,
    resource_id:safe(data.resource_id||'',180)||null,
    session_id:sessionId(),
    app_version:VERSION,
    metadata:data.metadata&&typeof data.metadata==='object'?data.metadata:{}
  };
  try{
    const r=await fetch(ENDPOINT,{method:'POST',headers:{apikey:API_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(body),keepalive:true});
    return r.ok;
  }catch{return false}
}
function qcmClick(el){
  const id=el.id||'';const oc=el.getAttribute?.('onclick')||'';const txt=el.textContent||'';
  return ['v76Revise','v7Smart','v72Progressive'].includes(id)||/startQuick|startSmart|startProgressive|startTodayV75|begin\s*\(/.test(oc)||/réviser maintenant|série rapide|révision intelligente/i.test(txt);
}
function resourceType(el){
  const ctx=(el.closest?.('.card,.sheet,section,div')?.textContent||'').toLowerCase();
  if(/vocal|audio|écouter/.test(ctx))return 'vocal';
  if(/infograph/.test(ctx))return 'infographic';
  if(/fiche|pdf|cours/.test(ctx))return 'sheet';
  return 'sheet';
}
function installClickTracking(){
  document.addEventListener('click',e=>{
    const el=e.target.closest?.('button,a');if(!el)return;
    if(qcmClick(el)){track('qcm_start',{resource_type:'qcm',resource_id:safe(el.id||el.textContent,120)});return}
    const href=el.href||el.getAttribute?.('href')||'';
    if(/drive\.google\.com/.test(href)){
      const type=resourceType(el),rid=driveId(href)||safe(el.textContent||href,160);
      track(type==='vocal'?'vocal_start':'resource_open',{resource_type:type,resource_id:rid});
    }
  },true);
}
function watchFinish(){
  const tick=()=>{
    const r=$('result');if(!r)return;
    const visible=!r.classList.contains('hidden')&&getComputedStyle(r).display!=='none';
    if(visible&&!resultVisible){track('qcm_finish',{resource_type:'qcm'});resultVisible=true}
    if(!visible)resultVisible=false;
  };
  tick();
  setInterval(tick,2000);
}
function privacyUI(){
  if($('v77Privacy'))return;
  const host=$('v76More')||[...document.querySelectorAll('#home .card')].pop();if(!host)return;
  const box=document.createElement('div');box.id='v77Privacy';box.className='small';box.style.cssText='margin-top:12px;padding:10px 12px;border:1px solid #e6e0ef;border-radius:12px;line-height:1.45';
  box.innerHTML=`<b>📊 Statistiques anonymes</b><br><span id="v77PrivacyText"></span><br><button id="v77PrivacyToggle" class="btn outline" type="button" style="margin-top:8px;padding:7px 10px"></button>`;
  host.appendChild(box);
  const refresh=()=>{const on=enabled();$('v77PrivacyText').textContent=on?'L’application envoie uniquement des événements d’usage (ouverture, QCM, ressources, vocaux), sans nom, email ni score.':'Le suivi statistique est désactivé sur cet appareil.';$('v77PrivacyToggle').textContent=on?'Désactiver les statistiques':'Activer les statistiques'};
  $('v77PrivacyToggle').onclick=()=>{localStorage.setItem(OPTOUT,enabled()?'1':'0');refresh()};refresh();
}
function init(){
  track('app_open',{resource_type:'app',resource_id:'home'});
  installClickTracking();watchFinish();
  let n=0,t=setInterval(()=>{privacyUI();if($('v77Privacy')||++n>80)clearInterval(t)},150);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.IFSI_V77={version:VERSION,track,enabled,setEnabled:v=>{localStorage.setItem(OPTOUT,v?'0':'1')}};
})();
