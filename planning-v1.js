(()=>{'use strict';
const $=id=>document.getElementById(id);
const SECTION='planningPromo';
const NAV_ID='vPlanningNav';
const K_PROMO='ifsiabc_planning_promo_v1';
const K_GROUP='ifsiabc_planning_group_v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let promo=localStorage.getItem(K_PROMO)==='A'?'A':'B';
let group=localStorage.getItem(K_GROUP)||'all';

function groupsFor(p){
 return p==='A'
  ?[{id:'all',label:'Tous'},{id:'A1',label:'A1'},{id:'A2',label:'A2'},{id:'G1',label:'Groupe 1'}]
  :[{id:'all',label:'Tous'},{id:'B1',label:'B1'},{id:'B2',label:'B2'},{id:'G2',label:'Groupe 2'}];
}
function css(){
 if($('planningPromoCss'))return;
 const s=document.createElement('style');s.id='planningPromoCss';s.textContent=`
 #v87Nav.vplanning-nav{grid-template-columns:repeat(6,1fr)}
 #planningPromo{padding-bottom:96px}
 .vp-head{border:1px solid #d9cfee;background:linear-gradient(135deg,#f7f3ff,#eefaf8);border-radius:22px;padding:16px;margin-bottom:12px}
 .vp-headline{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
 .vp-head h2{margin:3px 0 4px;font-size:24px}.vp-beta{font-size:10px;font-weight:900;letter-spacing:.07em;color:#6941c6;background:#eee7ff;border:1px solid #d6c9f7;border-radius:999px;padding:5px 8px;white-space:nowrap}
 .vp-segment{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:5px;background:#eeeaf3;border-radius:16px;margin:12px 0 8px}
 .vp-segment button{border:0;border-radius:12px;padding:11px 10px;background:transparent;color:#625c6e;font-weight:850;cursor:pointer}
 .vp-segment button.on{background:#7046d9;color:#fff;box-shadow:0 5px 14px rgba(95,57,190,.2)}
 .vp-filter-title{font-size:12px;font-weight:850;color:var(--muted);margin:11px 2px 7px}
 .vp-groups{display:flex;gap:7px;overflow:auto;padding-bottom:2px;scrollbar-width:none}.vp-groups::-webkit-scrollbar{display:none}
 .vp-group{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:8px 12px;font-weight:800;white-space:nowrap;cursor:pointer}
 .vp-group.on{border-color:#8c68df;background:#f0eaff;color:#6237c5}
 .vp-card{border:1px solid var(--line);background:var(--card);border-radius:20px;padding:15px;margin:10px 0;box-shadow:0 7px 22px rgba(55,39,94,.05)}
 .vp-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.vp-date{font-size:13px;color:var(--muted)}
 .vp-empty{margin-top:12px;border:1px dashed #cfc4e1;background:linear-gradient(145deg,#fff,#faf8ff);border-radius:18px;padding:18px;text-align:center}
 .vp-empty-icon{font-size:34px;margin-bottom:7px}.vp-empty h3{margin:0 0 5px;font-size:18px}.vp-empty p{margin:0 auto;max-width:560px;color:var(--muted);font-size:13px;line-height:1.45}
 .vp-source{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}.vp-source div{border:1px solid var(--line);border-radius:14px;padding:10px;background:var(--card)}
 .vp-source b{display:block;font-size:12px}.vp-source span{display:block;color:var(--muted);font-size:11px;margin-top:3px;line-height:1.35}
 .vp-week{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:10px}.vp-day{border:1px solid var(--line);border-radius:13px;padding:9px 4px;text-align:center;background:var(--card);font-size:11px}.vp-day b{display:block;font-size:14px;margin-top:2px}.vp-day.today{border-color:#9a7ce3;background:#f2ecff;color:#6237c5}
 .vp-legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;color:var(--muted);font-size:11px}.vp-dot{width:9px;height:9px;border-radius:50%;display:inline-block;margin-right:4px}.vp-dot.official{background:#7046d9}.vp-dot.promo{background:#0fa7a0}
 body.v72-dark .vp-head,body.v72-dark .vp-segment,body.v72-dark .vp-card,body.v72-dark .vp-group,body.v72-dark .vp-empty,body.v72-dark .vp-source div,body.v72-dark .vp-day{background:#211e2a;color:#f4f0fb;border-color:#3b3548}
 @media(max-width:520px){#v87Nav.vplanning-nav button{font-size:9px;padding-left:1px;padding-right:1px}#v87Nav.vplanning-nav button span{font-size:16px}.vp-source{grid-template-columns:1fr}.vp-week{gap:4px}.vp-day{padding:8px 2px}}
 `;document.head.appendChild(s);
}
function frenchDate(d){
 try{return new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d)}
 catch{return d.toLocaleDateString('fr-FR')}
}
function weekDays(){
 const d=new Date(),day=(d.getDay()+6)%7,monday=new Date(d);monday.setHours(12,0,0,0);monday.setDate(d.getDate()-day);
 return Array.from({length:5},(_,i)=>{const x=new Date(monday);x.setDate(monday.getDate()+i);return{x,label:['Lun','Mar','Mer','Jeu','Ven'][i],today:x.toDateString()===d.toDateString()}});
}
function validGroup(){
 const ids=new Set(groupsFor(promo).map(x=>x.id));if(!ids.has(group)){group='all';localStorage.setItem(K_GROUP,group)}
}
function render(){
 const sec=$(SECTION);if(!sec)return;validGroup();
 const days=weekDays();
 sec.innerHTML=`
 <div class="vp-head">
  <div class="vp-headline"><div><div class="small">VIE DE PROMO</div><h2>📅 Planning de la promo</h2><div class="small">Choisis ta promo puis ton groupe pour n'afficher que ce qui te concerne.</div></div><span class="vp-beta">BÊTA</span></div>
  <div class="vp-segment" role="group" aria-label="Choisir la promotion">
   <button type="button" data-vpromo="A" class="${promo==='A'?'on':''}" aria-pressed="${promo==='A'}">Promo A</button>
   <button type="button" data-vpromo="B" class="${promo==='B'?'on':''}" aria-pressed="${promo==='B'}">Promo B</button>
  </div>
  <div class="vp-filter-title">Sous-groupe</div>
  <div class="vp-groups">${groupsFor(promo).map(g=>`<button type="button" class="vp-group ${group===g.id?'on':''}" data-vgroup="${esc(g.id)}" aria-pressed="${group===g.id}">${esc(g.label)}</button>`).join('')}</div>
 </div>
 <div class="vp-card">
  <div class="vp-row"><div><b>Aujourd'hui</b><div class="vp-date">${esc(frenchDate(new Date()))}</div></div><span class="badge">0 cours importé</span></div>
  <div class="vp-empty"><div class="vp-empty-icon">🗓️</div><h3>Planning prêt à être connecté</h3><p>L'onglet est fonctionnel pour tester la navigation, Promo A / Promo B et les sous-groupes. Aucun horaire réel n'est affiché tant qu'une source officielle n'a pas été importée.</p></div>
  <div class="vp-source">
   <div><b>✅ Structure déjà prête</b><span>Promo, sous-groupe, vue du jour et vue semaine.</span></div>
   <div><b>📎 Source à ajouter ensuite</b><span>PDF, Excel, ICS ou capture du planning officiel.</span></div>
  </div>
 </div>
 <div class="vp-card">
  <div class="vp-row"><div><b>Cette semaine</b><div class="small">Aperçu du lundi au vendredi</div></div><span class="badge">Test interface</span></div>
  <div class="vp-week">${days.map(d=>`<div class="vp-day ${d.today?'today':''}">${d.label}<b>${d.x.getDate()}</b></div>`).join('')}</div>
  <div class="vp-legend"><span><i class="vp-dot official"></i>Officiel IFSI</span><span><i class="vp-dot promo"></i>Info promo</span></div>
 </div>`;
 sec.querySelectorAll('[data-vpromo]').forEach(b=>b.onclick=()=>{promo=b.dataset.vpromo;group='all';localStorage.setItem(K_PROMO,promo);localStorage.setItem(K_GROUP,group);render()});
 sec.querySelectorAll('[data-vgroup]').forEach(b=>b.onclick=()=>{group=b.dataset.vgroup;localStorage.setItem(K_GROUP,group);render()});
}
function addSection(){
 if($(SECTION))return true;const app=document.querySelector('.app');if(!app)return false;
 const sec=document.createElement('section');sec.id=SECTION;sec.className='hidden';
 const anchor=$('settings87')||document.querySelector('.app>nav');if(anchor)app.insertBefore(sec,anchor);else app.appendChild(sec);
 render();return true;
}
function hidePlanning(){$(SECTION)?.classList.add('hidden');$(NAV_ID)?.classList.remove('on')}
function showPlanning(){
 if(!addSection())return;
 document.querySelectorAll('.app>section').forEach(x=>x.classList.add('hidden'));
 $(SECTION)?.classList.remove('hidden');render();
 document.querySelectorAll('#v87Nav button').forEach(b=>b.classList.remove('on'));$(NAV_ID)?.classList.add('on');
 window.scrollTo({top:0,behavior:'smooth'});
}
function addNav(){
 const nav=$('v87Nav');if(!nav)return false;nav.classList.add('vplanning-nav');
 let b=$(NAV_ID);if(!b){b=document.createElement('button');b.id=NAV_ID;b.innerHTML='<span>🗓️</span>Planning';const home=$('v87Home');home?.insertAdjacentElement('afterend',b);b.onclick=showPlanning}
 if(!nav.dataset.planningBound){nav.dataset.planningBound='1';nav.addEventListener('click',e=>{const hit=e.target.closest('button');if(hit&&hit.id!==NAV_ID)hidePlanning()},true)}
 return true;
}
function init(){css();const a=addSection(),b=addNav();return a&&b}
let tries=0;const t=setInterval(()=>{tries++;if(init()||tries>240)clearInterval(t)},100);
window.IFSI_PLANNING={show:showPlanning,render,version:'beta-1'};
})();