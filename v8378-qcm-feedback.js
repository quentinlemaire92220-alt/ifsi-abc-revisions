/* IFSI ABC - Feedback personnalisé QCM, complément du corrigé officiel. */
(function(){
'use strict';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c];});}
// Les valeurs des cases et les lettres du corrigé restent les indices du support publié.
const balancedCourses=new Set([
 'sante_mondiale_sante_france','psychometrie','vih_b13_20261027',
 'd1_relation_soignant_soigne_ecoute_active','d1_bientraitance','psychologie_sante',
 'theorie_gestion_symptomes_td','parasites_champignons','physiopathologie_infections',
 'arthrose','rhumatismes_inflammatoires','fievre_retour_voyage_paludisme'
]);
const catalogues=new WeakMap();
function rank(text){
 let hash=2166136261;
 for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
 hash=Math.imul(hash^(hash>>>16),0x85ebca6b);
 return (hash^(hash>>>13))>>>0;
}
function dependsOnOrder(q){
 const reference=/(?:[Pp]roposition|[Rr]éponse|[Oo]ption|[Cc]hoix|[Ii]tem)s?\s+(?:[«"]\s*)?[A-E]\b|\b[A-E]\s*(?:et|ou|,|\+)\s*[A-E]\b|ci[- ](?:dessus|dessous)|(?:propositions?|réponses?|options?) précédentes?|(?:première|deuxième|dernière) (?:proposition|option|réponse)|^[A-E][.):]\s/;
 return [q.question,...q.choices].some(text=>reference.test(text));
}
function planCourse(questions){
 const groups=new Map(),orders=new Map();
 for(const q of questions){
  const n=q.choices?.length,k=q.answers?.length;
  if(!q.id||!Array.isArray(q.choices)||!Array.isArray(q.answers)||!(n>=2&&n<=5&&k>0&&k<n))continue;
  const key=n+':'+k;
  if(!groups.has(key))groups.set(key,{n,k,rows:[],slots:Array(n).fill(0),counts:new Map()});
  const group=groups.get(key);
  if(q.vocabularyTermId||dependsOnOrder(q)){
   const mask=q.answers.reduce((bits,i)=>bits|(1<<i),0);
   group.counts.set(mask,(group.counts.get(mask)||0)+1);
   for(const i of q.answers)group.slots[i]++;
  }else group.rows.push(q);
 }
 for(const {n,k,rows,slots,counts} of groups.values()){
  const indices=Array.from({length:n},(_,i)=>i), combinations=[];
  for(let mask=1;mask<(1<<n);mask++){
   const positions=indices.filter(i=>mask&(1<<i));
   if(positions.length===k)combinations.push({mask,positions});
  }
  rows.sort((a,b)=>rank(a.id)-rank(b.id)||a.id.localeCompare(b.id));
  for(const q of rows){
   // Répartir chaque combinaison, puis départager par les positions les moins utilisées.
   let best,lowest=Infinity,least=Infinity,tie=Infinity;
   for(const candidate of combinations){
    const count=counts.get(candidate.mask)||0;
    const occupied=candidate.positions.reduce((total,i)=>total+slots[i],0);
    const randomRank=rank(q.id+':'+candidate.mask);
    if(count<lowest||count===lowest&&(occupied<least||occupied===least&&randomRank<tie)){
     best=candidate;lowest=count;least=occupied;tie=randomRank;
    }
   }
   counts.set(best.mask,lowest+1);
   for(const i of best.positions)slots[i]++;
   const shuffled=indices.slice().sort((a,b)=>rank(q.id+'#'+a)-rank(q.id+'#'+b)||a-b);
   const correct=shuffled.filter(i=>q.answers.includes(i)),other=shuffled.filter(i=>!q.answers.includes(i));
   orders.set(q.id,indices.map(i=>best.mask&(1<<i)?correct.shift():other.shift()));
  }
 }
 return orders;
}
function choiceOrder(q,catalogue){
 if(!balancedCourses.has(q?.courseId)||q.vocabularyTermId||!Array.isArray(catalogue))return null;
 if(!catalogues.has(catalogue))catalogues.set(catalogue,new Map());
 const courses=catalogues.get(catalogue);
 if(!courses.has(q.courseId))courses.set(q.courseId,planCourse(catalogue.filter(row=>row.courseId===q.courseId)));
 return courses.get(q.courseId).get(q.id)||null;
}
function reviewChoices(q,indices,catalogue){
 if(!choiceOrder(q,catalogue))return null;
 return (indices||[]).map(i=>'ABCDE'[i]+'. '+q.choices[i]).join(' · ')||'Aucune';
}
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
 style.textContent='#choices input:enabled + span > .qcm-source-letter{display:none}.ifsi-qcm-personalized{margin-top:12px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);line-height:1.5}.ifsi-qcm-personalized ul{padding-left:19px;margin:8px 0 0}.ifsi-qcm-personalized li{margin:7px 0}.ifsi-qcm-personalized .incorrect::marker{color:#b42318}.ifsi-qcm-personalized .missed::marker{color:#187a3c}';
 document.head.appendChild(style);
}
window.IFSI_QCM_FEEDBACK={list:list,html:html,append:append,choiceOrder,reviewChoices};
if(typeof document!=='undefined'&&document.head)css();
})();
