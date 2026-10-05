(()=>{'use strict';
const V='8.23',$=id=>document.getElementById(id);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const QUICK=['systeme_urinaire','systeme_respiratoire','systeme_endocrinien','biomolecules'];
const RECENT=[
 {id:'nervous_resources_20261005',kind:'Cours',icon:'🧠',title:'Système nerveux',detail:'49 QCM + 4 infographies',date:'5 oct.',courseId:'systeme_nerveux',action:'course'},

 {id:'immune_boards_20261005',kind:'Schémas',icon:'🛡️',title:'Système immunitaire',detail:'8 planches anatomiques HD',date:'5 oct.',courseId:'systeme_immunitaire',action:'boards'},

 {id:'endocrine_boards_20261005',kind:'Schémas',icon:'🧪',title:'Système endocrinien',detail:'8 planches anatomiques HD',date:'5 oct.',courseId:'systeme_endocrinien',action:'boards'},
 {id:'urinary_boards_20261004',kind:'Schémas',icon:'💧',title:'Système urinaire',detail:'8 planches anatomiques (atlas urinaire)',date:'4 oct.',courseId:'systeme_urinaire',action:'boards'},
 {id:'resp_boards_20261004',kind:'Schémas',icon:'🫁',title:'Système respiratoire',detail:'8 planches anatomiques (atlas respiratoire)',date:'4 oct.',courseId:'systeme_respiratoire',action:'boards'}
];
function css(){
 if($('v813css'))return;const s=document.createElement('style');s.id='v813css';s.textContent=`
 body.v86-home #v86Tools{display:block!important}
 body.v86-home #v86Settings{display:none!important}
 .v813-wrap{display:grid;grid-template-columns:1fr!important;gap:12px;width:100%}
 .v813-search-card{border:1px solid var(--line);background:var(--card);border-radius:18px;padding:14px;width:100%}
 .v813-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
 .v813-head h3{margin:0;font-size:17px}.v813-head .btn{padding:7px 10px;font-size:11px}
 .v813-searchbox{position:relative;margin-top:10px}
 .v813-searchbox input{width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:14px;padding:12px 13px;font:inherit;outline:none}
 .v813-searchbox input:focus{border-color:#7a52d8;box-shadow:0 0 0 3px rgba(105,65,198,.12)}
 .v813-quick{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
 .v813-chip{border:1px solid var(--line);background:color-mix(in srgb,var(--card) 92%,#7046d9 8%);color:var(--ink);border-radius:999px;padding:7px 10px;font-size:11px;font-weight:800;cursor:pointer}
 .v813-chip:hover{border-color:#7a52d8}
 .v813-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:9px}
 .v813-course{border:1px solid var(--line);background:color-mix(in srgb,var(--card) 95%,#7046d9 5%);color:var(--ink);border-radius:13px;padding:10px;text-align:left;cursor:pointer;min-width:0}
 .v813-course:hover{border-color:#7a52d8}.v813-course b{display:block;font-size:12px;line-height:1.25}.v813-course small{display:block;color:var(--muted);font-size:9px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .v813-empty{color:var(--muted);font-size:11px;margin-top:8px}
 body.v72-dark .v813-chip,body.v72-dark .v813-course{background:#211e2a}
 @media(max-width:620px){.v813-results{grid-template-columns:1fr}.v813-head h3{font-size:15px}.v813-search-card{padding:12px}}
 `;document.head.appendChild(s)
}
function registry(){return window.IFSI_V741?.getRegistry?.()?.courses||[]}
function info(c){
 const r=window.IFSI_V741?.resourcesForCourse?.(c.id)||{questions:[],sheets:[],infographics:[],vocals:[]};
 return {c,r,total:(r.questions?.length||0)+(r.sheets?.length||0)+(r.infographics?.length||0)+(r.vocals?.length||0)}
}
function available(){
 return registry().filter(c=>c.showInCourses!==false).map(info).filter(x=>x.total>0)
}
function openCourse(id){
 const c=registry().find(x=>x.id===id);if(!c)return;
 if(typeof window.openCourse74==='function')window.openCourse74(c.label);else window.showCourses74?.()
}
function openBoards(id){
 if(window.IFSI_V82?.showSystemBoards)return window.IFSI_V82.showSystemBoards(id);
 window.IFSI_V82?.showAnatomy?.()
}
function resultButton(x){
 const r=x.r||{};return `<button class="v813-course" type="button" data-v813course="${E(x.c.id)}"><b>${E(x.c.label)}</b><small>${r.questions?.length||0} QCM • ${r.sheets?.length||0} fiche${(r.sheets?.length||0)>1?'s':''} • ${r.infographics?.length||0} info • ${r.vocals?.length||0} vocal${(r.vocals?.length||0)>1?'aux':''}</small></button>`
}
function renderResults(){
 const input=$('v813Search'),box=$('v813Results'),quick=$('v813Quick');if(!box||!input)return;
 const term=N(input.value);
 if(!term){
   box.innerHTML='';if(quick)quick.innerHTML=QUICK.map(id=>{const x=available().find(y=>y.c.id===id);return x?`<button class="v813-chip" type="button" data-v813course="${E(id)}">${E(x.c.label)}</button>`:''}).join('');
 }else{
   if(quick)quick.innerHTML='';
   const rows=available().filter(x=>N([x.c.label,...(x.c.aliases||[]),x.c.ue||'',x.c.domain||''].join(' ')).includes(term)).slice(0,8);
   box.innerHTML=rows.length?rows.map(resultButton).join(''):`<div class="v813-empty">Aucun cours trouvé pour « ${E(input.value.trim())} ».</div>`;
 }
 bindCourseButtons()
}
function bindCourseButtons(){document.querySelectorAll('[data-v813course]').forEach(b=>b.onclick=()=>openCourse(b.dataset.v813course))}
function mount(){
 const host=$('v86Tools');if(!host||host.dataset.v813==='1')return false;
 host.dataset.v813='1';host.className='v86-tools v813-wrap';
 host.innerHTML=`<section class="v813-search-card"><div class="v813-head"><div><h3>🔎 Rechercher un cours</h3><div class="small">Accès direct à une matière et à toutes ses ressources.</div></div><button id="v813AllCourses" class="btn outline" type="button">Tous les cours →</button></div><div class="v813-searchbox"><input id="v813Search" type="search" autocomplete="off" placeholder="Ex. système urinaire, biomolécules, calculs…"></div><div id="v813Quick" class="v813-quick"></div><div id="v813Results" class="v813-results"></div></section>
`;
 $('v813AllCourses').onclick=()=>window.showCourses74?.();
 $('v813Search').oninput=renderResults;
 renderResults();return true
}
function apply(){css();mount();$('v86Settings')?.remove()}
let tries=0;const t=setInterval(()=>{tries++;apply();if($('v86Tools')?.dataset.v813==='1'||tries>240)clearInterval(t)},100);
window.addEventListener('ifsi:v741-ready',()=>requestAnimationFrame(apply));
window.addEventListener('storage',()=>requestAnimationFrame(apply));
window.IFSI_V813={version:V,apply,openCourse,openBoards,recent:()=>RECENT.map(x=>({...x}))};
})();