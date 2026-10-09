(()=>{'use strict';
const $=id=>document.getElementById(id);
const SECTION='planningPromo';
const NAV_ID='vPlanningNav';
const K_PROMO='ifsiabc_planning_promo_v1';
const K_WEEK='ifsiabc_planning_week_v1';
const K_SUBGROUP='ifsiabc_planning_subgroup_v1';
const K_DAY='ifsiabc_planning_day_v1';
const K_SNAPSHOT='ifsiabc_planning_snapshot_v1';
const K_PENDING='ifsiabc_planning_changes_pending_v1';
const UPDATED_AT='2026-10-09';
const SOURCE='CFDC - IFSI Antoine Béclère • Promotion 2026/2029 • Planning prévisionnel';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let promo=localStorage.getItem(K_PROMO)==='A'?'A':'B';
let subgroup=localStorage.getItem(K_SUBGROUP)||'all';
function subgroupOptions(){return promo==='A'?['all','A1','A2']:['all','B1','B2']}
function subgroupLabel(x){return x==='all'?'Tous':x}
function validSubgroup(){if(!subgroupOptions().includes(subgroup)){subgroup='all';localStorage.setItem(K_SUBGROUP,subgroup)}}

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
  {date:'2026-10-08',start:'09:00',end:'12:30',promo:'all',ue:'UE A2 S1',type:'CM',title:'Les droits du patient',detail:'Des droits généraux aux droits relatifs à la santé mentale et à la psychiatrie',room:'Amphi KB',teacher:'Timothy JAMES'},
  {date:'2026-10-08',start:'13:30',end:'15:30',promo:'all',ue:'UE B1 S1',type:'CM',title:'Appareil reproducteur',room:'Amphi KB',teacher:'Vanessa PETIT'},
  {date:'2026-10-08',start:'15:30',end:'17:30',promo:'all',ue:'UE B1 S1',type:'Annulé',title:'Pharmacologie des antalgiques (E Campus) — non assuré',detail:'Cours non assuré le 8 octobre : ressource distancielle introuvable, en attente de clarification de l’université.',courseId:'pharmacologie',room:'',teacher:''},
  {date:'2026-10-09',start:'09:00',end:'12:30',promo:'A',ue:'UE Simulation',type:'TD',title:'Simulation en santé J2',detail:'Toilette complète au lit • Chambre des erreurs • Prescriptions et calculs • Découverte des dispositifs médicaux • Prise des paramètres vitaux',room:'S1 • S4 • S5 • S6 • S2/S3/S10/S13',teacher:'W Bernabelah AS • S Soufi AS • A Laleg AS • A Benatia AS • ID/SL/AC SSO'},
  {date:'2026-10-09',start:'09:00',end:'12:30',promo:'B',ue:'UE Simulation',type:'Asynchrone',title:'Réalisation de cas concrets et outil de révision PV',room:'Distanciel',teacher:''},
  {date:'2026-10-09',start:'13:30',end:'17:00',promo:'B',ue:'UE Simulation',type:'TD',title:'Simulation en santé J2',detail:'Toilette complète au lit • Chambre des erreurs • Prescriptions et calculs • Découverte des dispositifs médicaux • Prise des paramètres vitaux',room:'S1 • S4 • S5 • S6 • S2/S3/S10/S13',teacher:'W Bernabelah AS • S Soufi AS • A Laleg AS • A Benatia AS • ID/SL/AC SSO'},
  {date:'2026-10-09',start:'13:30',end:'17:00',promo:'A',ue:'UE Simulation',type:'Asynchrone',title:'Réalisation de cas concrets et outil de révision PV',room:'Distanciel',teacher:''}
 ]}
 ,{id:'S7',label:'S7',start:'2026-10-12',end:'2026-10-16',range:'12 - 16 oct.',events:[
  {date:'2026-10-12',start:'09:00',end:'10:30',promo:'B',groups:['B1','B2'],groupLabel:'Groupes B1 / B2',ue:'UE A1 S1',type:'TD',title:'Rôles et missions de l’IDE',room:'S11 • S3',teacher:''},
  {date:'2026-10-12',start:'09:00',end:'10:30',promo:'A',groupLabel:'Promo A',ue:'UE B3.3 S1',type:'TD',title:'Stomathérapie',room:'S10',teacher:'PANDION Odile'},
  {date:'2026-10-12',start:'10:30',end:'12:00',promo:'A',groups:['A1','A2'],groupLabel:'Groupes A1 / A2',ue:'UE A1 S1',type:'TD',title:'Rôles et missions de l’IDE',room:'S11 • S3',teacher:'BOURRIGAN Lucille • LEBRE Stéphanie'},
  {date:'2026-10-12',start:'10:30',end:'12:00',promo:'B',groupLabel:'Promo B',ue:'UE B3.3 S1',type:'TD',title:'Stomathérapie',room:'S10',teacher:''},
  {date:'2026-10-12',start:'13:15',end:'16:15',promo:'A',groups:['A1'],groupLabel:'Groupe A1',ue:'UE B3.2.1 S1',type:'TD',title:'Gestion du stress',room:'S10',teacher:'MARCEAU Patrice'},
  {date:'2026-10-12',start:'13:15',end:'16:15',promo:'all',groups:['A2','B2'],groupLabel:'Groupes A2 / B2',ue:'UE B3.2.1 S1',type:'TD',title:'1ère intervention PSSM',room:'S11 • S3',teacher:'BOURRIGAN Lucille • SOARES Sonia • DIETRICH Anne • LEBRE Stéphanie'},
  {date:'2026-10-12',start:'13:15',end:'16:15',promo:'B',groups:['B1'],groupLabel:'Groupe B1 (D)',ue:'',type:'TD',title:'Temps d’Appropriation des Connaissances',room:'',teacher:''},

  {date:'2026-10-13',start:'09:00',end:'12:00',promo:'all',groups:['A1','B1'],groupLabel:'Groupes A1 / B1',ue:'UE B3.2.1 S1',type:'TD',title:'1ère intervention PSSM',room:'S11 • S3',teacher:'BOURRIGAN Lucille • SOARES Sonia • DIETRICH Anne • LEBRE Stéphanie'},
  {date:'2026-10-13',start:'09:00',end:'12:00',promo:'A',groups:['A2'],groupLabel:'Groupe A2',ue:'UE A2.1 S1',type:'TD',title:'Gestion du stress',room:'S10',teacher:'MARCEAU Patrice'},
  {date:'2026-10-13',start:'09:00',end:'12:00',promo:'B',groups:['B2'],groupLabel:'Groupe B2 (D)',ue:'',type:'TD',title:'Temps d’Appropriation des Connaissances',room:'',teacher:''},
  {date:'2026-10-13',start:'14:00',end:'16:00',promo:'all',groupLabel:'Groupes Niveau 1 (1), (2) et (3)',ue:'UE B3.1 S1',type:'TD',title:'Atelier de soutien en calculs ESI Nv1',courseId:'calculs_doses_mathematiques',room:'S3 • S10 • S13',teacher:'BOURRIGAN Lucille • DIETRICH Anne • LEBRE Stéphanie'},
  {date:'2026-10-13',start:'14:00',end:'17:00',promo:'all',groupLabel:'Groupes Niveau 2 (1) et (2) (D)',ue:'UE B3.1 S1',type:'Asynchrone',title:'Connexion Mischool (pour ESI Nv2)',courseId:'calculs_doses_mathematiques',room:'Distanciel',teacher:''},
  {date:'2026-10-13',start:'14:00',end:'16:00',promo:'all',groupLabel:'Groupe Niveau 3 (D)',ue:'UE B3.1 S1',type:'Asynchrone',title:'Atelier calculs ESI Nv3',courseId:'calculs_doses_mathematiques',room:'Distanciel',teacher:''},

  {date:'2026-10-14',start:'09:00',end:'12:00',promo:'A',groupLabel:'Promo A',ue:'UE B3.3 S1',type:'TD',title:'Les plaies simples et soins courants',room:'S10',teacher:''},
  {date:'2026-10-14',start:'09:00',end:'12:00',promo:'B',groupLabel:'Promo B',ue:'UE D1.1 S1',type:'CM',title:'L’entretien infirmier',room:'S11',teacher:'GRARE Pascaline'},
  {date:'2026-10-14',start:'13:30',end:'16:30',promo:'all',groupLabel:'Distanciel',ue:'UE D4 S1',type:'TD',title:'Temps d’Appropriation des Connaissances',room:'Distanciel',teacher:''},
  {date:'2026-10-14',start:'16:30',end:'17:30',promo:'all',groupLabel:'Distanciel',ue:'UE 5.08 S1',type:'Asynchrone',title:'Visionnage du film sur « Les objectifs de stage »',room:'Distanciel',teacher:''},

  {date:'2026-10-15',start:'09:00',end:'12:00',promo:'all',groupLabel:'Cf groupe',ue:'UE 5.08 S1',type:'TD',title:'Simulation J3 — Pansement simple avec pinces',room:'TP4 • Informatique • S12 • S2',teacher:'DIETRICH Anne'},
  {date:'2026-10-15',start:'09:30',end:'12:00',promo:'all',groupLabel:'Cf groupe',ue:'UE 5.08 S1',type:'TD',title:'Simulation J3 — Jeu de rôle et communication / chambre d’observation',room:'S3 • S13 • S10 • S11',teacher:'BOURRIGAN Lucille • DELABARRE Isabelle • LEBRE Stéphanie • SOARES Sonia'},
  {date:'2026-10-15',start:'13:30',end:'16:30',promo:'all',groupLabel:'Cf groupe',ue:'UE 5.08 S1',type:'TD',title:'Simulation J3 — Pansement simple avec pinces',room:'TP4 • Informatique • S12 • S2',teacher:'SERRE Manon • MANGIN Elsa'},
  {date:'2026-10-15',start:'14:00',end:'16:30',promo:'all',groupLabel:'Cf groupe',ue:'UE 5.08 S1',type:'TD',title:'Simulation J3 — Jeu de rôle et communication / chambre d’observation',room:'S3 • S10 • S13 • S11',teacher:'BOURRIGAN Lucille • DELABARRE Isabelle • LEBRE Stéphanie • SOARES Sonia • DIETRICH Anne'},

  {date:'2026-10-16',start:'09:00',end:'12:00',promo:'A',groupLabel:'Promo A',ue:'UE D1.1 S1',type:'CM',title:'L’entretien IDE',room:'S11',teacher:'GRARE Pascaline'},
  {date:'2026-10-16',start:'09:00',end:'12:00',promo:'B',groupLabel:'Promo B',ue:'UE B3.3 S1',type:'TD',title:'Plaies et pansements simples',room:'S10',teacher:''},
  {date:'2026-10-16',start:'13:30',end:'16:30',promo:'all',groupLabel:'Groupes Niveau 1 et Niveau 3 (D)',ue:'UE E2.1 S1',type:'Asynchrone',title:'Connexion plateforme Mischool (ESI Nv1 et 3)',courseId:'calculs_doses_mathematiques',room:'Distanciel',teacher:''},
  {date:'2026-10-16',start:'14:00',end:'16:00',promo:'all',groupLabel:'Groupes Niveau 2 (1) et (2)',ue:'UE B3.1 S1',type:'TD',title:'Atelier de soutien pour ESI Nv2',courseId:'calculs_doses_mathematiques',room:'S3 • S2',teacher:'DELABARRE Isabelle • DIETRICH Anne'}
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
 #planningPromo{padding:8px 0 132px}
 .vp-toolbar,.vp-card{border:1px solid var(--line);background:var(--card);border-radius:19px;box-shadow:0 7px 22px rgba(55,39,94,.05)}
 .vp-toolbar{padding:10px 12px;margin-bottom:10px;display:grid;gap:8px}
 .vp-control-row{display:flex;align-items:center;gap:8px;min-width:0}.vp-control-icon{width:28px;text-align:center;font-size:16px;flex:0 0 auto}
 .vp-segment{display:flex;gap:5px;flex:1;min-width:0;padding:4px;background:#eeeaf3;border-radius:14px}
 .vp-segment button{flex:1;border:0;border-radius:11px;padding:9px 11px;background:transparent;color:#625c6e;font-weight:850;cursor:pointer;white-space:nowrap}
 .vp-segment button.on{background:#7046d9;color:#fff;box-shadow:0 5px 14px rgba(95,57,190,.2)}
 .vp-week-segment button{min-width:58px}.vp-subgroups{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-left:36px}
 .vp-subgroup-label{font-size:10px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-right:2px}
 .vp-subgroup{border:1px solid var(--line);background:transparent;color:var(--ink);border-radius:999px;padding:6px 10px;font:inherit;font-size:11px;font-weight:800;cursor:pointer}
 .vp-subgroup.on{border-color:#8c68df;background:#f0eaff;color:#6237c5}
 .vp-card{padding:14px;margin:10px 0}.vp-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
 .vp-today-title,.vp-week-title{display:flex;align-items:center;gap:9px;font-weight:900;font-size:17px}.vp-date{font-size:12px;color:var(--muted)}
 .vp-agenda{display:grid;gap:7px;margin-top:10px}.vp-agenda-row{position:relative;display:grid;grid-template-columns:118px minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:10px 11px 10px 14px;background:var(--card);overflow:hidden}
 .vp-agenda-row.current{border-color:#8060d6;background:linear-gradient(90deg,rgba(112,70,217,.14),transparent)}.vp-agenda-row.current:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:#7046d9}
 .vp-agenda-time{font-weight:900;font-size:14px;line-height:1.25}.vp-agenda-time small{display:block;color:var(--muted);font-size:10px;font-weight:700;margin-bottom:3px}
 .vp-status{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:4px 7px;font-size:9px;font-weight:950;letter-spacing:.03em;text-transform:uppercase;background:#eee8ff;color:#6941c6;margin-bottom:4px}
 .vp-status.live{background:#e5f7f3;color:#087a75}.vp-agenda-main{min-width:0}.vp-ue{font-size:10px;font-weight:900;color:#6941c6;text-transform:uppercase;letter-spacing:.04em}.vp-title{font-size:14px;font-weight:850;line-height:1.25;margin:2px 0}.vp-meta,.vp-detail{font-size:11px;color:var(--muted);line-height:1.35}.vp-detail{margin-top:4px}
 .vp-type{font-size:10px;font-weight:900;border-radius:999px;padding:5px 8px;background:#efe8ff;color:#6941c6;white-space:nowrap}.vp-type.td{background:#e6f7f4;color:#087a75}.vp-type.tp{background:#e8f2ff;color:#2368b7}.vp-type.async{background:#eaf8ee;color:#187a3c}.vp-type.info{background:#fff2df;color:#9a5d08}
 .vp-week-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px}.vp-sourcechip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:999px;padding:6px 9px;font-size:10px;color:var(--muted);background:rgba(112,70,217,.06)}
 .vp-days{display:grid;gap:6px}.vp-day{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card)}
 .vp-day-toggle{width:100%;border:0;background:transparent;color:var(--ink);padding:10px 12px;display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:9px;text-align:left;cursor:pointer;font:inherit}
 .vp-day.open>.vp-day-toggle{background:rgba(112,70,217,.10)}.vp-chevron{font-size:15px;transition:transform .18s ease}.vp-day.open .vp-chevron{transform:rotate(90deg)}
 .vp-day-name{font-weight:900;font-size:13px}.vp-day-count{font-size:11px;color:var(--muted);white-space:nowrap}.vp-today-dot{font-size:9px;color:#6941c6;font-weight:900}
 .vp-day-body{display:none;padding:0 8px 8px}.vp-day.open .vp-day-body{display:block}
 .vp-event{position:relative;display:grid;grid-template-columns:74px minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:9px 9px 9px 13px;margin:6px 0 0;background:var(--card);overflow:hidden}
 .vp-event:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:#7046d9}.vp-event[data-kind="TD"]:before{background:#0fa7a0}.vp-event[data-kind="TP"]:before{background:#3182e4}.vp-event[data-kind="ASYNC"]:before{background:#27a85e}.vp-event[data-kind="INFO"]:before{background:#d98a20}
 .vp-time{font-weight:900;font-size:12px;line-height:1.25}.vp-time small{display:block;font-weight:600;color:var(--muted);font-size:10px}.vp-main{min-width:0}
 .vp-resource-btn{margin-top:5px;border:1px solid #d4c8ee;background:transparent;color:#6038bf;border-radius:9px;padding:5px 8px;font:inherit;font-size:10px;font-weight:850;cursor:pointer}
 .vp-empty{border:1px dashed #cfc4e1;background:#faf8ff;border-radius:12px;padding:11px;text-align:center;color:var(--muted);font-size:11px;margin-top:6px}
 .vp-week-foot{display:flex;align-items:center;justify-content:space-between;gap:9px;flex-wrap:wrap;border-top:1px solid var(--line);margin-top:10px;padding-top:10px}.vp-source{color:var(--muted);font-size:10px;line-height:1.35;max-width:70%}.vp-export{padding:8px 10px!important;font-size:11px!important;width:auto!important}
 .vp-changes{border-color:#f1cf94;background:#fffaf0}.vp-changes .vp-change-lines{margin:8px 0 0;padding-left:18px;font-size:11px;color:var(--muted);line-height:1.45}.vp-change-ack{border:0;background:transparent;color:#6941c6;font-weight:850;cursor:pointer;padding:4px 0}
 body.v72-dark .vp-toolbar,body.v72-dark .vp-card,body.v72-dark .vp-day,body.v72-dark .vp-event,body.v72-dark .vp-agenda-row,body.v72-dark .vp-empty{background:#211e2a;color:#f4f0fb;border-color:#3b3548}
 body.v72-dark .vp-segment{background:#191720}body.v72-dark .vp-subgroup.on{background:#382c57;color:#eadfff}body.v72-dark .vp-agenda-row.current{background:linear-gradient(90deg,rgba(112,70,217,.18),#211e2a)}
 @media(max-width:700px){#planningPromo{padding:4px 0 126px}.vp-toolbar{padding:8px}.vp-subgroups{margin-left:0}.vp-control-icon{display:none}.vp-agenda-row{grid-template-columns:88px minmax(0,1fr);gap:8px}.vp-agenda-row>.vp-type{grid-column:2;justify-self:start}.vp-event{grid-template-columns:58px minmax(0,1fr);gap:8px}.vp-event>.vp-type{grid-column:2;justify-self:start}.vp-week-head{align-items:flex-start}.vp-sourcechip{width:100%;justify-content:center}.vp-week-foot{display:grid}.vp-source{max-width:none}.vp-export{width:100%!important}.vp-day-toggle{grid-template-columns:auto 1fr auto}.vp-day-toggle .vp-today-dot{display:none}}
 `;document.head.appendChild(s)
}
function frDate(iso,opts={weekday:'long',day:'numeric',month:'long'}){const [y,m,d]=iso.split('-').map(Number);return new Intl.DateTimeFormat('fr-FR',opts).format(new Date(y,m-1,d,12))}
function kind(type){const t=String(type||'').toUpperCase();if(t.startsWith('TD'))return'TD';if(t.startsWith('TP'))return'TP';if(t.includes('ASYN'))return'ASYNC';if(t==='INFO')return'INFO';return'CM'}
function typeClass(type){const k=kind(type);return k==='TD'?'td':k==='TP'?'tp':k==='ASYNC'?'async':k==='INFO'?'info':''}
function eventVisible(e){if(!(e.promo==='all'||e.promo===promo))return false;if(subgroup==='all')return true;return !Array.isArray(e.groups)||!e.groups.length||e.groups.includes(subgroup)}
function eventsFor(w,date){validSubgroup();return w.events.filter(e=>e.date===date&&eventVisible(e)).sort((a,b)=>a.start.localeCompare(b.start))}
function registryCourse(id){return (window.IFSI_V741?.getRegistry?.()?.courses||[]).find(c=>c.id===id)||null}
function resourcesFor(id){return id?window.IFSI_V741?.resourcesForCourse?.(id):null}
function hasResources(id){const r=resourcesFor(id);return !!r&&['questions','sheets','infographics','vocals'].some(k=>Array.isArray(r[k])&&r[k].length)}
function openCourseResources(id){
 const c=registryCourse(id);
 if(window.IFSI_V813?.openCourse){window.IFSI_V813.openCourse(id);return}
 if(c?.label&&typeof window.openCourse74==='function'){window.openCourse74(c.label);return}
 window.showCourses74?.()
}
function eventMeta(e){return [e.groupLabel&&'👥 '+e.groupLabel,e.room&&'📍 '+e.room,e.teacher&&'👤 '+e.teacher].filter(Boolean).join(' • ')}
function eventCard(e){
 const meta=eventMeta(e),resource=hasResources(e.courseId)?`<button type="button" class="vp-resource-btn" data-vcourse="${esc(e.courseId)}">📚 Ressources</button>`:'';
 return `<article class="vp-event" data-kind="${kind(e.type)}"><div class="vp-time">${esc(e.start)}<small>${esc(e.end)}</small></div><div class="vp-main">${e.ue?`<div class="vp-ue">${esc(e.ue)}</div>`:''}<div class="vp-title">${esc(e.title)}</div>${meta?`<div class="vp-meta">${esc(meta)}</div>`:''}${e.detail?`<div class="vp-detail">${esc(e.detail)}</div>`:''}${resource}</div><span class="vp-type ${typeClass(e.type)}">${esc(e.type)}</span></article>`
}
function allPromoEvents(){validSubgroup();return WEEKS.flatMap(w=>w.events).filter(eventVisible).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start))}
function eventDateTime(e,field){return new Date(e.date+'T'+e[field]+':00')}
function agendaRow(e,status){
 const meta=eventMeta(e),live=status==='live',label=live?'● En cours':'À suivre',dateExtra=e.date!==todayISO()?frDate(e.date,{weekday:'short',day:'numeric',month:'short'}):'';
 return `<article class="vp-agenda-row ${live?'current':''}"><div class="vp-agenda-time"><span class="vp-status ${live?'live':''}">${label}</span><div>${esc(e.start)} – ${esc(e.end)}</div>${dateExtra?`<small>${esc(dateExtra)}</small>`:''}</div><div class="vp-agenda-main">${e.ue?`<div class="vp-ue">${esc(e.ue)}</div>`:''}<div class="vp-title">${esc(e.title)}</div>${meta?`<div class="vp-meta">${esc(meta)}</div>`:''}</div><span class="vp-type ${typeClass(e.type)}">${esc(e.type)}</span></article>`
}
function todaySummary(){
 const now=new Date(),all=allPromoEvents(),current=all.find(e=>eventDateTime(e,'start')<=now&&now<eventDateTime(e,'end')),next=all.find(e=>eventDateTime(e,'start')>now&&(!current||e!==current));
 const rows=[];if(current)rows.push(agendaRow(current,'live'));if(next)rows.push(agendaRow(next,'next'));
 const label=frDate(todayISO(),{weekday:'short',day:'numeric',month:'short',year:'numeric'});
 return `<div class="vp-card"><div class="vp-today-title">📅 Aujourd’hui — ${esc(label)}</div><div class="vp-agenda">${rows.length?rows.join(''):'<div class="vp-empty">Aucun autre cours importé à venir.</div>'}</div></div>`
}
function snapshot(){
 const out={};
 for(const e of WEEKS.flatMap(w=>w.events)){const k=[e.date,e.start,e.promo,(e.groups||[]).join(','),e.ue||'',e.title].join('|');out[k]={start:e.start,end:e.end,room:e.room||'',type:e.type||''}}
 return out
}
function changeLabel(key,obj){const [date,start,,,ue,title]=key.split('|');return `${frDate(date,{weekday:'short',day:'numeric',month:'short'})} • ${ue?ue+' • ':''}${title}${start?' • '+start:''}`}
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
function weekDates(w){const [y,m,d]=w.start.split('-').map(Number),base=new Date(y,m-1,d,12);return Array.from({length:5},(_,i)=>{const x=new Date(base);x.setDate(base.getDate()+i);const p=n=>String(n).padStart(2,'0');return x.getFullYear()+'-'+p(x.getMonth()+1)+'-'+p(x.getDate())})}
function weekSource(w){
 if(w.id==='S7')return {chip:'Prévisionnel · S7 saisie depuis photo · MAJ 07/10/2026',detail:'S7 saisie à partir de la photo du planning. Une modification communiquée par l’IFSI reste prioritaire.',ics:'S7 saisie depuis photo du planning prévisionnel'};
 return {chip:`Prévisionnel · ${w.id} support IFSI · MAJ 07/10/2026`,detail:`${w.id} importée depuis le support IFSI. Le planning reste prévisionnel.`,ics:SOURCE};
}
function defaultOpenDay(w){const dates=weekDates(w),today=todayISO();return dates.includes(today)?today:dates[0]}
function openDayFor(w){const saved=localStorage.getItem(K_DAY);if(saved===`none:${w.id}`)return '';return weekDates(w).includes(saved)?saved:defaultOpenDay(w)}
function weekCard(w){
 const t=todayISO(),openDay=openDayFor(w),source=weekSource(w);
 return `<div class="vp-card"><div class="vp-week-head"><div><div class="vp-week-title">📅 ${esc(w.label)} · ${esc(w.range)} · Promo ${promo}</div>${subgroup!=='all'?`<div class="vp-date">Sous-groupe ${esc(subgroup)}</div>`:''}</div><span class="vp-sourcechip">ⓘ ${esc(source.chip)}</span></div>
 <div class="vp-days">${weekDates(w).map(date=>{const es=eventsFor(w,date),open=date===openDay,today=date===t;return `<section class="vp-day ${open?'open':''}" data-vday-wrap="${date}"><button type="button" class="vp-day-toggle" data-vday="${date}" aria-expanded="${open}"><span class="vp-chevron">›</span><span class="vp-day-name">${esc(frDate(date,{weekday:'short',day:'numeric',month:'long'}))}</span>${today?'<span class="vp-today-dot">AUJ.</span>':'<span></span>'}<span class="vp-day-count">${es.length} cours</span></button><div class="vp-day-body">${es.length?es.map(eventCard).join(''):'<div class="vp-empty">Aucun cours pour ce filtre.</div>'}</div></section>`}).join('')}</div>
 <div class="vp-week-foot"><div class="vp-source">${esc(source.detail)}</div><button id="vpExportIcs" class="btn outline vp-export">📅 Exporter ${esc(w.label)} (.ics)</button></div></div>`
}
function icsEscape(s){return String(s??'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
function icsStamp(date,time){return date.replaceAll('-','')+'T'+time.replace(':','')+'00'}
function exportIcs(){
 const w=WEEKS.find(x=>x.id===selectedWeek);if(!w)return;
 validSubgroup();const es=w.events.filter(e=>eventVisible(e)&&e.type!=='Annulé'),source=weekSource(w);
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//IFSI ABC Révisions//Planning Promo//FR','CALSCALE:GREGORIAN','X-WR-CALNAME:IFSI Promo '+promo+' '+w.id,'X-WR-TIMEZONE:Europe/Paris'];
 es.forEach((e,i)=>{lines.push('BEGIN:VEVENT','UID:ifsi-'+w.id+'-'+promo+'-'+e.date+'-'+e.start.replace(':','')+'-'+i+'@ifsi-abc','DTSTART;TZID=Europe/Paris:'+icsStamp(e.date,e.start),'DTEND;TZID=Europe/Paris:'+icsStamp(e.date,e.end),'SUMMARY:'+icsEscape((e.ue?e.ue+' - ':'')+e.type+' : '+e.title),'LOCATION:'+icsEscape(e.room||''),'DESCRIPTION:'+icsEscape([e.detail,e.teacher&&'Intervenant : '+e.teacher,'Source : '+source.ics].filter(Boolean).join('\n')),'END:VEVENT')});
 lines.push('END:VCALENDAR');
 const blob=new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='IFSI_'+w.id+'_Promo_'+promo+(subgroup!=='all'?'_'+subgroup:'')+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)
}
function toolbar(){
 validSubgroup();
 return `<div class="vp-toolbar"><div class="vp-control-row"><span class="vp-control-icon">👥</span><div class="vp-segment" role="group" aria-label="Choisir la promotion"><button type="button" data-vpromo="A" class="${promo==='A'?'on':''}" aria-pressed="${promo==='A'}">Promo A</button><button type="button" data-vpromo="B" class="${promo==='B'?'on':''}" aria-pressed="${promo==='B'}">Promo B</button></div></div><div class="vp-control-row"><span class="vp-control-icon">📅</span><div class="vp-segment vp-week-segment" role="group" aria-label="Choisir la semaine">${WEEKS.map(x=>`<button type="button" class="${x.id===selectedWeek?'on':''}" data-vweek="${x.id}">${x.label}</button>`).join('')}</div></div><div class="vp-subgroups"><span class="vp-subgroup-label">Sous-groupe</span>${subgroupOptions().map(x=>`<button type="button" class="vp-subgroup ${subgroup===x?'on':''}" data-vsubgroup="${x}">${subgroupLabel(x)}</button>`).join('')}</div></div>`
}
function render(){
 const sec=$(SECTION);if(!sec)return;
 const w=WEEKS.find(x=>x.id===selectedWeek)||WEEKS[WEEKS.length-1];
 sec.innerHTML=toolbar()+changesCard()+todaySummary()+weekCard(w);
 sec.querySelectorAll('[data-vpromo]').forEach(b=>b.onclick=()=>{promo=b.dataset.vpromo;subgroup='all';localStorage.setItem(K_PROMO,promo);localStorage.setItem(K_SUBGROUP,subgroup);render()});
 sec.querySelectorAll('[data-vsubgroup]').forEach(b=>b.onclick=()=>{subgroup=b.dataset.vsubgroup;localStorage.setItem(K_SUBGROUP,subgroup);render()});
 sec.querySelectorAll('[data-vweek]').forEach(b=>b.onclick=()=>{selectedWeek=b.dataset.vweek;localStorage.setItem(K_WEEK,selectedWeek);localStorage.setItem(K_DAY,defaultOpenDay(WEEKS.find(x=>x.id===selectedWeek)));render()});
 sec.querySelectorAll('[data-vday]').forEach(b=>b.onclick=()=>{const d=b.dataset.vday,wrap=sec.querySelector('[data-vday-wrap="'+d+'"]'),isOpen=wrap?.classList.contains('open');localStorage.setItem(K_DAY,isOpen?`none:${selectedWeek}`:d);render()});
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
window.IFSI_PLANNING={show:showPlanning,render,weeks:WEEKS,version:'1.4',updatedAt:UPDATED_AT};
})();
