(()=>{'use strict';
const V='8.30.5',$=id=>document.getElementById(id);
function css(){
 if($('v8303css'))return;
 const s=document.createElement('style');s.id='v8303css';s.textContent=`
 body.v86-home #v76Home>#v8303HomeExtras{display:grid!important}
 #v8303HomeExtras{display:grid;gap:12px;width:100%;min-width:0}
 body.v86-home #v8303HomeExtras #v742Changelog{display:block!important}
 body.v86-home #v8303HomeExtras .v72-feedback{display:block!important}
 #v8303HomeExtras>.card{margin:0!important}
 @media(max-width:620px){#v8303HomeExtras{gap:10px}}
 `;document.head.appendChild(s)
}
function isHome(){const h=$('home');return !!h&&!h.classList.contains('hidden')}
function normalizeHomeState(){
 const on=isHome();
 document.body.classList.toggle('v85-home',on);
 document.body.classList.toggle('v86-home',on);
}
function reapplyChangelog(){
 window.IFSI_CHANGELOG?.refresh?.();
 for(const k of ['IFSI_V822_CHANGELOG','IFSI_V826_CHANGELOG','IFSI_V828_CHANGELOG','IFSI_V829_CHANGELOG','IFSI_V830_CHANGELOG','IFSI_V8301_CHANGELOG','IFSI_V8302_CHANGELOG','IFSI_V8303_CHANGELOG','IFSI_V8304_CHANGELOG','IFSI_V8305_CHANGELOG'])window[k]?.patch?.();
}
function ensureImprove(){
 let card=document.querySelector('.v72-feedback');
 if(card)return card;
 const host=$('home');if(!host)return null;
 card=document.createElement('div');card.className='card v72-feedback';card.id='v8303ImproveCard';
 card.innerHTML='<b>💡 Une idée pour améliorer l’appli ?</b><div class="small" style="margin:5px 0 10px">Propose une évolution. Le message sera préparé pour le groupe « Problème technique ».</div><button id="v8303SuggestBtn" class="btn secondary full">💡 Proposer une amélioration</button>';
 const b=card.querySelector('#v8303SuggestBtn');b.onclick=()=>{
   const old=$('v72SuggestBtn');if(old&&old!==b)return old.click();
   const modal=$('v72SuggestModal');if(modal)return modal.classList.remove('hidden');
   const settings=$('v87Improve');if(settings)return settings.click();
   alert('Le formulaire d’amélioration est indisponible pour le moment.');
 };
 return card
}
function ensureExtras(){
 const host=$('v76Home');if(!host)return false;
 let extras=$('v8303HomeExtras');
 if(!extras){extras=document.createElement('div');extras.id='v8303HomeExtras';const tools=$('v86Tools');tools?.insertAdjacentElement('afterend',extras)||host.appendChild(extras)}
 reapplyChangelog();
 const improve=ensureImprove(),log=$('v742Changelog');
 if(improve&&improve.parentElement!==extras)extras.appendChild(improve);
 if(log&&log.parentElement!==extras)extras.appendChild(log);
 return !!improve&&!!log
}
function refreshDynamic(){
 window.IFSI_V76?.refresh?.();
 window.IFSI_V813?.apply?.();
}
function sync(){
 css();normalizeHomeState();ensureExtras();refreshDynamic();
}
function patchNavigation(){
 if(window.__IFSI_V8303_NAV)return;window.__IFSI_V8303_NAV=1;
 if(typeof window.show==='function'){const old=window.show;window.show=function(){const out=old.apply(this,arguments);setTimeout(sync,0);return out}}
}
let ticks=0,lastVoc=-1;
function settle(){
 sync();patchNavigation();
 const voc=window.IFSI_V73?.getVocals?.()?.length??0;
 if(voc!==lastVoc){lastVoc=voc;window.IFSI_V76?.refresh?.()}
 if(++ticks>=80&&voc>0&&$('v742Changelog')&&$('v8303HomeExtras'))clearInterval(timer)
}
const timer=setInterval(settle,100);
window.addEventListener('load',()=>setTimeout(sync,0));
window.addEventListener('ifsi:v73-ready',()=>requestAnimationFrame(sync));
window.addEventListener('ifsi:v741-ready',()=>requestAnimationFrame(sync));
window.addEventListener('storage',()=>requestAnimationFrame(sync));
setTimeout(sync,0);
window.IFSI_V8303={version:V,sync};
})();