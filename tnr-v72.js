(()=>{
'use strict';
if(new URLSearchParams(location.search).get('tnr')!=='1')return;
const tests=[];
const add=(name,fn)=>tests.push({name,fn});
const ok=(v,msg='échec')=>{if(!v)throw new Error(msg)};
add('Banque QCM chargée',()=>ok(Array.isArray(Q)&&Q.length>0));
add('IDs QCM uniques',()=>{const ids=Q.map(q=>q.id);ok(ids.every(Boolean),'ID manquant');ok(new Set(ids).size===ids.length,'doublon détecté')});
add('Structure des QCM valide',()=>{for(const q of Q){ok(Array.isArray(q.choices)&&q.choices.length>=2,`choices ${q.id}`);ok(Array.isArray(q.answers)&&q.answers.length>=1,`answers ${q.id}`);ok(new Set(q.answers).size===q.answers.length,`réponse dupliquée ${q.id}`);ok(q.answers.every(a=>Number.isInteger(a)&&a>=0&&a<q.choices.length),`index réponse ${q.id}`)}});
add('Fonctions principales présentes',()=>['begin','draw','validateQ','startCustom','startSmart','showProgress','showVocals'].forEach(n=>ok(typeof window[n]==='function',n)));
add('Composants V7 présents',()=>{ok(document.getElementById('v7Mode'),'mode examen');ok(document.getElementById('v7Smart'),'révision intelligente')});
add('Composants V7.1 présents',()=>{ok(document.getElementById('v71SearchCard'),'recherche');ok(document.getElementById('v71ReportBtn'),'signalement')});
add('Composants V7.2 présents',()=>{ok(document.getElementById('v72Difficulty'),'difficulté');ok(document.getElementById('v72Progressive'),'progressif');ok(document.getElementById('v72SuggestBtn'),'proposition');ok(window.IFSI_V72?.version==='7.2','API V7.2')});
add('Composants V7.3 Vocaux présents',()=>{ok(document.getElementById('vocals'),'section vocaux');ok(document.getElementById('nv'),'onglet vocaux');ok(document.getElementById('vocalList'),'liste vocaux');ok(document.getElementById('vocalPlayer'),'lecteur vocal');ok(window.IFSI_V73?.version==='7.3','API V7.3')});
add('Catalogue vocaux chargé',()=>{const v=window.IFSI_V73?.getVocals?.()||[];ok(v.length>=29,`${v.length} vocaux`);ok(new Set(v.map(x=>x.id)).size===v.length,'IDs vocaux dupliqués');ok(new Set(v.map(x=>x.driveId)).size===v.length,'Drive IDs dupliqués')});
add('Difficultés valides',()=>{const allowed=new Set(['easy','medium','hard']);Q.forEach(q=>ok(allowed.has(window.IFSI_V72.difficulty(q)),`difficulté ${q.id}`))});
add('Schémas respiratoires conservés',()=>['resp_003','resp_013','resp_015'].forEach(id=>ok(Q.some(q=>q.id===id),id)));
add('Valeurs des matières stables',()=>{const s=document.getElementById('course');ok(s&&s.options.length>0);[...s.options].forEach(o=>ok(!/\(\d+\)$/.test(o.value),`valeur modifiée ${o.value}`))});
add('Stockage local opérationnel',()=>{const k='ifsiabc_tnr_probe';localStorage.setItem(k,'ok');ok(localStorage.getItem(k)==='ok');localStorage.removeItem(k)});
add('Pas de doublons d’UI critique',()=>['v72Difficulty','v72Progressive','v72SuggestBtn','v72Online','vocals','nv','vocalPlayer'].forEach(id=>ok(document.querySelectorAll('#'+id).length===1,id)));
function run(){const rows=[];let pass=0;for(const t of tests){try{t.fn();rows.push({name:t.name,ok:true});pass++}catch(e){rows.push({name:t.name,ok:false,error:e.message})}}render(rows,pass);console.table(rows)}
function render(rows,pass){let box=document.getElementById('tnrV72');if(!box){box=document.createElement('div');box.id='tnrV72';box.style.cssText='position:fixed;z-index:20000;inset:10px 10px auto auto;width:min(94vw,520px);max-height:88vh;overflow:auto;background:#fff;color:#242332;border:2px solid #6941c6;border-radius:18px;padding:14px;box-shadow:0 18px 70px #0006;font-family:system-ui';document.body.appendChild(box)}const fail=rows.length-pass;box.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><b>🧪 TNR V7.3</b><button id="tnrClose" style="border:0;background:#eee8fb;border-radius:999px;width:32px;height:32px">×</button></div><div style="font-size:26px;font-weight:900;color:${fail?'#b42318':'#187a3c'};margin:8px 0">${pass}/${rows.length} OK</div>${rows.map(r=>`<div style="padding:7px 0;border-top:1px solid #eee">${r.ok?'✅':'❌'} <b>${r.name}</b>${r.error?`<div style="font-size:12px;color:#b42318">${r.error}</div>`:''}</div>`).join('')}`;document.getElementById('tnrClose').onclick=()=>box.remove()}
let tries=0;const timer=setInterval(()=>{tries++;const vocals=window.IFSI_V73?.getVocals?.()||[];if(Array.isArray(Q)&&Q.length&&window.IFSI_V72&&document.getElementById('v72Difficulty')&&window.IFSI_V73&&vocals.length){clearInterval(timer);setTimeout(run,250)}else if(tries>200){clearInterval(timer);render([{name:'Initialisation de l’application V7.3',ok:false,error:'timeout'}],0)}},125);
})();
