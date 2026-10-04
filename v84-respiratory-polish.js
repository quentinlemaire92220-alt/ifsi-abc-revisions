(()=>{'use strict';
const V='8.7',SECTION='anatomy83';
const $=id=>document.getElementById(id);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TERMS=[
 ['Fosses nasales','Entrée des voies aériennes supérieures.'],
 ['Pharynx','Carrefour aérodigestif situé derrière les cavités nasale et orale.'],
 ['Larynx','Segment des voies aériennes entre le pharynx et la trachée.'],
 ['Trachée','Conduit aérien qui se divise en deux bronches souches.'],
 ['Bronches souches','Premières divisions de la trachée vers chaque poumon.'],
 ['Bronchiole','Petite ramification distale de l’arbre bronchique.'],
 ['Alvéole','Zone terminale où s’effectuent les échanges gazeux avec les capillaires.'],
 ['Cils','Structures mobiles de l’épithélium participant au transport du mucus.'],
 ['Cellule caliciforme','Cellule épithéliale sécrétrice de mucus.']
];
function resources(){return window.IFSI_V741?.resourcesForCourse?.('systeme_respiratoire')||{sheets:[],infographics:[],questions:[],vocals:[]}}
function css(){if($('v84css'))return;const s=document.createElement('style');s.id='v84css';s.textContent=`
body.v84-anatomy-open .app{max-width:1180px}.v84-headrow{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:12px;align-items:stretch}.v84-progressbox{border:1px solid #d7ccef;background:#fff;border-radius:16px;padding:12px;display:flex;flex-direction:column;justify-content:center}.v84-progressbox b{font-size:22px;color:#6941c6}.v84-overview{display:grid;gap:12px}.v84-hero{border:1px solid #d7ccef;border-radius:20px;padding:16px;background:linear-gradient(135deg,#fff,#f5f1ff 55%,#eefaf8)}.v84-hero h3{margin:0 0 5px;font-size:22px}.v84-route{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.v84-route span{border:1px solid #d9d2e7;border-radius:999px;padding:7px 10px;background:#fff;font-size:12px;font-weight:800}.v84-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.v84-card{border:1px solid var(--line);background:var(--card);border-radius:17px;padding:13px}.v84-card h4{margin:0 0 6px}.v84-card p{margin:0;color:var(--muted);font-size:13px;line-height:1.45}.v84-resourcegrid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:11px}.v84-resource{border:1px solid var(--line);border-radius:15px;padding:11px;background:var(--card)}.v84-resource b{display:block;font-size:13px;margin-bottom:5px}.v84-vocab{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.v84-term{border:1px solid var(--line);border-radius:15px;background:var(--card);padding:12px}.v84-term b{color:#6941c6}.v84-term div{font-size:13px;color:var(--muted);margin-top:4px;line-height:1.4}.v84-tab{border:1px solid #ddd4eb;background:#fff;border-radius:12px;padding:8px 11px;font-weight:800;cursor:pointer}.v84-tab.on{background:#6941c6;color:#fff;border-color:#6941c6}.v84-hidden{display:none!important}.v84-modehint{margin-top:8px;border:1px dashed #d7ccef;border-radius:12px;padding:9px;background:#faf8ff;font-size:12px;color:var(--muted)}
body.v72-dark .v84-progressbox,body.v72-dark .v84-hero,body.v72-dark .v84-card,body.v72-dark .v84-resource,body.v72-dark .v84-term,body.v72-dark .v84-tab{background:#211e2a;color:#f4f0fb;border-color:#3b3548}
@media(max-width:800px){.v84-headrow{grid-template-columns:1fr}.v84-grid,.v84-resourcegrid,.v84-vocab{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function anatomyMastery(){try{return window.IFSI_V83?.mastery?.()||{done:0,total:0,pct:0}}catch{return{done:0,total:0,pct:0}}}
function findInfo(rx){return (resources().infographics||[]).find(x=>rx.test(x.title||''))}
function resCard(item,label){if(!item)return'';return `<div class="v84-resource"><b>${E(label)}</b><div class="small">${E((item.title||'').replace(/_/g,' '))}</div><a class="btn outline full" href="${E(item.url)}" target="_blank" rel="noopener" style="margin-top:8px">Ouvrir ↗</a></div>`}
function overviewHtml(){const r=resources(),a=findInfo(/Voies_Aeriennes_Trajet_Air/i),b=findInfo(/Alveoles_Membrane_Surfactant/i),c=findInfo(/Poumons_Hile_Plevre/i);return `<div class="v84-overview"><div class="v84-hero"><div class="small">SYSTÈME RESPIRATOIRE</div><h3>Du trajet de l’air aux échanges alvéolaires</h3><div class="small">Une entrée rapide avant les schémas interactifs, le QCM et les ressources du cours.</div><div class="v84-route"><span>Fosses nasales</span><span>→ Pharynx</span><span>→ Larynx</span><span>→ Trachée</span><span>→ Bronches</span><span>→ Bronchioles</span><span>→ Alvéoles</span></div></div><div class="v84-grid"><div class="v84-card"><h4>🫁 Voies aériennes</h4><p>Repérer les principaux conduits et suivre le trajet de l’air jusqu’à l’arbre bronchique.</p></div><div class="v84-card"><h4>🫧 Territoire alvéolaire</h4><p>Identifier les structures terminales et relier les alvéoles aux échanges gazeux.</p></div><div class="v84-card"><h4>🧹 Épithélium de conduction</h4><p>Reconnaître les cils et les cellules caliciformes présents sur le schéma du cours.</p></div></div><div class="card"><div class="row"><div><b>Ressources respiratoires</b><div class="small">${r.sheets.length} fiche(s) • ${r.infographics.length} infographie(s) • ${r.questions.length} QCM • ${r.vocals.length} vocal(aux)</div></div><span class="badge">Cours IFSI</span></div><div class="v84-resourcegrid">${resCard(a,'Trajet de l’air')}${resCard(b,'Alvéoles & membrane')}${resCard(c,'Poumons, hile & plèvre')}</div></div></div>`}
function vocabHtml(){return `<div class="card"><div class="row"><div><b>Vocabulaire du schéma</b><div class="small">Les repères essentiels utilisés dans le module interactif.</div></div><span class="badge">${TERMS.length} termes</span></div><div class="v84-vocab" style="margin-top:11px">${TERMS.map(x=>`<div class="v84-term"><b>${E(x[0])}</b><div>${E(x[1])}</div></div>`).join('')}</div></div>`}
function hideViews(){['v83Schemas','v83Synth','v83Qcm','v83Vocals','v84Overview','v84Vocab'].forEach(id=>$(id)?.classList.add('hidden'))}
function clearTabs(){document.querySelectorAll('#anatomy83 .v83-tab,#anatomy83 .v84-tab').forEach(x=>x.classList.remove('on'))}
function showCustom(view){hideViews();clearTabs();const id=view==='overview'?'v84Overview':'v84Vocab';$(id)?.classList.remove('hidden');document.querySelector(`[data-v84view="${view}"]`)?.classList.add('on')}
function decorateHead(){const head=document.querySelector('#anatomy83 .v83-head');if(!head||head.dataset.v84done)return;head.dataset.v84done='1';const top=head.querySelector('.row');if(top){const m=anatomyMastery(),box=document.createElement('div');box.className='v84-progressbox';box.innerHTML=`<span class="small">Progression schémas</span><b>${m.pct}%</b><div class="small">${m.done}/${m.total} structures maîtrisées</div>`;const wrap=document.createElement('div');wrap.className='v84-headrow';top.parentNode.insertBefore(wrap,top);wrap.appendChild(top);wrap.appendChild(box)}
const tabs=head.querySelector('.v83-tabs');if(tabs){const ov=document.createElement('button');ov.className='v84-tab';ov.dataset.v84view='overview';ov.textContent='◉ Vue d’ensemble';tabs.insertBefore(ov,tabs.firstChild);const voc=[...tabs.querySelectorAll('.v83-tab')].find(x=>x.dataset.v83view==='vocals');const vb=document.createElement('button');vb.className='v84-tab';vb.dataset.v84view='vocab';vb.textContent='📚 Vocabulaire';tabs.insertBefore(vb,voc||null);ov.onclick=()=>showCustom('overview');vb.onclick=()=>showCustom('vocab');tabs.querySelectorAll('[data-v83view]').forEach(x=>x.addEventListener('click',()=>{$('v84Overview')?.classList.add('hidden');$('v84Vocab')?.classList.add('hidden');document.querySelectorAll('[data-v84view]').forEach(y=>y.classList.remove('on'))}))}}
function decorateBody(){const page=document.querySelector('#anatomy83 .v83-page');if(!page||$('v84Overview'))return;const head=page.querySelector('.v83-head'),ov=document.createElement('div');ov.id='v84Overview';ov.className='hidden';ov.innerHTML=overviewHtml();head.insertAdjacentElement('afterend',ov);const vb=document.createElement('div');vb.id='v84Vocab';vb.className='hidden';vb.innerHTML=vocabHtml();ov.insertAdjacentElement('afterend',vb);const fig=document.querySelector('#anatomy83 .v83-figure');if(fig&&!fig.querySelector('.v84-modehint')){const h=document.createElement('div');h.className='v84-modehint';h.innerHTML='<b>Astuce :</b> commence par Apprendre, passe à S’entraîner, puis termine par Tester pour valider les repères.';fig.appendChild(h)}}
function updateBodyClass(){const sec=$(SECTION);document.body.classList.toggle('v84-anatomy-open',!!sec&&!sec.classList.contains('hidden'))}
function decorateSchemaUI(){
 const tab=[...document.querySelectorAll('#anatomy83 [data-v83view]')].find(x=>x.dataset.v83view==='schemas');
 if(tab)tab.textContent='🧩 Schémas interactifs (3)';
 const box=$('v83Schemas');
 if(box&&!box.querySelector('.v84-schema-intro')){
   const intro=document.createElement('div');intro.className='card v84-schema-intro';
   intro.innerHTML='<b>🧩 3 schémas interactifs disponibles</b><div class="small" style="margin-top:4px">Choisis ci-dessous : Voies respiratoires, Arbre bronchique ou Épithélium de conduction. Ensuite utilise Apprendre, S’entraîner ou Tester.</div>';
   box.insertBefore(intro,box.firstChild);
 }
 document.querySelectorAll('#anatomy83 [data-v83diagram]').forEach(x=>{
   if(x.dataset.v84scroll)return;x.dataset.v84scroll='1';
   x.addEventListener('click',()=>setTimeout(()=>document.querySelector('#anatomy83 .v83-figure')?.scrollIntoView({behavior:'smooth',block:'start'}),120));
 });
}
function decorate(){css();decorateHead();decorateBody();decorateSchemaUI();updateBodyClass()}
let t=0;const timer=setInterval(()=>{t++;decorate();if(t>300)clearInterval(timer)},100);new MutationObserver(()=>requestAnimationFrame(decorate)).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});window.addEventListener('storage',decorate);window.IFSI_V84={version:V,decorate};
})();
