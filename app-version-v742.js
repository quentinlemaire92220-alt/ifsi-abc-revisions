(()=>{
'use strict';
const VERSION='8.23';
const TITLE=`V${VERSION} local`;
const READY=`Application prête • V${VERSION} : système cardiovasculaire synchronisé (53 QCM + fiche).`;
const $=id=>document.getElementById(id);
function buildStableVersionUI(){const legacy=$('update');if(!legacy)return false;const legacyBox=legacy.parentElement;const card=legacyBox?.parentElement;if(!legacyBox||!card)return false;legacyBox.id='legacyVersionSink';legacyBox.setAttribute('aria-hidden','true');legacyBox.style.display='none';let stable=$('appVersion742');if(!stable){stable=document.createElement('div');stable.id='appVersion742';stable.innerHTML=`<b id="appVersionTitle742">${TITLE}</b><div class="small" id="appVersionStatus742">${READY}</div>`;card.insertBefore(stable,card.firstChild)}return true}
function setStatus(text){const s=$('appVersionStatus742');if(s)s.textContent=text}
function restore(){const t=$('appVersionTitle742'),s=$('appVersionStatus742');if(t)t.textContent=TITLE;if(s)s.textContent=READY}
async function checkUpdate742(){setStatus('Vérification de la mise à jour…');try{const r=await navigator.serviceWorker.getRegistration();if(r)await r.update();setStatus('Vérification terminée. Ferme puis rouvre l’application si une mise à jour est disponible.')}catch{setStatus('Vérification impossible.')}setTimeout(restore,2200)}
function init(){if(!buildStableVersionUI())return false;window.checkUpdate=checkUpdate742;restore();return true}
let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>120)clearInterval(timer)},50);
window.IFSI_APP_VERSION=VERSION;window.IFSI_VERSION_UI={version:VERSION,restore,checkUpdate:checkUpdate742};
})();