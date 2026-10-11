/* IFSI ABC - Feedback personnalisé QCM, complément du corrigé officiel. */
(function(){
'use strict';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c];});}
function list(q,selected){
 if(!q||!Array.isArray(q.choices)||!Array.isArray(q.answers)||!Array.isArray(selected))return [];
 var chosen=new Set(selected.filter(Number.isInteger)),expected=new Set(q.answers),rows=[];
 if(chosen.size===expected.size&&Array.from(chosen).every(function(i){return expected.has(i);}))return [];
 q.choices.forEach(function(choice,i){
  if(chosen.has(i)&&!expected.has(i)){
   var personal=q.choiceFeedback&&q.choiceFeedback[i],reason='';
   if(typeof personal==='string')reason=personal;
   else if(personal&&typeof personal.incorrect==='string')reason=personal.incorrect;
   else if(/\breins?\b/i.test(String(q.question))&&/\bdigestif\b/i.test(String(choice)))reason='Les reins appartiennent au système urinaire : ils filtrent le sang et participent à la production de l’urine, pas à la digestion.';
   else reason='Cette proposition n’est pas retenue par le corrigé pour cette question. Confronte ce choix à la justification pédagogique ci-dessus.';
   rows.push({kind:'incorrect',index:i,choice:String(choice),message:'Tu as sélectionné « '+String(choice)+' ». '+reason});
  }else if(!chosen.has(i)&&expected.has(i)){
   var missing=q.choiceFeedback&&q.choiceFeedback[i],detail=missing&&typeof missing==='object'&&typeof missing.missed==='string'?missing.missed:'Cette proposition fait partie des réponses attendues. Relis la justification pour comprendre son rôle.';
   rows.push({kind:'missed',index:i,choice:String(choice),message:'Tu as oublié « '+String(choice)+' ». '+detail});
  }
 });
 return rows;
}
function html(q,selected){
 var rows=list(q,selected);if(!rows.length)return '';
 return '<div class="ifsi-qcm-personalized" aria-label="Explication de mes erreurs"><b>Comprendre mes erreurs</b><ul>'+rows.map(function(x){return '<li class="'+x.kind+'">'+esc(x.message)+'</li>';}).join('')+'</ul></div>';
}
function append(host,q,selected){
 if(!host)return;
 var rows=list(q,selected);
 if(!rows.length)return;
 var box=document.createElement('div');box.className='ifsi-qcm-personalized';box.setAttribute('aria-label','Explication de mes erreurs');
 var heading=document.createElement('b');heading.textContent='Comprendre mes erreurs';box.appendChild(heading);
 var ul=document.createElement('ul');
 rows.forEach(function(r){var li=document.createElement('li');li.className=r.kind;li.textContent=r.message;ul.appendChild(li);});
 box.appendChild(ul);host.appendChild(box);
}
function css(){
 if(document.getElementById('ifsi-qcm-personalized-style'))return;
 var style=document.createElement('style');style.id='ifsi-qcm-personalized-style';
 style.textContent='.ifsi-qcm-personalized{margin-top:12px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);line-height:1.5}.ifsi-qcm-personalized ul{padding-left:19px;margin:8px 0 0}.ifsi-qcm-personalized li{margin:7px 0}.ifsi-qcm-personalized .incorrect::marker{color:#b42318}.ifsi-qcm-personalized .missed::marker{color:#187a3c}';
 document.head.appendChild(style);
}
window.IFSI_QCM_FEEDBACK={list:list,html:html,append:append};
if(typeof document!=='undefined'&&document.head)css();
})();
