(()=>{'use strict';
const V='8.30.38',KEY='ifsiabc_flashcards_v1',$=id=>document.getElementById(id),E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let deck=[],session=[],index=0,revealed=false,sessionMarks=[],activeCourse='all',mode='home';
const now=()=>Date.now(),day=86400000,read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{"cards":{},"sessions":0}')}catch{return{cards:{},sessions:0}}},write=s=>localStorage.setItem(KEY,JSON.stringify(s));
const reg=()=>window.IFSI_V741?.getRegistry?.()?.courses||[],res=id=>window.IFSI_V741?.resourcesForCourse?.(id)||{questions:[],sheets:[]};
const diff=q=>q?.difficulty||window.IFSI_V79?.difficultyOf?.(q)||'medium',theme=q=>window.IFSI_V79?.themeOf?.(q)||q?.theme||'Général';
function cleanQuestion(q){let t=String(q?.question||'').trim();t=t.replace(/\s+—\s+Repères\s*:[\s\S]*?—\s*Quelle combinaison regroupe toutes les bonnes réponses\s*\?\s*$/i,'');return t.replace(/\s+/g,' ').trim()||'Question de révision';}
function correctAnswers(q){return (q?.answers||[]).map(i=>String(q?.choices?.[i]||'').trim()).filter(Boolean)}
function wrongAnswers(q){const good=new Set(q?.answers||[]);return (q?.choices||[]).map((x,i)=>({text:String(x||'').trim(),i})).filter(x=>x.text&&!good.has(x.i)).map(x=>x.text)}
function answer(q){const a=correctAnswers(q);return a.length?a:['Voir le corrigé associé'];}
function subjectCase(s){return String(s||'').trim().replace(/[.:;]+$/,'')}
function lcFirst(s){s=String(s||'');return s?s[0].toLowerCase()+s.slice(1):s}
function capFirst(s){s=String(s||'');return s?s[0].toUpperCase()+s.slice(1):s}
function hasVerb(s){return /\b(?:est|sont|a|ont|peut|peuvent|doit|doivent|comprend|comprennent|appartient|assure|assurent|participe|participent|permet|permettent|produit|produisent|contient|contiennent|se situe|se situent|présente|présentent)\b/i.test(s)}
function compactAnswer(s){return String(s||'').replace(/^Il s['’]agit d['’]e?\s*/i,'').replace(/^C['’]est\s+/i,'').replace(/\s+/g,' ').trim()}
function answerKey(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\barnm\b/g,'arn messager').replace(/[^a-z0-9%]+/g,' ').replace(/\s+/g,' ').trim()}
function answerTokens(s){const stop=new Set(['le','la','les','un','une','de','du','des','d','l','a','au','aux','en','vers','et','ou','par','pour','se','est','sont','il','elle','dans']);return answerKey(s).split(' ').filter(x=>x.length>1&&!stop.has(x))}
function sameMeaning(a,b){const A=new Set(answerTokens(a)),B=new Set(answerTokens(b));if(!A.size||!B.size)return false;let hit=0;for(const x of A)if(B.has(x))hit++;return hit/Math.min(A.size,B.size)>=0.8}
function dedupeAnswers(arr){const out=[];for(const raw of arr||[]){const a=compactAnswer(raw);if(!a)continue;if(out.some(x=>answerKey(x)===answerKey(a)||sameMeaning(x,a)))continue;out.push(a)}return out}
function expectedCount(front){const f=String(front||'').toLowerCase(),words={deux:2,trois:3,quatre:4,cinq:5,six:6,sept:7,huit:8,neuf:9,dix:10},m=f.match(/\b([2-9]|10|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s+(?:(?:grands?|grandes?|principaux?|principales?)\s+)?(?:classes?|types?|étapes?|phases?|familles?|éléments?|signes?|aspects?|axes?|parties?|catégories?|mécanismes?|fonctions?|propriétés?|caractéristiques?|facteurs?|critères?)\b/);if(!m)return null;return /^\d+$/.test(m[1])?Number(m[1]):words[m[1]]||null}
function splitShortList(s){const x=String(s||'').replace(/[.;]+$/,'').trim();if(!x||x.length>120||/[.!?;:]/.test(x))return[x];const parts=x.split(/\s*,\s*|\s+et\s+/i).map(y=>y.trim()).filter(Boolean);return parts.length>1?parts:[x]}
function listFromExplanation(exp,n){const e=String(exp||'').replace(/\s+/g,' ').trim();if(!e||!n)return[];const m=e.match(/:\s*([^.!?]+)/);if(!m)return[];const parts=m[1].split(/\s*,\s*|\s+et\s+/i).map(x=>x.trim().replace(/^(?:le|la|les|un|une)\s+/i,'')).filter(Boolean);return parts.length===n?parts:[]}
function refineAnswers(front,answers,explanation){let out=dedupeAnswers(answers);const n=expectedCount(front);if(n&&out.length!==n){const split=out.flatMap(splitShortList);if(split.length===n)out=dedupeAnswers(split);if(out.length!==n){const fromExp=listFromExplanation(explanation,n);if(fromExp.length===n)out=dedupeAnswers(fromExp)}}return out}
function answersMatchQuestion(front,answers){const n=expectedCount(front);return !n||answers.length===n}
function stripSourceMeta(s){return String(s||'').replace(/\s*,?\s*(?:et\s+)?(?:son|le|la)?\s*QCM\s+oral\b/gi,'').replace(/\b(?:dans|selon|d['’]après|conformément à)\s+(?:ce|le|la)?\s*(?:cours|support(?: de cours)?)\b/gi,'').replace(/\b(?:du|de la)\s+(?:cours|support(?: de cours)?)\b/gi,'').replace(/\s+/g,' ').replace(/\s+([?;,:])/g,'$1').replace(/[,;:]\s*\?/g,' ?').trim()}
function sanitizeExplanation(exp){const parts=String(exp||'').replace(/\s+/g,' ').trim().split(/(?<=[.!?])\s+/);return parts.filter(s=>s&&!/\b(?:support(?: de cours)?|diapo(?:sitive)?\s*\d*|QCM\s+oral)\b/i.test(s)).map(stripSourceMeta).filter(Boolean).join(' ')}
function termKey(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[₀-₉]/g,d=>({'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'}[d])).replace(/[⁺+]/g,'+').replace(/[⁻−-]/g,'-').replace(/[^A-Z0-9+-]/g,'')}
function knownExpansion(term){const k=termKey(term),map={LIC:'liquide intracellulaire (LIC)',LEC:'liquide extracellulaire (LEC)',ADH:'hormone antidiurétique (ADH)',HCO3:'bicarbonates (HCO₃⁻)','HCO3-':'bicarbonates (HCO₃⁻)',PACO2:'pression artérielle en dioxyde de carbone (PaCO₂)',PAO2:'pression artérielle en oxygène (PaO₂)',SPO2:'saturation pulsée en oxygène (SpO₂)',ADN:'acide désoxyribonucléique (ADN)',ARN:'acide ribonucléique (ARN)',ARNM:'ARN messager (ARNm)',ATP:'adénosine triphosphate (ATP)',PCR:'réaction en chaîne par polymérase (PCR)',VIH:"virus de l’immunodéficience humaine (VIH)",VHB:"virus de l’hépatite B (VHB)",VHC:"virus de l’hépatite C (VHC)",CRP:'protéine C-réactive (CRP)',DFG:'débit de filtration glomérulaire (DFG)','NA+':'sodium (Na⁺)','K+':'potassium (K⁺)','CA2+':'calcium (Ca²⁺)'};return map[k]||null}
function evidenceExpansion(term,q){return null}
function expandTerm(term,q){const raw=stripSourceMeta(subjectCase(term)),known=knownExpansion(raw);if(known)return known;const acronym=/^[A-ZÀ-Ý]{2,6}[0-9₂₃]*[+⁺\-−⁻]*$/.test(raw);if(acronym)return evidenceExpansion(raw,q);return raw}
function expandKnownInText(front){let x=String(front||'');const reps=[[/\bLIC\b/gi,'liquide intracellulaire (LIC)'],[/\bLEC\b/gi,'liquide extracellulaire (LEC)'],[/\bADH\b/gi,'hormone antidiurétique (ADH)'],[/\bHCO[₃3][⁻−-]?\b/gi,'bicarbonates (HCO₃⁻)'],[/\bPaCO[₂2]\b/gi,'pression artérielle en dioxyde de carbone (PaCO₂)'],[/\bPaO[₂2]\b/gi,'pression artérielle en oxygène (PaO₂)'],[/\bSpO[₂2]\b/gi,'saturation pulsée en oxygène (SpO₂)']];for(const [re,to] of reps)x=x.replace(re,to);return x}
function articleSubject(s){const x=stripSourceMeta(subjectCase(s));if(/^(?:le|la|les|l['’]|un|une|des)\s/i.test(x))return lcFirst(x);if(/^(?:calcium|potassium|sodium|magnésium|fer|phosphore|pancréas|rein|foie)\b/i.test(x))return'le '+lcFirst(x);return lcFirst(x)}
function themeContext(q){const t=String(theme(q)||'').toLowerCase();if(/homéostase|rétrocontrôle/.test(t))return'dans une boucle d’homéostasie';if(/thermorégulation/.test(t))return'en thermorégulation';if(/équilibre hydrique|adh/.test(t))return'dans l’équilibre hydrique';if(/acido|\bph\b/.test(t))return'dans l’équilibre acido-basique';if(/adn|arn|génétique/.test(t))return'en biologie moléculaire';return''}
function contextualPairFront(left,right,q,numeric){const raw=stripSourceMeta(subjectCase(left)),expanded=expandTerm(raw,q);if(!expanded)return null;const k=termKey(raw),ctx=themeContext(q);if(k==='LIC'&&numeric)return'Quelle proportion de l’eau corporelle totale se trouve dans le liquide intracellulaire (LIC) ?';if(k==='LEC'&&numeric)return'Quelle proportion de l’eau corporelle totale se trouve dans le liquide extracellulaire (LEC) ?';if(/^HCO3-?$/.test(k)&&numeric)return'Quelle est la valeur normale des bicarbonates (HCO₃⁻) dans le sang ?';if(/^capteur$/i.test(raw)&&/homéostase|rétrocontrôle/i.test(String(theme(q))))return'Quel est le rôle du capteur dans une boucle d’homéostasie ?';if(/^(?:convection|conduction|évaporation|rayonnement)$/i.test(raw)&&/thermorégulation/i.test(String(theme(q))))return'En thermorégulation, à quoi correspond la '+lcFirst(raw)+' ?';if(numeric)return'Quelle est la valeur normale de '+lcFirst(expanded)+' ?';if(ctx&&raw.split(/\s+/).length<=2)return'À quoi correspond « '+expanded+' » '+ctx+' ?';return'À quoi correspond « '+expanded+' » ?'}
function contextualizeFront(front,q){let f=expandKnownInText(contextualizeDefinition(sanitizeContextFront(stripSourceMeta(front)),q));if(/Quel organe sécrète l['’]insuline/i.test(f))f='Quel organe sécrète l’insuline ?';return capFirst(f.replace(/\s+/g,' ').replace(/\s+\?/g,' ?').trim())}
function subjectPrompt(t){let s=stripSourceMeta(String(t||'').trim()),m=s.match(/^Concernant\s+(.+?)\s*\?$/i);if(m)return subjectCase(m[1]);m=s.match(/^((?:Le|La|Les|L['’])\s+[^?]{2,60})\s*\?$/i);return m?subjectCase(m[1]):''}
function deSubject(s){const x=String(s||'').trim();if(/^le\s+/i.test(x))return'du '+x.replace(/^le\s+/i,'');if(/^la\s+/i.test(x))return'de la '+x.replace(/^la\s+/i,'');if(/^les\s+/i.test(x))return'des '+x.replace(/^les\s+/i,'');if(/^l['’]/i.test(x))return'de '+x;return'de '+x}
function subjectFactAtom(subject,a,q){const s=String(a||'').trim().replace(/[.;]+$/,''),sub=articleSubject(subject),exp=sanitizeExplanation(q?.explanation||'');let m=s.match(/^environ\s+(.+?)\s+se trouve(?:nt)?\s+dans\s+(.+)$/i);if(m)return{kind:'Valeur à connaître',front:'Où se trouve environ '+m[1]+' '+deSubject(sub)+' de l’organisme ?',answers:[capFirst(m[2])],explanation:exp,atomic:true};m=s.match(/^(?:il|elle)?\s*participe\s+à\s+(.+)$/i);if(m)return{kind:'Rôle / fonction',front:'À quel processus physiologique participe '+sub+' ?',answers:[subjectCase(m[1])],explanation:exp,atomic:true};m=s.match(/^(?:il|elle)?\s*intervient\s+(?:dans|au niveau de)\s+(.+)$/i);if(m)return{kind:'Rôle / fonction',front:'Dans quel processus physiologique intervient '+sub+' ?',answers:[subjectCase(m[1])],explanation:exp,atomic:true};m=s.match(/^est\s+le\s+principal\s+(.+)$/i);if(m)return{kind:'Définition',front:'Quel est le principal '+subjectCase(m[1])+' ?',answers:[capFirst(sub)],explanation:exp,atomic:true};m=s.match(/^se trouve\s+principalement\s+dans\s+(.+)$/i);if(m)return{kind:'Localisation',front:'Où se trouve principalement '+sub+' ?',answers:[capFirst(m[1])],explanation:exp,atomic:true};m=s.match(/^(?:il|elle)?\s*(?:joue un rôle|est impliqué(?:e)?)\s+dans\s+(.+)$/i);if(m)return{kind:'Rôle / fonction',front:'Dans quel processus physiologique intervient '+sub+' ?',answers:[subjectCase(m[1])],explanation:exp,atomic:true};return null}
function subjectAtomicCards(q,t){const subject=subjectPrompt(t);if(!subject)return[];const atoms=[];for(const a of correctAnswers(q).map(compactAnswer)){const z=subjectFactAtom(subject,a,q);if(z)atoms.push(z)}return atoms}
function contextualizeDefinition(front,q){let f=String(front||'').trim();if(/^(?:À quoi correspond|Qu['’]est-ce que) la traduction\s*\?$/i.test(f))return'Qu’est-ce que la traduction en biologie moléculaire ?';if(/^(?:À quoi correspond|Qu['’]est-ce que) la transcription\s*\?$/i.test(f))return'Qu’est-ce que la transcription en biologie moléculaire ?';return f}
function definitionCard(q,t){
  let m=t.match(/^(.{2,80}?)\s+(?:correspond|désigne|se définit)\s+(?:à|comme)\s*:?$/i);
  if(m)return{kind:'Définition',front:`Qu’est-ce que ${lcFirst(subjectCase(m[1]))} ?`,answers:correctAnswers(q).map(compactAnswer)};
  m=t.match(/^Quelle est la définition (?:de|du|de la|des)\s+(.+?)\s*\?$/i);
  if(m)return{kind:'Définition',front:`Qu’est-ce que ${lcFirst(subjectCase(m[1]))} ?`,answers:correctAnswers(q).map(compactAnswer)};
  m=t.match(/^Qu['’]est-ce (?:que|qu['’])\s*(.+?)\s*\?$/i);
  if(m)return{kind:'Définition',front:t,answers:correctAnswers(q).map(compactAnswer)};
  m=t.match(/^(.{2,70}?)\s+est\s*:\s*$/i);
  if(m&&m[1].split(/\s+/).length<=8)return{kind:'Définition',front:`Qu’est-ce que ${lcFirst(subjectCase(m[1]))} ?`,answers:correctAnswers(q).map(compactAnswer)};
  return null
}
function roleCard(q,t){
  let m=t.match(/^(?:Quel est |Quelle est )?(?:le |la )?rôle (?:de|du|de la|des)\s+(.+?)\s*\??$/i);
  if(m)return{kind:'Rôle / fonction',front:`Quel est le rôle de ${lcFirst(subjectCase(m[1]))} ?`,answers:correctAnswers(q).map(compactAnswer)};
  m=t.match(/^(.+?)\s+(?:a pour rôle|a pour fonction|sert à|permet)\s*:?$/i);
  if(m)return{kind:'Rôle / fonction',front:`Quel est le rôle de ${lcFirst(subjectCase(m[1]))} ?`,answers:correctAnswers(q).map(compactAnswer)};
  if(/\bfonction(?:s)?\b/i.test(t)&&/\?$/.test(t))return{kind:'Rôle / fonction',front:t,answers:correctAnswers(q).map(compactAnswer)};
  return null
}
function stepsCard(q,t){
  if(/\b(?:étapes|phases|stades|ordre|séquence)\b/i.test(t)){
    let front=t;
    if(!/\?$/.test(front))front=`Quelles sont les principales étapes concernant ${lcFirst(subjectCase(theme(q)))} ?`;
    return{kind:'Étapes',front,answers:correctAnswers(q).map(compactAnswer)}
  }
  return null
}
function valueCard(q,t){
  const good=correctAnswers(q),all=[...good,...wrongAnswers(q)],unit=/\b\d+(?:[.,]\d+)?\s*(?:%|mmHg|bpm|°C|g\/?L|mg\/?L|mmol\/?L|mL|L\/min|kg|cm|mm|UI|mEq)\b/i;
  if(!all.some(x=>unit.test(x))&&!/\b(?:norme|valeur normale|valeurs normales|intervalle|seuil|fréquence|saturation|SpO2|température|pression artérielle)\b/i.test(t))return null;
  let front=t.replace(/\s*:\s*$/,'?');
  if(!/\?$/.test(front)){
    if(/^Concernant\s+/i.test(front))front=`Quelle valeur faut-il retenir ${lcFirst(front)} ?`;
    else front=`Quelle valeur faut-il retenir pour ${lcFirst(subjectCase(front))} ?`
  }
  front=front.replace(/^La valeur normale de (.+?) est\s*\?$/i,'Quelle est la valeur normale de $1 ?');
  return{kind:'Valeur à connaître',front,answers:good.map(compactAnswer)}
}
function trueFalseCard(q,t){
  const pool=(q?.choices||[]).map((x,i)=>({text:String(x||'').trim(),good:(q?.answers||[]).includes(i)})).filter(x=>x.text.length>=24&&x.text.length<=135&&hasVerb(x.text));
  if(!pool.length)return null;
  const pick=pool[hash(q.id)%pool.length];
  if(hash(q.id)%4!==0)return null;
  return{kind:'Vrai / Faux',front:`Vrai ou faux : ${pick.text.replace(/[.?]+$/,'')} ?`,answers:[pick.good?'Vrai.':'Faux.'],explanation:pick.good?String(q.explanation||'').trim():`Faux. ${String(q.explanation||'').trim()}`}
}
function directQuestion(t){
  let front=String(t||'').trim();
  if(/^(?:Qui|Que|Qu['’]est-ce|Quel(?:le|s|les)?|Quels?|Quelles?|Comment|Pourquoi|Où|Quand|Combien|À quoi|A quoi|De quoi|Par quoi)\b/i.test(front)){
    return capFirst(front.replace(/\s*:\s*$/,' ?').replace(/\s*\?\s*$/,' ?').replace(/\s+/g,' ').trim())
  }
  let m=front.match(/^(.+?)\s+sont\s*:\s*$/i);
  if(m)return `Quels sont ${lcFirst(subjectCase(m[1]))} ?`;
  m=front.match(/^(.+?)\s+est\s*:\s*$/i);
  if(m)return `Qu’est-ce que ${lcFirst(subjectCase(m[1]))} ?`;
  m=front.match(/^(.+?)\s+correspond(?:ent)?(?:\s+à)?\s*:\s*$/i);
  if(m)return /^\s*(?:les|des|ces)\b/i.test(m[1])?`À quoi correspondent ${lcFirst(subjectCase(m[1]))} ?`:`À quoi correspond ${lcFirst(subjectCase(m[1]))} ?`;
  m=front.match(/^(.+?)\s+peut faire appel à\s*:\s*$/i);
  if(m)return `À quoi peut faire appel ${lcFirst(subjectCase(m[1]))} ?`;
  m=front.match(/^(.+?)\s+peuvent faire appel à\s*:\s*$/i);
  if(m)return `À quoi peuvent faire appel ${lcFirst(subjectCase(m[1]))} ?`;
  m=front.match(/^(.+?)\s+comprend(?:ent)?\s*:\s*$/i);
  if(m)return `Que comprend ${lcFirst(subjectCase(m[1]))} ?`;
  m=front.match(/^(.+?)\s+se compose(?:nt)? de\s*:\s*$/i);
  if(m)return `De quoi se compose ${lcFirst(subjectCase(m[1]))} ?`;
  m=front.match(/^(.+?)\s+se caractérise(?:nt)? par\s*:\s*$/i);
  if(m)return `Comment se caractérise ${lcFirst(subjectCase(m[1]))} ?`;
  m=front.match(/^(.+?)\s+permet(?:tent)?\s*:\s*$/i);
  if(m)return `Que permet ${lcFirst(subjectCase(m[1]))} ?`;
  return null
}
function recoverContextCard(q,t){
  const original=String(t||'').trim(),exp=String(q?.explanation||'').trim(),good=correctAnswers(q).map(compactAnswer);
  const evidence=[original,exp,...good].join(' ');
  if(/\b(?:hiérarchie correcte|ordre correct|ordre d['’]organisation)\b/i.test(original)){
    if(/\b(?:muscle|faisceau|fibres?|myofibrilles?|sarcomères?)\b/i.test(evidence)){
      return{kind:'Étapes',front:'Quel est l’ordre d’organisation du muscle squelettique, du plus grand au plus petit ?',answers:good,explanation:exp,recovered:true}
    }
    const topic=subjectCase(theme(q));
    if(topic&&topic!=='Général')return{kind:'Étapes',front:`Quel est l’ordre d’organisation concernant ${lcFirst(topic)} ?`,answers:good,explanation:exp,recovered:true}
  }
  let x=original
    .replace(/\b(?:cité(?:e|es|s)?|mentionné(?:e|es|s)?|suivant(?:e|es|s)?|proposé(?:e|es|s)?|indiqué(?:e|es|s)?|présenté(?:e|es|s)?)\b/gi,'')
    .replace(/^Parmi (?:les|ces) (?:propositions|réponses|éléments)[^,:;?]*[,;:]?\s*/i,'')
    .replace(/\b(?:ci-dessus|ci-dessous|dans le cours|selon le cours|dans cet exemple|dans l['’]exemple du cours)\b/gi,'')
    .replace(/\s+/g,' ').replace(/\s+([?;,:])/g,'$1').trim();
  x=x.replace(/\s*:\s*$/,' ?').replace(/\s*\?\s*$/,' ?');
  let front=directQuestion(x);
  if(front&&!vagueFront(front))return{kind:'Question / réponse',front,answers:good,explanation:exp,recovered:true};
  return null
}
function vagueFront(front){
  const f=String(front||'').toLowerCase();
  return !front||front.length<8||
    /^concernant\s+.+\?$/i.test(String(front||'').trim())||
    /^(?:le|la|les|l['’])\s+[^?]{2,60}\?$/i.test(String(front||'').trim())||
    /que faut-il retenir concernant/.test(f)||
    /dans l['’]exemple du cours/.test(f)||
    /\b(?:ceci|cela|ci-dessus|ci-dessous|dans ce cas|dans cet exemple|dans le cours|selon le cours)\b/.test(f)||
    /\b(?:cité(?:e|es|s)?|mentionné(?:e|es|s)?|suivant(?:e|es|s)?|proposé(?:e|es|s)?|indiqué(?:e|es|s)?|présenté(?:e|es|s)?)\b/.test(f)||
    /\bparmi (?:les|ces) (?:propositions|réponses|éléments)\b/.test(f)||
    /\bla hiérarchie correcte\b/.test(f)||
    /concernant\s+(?:dans|lesquels?|laquelle|lequel)\b/.test(f)||
    /\b(?:sont|correspond|peut faire appel à)\s*\?$/.test(f)
}
function genericQuestion(q,t){
  let front=directQuestion(t);
  if(!front){
    let x=t;
    x=x.replace(/^Parmi les fonctions attribuées à\s+(.+?)\s*:\s*$/i,'Quelles sont les fonctions de $1 ?');
    x=x.replace(/^Concernant\s+(.+?)\s*:\s*$/i,'');
    x=x.replace(/^À propos de\s+(.+?)\s*:\s*$/i,'');
    if(x&&x!==t)front=directQuestion(x);
  }
  if(!front||vagueFront(front))return null;
  return{kind:'Question / réponse',front:capFirst(front.replace(/\s+/g,' ').trim()),answers:correctAnswers(q).map(compactAnswer)}
}
function sanitizeContextFront(front){
  let x=String(front||'').trim()
    .replace(/\b(?:selon|conformément (?:à|au)|d['’]après) (?:le |la |au )?(?:support(?: officiel)?|cours)\b/gi,'')
    .replace(/\b(?:dans|du|de la|au) (?:le |la )?(?:support(?: officiel)?|cours)\b/gi,'')
    .replace(/\bde la diapo(?:sitive)?\s*\d+\b/gi,'')
    .replace(/\b(?:sur|dans) (?:le )?(?:schéma|figure|document)\b[^?]*?(?=\?|$)/gi,'')
    .replace(/\s+/g,' ').replace(/\s+([?;,:])/g,'$1').trim();
  x=x.replace(/^Qu['’]est-ce que\s*,?\s*/i,'Qu’est-ce que ');
  x=x.replace(/^Quelle fonction est attribuée à\s+(.+?)\s*\?$/i,'Quelle est la fonction de $1 ?');
  x=x.replace(/^Quel organe est nommé comme producteur de\s+(.+?)\s*\?$/i,'Quel organe produit $1 ?');
  x=x.replace(/^Quelle proposition définit\s+(.+?)\s*\?$/i,'Qu’est-ce que $1 ?');
  x=x.replace(/^Quelles propriétés de\s+(.+?)\s+sont\s*\?$/i,'Quelles sont les principales propriétés de $1 ?');
  x=x.replace(/^Quelles affirmations décrivent\s+(.+?)\s*\?$/i,'Quelles sont les principales caractéristiques de $1 ?');
  x=x.replace(/^Quelles associations\s+(.+?)\s+correspondent\s*\?$/i,'Quelles sont les associations $1 ?');
  return capFirst(x.replace(/\s+/g,' ').trim())
}
function answerPairAtom(a,q){
  const s=String(a||'').trim().replace(/[.;]+$/,'');
  let m=s.match(/^(.{1,70}?)\s*(?:→|:|=|\s+[–—-]\s+)\s*(.{2,180})$/);
  if(!m)return null;
  const rawLeft=subjectCase(m[1]),right=subjectCase(m[2]),exp=sanitizeExplanation(q?.explanation||''),evidence=[String(q?.question||''),exp,rawLeft,right].join(' ');
  if(!rawLeft||!right)return null;
  if(/^[A-ZÀ-Ý]$/i.test(rawLeft))return null;
  if(/^(?:fins?|épais)$/i.test(rawLeft)&&/myofilament|actine|myosine/i.test(evidence)){const label=/^fins?$/i.test(rawLeft)?'fins':'épais';return{kind:'Association',front:'De quoi sont principalement constitués les myofilaments '+label+' ?',answers:[right],explanation:exp}}
  if(rawLeft.length<=2||/^\d+$/.test(rawLeft))return null;
  const genericOneWord=/^(?:fins?|épais|haut|bas|droite|gauche|antérieur|postérieur|supérieur|inférieur|proximal|distal)$/i.test(rawLeft);
  if(genericOneWord)return null;
  const numeric=/\b\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*(?:%|mmHg|bpm|°C|g\/?L|mg\/?L|mmol\/?L|mL|L\/min|kg|cm|mm|UI|mEq)\b/i.test(right);
  const front=contextualPairFront(rawLeft,right,q,numeric);
  if(!front)return null;
  return{kind:numeric?'Valeur à connaître':'Association',front,answers:[right],explanation:exp}
}
function answerSentenceAtom(a){
  const s=String(a||'').trim().replace(/[.;]+$/,'');
  let m=s.match(/^(.{2,90}?)\s+(sécrète|sécrètent|produit|produisent|contient|contiennent|favorise|favorisent|permet|permettent|assure|assurent)\s+(.{2,180})$/i);
  if(m){const sub=subjectCase(m[1]),verb=m[2].toLowerCase(),obj=subjectCase(m[3]);let front='';
    if(/^sécr/.test(verb))front=`Que sécrète ${lcFirst(sub)} ?`;
    else if(/^produ/.test(verb))front=`Que produit ${lcFirst(sub)} ?`;
    else if(/^cont/.test(verb))front=`Que contient ${lcFirst(sub)} ?`;
    else if(/^favor/.test(verb))front=`Que favorise ${lcFirst(sub)} ?`;
    else if(/^permet/.test(verb))front=`Que permet ${lcFirst(sub)} ?`;
    else front=`Quel rôle assure ${lcFirst(sub)} ?`;
    return{kind:'Question / réponse',front,answers:[obj]}
  }
  m=s.match(/^(.{2,90}?)\s+peut\s+(favoriser|provoquer|entraîner|permettre|donner)\s+(.{2,180})$/i);
  if(m)return{kind:'Question / réponse',front:`Que peut ${m[2]} ${lcFirst(subjectCase(m[1]))} ?`,answers:[subjectCase(m[3])]};
  m=s.match(/^(.{2,90}?)\s+peuvent\s+(favoriser|provoquer|entraîner|permettre|donner)\s+(.{2,180})$/i);
  if(m)return{kind:'Question / réponse',front:`Que peuvent ${m[2]} ${lcFirst(subjectCase(m[1]))} ?`,answers:[subjectCase(m[3])]};
  m=s.match(/^(.{2,90}?)\s+correspond(?:ent)?\s+à\s+(.{2,180})$/i);
  if(m)return{kind:'Définition',front:`À quoi correspond ${lcFirst(subjectCase(m[1]))} ?`,answers:[subjectCase(m[2])]};
  m=s.match(/^(.{2,90}?)\s+est de\s+(.{2,120})$/i);
  if(m&&/\d/.test(m[2]))return{kind:'Valeur à connaître',front:`Quelle est la valeur de ${lcFirst(subjectCase(m[1]).replace(/\bindiqué(?:e)?\b/i,'').trim())} ?`,answers:[subjectCase(m[2])]};
  m=s.match(/^Le pH\s+7\s+est\s+neutre$/i);
  if(m)return{kind:'Définition',front:'Que signifie un pH de 7 ?',answers:['Il est neutre']};
  return null
}
function atomicFromAnswers(q,t){
  const good=correctAnswers(q).map(compactAnswer),exp=String(q?.explanation||'').trim();
  if(good.length<2)return[];
  if(/\b(?:hiérarchie correcte|ordre correct|ordre d['’]organisation)\b/i.test(t))return[];
  const atoms=[];
  for(const a of good){
    const z=answerPairAtom(a,q)||answerSentenceAtom(a);
    if(z&&!vagueFront(z.front))atoms.push({...z,explanation:exp,atomic:true})
  }
  if(atoms.length>=2)return atoms;
  const cleanT=stripSourceMeta(t),subjectMatch=cleanT.match(/(?:s['’]appliquent|concernent|à propos de|concernant)\s+(?:au|à la|aux|le|la|les)?\s*([^?:,]+?)(?:\s*\?|\s*:|$)/i);
  const subject=subjectCase(subjectMatch?.[1]||'');
  const roles=good.filter(a=>/^Participation à\s+/i.test(a)).map(a=>subjectCase(a.replace(/^Participation à\s+/i,'')));
  const values=good.map(a=>answerPairAtom(a,q)).filter(Boolean).filter(x=>x.kind==='Valeur à connaître');
  if(subject&&roles.length>=2)atoms.push({kind:'Rôle / fonction',front:'À quels processus physiologiques participe '+articleSubject(subject)+' ?',answers:roles,explanation:sanitizeExplanation(exp),atomic:true});
  for(const v of values)atoms.push({...v,explanation:exp,atomic:true});
  return atoms.length>=2?atoms:[]
}
function pedagogicalCard(q){
  const t=cleanQuestion(q),exp=String(q.explanation||'').trim();
  let card=definitionCard(q,t)||roleCard(q,t)||stepsCard(q,t)||valueCard(q,t)||genericQuestion(q,t);
  if(card)card={...card,front:contextualizeFront(card.front,q)};
  if(!card||vagueFront(card.front))card=recoverContextCard(q,t);
  if(card)card={...card,front:contextualizeFront(card.front,q)};
  if(!card||vagueFront(card.front))return null;
  const answers=refineAnswers(card.front,card.answers||answer(q),card.explanation??exp);
  if(!answers.length||!answersMatchQuestion(card.front,answers))return null;
  return{...card,answers,explanation:sanitizeExplanation(card.explanation??exp)}
}
function atomicCards(q){
  const t=cleanQuestion(q),good=correctAnswers(q),subjectParts=subjectAtomicCards(q,t),meta=/\b(?:associations?|propositions?|affirmations?|sont exactes|sont justes|sont correctes|est exacte|est juste|est correcte|correspondent au support|valeurs ou définitions)\b/i.test(t);
  if(subjectParts.length)return subjectParts.map(p=>({...p,answers:refineAnswers(p.front,p.answers,p.explanation||q.explanation||'')})).filter(p=>p.answers.length&&answersMatchQuestion(p.front,p.answers));
  const split=good.length>1&&(meta||good.some(a=>/(?:→|:|=)/.test(a)))?atomicFromAnswers(q,t):[];
  if(split.length>=2)return split.map(p=>({...p,answers:refineAnswers(p.front,p.answers,p.explanation||q.explanation||'')})).filter(p=>p.answers.length&&answersMatchQuestion(p.front,p.answers));
  const p=pedagogicalCard(q);
  return p?[p]:[]
}
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function selectCards(cards,max=40){
  const seen=new Set(),clean=[];
  for(const c of cards){const k=String(c.front||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();if(!k||seen.has(k)||vagueFront(c.front))continue;seen.add(k);clean.push(c)}
  const groups=new Map();for(const c of clean){const k=c.theme||'Général';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c)}
  for(const a of groups.values())a.sort((x,y)=>hash(x.id)-hash(y.id));
  const keys=[...groups.keys()].sort((a,b)=>a.localeCompare(b,'fr')),out=[];let round=0;
  while(out.length<Math.min(max,clean.length)){let added=0;for(const k of keys){const a=groups.get(k),c=a[round];if(c&&out.length<max){out.push(c);added++}}if(!added)break;round++}
  return out
}
function build(){const out=[];for(const c of reg()){const r=res(c.id),qs=Array.isArray(r.questions)?r.questions:[];if(!qs.length)continue;const candidates=[];for(const q of qs){const parts=atomicCards(q),split=parts.length>1;parts.forEach((p,i)=>candidates.push({id:split?`fc:${q.id}:${i+1}`:`fc:${q.id}`,qid:q.id,courseId:c.id,course:c.label,theme:theme(q),difficulty:diff(q),kind:p.kind,front:contextualizeFront(p.front,q),answers:p.answers,explanation:sanitizeExplanation(p.explanation),officialSupport:!(r.sheets||[]).some(s=>s.officialSupport===false)}))}out.push(...selectCards(candidates,40))}deck=out;return out}
function state(id){return read().cards?.[id]||null}function statusOf(id){const s=state(id);if(!s)return'unseen';if(s.status==='again'||(s.due&&s.due<=now()))return'again';return s.status||'learning'}
function stats(cards=deck){let known=0,learning=0,again=0,unseen=0;for(const c of cards){const s=statusOf(c.id);if(s==='known')known++;else if(s==='learning')learning++;else if(s==='again')again++;else unseen++}return{known,learning,again,unseen,total:cards.length,mastered:cards.length?Math.round(known/cards.length*100):0}}
function dueCards(cards=deck){return cards.filter(c=>{const s=state(c.id);return !!s&&(s.status==='again'||(s.due&&s.due<=now()))})}
function courseCards(id){return deck.filter(c=>id==='all'||c.courseId===id)}
function setMark(card,mark){const s=read(),old=s.cards?.[card.id]||{seen:0,streak:0,favorite:false};s.cards=s.cards||{};const next={...old,seen:(old.seen||0)+1,last:now()};if(mark==='again'){next.status='again';next.streak=0;next.due=now()}else if(mark==='learning'){next.status='learning';next.streak=(old.streak||0)+1;next.due=now()+day}else{next.status='known';next.streak=(old.streak||0)+1;const gap=[4,7,14,30,60][Math.min(next.streak-1,4)];next.due=now()+gap*day}s.cards[card.id]=next;write(s);sessionMarks.push({id:card.id,mark})}
function toggleFav(card){const s=read();s.cards=s.cards||{};const old=s.cards[card.id]||{seen:0,streak:0};s.cards[card.id]={...old,favorite:!old.favorite};write(s);drawSession()}
function favorite(card){return !!state(card.id)?.favorite}
function sourceLabel(id){const sheets=res(id).sheets||[];if(!sheets.length)return'';return sheets.some(s=>s.officialSupport===false)?'📝 Notes / captures':'✓ Support officiel'}
function ensure(){if($('v8338Flashcards'))return;const sec=document.createElement('section');sec.id='v8338Flashcards';sec.className='hidden';sec.innerHTML='<div id="fcApp"></div>';($('quiz')||document.querySelector('.app')).insertAdjacentElement?.($('quiz')?'beforebegin':'beforeend',sec)}
function css(){if($('v8338FlashcardsCss'))return;const s=document.createElement('style');s.id='v8338FlashcardsCss';s.textContent=`
#v81Body .fc-revision-entry{grid-column:1/-1!important;order:3!important;padding:18px!important;border:1px solid #c9b9f1!important;background:linear-gradient(135deg,#f5f0ff,#eefcff)!important;overflow:hidden;position:relative}
#v81Body .vcr-custom{order:4!important}#v81Body .v8309-quick{order:5!important}#v81Body .v8309-exam{order:6!important}#v81Body .v8309-goal{order:7!important}
.fc-entry-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:center}.fc-entry-icon{width:72px;height:72px;border-radius:22px;display:grid;place-items:center;font-size:36px;background:linear-gradient(145deg,#6941c6,#8b5cf6);color:#fff;box-shadow:0 12px 28px #6941c63b}.fc-entry-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.fc-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:#fff;border:1px solid #ded5ef;font-size:12px;font-weight:800}.fc-shell{max-width:760px;margin:0 auto}.fc-head{display:flex;align-items:center;gap:12px;margin:4px 0 14px}.fc-back{width:44px;height:44px;border-radius:14px}.fc-hero{background:linear-gradient(135deg,#6941c6,#7c3aed);color:#fff;border:0}.fc-hero .small{color:#efeaff}.fc-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.fc-mini{border-radius:14px;padding:11px;background:#ffffff18;border:1px solid #ffffff25;text-align:center}.fc-mini b{display:block;font-size:22px}.fc-course-list{display:grid;gap:9px}.fc-course{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:13px;border:1px solid var(--line);border-radius:16px;background:var(--card);cursor:pointer;text-align:left}.fc-course:hover{border-color:#bbaae8}.fc-course-title{font-weight:850}.fc-course-meta{font-size:12px;color:var(--muted);margin-top:4px}.fc-progress{height:7px;background:#ece8f2;border-radius:999px;overflow:hidden;margin-top:8px}.fc-progress span{display:block;height:100%;background:linear-gradient(90deg,#16a085,#6941c6)}.fc-card-wrap{perspective:1000px;margin-top:12px}.fc-card{min-height:420px;border-radius:28px;padding:22px;background:linear-gradient(160deg,#fff,#f7f4ff);border:1px solid #ddd4ee;box-shadow:0 18px 45px #33225a18;display:flex;flex-direction:column;justify-content:space-between}.fc-card-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.fc-topic{padding:6px 10px;border-radius:999px;background:#e9fbf6;color:#15735c;font-size:12px;font-weight:850}.fc-star{border:0;background:transparent;font-size:27px;cursor:pointer}.fc-question{font-size:27px;font-weight:850;line-height:1.2;margin:28px 0;text-align:center}.fc-hint{text-align:center;color:var(--muted);font-size:13px}.fc-answer{font-size:20px;line-height:1.35;margin:18px 0}.fc-answer ul{padding-left:22px}.fc-explain{margin-top:14px;padding:13px;border-radius:16px;background:#f0ebfb;border-left:4px solid #6941c6;line-height:1.45}.fc-session-actions{display:grid;grid-template-columns:1fr 1.4fr;gap:9px;margin-top:12px}.fc-ratings{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:12px}.fc-rate{border:0;border-radius:16px;padding:13px 8px;font-weight:850;cursor:pointer}.fc-again{background:#fff0ef;color:#b42318}.fc-learning{background:#fff6df;color:#8a5b00}.fc-known{background:#eaf8ef;color:#187a3c}.fc-session-bar{height:7px;background:#e9e6ef;border-radius:99px;overflow:hidden;flex:1}.fc-session-bar span{display:block;height:100%;background:linear-gradient(90deg,#6941c6,#8b5cf6)}.fc-mode-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.fc-mode{border:1px solid #ddd4ee;border-radius:16px;background:var(--card);padding:14px;text-align:left;cursor:pointer}.fc-mode b{display:block}.fc-empty{text-align:center;padding:34px 15px}.fc-result{text-align:center}.fc-result-icon{font-size:58px}.fc-source-warn{font-size:11px;color:#705300;background:#fff7df;border-radius:999px;padding:4px 7px;display:inline-block;margin-top:5px}body.v72-dark .fc-course,body.v72-dark .fc-mode,body.v72-dark .fc-card{background:#211e2a;color:#f4f0fb;border-color:#41374f}body.v72-dark .fc-explain{background:#302841}.fc-course:focus-visible,.fc-mode:focus-visible,.fc-rate:focus-visible,.fc-star:focus-visible{outline:3px solid #9d83df;outline-offset:2px}
@media(max-width:620px){.fc-entry-grid{grid-template-columns:1fr auto}.fc-entry-icon{width:58px;height:58px;border-radius:18px;font-size:30px}.fc-summary-grid{grid-template-columns:repeat(3,1fr)}.fc-card{min-height:390px;padding:18px}.fc-question{font-size:23px}.fc-answer{font-size:18px}.fc-ratings{grid-template-columns:1fr}.fc-mode-grid{grid-template-columns:1fr}.fc-session-actions{grid-template-columns:1fr}.fc-head h2{font-size:25px}}
`;document.head.appendChild(s)}
function hideAll(){document.querySelectorAll('.app > section').forEach(x=>x.classList.add('hidden'));ensure();$('v8338Flashcards').classList.remove('hidden');document.querySelectorAll('nav button').forEach(x=>x.classList.remove('on'));scrollTo({top:0,behavior:'smooth'})}
function openHome(){mode='home';activeCourse='all';hideAll();renderHome()}
function backRevision(){window.IFSI_V81?.showHub?.()||window.show?.('home')}
function renderHome(){const box=$('fcApp');if(!box)return;const all=stats(),due=dueCards(),courses=reg().map(c=>({c,cards:courseCards(c.id)})).filter(x=>x.cards.length);box.innerHTML=`<div class="fc-shell"><div class="fc-head"><button id="fcBack" class="btn outline fc-back" aria-label="Retour">←</button><div><h2 style="margin:0">🗂️ Flashcards</h2><div class="small">Révise activement, carte après carte.</div></div></div><div class="card fc-hero"><div class="row"><div><div class="small">CONTINUER MA RÉVISION</div><h2 style="margin:5px 0">${due.length?`${due.length} carte${due.length>1?'s':''} à revoir`:'Une série rapide ?'}</h2><div class="small">${due.length?'Priorité aux notions à consolider.':'Aucune carte urgente : révise 10 cartes au hasard.'}</div></div><button id="fcContinue" class="btn outline">▶ Continuer</button></div><div class="fc-summary-grid"><div class="fc-mini"><b>${all.mastered}%</b><span class="small">maîtrisées</span></div><div class="fc-mini"><b>${all.known}</b><span class="small">acquises</span></div><div class="fc-mini"><b>${all.unseen}</b><span class="small">jamais vues</span></div></div></div><div class="section">Modes de révision</div><div class="fc-mode-grid"><button class="fc-mode" data-mode="unseen"><b>🆕 Cartes jamais vues</b><span class="small">${all.unseen} disponibles</span></button><button class="fc-mode" data-mode="due"><b>🎯 Mes cartes à revoir</b><span class="small">${due.length} prioritaires</span></button><button class="fc-mode" data-mode="favorites"><b>⭐ Mes favorites</b><span class="small">Retrouve les notions marquées</span></button><button class="fc-mode" data-mode="random"><b>🔀 Série aléatoire</b><span class="small">10 cartes tous cours</span></button></div><div class="section">Par cours</div><div class="fc-course-list">${courses.map(({c,cards})=>{const s=stats(cards),src=sourceLabel(c.id);return `<button class="fc-course" data-course="${E(c.id)}"><div><div class="fc-course-title">${E(c.label)}</div><div class="fc-course-meta">${cards.length} cartes • ${s.known} acquises • ${s.again} à revoir</div>${src.includes('Notes')?`<span class="fc-source-warn">${E(src)}</span>`:''}<div class="fc-progress"><span style="width:${s.mastered}%"></span></div></div><b>${s.mastered}% ›</b></button>`}).join('')}</div></div>`;$('fcBack').onclick=backRevision;$('fcContinue').onclick=()=>startSession(due.length?due:shuffle(deck).slice(0,10),'À revoir');box.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>openMode(b.dataset.mode));box.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>renderCourse(b.dataset.course))}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function openMode(m){let cards=[];if(m==='unseen')cards=deck.filter(c=>statusOf(c.id)==='unseen');else if(m==='due')cards=dueCards();else if(m==='favorites')cards=deck.filter(favorite);else cards=shuffle(deck).slice(0,10);if(!cards.length)return renderEmpty(m);startSession(m==='random'?cards:shuffle(cards).slice(0,Math.min(20,cards.length)),m)}
function renderEmpty(kind){hideAll();const box=$('fcApp');box.innerHTML=`<div class="fc-shell"><div class="card fc-empty"><div style="font-size:48px">✨</div><h2>Rien à réviser ici</h2><p class="small">${kind==='due'?'Aucune carte n’est due pour le moment.':kind==='favorites'?'Tu n’as pas encore ajouté de carte aux favorites.':'Toutes les cartes de ce mode ont déjà été vues.'}</p><button id="fcEmptyBack" class="btn primary">Retour aux flashcards</button></div></div>`;$('fcEmptyBack').onclick=openHome}
function renderCourse(id){activeCourse=id;hideAll();const c=reg().find(x=>x.id===id),cards=courseCards(id),s=stats(cards),due=dueCards(cards);const box=$('fcApp');box.innerHTML=`<div class="fc-shell"><div class="fc-head"><button id="fcCourseBack" class="btn outline fc-back">←</button><div><h2 style="margin:0">${E(c?.label||'Cours')}</h2><div class="small">${cards.length} flashcards • ${s.mastered}% maîtrisées</div></div></div><div class="card"><div class="row"><div><b>Ta progression</b><div class="small">${s.known} acquises • ${s.learning} en cours • ${s.again} à revoir • ${s.unseen} jamais vues</div></div><span class="badge">${E(c?.ue||'')}</span></div><div class="fc-progress" style="height:10px;margin-top:12px"><span style="width:${s.mastered}%"></span></div></div><div class="section">Choisir une session</div><div class="fc-mode-grid"><button class="fc-mode" data-size="10"><b>⚡ Session rapide</b><span class="small">10 cartes • ~5 min</span></button><button class="fc-mode" data-size="20"><b>📚 Session classique</b><span class="small">20 cartes • ~10 min</span></button><button class="fc-mode" data-size="all"><b>🗂️ Toutes les cartes</b><span class="small">${cards.length} cartes</span></button><button class="fc-mode" data-size="due"><b>🎯 Mes erreurs uniquement</b><span class="small">${due.length} cartes à revoir</span></button></div></div>`;$('fcCourseBack').onclick=openHome;box.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{const k=b.dataset.size;let a=k==='due'?due:shuffle(cards);if(k==='10')a=a.slice(0,10);else if(k==='20')a=a.slice(0,20);if(!a.length)return renderEmpty('due');startSession(a,c?.label||'Cours')})}
function startSession(cards,label='Session'){session=[...cards];index=0;revealed=false;sessionMarks=[];mode='session';const s=read();s.sessions=(s.sessions||0)+1;write(s);hideAll();drawSession(label)}
function drawSession(label){const card=session[index],box=$('fcApp');if(!card){finish();return}const st=statusOf(card.id),fav=favorite(card);box.innerHTML=`<div class="fc-shell"><div class="row" style="gap:10px"><button id="fcQuit" class="btn outline fc-back">×</button><div class="fc-session-bar"><span style="width:${Math.round(index/session.length*100)}%"></span></div><b>${index+1} / ${session.length}</b></div><div class="fc-card-wrap"><article class="fc-card"><div><div class="fc-card-top"><span class="fc-topic">${E(card.theme)}</span><button id="fcStar" class="fc-star" aria-label="Favorite">${fav?'★':'☆'}</button></div><div class="small" style="margin-top:8px">${E(card.course)} • ${E(card.kind||'Question / réponse')} • ${card.difficulty==='easy'?'🟢 Facile':card.difficulty==='hard'?'🔴 Difficile':'🟠 Moyen'} ${st==='again'?'• 🎯 À revoir':st==='known'?'• ✅ Acquise':''}</div>${!revealed?`<div class="fc-question">${E(card.front)}</div><div class="fc-hint">Réfléchis avant de retourner la carte.</div>`:`<div class="fc-question" style="font-size:19px;text-align:left;margin-bottom:10px">${E(card.front)}</div><div class="fc-answer"><b>Réponse</b><ul>${card.answers.map(x=>`<li>${E(x)}</li>`).join('')}</ul></div>${card.explanation?`<div class="fc-explain">💡 ${E(card.explanation)}</div>`:''}`}</div></article></div>${!revealed?`<div class="fc-session-actions"><button id="fcDontKnow" class="btn outline">Je ne sais pas</button><button id="fcReveal" class="btn primary">↻ Voir la réponse</button></div>`:`<div class="fc-ratings"><button class="fc-rate fc-again" data-rate="again">✕<br>À revoir</button><button class="fc-rate fc-learning" data-rate="learning">−<br>En cours</button><button class="fc-rate fc-known" data-rate="known">✓<br>Acquise</button></div>`}</div>`;$('fcQuit').onclick=()=>activeCourse!=='all'?renderCourse(activeCourse):openHome;$('fcStar').onclick=()=>toggleFav(card);if(!revealed){$('fcReveal').onclick=()=>{revealed=true;drawSession(label)};$('fcDontKnow').onclick=()=>{revealed=true;drawSession(label)}}else box.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{setMark(card,b.dataset.rate);index++;revealed=false;if(index>=session.length)finish(label);else drawSession(label)})}
function finish(label='Session'){const total=session.length,known=sessionMarks.filter(x=>x.mark==='known').length,again=sessionMarks.filter(x=>x.mark==='again').length,learning=total-known-again,pct=total?Math.round(known/total*100):0,box=$('fcApp');box.innerHTML=`<div class="fc-shell"><div class="card fc-result"><div class="fc-result-icon">🎉</div><h2>Série terminée !</h2><div class="small">${E(label)} • ${total} cartes</div><div class="grid" style="margin-top:16px"><div class="stat"><b style="color:#187a3c">${known}</b><span class="small">Acquises</span></div><div class="stat"><b style="color:#8a5b00">${learning}</b><span class="small">En cours</span></div><div class="stat"><b style="color:#b42318">${again}</b><span class="small">À revoir</span></div><div class="stat"><b>${pct}%</b><span class="small">Maîtrisées</span></div></div>${again?'<button id="fcRetry" class="btn primary full" style="margin-top:16px">Revoir mes erreurs</button>':''}<button id="fcDone" class="btn outline full" style="margin-top:9px">Retour aux flashcards</button></div></div>`;if($('fcRetry'))$('fcRetry').onclick=()=>{const ids=new Set(sessionMarks.filter(x=>x.mark==='again').map(x=>x.id));startSession(session.filter(c=>ids.has(c.id)),'Mes erreurs')};$('fcDone').onclick=openHome}
function inject(){const body=$('v81Body');if(!body||body.querySelector('.fc-revision-entry'))return false;const s=stats(),due=dueCards(),card=document.createElement('div');card.className='card fc-revision-entry';card.innerHTML=`<div class="fc-entry-grid"><div><div class="row" style="justify-content:flex-start"><span class="badge">NOUVEAU</span><b>🗂️ Flashcards</b></div><h3 style="margin:8px 0 5px">Révise autrement qu’avec les QCM</h3><div class="small">Questions de rappel actif par cours : définitions, valeurs, vrai/faux, rôles et étapes.</div><div class="fc-entry-actions"><span class="fc-pill">${deck.length} cartes</span><span class="fc-pill">${s.mastered}% maîtrisées</span><span class="fc-pill">🎯 ${due.length} à revoir</span><button id="fcOpen" class="btn primary">Ouvrir les flashcards →</button></div></div><div class="fc-entry-icon">▰</div></div>`;const custom=body.querySelector('.vcr-custom');custom?body.insertBefore(card,custom):body.appendChild(card);$('fcOpen').onclick=openHome;return true}
function init(){css();ensure();build();inject();const body=$('v81Body');if(body){const obs=new MutationObserver(()=>{clearTimeout(window.__fcInjectTimer);window.__fcInjectTimer=setTimeout(()=>{build();inject()},30)});obs.observe(body,{childList:true})}window.addEventListener('ifsi:v741-ready',()=>{build();inject()});window.addEventListener('storage',e=>{if(e.key===KEY&&mode==='home')renderHome()});return true}
let tries=0,t=setInterval(()=>{tries++;if(window.IFSI_V741&&typeof window.IFSI_V741.resourcesForCourse==='function'){clearInterval(t);init()}else if(tries>240){clearInterval(t);init()}},100);
window.IFSI_V8338_FLASHCARDS={version:V,open:openHome,rebuild:build,getDeck:()=>deck,getStats:()=>stats()};
})();