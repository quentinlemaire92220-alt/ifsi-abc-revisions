(()=>{'use strict';
const V=window.IFSI_APP_VERSION||'8.30.4', $=id=>document.getElementById(id);
const DARK='ifsiabc_v72_dark',TIMER='ifsiabc_v72_timer';
function css(){if($('v86css'))return;const s=document.createElement('style');s.id='v86css';s.textContent=`
body.v86-home #v76More,body.v86-home #v742Changelog,body.v86-home #v72Changelog{display:none!important}
body.v86-home #home>.section,body.v86-home #home>.card,body.v86-home #home>.grid,body.v86-home #home>.stack{display:none!important}
body.v86-home #home>#v76Home{display:grid!important}
body.v86-home #v76Home>#v82Primary,body.v86-home #v76Home>.v76-today,body.v86-home #v86Tools{display:block!important}
body.v86-home #v76Home>*:not(#v82Primary):not(.v76-today):not(#v86Tools):not(#v8303HomeExtras){display:none!important}
.v86-tools{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.v86-tool{border:1px solid var(--line);background:var(--card);border-radius:15px;padding:11px 12px;color:var(--ink);text-align:left;cursor:pointer;display:flex;align-items:center;gap:9px;min-width:0}
.v86-tool .i{font-size:20px;flex:0 0 auto}.v86-tool b{display:block;font-size:13px}.v86-tool small{display:block;color:var(--muted);font-size:10px;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v86-dialog{border:0;border-radius:22px;padding:0;max-width:520px;width:min(92vw,520px);background:var(--card);color:var(--ink);box-shadow:0 24px 70px rgba(25,18,50,.28)}
.v86-dialog::backdrop{background:rgba(24,20,34,.48);backdrop-filter:blur(2px)}
.v86-sheet{padding:18px}.v86-sheet h3{margin:0}.v86-setting{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid var(--line)}
.v86-setting:last-of-type{border-bottom:0}.v86-setting b{display:block}.v86-setting small{display:block;color:var(--muted);margin-top:2px}.v86-setting input{width:22px;height:22px}
.v86-about{border:1px solid var(--line);border-radius:15px;padding:11px;margin-top:10px;background:color-mix(in srgb,var(--card) 88%,#7046d9 12%)}
.v86-sheet-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}
body.v86-home .v76-today{margin:0}
@media(max-width:420px){.v86-tools{grid-template-columns:1fr 1fr}.v86-tool{padding:10px}.v86-tool small{display:none}}
`;document.head.appendChild(s)}
function tools(){
 const host=$('v76Home');if(!host)return;
 let box=$('v86Tools');if(!box){box=document.createElement('section');box.id='v86Tools';box.className='v86-tools';box.innerHTML=`
 <button id="v86Search" class="v86-tool"><span class="i">🔎</span><span><b>Rechercher</b><small>Cours, QCM et ressources</small></span></button>
 <button id="v86Settings" class="v86-tool"><span class="i">⚙️</span><span><b>Réglages</b><small>Affichage et application</small></span></button>`;
 const today=host.querySelector('.v76-today');if(today)today.insertAdjacentElement('afterend',box);else host.appendChild(box)}
 $('v86Search').onclick=()=>{window.IFSI_V81?.showHub?.();setTimeout(()=>{if(window.IFSI_V828?.openSearch)return window.IFSI_V828.openSearch();$('v828SearchToggle')?.click();const el=$('v81S');el?.scrollIntoView({behavior:'smooth',block:'center'});el?.focus()},180)};
 $('v86Settings').onclick=()=>window.IFSI_V87?.showSettings?.()||openSettings();
}
function dialog(){
 let d=$('v86SettingsDialog');if(d)return d;d=document.createElement('dialog');d.id='v86SettingsDialog';d.className='v86-dialog';d.innerHTML=`<div class="v86-sheet">
 <div class="row"><div><h3>⚙️ Réglages</h3><div class="small">Options locales de l’application</div></div><button id="v86Close" class="btn outline">Fermer</button></div>
 <label class="v86-setting"><span><b>🌙 Mode sombre</b><small>Enregistré sur cet appareil</small></span><input id="v86Dark" type="checkbox"></label>
 <label class="v86-setting"><span><b>⏱️ Chronomètre QCM</b><small>Afficher le temps pendant les séries</small></span><input id="v86Timer" type="checkbox"></label>
 <div class="v86-about"><b>IFSI ABC Révisions — V${V}</b><div class="small" style="margin-top:4px">Accueil simplifié avec nouveautés et informations utiles synchronisées.</div></div>
 <div class="v86-sheet-actions"><button id="v86Improve" class="btn outline">💡 Amélioration</button><button id="v86Update" class="btn primary">↻ Vérifier la mise à jour</button></div>
 </div>`;document.body.appendChild(d);
 $('v86Close').onclick=()=>d.close();
 $('v86Dark').onchange=e=>{localStorage.setItem(DARK,e.target.checked?'1':'0');document.body.classList.toggle('v72-dark',e.target.checked)};
 $('v86Timer').onchange=e=>localStorage.setItem(TIMER,e.target.checked?'1':'0');
 $('v86Improve').onclick=()=>{d.close();const b=$('v72SuggestBtn')||[...document.querySelectorAll('button')].find(x=>x.id!=='v86Improve'&&x.id!=='v87Improve'&&/Proposer une amélioration/i.test(x.textContent));if(b)b.click();else alert('Le formulaire d’amélioration est indisponible pour le moment.')};
 $('v86Update').onclick=async()=>{const b=$('v86Update');b.textContent='Vérification…';try{const r=await navigator.serviceWorker.getRegistration();if(r)await r.update();b.textContent='À jour ✓'}catch{b.textContent='Réessayer'}setTimeout(()=>b.textContent='↻ Vérifier la mise à jour',1800)};
 return d;
}
function openSettings(){const d=dialog();$('v86Dark').checked=localStorage.getItem(DARK)==='1';$('v86Timer').checked=localStorage.getItem(TIMER)==='1';d.showModal()}
function state(){const home=$('home');const on=!!home&&!home.classList.contains('hidden');document.body.classList.toggle('v86-home',on);if(on)tools()}
function apply(){css();$('v76More')?.remove();state()}
let tries=0;const t=setInterval(()=>{tries++;apply();if(($('v82Primary')&&document.querySelector('.v76-today'))||tries>200)clearInterval(t)},100);
window.addEventListener('storage',()=>requestAnimationFrame(apply));
window.IFSI_V86={version:V,apply,openSettings};
})();