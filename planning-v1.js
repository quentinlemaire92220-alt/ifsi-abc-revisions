(()=>{'use strict';
const $=id=>document.getElementById(id);
const SECTION='planningPromo';
const NAV_ID='vPlanningNav';
const K_PROMO='ifsiabc_planning_promo_v1';
const K_WEEK='ifsiabc_planning_week_v1';
const K_SNAPSHOT='ifsiabc_planning_snapshot_v1';
const K_PENDING='ifsiabc_planning_changes_pending_v1';
const UPDATED_AT='2026-10-07';
const SOURCE='CFDC - IFSI Antoine Béclère • Promotion 2026/2029 • Planning prévisionnel';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let promo=localStorage.getItem(K_PROMO)==='A'?'A':'B';

const WEEKS=[
 {id:'S5',label:'S5',start:'2026-09-28',end:'2026-10-02',range:'28 sept. - 2 oct.',events:[
  {date:'2026-09-28',start:'08:30',end:'12:30',promo:'all',ue:'UE B1 S1',type:'CM',title:'Appareil digestif',courseId:'systeme_digestif',room:'Amphi KB',teacher:'V Petit'},
  {date:'2026-09-28',start:'13:30',end:'16:30',promo:'all',ue:'UE B1 S1',type:'CM',title:'Maladies rhumato et inflammatoires',courseId:'rhumatismes_inflammatoires',room:'Amphi KB',teacher:'S Bitoun'},
  {date:'2026-09-29',start:'08:30',end:'12:30',promo:'all',ue:'UE B1 S1',type:'CM',title:'Appareil urinaire',courseId:'systeme_urinaire',room:'Amphi KB',teacher:'V Petit'},
  {date:'2026-09-29',start:'13:30',end:'17:30',promo:'all',ue:'UE B1 S1',type:'CM',title:'Infections bactériennes et virales, IST bactériennes',room:'Amphi KB',teacher:'M Dorbet • N Bourgeois'},
  {date:'2026-09-30',start:'09:00',end:'12:30',promo:'A',ue:'UE B3 S1',type:'TD',title:'Introduction aux plaies et pansements',room:'S10',teacher:'Mme Ecorcheville'},
  {date:'2026-09-30',start:'09:00',end:'12:00',promo:'B',ue:'UE B3 S1',type:'TD',title:'Repérage PSSM',room:'S11',teacher:'LBN'},
  {date:'2026-09-30',start:'13:30',end:'14:00',promo:'all',ue:'',type:'Info',title:'Présentation plateforme MyK',room:'Amphi ABC',teacher:'A Fournier - secrétaire'},
  {date:'2026-09-30',start:'14:00',end:'15:30',promo:'all',ue:'',type:'Info',title:'Élections des délégués',room:'Amphi ABC',teacher:'Frs 1èreA'},
  {date:'2026-09-30',start:'15:30',end:'16:30',promo:'all',ue:'UE E3 S1',type:'TD',title:'Présentation Blason collectif de promotion',room:'Amphi ABC',teacher:'P Quach • Frs 1èreA'},
  {date:'2026-09-30',start:'16:30',end:'17:00',promo:'all',ue:'UE E3 S1',type:'Asynchrone',title:'Test de personnalité (Big Five)',room:'Distanciel',teacher:''},
  {date:'2026-10-01',start:'09:00',end:'10:30',promo:'all',ue:'UE B1 S1',type:'CM',title:'Appareil respiratoire',courseId:'systeme_respiratoire',room:'Amphi KB',teacher:'S Dulong'},
  {date:'2026-10-01',start:'10:30',end:'12:30',promo:'all',ue:'UE A1 S1',type:'CM',title:'Fondamentaux, modèles conceptuelles et cliniques',room:'Amphi KB',teacher:'Mme Pierre'},
  {date:'2026-10-01',start:'13:30',end:'15:30',promo:'all',ue:'UE A1 S1',type:'CM',title:'Théorie des soins infirmiers et pratiques cliniques',room:'Amphi KB',teacher:'Mme Pierre'},
  {date:'2026-10-01',start:'15:30',end:'18:00',promo:'all',ue:'UE B2 S1',type:'CM',title:'Psychologie de la santé',courseId:'psychologie_sante',room:'Amphi KB',teacher:'Mme Khatir'},
  {date:'2026-10-02',start:'09:00',end:'12:30',promo:'B',ue:'UE B3 S1',type:'TP',title:'Simulation en santé J1',detail:'Tri des déchets • Hygiène des mains et FHA • Bionettoyage et environnement/chariot • EPI',room:'S13 • S3/Cafétéria • S2/S4/S5 • S10',teacher:'A. Fleurant AS • W Bernabelah AS • S Soufi AS • 2 Frs • 1 Fr'},
  {date:'2026-10-02',start:'09:00',end:'12:30',promo:'A',ue:'UE Stage',type:'Asynchrone',title:'Simulation Serious Game et Quizz',detail:'Visionnage film sur la toilette complète • fiche technique sur la toilette complète',room:'Distanciel',teacher:''},
  {date:'2026-10-02',start:'13:30',end:'17:00',promo:'A',ue:'UE B3 S1',type:'TP',title:'Simulation en santé J1',detail:'Tri des déchets • Hygiène des mains et FHA • Bionettoyage et environnement/chariot • EPI',room:'S13 • S3/Cafétéria • S2/S4/S5 • S10',teacher:'A. Fleurant AS • W Bernabelah AS • S Soufi AS • 2 Frs • 1 Fr'},
  {date:'2026-10-02',start:'13:30',end:'17:00',promo:'B',ue:'UE Stage',type:'Asynchrone',title:'Simulation Serious Game et Quizz',detail:'Visionnage film sur la toilette complète • fiche technique sur la toilette complète',room:'Distanciel',teacher:''}
 ]},
 {id:'S6',label:'S6',start:'2026-10-05',end:'2026-10-09',range:'5 - 9 oct.',events:[
  {date:'2026-10-05',start:'08:30',end:'12:30',promo:'all',ue:'UE B1 S1',type:'CM',title:'Appareil cardio-vasculaire',courseId:'systeme_cardiovasculaire',room:'Amphi KB',teacher:'S Dulong'},
  {date:'2026-10-05',start:'13:30',end:'17:30',promo:'all',ue:'UE B1 S1',type:'CM',title:'IST bactériennes, infections pulmonaires bactériennes, infections respiratoires virales',room:'Amphi KB',teacher:'Abgrall • Collarino'},
  {date:'2026-10-06',start:'09:00',end:'12:30',promo:'all',ue:'UE A2 S1',type:'CM',title:'Droit de la santé et droit de l’homme',room:'Amphi KB',teacher:'L Chevreau'},
  {date:'2026-10-06',start:'13:30',end:'17:30',promo:'all',ue:'UE B1 S1',type:'CM',title:'Introduction pharmacologie et thérapeutiques',courseId:'pharmacologie',room:'Amphi KB',teacher:'Dr Ait Taeb'},
  {date:'2026-10-07',start:'09:00',end:'12:00',promo:'A',ue:'UE B3 S1',type:'CM 1+2',title:'Initiation à l’administration médicamenteuse et sécurisation du médicament',room:'S10',teacher:'SL • MP'},
  {date:'2026-10-07',start:'09:00',end:'12:00',promo:'B',ue:'UE B3 S1',type:'CM 1+2',title:'Initiation à l’administration médicamenteuse et sécurisation du médicament',room:'S11',teacher:'SL • MP'},
  {date:'2026-10-07',start:'13:00',end:'16:30',promo:'B',ue:'UE B3 S1',type:'CM 1+2',title:'Introduction aux plaies et pansements',room:'S10',teacher:'Mme Ecorcheville'},
  {date:'2026-10-07',start:'13:30',end:'16:30',promo:'A',ue:'UE B3 S1',type:'TD',title:'PSSM repérage',room:'S11',teacher:'SL'},
  {date:'2026-10-08',start:'09:00',end:'12:30',promo:'all',ue:'UE A2 S1',type:'CM',title:'Droits des patients',room:'Amphi KB',teacher:'L Chevreau'},
  {date:'2026-10-08',start:'13:30',end:'15:30',promo:'all',ue:'UE B1 S1',type:'CM',title:'Appareil reproducteur',room:'Amphi KB',teacher:'V Petit'},
  {date:'2026-10-08',start:'15:30',end:'17:30',promo:'all',ue:'UE B1 S1',type:'CM',title:'Pharmacologie des antalgiques (E Campus)',courseId:'pharmacologie',room:'Distanciel',teacher:''},
  {date:'2026-10-09',start:'09:00',end:'12:30',promo:'A',ue:'UE Simulation',type:'TD',title:'Simulation en santé J2',detail:'Toilette complète au lit • Chambre des erreurs • Prescriptions et calculs • Découverte des dispositifs médicaux • Prise des paramètres vitaux',room:'S1 • S4 • S5 • S6 • S2/S3/S10/S13',teacher:'W Bernabelah AS • S Soufi AS • A Laleg AS • A Benatia AS • ID/SL/AC SSO'},
  {date:'2026-10-09',start:'09:00',end:'12:30',promo:'B',ue:'UE Simulation',type:'Asynchrone',title:'Réalisation de cas concrets et outil de révision PV',room:'Distanciel',teacher:''},
  {date:'2026-10-09',start:'13:30',end:'17:00',promo:'B',ue:'UE Simulation',type:'TD',title:'Simulation en santé J2',detail:'Toilette complète au lit • Chambre des erreurs • Prescriptions et calculs • Découverte des dispositifs médicaux • Prise des paramètres vitaux',room:'S1 • S4 • S5 • S6 • S2/S3/S10/S13',teacher:'W Bernabelah AS • S Soufi AS • A Laleg AS • A Benatia AS • ID/SL/AC SSO'},
  {date:'2026-10-09',start:'13:30',end:'17:00',promo:'A',ue:'UE Simulation',type:'Asynchrone',title:'Réalisation de cas concrets et outil de révision PV',room:'Distanciel',teacher:''}
 ]}
];

function todayISO(){const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
function weekForDate(date){return WEEKS.find(w=>date>=w.start&&date<=w.end)||null}
let selectedWeek=localStorage.getItem(K_WEEK);
if(!WEEKS.some(w=>w.id===selectedWeek))selectedWeek=(weekForDate(todayISO())||WEEKS[WEEKS.length-1]).id;

function css(){
 if($('planningPromoCss'))return;
 const s=document.createElement('style');s.id='planningPromoCss';s.textContent=`
 #v87Nav.vplanning-nav{grid-template-columns:repeat(6,1fr)}
 #planningPromo{padding-bottom:96px}
 .vp-head{border:1px solid #d9cfee;background:linear-gradient(135deg,#f7f3ff,#eefaf8);border-radius:22px;padding:16px;margin-bottom:12px}
 .vp-headline{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
 .vp-head h2{margin:3px 0 4px;font-size:24px}.vp-official{font-size:10px;font-weight:900;letter-spacing:.05em;color:#087a75;background:#e9f8f5;border:1px solid #b8e4dd;border-radius:999px;padding:5px 8px;white-space:nowrap}
 .vp-segment{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:5px;background:#eeeaf3;border-radius:16px;margin-top:12px}
 .vp-segment button{border:0;border-radius:12px;padding:11px 10px;background:transparent;color:#625c6e;font-weight:850;cursor:pointer}
 .vp-segment button.on{background:#7046d9;color:#fff;box-shadow:0 5px 14px rgba(95,57,190,.2)}
 .vp-week-tabs{display:flex;gap:7px;overflow:auto;padding:2px 0 4px;scrollbar-width:none}.vp-week-tabs::-webkit-scrollbar{display:none}
 .vp-week-tab{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:13px;padding:9px 11px;font-weight:800;white-space:nowrap;cursor:pointer}.vp-week-tab.on{border-color:#8c68df;background:#f0eaff;color:#6237c5}
 .vp-card{border:1px solid var(--line);background:var(--card);border-radius:20px;padding:15px;margin:10px 0;box-shadow:0 7px 22px rgba(55,39,94,.05)}
 .vp-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.vp-date{font-size:13px;color:var(--muted)}
 .vp-dayblock{margin-top:12px}.vp-dayhead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 2px 7px}.vp-dayhead b{font-size:14px}.vp-dayhead.today b{color:#6941c6}
 .vp-event{position:relative;display:grid;grid-template-columns:82px minmax(0,1fr) auto;gap:11px;align-items:start;border:1px solid var(--line);border-radius:16px;padding:11px 10px 11px 14px;margin:7px 0;background:var(--card);overflow:hidden}
 .vp-event:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:#7046d9}.vp-event[data-kind="TD"]:before{background:#0fa7a0}.vp-event[data-kind="TP"]:before{background:#3182e4}.vp-event[data-kind="ASYNC"]:before{background:#27a85e}.vp-event[data-kind="INFO"]:before{background:#d98a20}
 .vp-time{font-weight:900;font-size:13px;line-height:1.35}.vp-time small{display:block;font-weight:600;color:var(--muted);font-size:11px}
 .vp-main{min-width:0}.vp-ue{font-size:10px;font-weight:900;color:#6941c6;text-transform:uppercase;letter-spacing:.04em}.vp-title{font-size:14px;font-weight:850;line-height:1.3;margin:2px 0}.vp-meta,.vp-detail{font-size:11px;color:var(--muted);line-height:1.4}.vp-detail{margin-top:4px}
 .vp-type{font-size:10px;font-weight:900;border-radius:999px;padding:5px 8px;background:#efe8ff;color:#6941c6;white-space:nowrap}.vp-type.td{background:#e6f7f4;color:#087a75}.vp-type.tp{background:#e8f2ff;color:#2368b7}.vp-type.async{background:#eaf8ee;color:#187a3c}.vp-type.info{background:#fff2df;color:#9a5d08}
 .vp-empty{border:1px dashed #cfc4e1;background:#faf8ff;border-radius:15px;padding:13px;text-align:center;color:var(--muted);font-size:12px}
 .vp-source{margin-top:10px;border-top:1px solid var(--line);padding-top:10px;color:var(--muted);font-size:11px;line-height:1.4}
 .vp-actions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:11px}
 .vp-next{border-color:#cdbff1;background:linear-gradient(135deg,#faf8ff,#f0fbf8)}.vp-next-title{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.vp-next-label{font-size:10px;font-weight:950;letter-spacing:.05em;text-transform:uppercase;color:#6941c6;background:#efe8ff;border-radius:999px;padding:5px 8px}.vp-next-label.live{color:#087a75;background:#e5f7f3}
 .vp-resource-btn{margin-top:7px;border:1px solid #d4c8ee;background:#f6f1ff;color:#6038bf;border-radius:10px;padding:6px 9px;font:inherit;font-size:11px;font-weight:850;cursor:pointer}.vp-resource-btn:hover{background:#eee5ff}
 .vp-update{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:8px;color:var(--muted);font-size:11px}.vp-update strong{color:#087a75}.vp-changes{border-color:#f1cf94;background:#fffaf0}.vp-changes .vp-change-lines{margin:8px 0 0;padding-left:18px;font-size:11px;color:var(--muted);line-height:1.45}.vp-change-ack{border:0;background:transparent;color:#6941c6;font-weight:850;cursor:pointer;padding:4px 0}
 body.v72-dark .vp-head,body.v72-dark .vp-segment,body.v72-dark .vp-card,body.v72-dark .vp-week-tab,body.v72-dark .vp-event,body.v72-dark .vp-empty{background:#211e2a;color:#f4f0fb;border-color:#3b3548}
 @media(max-width:620px){#v87Nav.vplanning-nav button{font-size:9px;padding-left:1px;padding-right:1px}#v87Nav.vplanning-nav button span{font-size:16px}.vp-event{grid-template-columns:64px minmax(0,1fr);gap:9px}.vp-type{grid-column:2;justify-self:start}.vp-head h2{font-size:21px}}
 `;document.head.appendChild(s)
}
function frDate(iso,opts={weekday:'long',day:'numeric',month:'long'}){const [y,m,d]=iso.split('-').map(Number);return new Intl.DateTimeFormat('fr-FR',opts).format(new Date(y,m-1,d,12))}
function kind(type){const t=String(type||'').toUpperCase();if(t.startsWith('TD')||t==='CM 1+2'&&false)return t.startsWith('TD')?'TD':'CM';if(t.startsWith('TP'))return'TP';if(t.includes('ASYN'))return'ASYNC';if(t==='INFO')return'INFO';return'CM'}
function typeClass(type){const k=kind(type);return k==='TD'?'td':k==='TP'?'tp':k==='ASYNC'?'async':k==='INFO'?'info':''}
function eventsFor(w,date){return w.events.filter(e=>e.date===date&&(e.promo==='all'||e.promo===promo)).sort((a,b)=>a.start.localeCompare(b.start))}
function registryCourse(id){return (window.IFSI_V741?.getRegistry?.()?.courses||[]).find(c=>c.id===id)||null}
function openCourseResources(id){
 const c=registryCourse(id);
 if(window.IFSI_V813?.openCourse){window.IFSI_V813.openCourse(id);return}
 if(c?.label&&typeof window.openCourse74==='function'){window.openCourse74(c.label);return}
 window.showCourses74?.()
}
function eventCard(e){
 const meta=[e.room&&'📍 '+e.room,e.teacher&&'👤 '+e.teacher].filter(Boolean).join(' • '),resource=e.courseId?`<button type="button" class="vp-resource-btn" data-vcourse="${esc(e.courseId)}">📚 Voir les ressources</button>`:'';
 return `<article class="vp-event" data-kind="${kind(e.type)}"><div class="vp-time">${esc(e.start)}<small>à ${esc(e.end)}</small></div><div class="vp-main">${e.ue?`<div class="vp-ue">${esc(e.ue)}</div>`:''}<div class="vp-title">${esc(e.title)}</div>${meta?`<div class="vp-meta">${esc(meta)}</div>`:''}${e.detail?`<div class="vp-detail">${esc(e.detail)}</div>`:''}${resource}</div><span class="vp-type ${typeClass(e.type)}">${esc(e.type)}</span></article>`
}
function allPromoEvents(){return WEEKS.flatMap(w=>w.events).filter(e=>e.promo==='all'||e.promo===promo).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start))}
function eventDateTime(e,field){return new Date(e.date+'T'+e[field]+':00')}
function nextCourseCard(){
 const now=new Date(),es=allPromoEvents(),current=es.find(e=>eventDateTime(e,'start')<=now&&now<eventDateTime(e,'end')),next=current||es.find(e=>eventDateTime(e,'start')>now);
 if(!next)return `<div class="vp-card vp-next"><div class="vp-next-title"><span class="vp-next-label">À venir</span><b>Plus aucun cours importé</b></div><div class="small" style="margin-top:6px">Ajoute un nouveau planning officiel pour afficher la suite.</div></div>`;
 const live=!!current,sameDay=next.date===todayISO(),when=live?`En cours jusqu’à ${next.end}`:(sameDay?`Aujourd’hui à ${next.start}`:`${frDate(next.date,{weekday:'long',day:'numeric',month:'long'})} à ${next.start}`);
 return `<div class="vp-card vp-next"><div class="vp-next-title"><span class="vp-next-label ${live?'live':''}">${live?'● En cours':'Prochain cours'}</span><b>${esc(when)}</b></div><div style="margin-top:8px">${eventCard(next)}</div></div>`
}
function snapshot(){
 const out={};
 for(const e of WEEKS.flatMap(w=>w.events)){const k=[e.date,e.promo,e.ue||'',e.title].join('|');out[k]={start:e.start,end:e.end,room:e.room||'',type:e.type||''}}
 return out
}
function changeLabel(key,obj){const [date,,ue,title]=key.split('|');return `${frDate(date,{weekday:'short',day:'numeric',month:'short'})} • ${ue?ue+' • ':''}${title}${obj?.start?' • '+obj.start:''}`}
function reconcilePlanningChanges(){
 const cur=snapshot(),raw=localStorage.getItem(K_SNAPSHOT);
 if(raw){try{const old=JSON.parse(raw),added=[],removed=[],modified=[];for(const [k,v] of Object.entries(cur)){if(!old[k])added.push(changeLabel(k,v));else if(JSON.stringify(old[k])!==JSON.stringify(v))modified.push(changeLabel(k,v))}for(const [k,v] of Object.entries(old))if(!cur[k])removed.push(changeLabel(k,v));if(added.length||removed.length||modified.length)localStorage.setItem(K_PENDING,JSON.stringify({added,removed,modified,at:UPDATED_AT}))}catch{}}
 localStorage.setItem(K_SNAPSHOT,JSON.stringify(cur))
}
function pendingChanges(){try{return JSON.parse(localStorage.getItem(K_PENDING)||'null')}catch{return null}}
function changesCard(){
 const c=pendingChanges();if(!c)return '';
 const total=(c.added?.length||0)+(c.removed?.length||0)+(c.modified?.length||0),lines=[...(c.modified||[]).map(x=>'Modifié : '+x),...(c.added||[]).map(x=>'Ajouté : '+x),...(c.removed||[]).map(x=>'Retiré : '+x)].slice(0,4);
 return `<div class="vp-card vp-changes"><div class="vp-row"><div><b>🔔 Planning modifié</b><div class="small">${total} changement${total>1?'s':''} détecté${total>1?'s':''} depuis ta dernière consultation.</div></div><button type="button" id="vpAckChanges" class="vp-change-ack">J’ai vu</button></div>${lines.length?`<ul class="vp-change-lines">${lines.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</div>`
}
function todayCard(){
 const t=todayISO(),w=weekForDate(t);if(!w)return `<div class="vp-card"><div class="vp-row"><div><b>Aujourd'hui</b><div class="vp-date">${esc(frDate(t,{weekday:'long',day:'numeric',month:'long',year:'numeric'}))}</div></div></div><div class="vp-empty" style="margin-top:10px">Aucun planning importé pour cette date.</div></div>`;
 const es=eventsFor(w,t);
 return `<div class="vp-card"><div class="vp-row"><div><b>Aujourd'hui • Promo ${promo}</b><div class="vp-date">${esc(frDate(t,{weekday:'long',day:'numeric',month:'long',year:'numeric'}))}</div></div><span class="badge">${es.length} créneau${es.length>1?'x':''}</span></div><div style="margin-top:9px">${es.length?es.map(eventCard).join(''):'<div class="vp-empty">Aucun cours pour cette promo aujourd’hui.</div>'}</div></div>`
}
function weekDates(w){const [y,m,d]=w.start.split('-').map(Number),base=new Date(y,m-1,d,12);return Array.from({length:5},(_,i)=>{const x=new Date(base);x.setDate(base.getDate()+i);const p=n=>String(n).padStart(2,'0');return x.getFullYear()+'-'+p(x.getMonth()+1)+'-'+p(x.getDate())})}
function weekCard(w){
 const t=todayISO();
 return `<div class="vp-card"><div class="vp-row"><div><b>${esc(w.label)} • Promo ${promo}</b><div class="vp-date">${esc(frDate(w.start,{day:'numeric',month:'long'}))} - ${esc(frDate(w.end,{day:'numeric',month:'long',year:'numeric'}))}</div></div><span class="badge">Prévisionnel</span></div>
 ${weekDates(w).map(date=>{const es=eventsFor(w,date),today=date===t;return `<section class="vp-dayblock"><div class="vp-dayhead ${today?'today':''}"><b>${esc(frDate(date,{weekday:'long',day:'numeric',month:'long'}))}${today?' • Aujourd’hui':''}</b><span class="small">${es.length} créneau${es.length>1?'x':''}</span></div>${es.length?es.map(eventCard).join(''):'<div class="vp-empty">Aucun cours pour la Promo '+promo+'.</div>'}</section>`}).join('')}
 <div class="vp-actions"><button id="vpExportIcs" class="btn outline full">📅 Exporter ${esc(w.label)} vers mon calendrier (.ics)</button></div>
 <div class="vp-source">✅ Source officielle importée : ${esc(SOURCE)}.<br>Les documents S5 et S6 indiquent explicitement qu'il s'agit d'un <b>planning prévisionnel</b> : une modification communiquée par l'IFSI reste prioritaire.</div></div>`
}
function icsEscape(s){return String(s??'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
function icsStamp(date,time){return date.replaceAll('-','')+'T'+time.replace(':','')+'00'}
function exportIcs(){
 const w=WEEKS.find(x=>x.id===selectedWeek);if(!w)return;
 const es=w.events.filter(e=>e.promo==='all'||e.promo===promo);
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//IFSI ABC Révisions//Planning Promo//FR','CALSCALE:GREGORIAN','X-WR-CALNAME:IFSI Promo '+promo+' '+w.id,'X-WR-TIMEZONE:Europe/Paris'];
 es.forEach((e,i)=>{lines.push('BEGIN:VEVENT','UID:ifsi-'+w.id+'-'+promo+'-'+e.date+'-'+e.start.replace(':','')+'-'+i+'@ifsi-abc','DTSTART;TZID=Europe/Paris:'+icsStamp(e.date,e.start),'DTEND;TZID=Europe/Paris:'+icsStamp(e.date,e.end),'SUMMARY:'+icsEscape((e.ue?e.ue+' - ':'')+e.type+' : '+e.title),'LOCATION:'+icsEscape(e.room||''),'DESCRIPTION:'+icsEscape([e.detail,e.teacher&&'Intervenant : '+e.teacher,'Source : '+SOURCE].filter(Boolean).join('\n')),'END:VEVENT')});
 lines.push('END:VCALENDAR');
 const blob=new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='IFSI_'+w.id+'_Promo_'+promo+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)
}
function render(){
 const sec=$(SECTION);if(!sec)return;
 const w=WEEKS.find(x=>x.id===selectedWeek)||WEEKS[WEEKS.length-1];
 sec.innerHTML=`<div class="vp-head"><div class="vp-headline"><div><div class="small">VIE DE PROMO</div><h2>📅 Planning de la promo</h2><div class="small">Planning officiel S5 et S6 • sélection personnalisée par promotion.</div><div class="vp-update">🕘 Mis à jour le <strong>${esc(frDate(UPDATED_AT,{day:'numeric',month:'long',year:'numeric'}))}</strong> • 🔔 changements suivis sur cet appareil</div></div><span class="vp-official">✓ OFFICIEL IFSI</span></div>
 <div class="vp-segment" role="group" aria-label="Choisir la promotion"><button type="button" data-vpromo="A" class="${promo==='A'?'on':''}" aria-pressed="${promo==='A'}">Promo A</button><button type="button" data-vpromo="B" class="${promo==='B'?'on':''}" aria-pressed="${promo==='B'}">Promo B</button></div></div>
 ${changesCard()}
 ${nextCourseCard()}
 ${todayCard()}
 <div class="vp-card"><div class="vp-row"><div><b>Choisir la semaine</b><div class="small">2 plannings officiels importés</div></div></div><div class="vp-week-tabs">${WEEKS.map(x=>`<button type="button" class="vp-week-tab ${x.id===selectedWeek?'on':''}" data-vweek="${x.id}">${x.label} • ${x.range}</button>`).join('')}</div></div>
 ${weekCard(w)}`;
 sec.querySelectorAll('[data-vpromo]').forEach(b=>b.onclick=()=>{promo=b.dataset.vpromo;localStorage.setItem(K_PROMO,promo);render()});
 sec.querySelectorAll('[data-vweek]').forEach(b=>b.onclick=()=>{selectedWeek=b.dataset.vweek;localStorage.setItem(K_WEEK,selectedWeek);render()});
 $('vpExportIcs')?.addEventListener('click',exportIcs);
 sec.querySelectorAll('[data-vcourse]').forEach(b=>b.onclick=()=>openCourseResources(b.dataset.vcourse));
 $('vpAckChanges')?.addEventListener('click',()=>{localStorage.removeItem(K_PENDING);render()})
}
function addSection(){if($(SECTION))return true;const app=document.querySelector('.app');if(!app)return false;const sec=document.createElement('section');sec.id=SECTION;sec.className='hidden';const anchor=$('settings87')||document.querySelector('.app>nav');if(anchor)app.insertBefore(sec,anchor);else app.appendChild(sec);render();return true}
function hidePlanning(){$(SECTION)?.classList.add('hidden');$(NAV_ID)?.classList.remove('on')}
function showPlanning(){if(!addSection())return;document.querySelectorAll('.app>section').forEach(x=>x.classList.add('hidden'));$(SECTION)?.classList.remove('hidden');render();document.querySelectorAll('#v87Nav button').forEach(b=>b.classList.remove('on'));$(NAV_ID)?.classList.add('on');window.scrollTo({top:0,behavior:'smooth'})}
function addNav(){const nav=$('v87Nav');if(!nav)return false;nav.classList.add('vplanning-nav');let b=$(NAV_ID);if(!b){b=document.createElement('button');b.id=NAV_ID;b.innerHTML='<span>🗓️</span>Planning';const home=$('v87Home');home?.insertAdjacentElement('afterend',b);b.onclick=showPlanning}if(!nav.dataset.planningBound){nav.dataset.planningBound='1';nav.addEventListener('click',e=>{const hit=e.target.closest('button');if(hit&&hit.id!==NAV_ID)hidePlanning()},true)}return true}
function init(){css();reconcilePlanningChanges();const a=addSection(),b=addNav();return a&&b}
let tries=0;const t=setInterval(()=>{tries++;if(init()||tries>240)clearInterval(t)},100);
window.IFSI_PLANNING={show:showPlanning,render,weeks:WEEKS,version:'1.2',updatedAt:UPDATED_AT};
})();