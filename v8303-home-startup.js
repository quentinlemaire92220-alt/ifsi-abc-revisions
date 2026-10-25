(()=>{'use strict';
const V='8.30.135',$=id=>document.getElementById(id);
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
 if(!$('v742Changelog'))window.IFSI_CHANGELOG?.refresh?.();
 for(const k of ['IFSI_V822_CHANGELOG','IFSI_V826_CHANGELOG','IFSI_V828_CHANGELOG','IFSI_V829_CHANGELOG','IFSI_V830_CHANGELOG','IFSI_V8301_CHANGELOG','IFSI_V8302_CHANGELOG','IFSI_V8303_CHANGELOG','IFSI_V8304_CHANGELOG','IFSI_V8305_CHANGELOG','IFSI_V8306_CHANGELOG','IFSI_V8307_CHANGELOG','IFSI_V8308_CHANGELOG','IFSI_V8309_CHANGELOG','IFSI_V8310_CHANGELOG','IFSI_V8311_CHANGELOG','IFSI_V8312_CHANGELOG','IFSI_V8313_CHANGELOG','IFSI_V8314_CHANGELOG','IFSI_V8315_CHANGELOG','IFSI_V8316_CHANGELOG','IFSI_V8317_CHANGELOG','IFSI_V8318_CHANGELOG','IFSI_V8319_CHANGELOG','IFSI_V8320_CHANGELOG','IFSI_V8321_CHANGELOG','IFSI_V8322_CHANGELOG','IFSI_V8323_CHANGELOG','IFSI_V8324_CHANGELOG','IFSI_V8325_CHANGELOG','IFSI_V8326_CHANGELOG','IFSI_V8327_CHANGELOG','IFSI_V8328_CHANGELOG','IFSI_V8329_CHANGELOG','IFSI_V8330_CHANGELOG','IFSI_V8331_CHANGELOG','IFSI_V8332_CHANGELOG','IFSI_V8333_CHANGELOG','IFSI_V8334_CHANGELOG','IFSI_V8335_CHANGELOG','IFSI_V8336_CHANGELOG','IFSI_V8337_CHANGELOG','IFSI_V8338_CHANGELOG','IFSI_V8339_CHANGELOG','IFSI_V8340_CHANGELOG','IFSI_V8341_CHANGELOG','IFSI_V8342_CHANGELOG','IFSI_V8343_CHANGELOG','IFSI_V8344_CHANGELOG','IFSI_V8345_CHANGELOG','IFSI_V8346_CHANGELOG','IFSI_V8347_CHANGELOG','IFSI_V8350_CHANGELOG','IFSI_V8351_CHANGELOG','IFSI_V8352_CHANGELOG','IFSI_V8353_CHANGELOG','IFSI_V8354_CHANGELOG','IFSI_V8355_CHANGELOG','IFSI_V8357_CHANGELOG','IFSI_V8358_CHANGELOG','IFSI_V8359_CHANGELOG','IFSI_V8360_CHANGELOG','IFSI_V8361_CHANGELOG','IFSI_V8362_CHANGELOG','IFSI_V8365_CHANGELOG','IFSI_V8366_CHANGELOG','IFSI_V8367_CHANGELOG','IFSI_V8368_CHANGELOG','IFSI_V8369_CHANGELOG','IFSI_V8370_CHANGELOG','IFSI_V8371_CHANGELOG','IFSI_V8372_CHANGELOG','IFSI_V8373_CHANGELOG','IFSI_V8374_CHANGELOG','IFSI_V8375_CHANGELOG','IFSI_V8376_CHANGELOG','IFSI_V8377_CHANGELOG','IFSI_V8378_CHANGELOG','IFSI_V8379_CHANGELOG','IFSI_V8380_CHANGELOG','IFSI_V8381_CHANGELOG','IFSI_V8382_CHANGELOG','IFSI_V8383_CHANGELOG','IFSI_V8384_CHANGELOG','IFSI_V8385_CHANGELOG','IFSI_V8387_CHANGELOG','IFSI_V8388_CHANGELOG','IFSI_V8389_CHANGELOG','IFSI_V8390_CHANGELOG','IFSI_V8392_CHANGELOG','IFSI_V8393_CHANGELOG','IFSI_V8394_CHANGELOG','IFSI_V8395_CHANGELOG','IFSI_V8398_CHANGELOG','IFSI_V8400_CHANGELOG','IFSI_V8402_CHANGELOG','IFSI_V8404_CHANGELOG','IFSI_V8405_CHANGELOG','IFSI_V8406_CHANGELOG','IFSI_V8407_CHANGELOG','IFSI_V8408_CHANGELOG','IFSI_V8409_CHANGELOG','IFSI_V8410_CHANGELOG','IFSI_V8411_CHANGELOG','IFSI_V8412_CHANGELOG','IFSI_V8413_CHANGELOG','IFSI_V8414_CHANGELOG','IFSI_V8415_CHANGELOG','IFSI_V8417_CHANGELOG','IFSI_V8418_CHANGELOG','IFSI_V8419_CHANGELOG','IFSI_V8420_CHANGELOG','IFSI_V8421_CHANGELOG','IFSI_V8422_CHANGELOG','IFSI_V8424_CHANGELOG','IFSI_V8425_CHANGELOG','IFSI_V8426_CHANGELOG','IFSI_V8427_CHANGELOG','IFSI_V8428_CHANGELOG','IFSI_V8429_CHANGELOG','IFSI_V8434_CHANGELOG','IFSI_V8435_CHANGELOG'])window[k]?.patch?.();
}
function ensureImprove(){
 let card=document.querySelector('.v72-feedback');
 if(card)return card;
 const host=$('home');if(!host)return null;
 card=document.createElement('div');card.className='card v72-feedback';card.id='v8303ImproveCard';
 card.innerHTML='<b>💡 Une idée pour améliorer l’appli ?</b><div class="small" style="margin:5px 0 10px">Propose une évolution. Le message sera préparé pour le groupe « Technique ».</div><button id="v8303SuggestBtn" class="btn secondary full">💡 Proposer une amélioration</button>';
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
 const ready=$('v742Changelog')&&$('v8303HomeExtras')&&window.IFSI_V813;
 if(ready||++ticks>=20)clearInterval(timer)
}
const timer=setInterval(settle,100);
window.addEventListener('load',()=>setTimeout(sync,0));
window.addEventListener('ifsi:v73-ready',()=>requestAnimationFrame(sync));
window.addEventListener('ifsi:v741-ready',()=>requestAnimationFrame(sync));
window.addEventListener('storage',()=>requestAnimationFrame(sync));
setTimeout(sync,0);
window.IFSI_V8303={version:V,sync};
})();
