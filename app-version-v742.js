(()=>{
'use strict';
const VERSION='8.30.4';
const BUILD_URL='./build-meta.json';
const TITLE=`V${VERSION}`;
const READY=`Application prête • V${VERSION} : nouveautés et amélioration visibles dès l’ouverture de l’accueil.`;
const $=id=>document.getElementById(id);
let checking=false;
function buildStableVersionUI(){const legacy=$('update');if(!legacy)return false;const legacyBox=legacy.parentElement;const card=legacyBox?.parentElement;if(!legacyBox||!card)return false;legacyBox.id='legacyVersionSink';legacyBox.setAttribute('aria-hidden','true');legacyBox.style.display='none';let stable=$('appVersion742');if(!stable){stable=document.createElement('div');stable.id='appVersion742';stable.innerHTML=`<b id="appVersionTitle742">${TITLE}</b><div class="small" id="appVersionStatus742">${READY}</div>`;card.insertBefore(stable,card.firstChild)}return true}
function setStatus(text){const s=$('appVersionStatus742');if(s)s.textContent=text}
function restore(){const t=$('appVersionTitle742'),s=$('appVersionStatus742');if(t)t.textContent=TITLE;if(s)s.textContent=READY}
async function remoteBuild(){const r=await fetch(BUILD_URL+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('manifest version indisponible');return r.json()}
async function updateWorker(){const r=await navigator.serviceWorker?.getRegistration?.();if(r)await r.update();return r}
async function checkUpdate742(opts={}){if(checking)return;checking=true;const silent=!!opts.silent;if(!silent)setStatus('Vérification de la mise à jour…');try{const remote=await remoteBuild();await updateWorker();if(remote?.version&&remote.version!==VERSION){setStatus(`Mise à jour V${remote.version} détectée • installation…`);setTimeout(()=>location.reload(),1200)}else if(!silent){setStatus('Application à jour.')}}catch(e){if(!silent)setStatus('Vérification impossible pour le moment.')}finally{checking=false;if(!silent)setTimeout(restore,2200)}}
function init(){if(!buildStableVersionUI())return false;window.checkUpdate=()=>checkUpdate742({silent:false});restore();setTimeout(()=>checkUpdate742({silent:true}),1200);return true}
let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>120)clearInterval(timer)},50);
window.addEventListener('focus',()=>checkUpdate742({silent:true}));
setInterval(()=>checkUpdate742({silent:true}),15*60*1000);
window.IFSI_APP_VERSION=VERSION;window.IFSI_VERSION_UI={version:VERSION,restore,checkUpdate:checkUpdate742};
})();
