/* IFSI ABC — module Pathologies : coque publique sans contenu clinique,
 * fiches/QCM/cas accessibles seulement après validation du catalogue publié.
 */
(function(root){
'use strict';
const SECTION='ifsiPathologies', KEY='ifsiabc_pathologies_progress_v1';
const REQUIRED=['definition','physiopathologie','riskFactors','clinicalSigns','diagnosis','treatments','nursingCare','monitoring','complications','keywords'];
const P1_IDS=new Set(['bpco','hta','dt2']);
const P1_CATALOG=Object.freeze([
 {id:'bpco',title:'Bronchopneumopathie chronique obstructive (BPCO)',shortTitle:'BPCO',system:'Système respiratoire',icon:'🫁',courseId:'systeme_respiratoire'},
 {id:'hta',title:'Hypertension artérielle (HTA)',shortTitle:'Hypertension artérielle (HTA)',system:'Système cardiovasculaire',icon:'🫀',courseId:'systeme_cardiovasculaire'},
 {id:'dt2',title:'Diabète de type 2',shortTitle:'Diabète de type 2',system:'Système endocrinien',icon:'🩺',courseId:'systeme_endocrinien'}
]);
const LABELS={definition:'Définition',physiopathologie:'Physiopathologie',riskFactors:'Causes et facteurs de risque',clinicalSigns:'Signes cliniques',diagnosis:'Examens et diagnostic',treatments:'Prise en charge',nursingCare:'Rôle infirmier',monitoring:'Surveillances',complications:'Complications et signes d’alerte',keywords:'Définitions des mots-clés'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const unique=a=>Array.isArray(a)&&a.length===new Set(a).size;
const text=v=>typeof v==='string'&&v.trim().length>0;
const approved=p=>p&&p.status==='approved'&&p.authorization==='explicit_go_publication'&&p.scope==='pathology_package'&&/^[a-f0-9]{64}$/i.test(p.bundleSha256||'');
const nonEmpty=a=>Array.isArray(a)&&a.length>0;
function checkOptions(q,prefix,errors){
 if(!q||!text(q.id)||!text(q.prompt)||!Array.isArray(q.options)||q.options.length<4||q.options.length>5||!q.options.every(text)){errors.push(prefix+': question ou options invalides');return;}
 if(!unique(q.options)){errors.push(prefix+': propositions dupliquées');}
 if(!Array.isArray(q.correct)||!unique(q.correct)||q.correct.length<1||q.correct.length>3||q.correct.some(i=>!Number.isInteger(i)||i<0||i>=q.options.length))errors.push(prefix+': réponses attendues invalides (1 à 3, pas 4/4)');
 if(!text(q.explanation)||!Array.isArray(q.feedback)||q.feedback.length!==q.options.length||!q.feedback.every(text))errors.push(prefix+': correction argumentée manquante');
}
function checkAnswerSpread(questions, getter, label, errors){
 if(!Array.isArray(questions)||questions.length<8)return;
 const sets=questions.map(q=>getter(q));
 if(sets.some(s=>!Array.isArray(s)||!s.length||!s.every(Number.isInteger)))return;
 const positions=new Set(sets.flat());
 if(positions.size<3)errors.push(label+': bonnes réponses concentrées sur moins de trois lettres (A/B/C/D/E)');
 if(questions.length>=12&&sets.filter(s=>s.includes(0)).length>Math.ceil(questions.length*0.83))errors.push(label+': réponse A quasi systématiquement vraie');
}
function checkSourceRefs(record,label,sourceIds,errors){
 const refs=record?.sourceIds;
 if(!nonEmpty(refs)||!refs.every(id=>text(id)&&sourceIds.has(id))||!unique(refs))errors.push(label+': sourceIds individuels absents, dupliqués ou inconnus');
}
function validate(item){
 const errors=[];
 if(!item||!text(item.id)||!/^[a-z0-9_]+$/.test(item.id)||!text(item.title)||!text(item.system))errors.push('Identité / système invalide');
 if(!Number.isInteger(item?.year)||item.year<1||item.year>3)errors.push('Année IFSI invalide');
 if(!nonEmpty(item?.courseIds)||!item.courseIds.every(text)||!unique(item.courseIds))errors.push('Liens vers les cours manquants ou dupliqués');
 for(const k of REQUIRED){if(!text(item?.sections?.[k]))errors.push('Section absente : '+k);}
 if(!nonEmpty(item?.sources)||!item.sources.every(s=>s&&text(s.label)&&text(s.url)&&/^https:\/\//.test(s.url)&&['official','verified_complement'].includes(s.type)))errors.push('Sources non traçables');
 const sourceIds=new Set((item?.sources||[]).map(s=>s?.id).filter(text));
 if(!nonEmpty(item?.sources)||!item.sources.every(s=>s&&text(s.id))||!unique(item.sources.map(s=>s?.id)))errors.push('Identifiants des sources manquants ou dupliqués');
 const visuals=item?.visuals;
 if(!nonEmpty(visuals)||!unique(visuals.map(v=>v?.id)))errors.push('Infographies manquantes ou identifiants dupliqués');
 else visuals.forEach(v=>{
  if(!text(v?.id)||!REQUIRED.includes(v?.sectionId)||v?.kind!=='original_infographic'||!text(v?.alt)||!text(v?.url)||!/^https:\/\//i.test(v?.url)||!/^[-a-f0-9]{64}$/i.test(v?.sha256||''))errors.push('Infographie incomplète, brute ou non sécurisée : '+(v?.id||'?'));
  if(!nonEmpty(v?.sourceIds)||(Array.isArray(v?.sourceIds)&&v?.sourceIds.some(id=>!sourceIds.has(id))))errors.push('Infographie sans source identifiable : '+(v?.id||'?'));
  if(v?.graphicalReview!=='approved'||v?.medicalReview!=='approved')errors.push('Infographie sans double validation médicale et graphique : '+(v?.id||'?'));
 });
 const audit=item?.visualAudit;
 if(!audit||!Number.isInteger(audit.diagramCount)||audit.diagramCount<1||audit.diagramCount!==(visuals||[]).length||audit.rawDiagramCount!==0||audit.allPdfPagesChecked!==true||audit.clinicalContentReviewed!==true)errors.push('Audit schéma → infographie / PDF / validation clinique incomplet');
 const pages=item?.posterPages;
 if(P1_IDS.has(item?.id)&&(!Array.isArray(pages)||pages.length!==6))errors.push('Lot P1 : six planches originales validées obligatoires');
 if(pages!==undefined){
  if(!Array.isArray(pages)||!unique(pages.map(p=>p?.id))||!unique(pages.map(p=>p?.number)))errors.push('Planches : liste ou identifiants dupliqués');
  else pages.forEach((p,index)=>{
   if(!text(p?.id)||p?.number!==index+1||!text(p?.title)||!text(p?.alt)||!/^https:\/\//i.test(p?.url||'')||!/^[a-f0-9]{64}$/i.test(p?.sha256||''))errors.push('Planche '+(index+1)+' : url/texte/empreinte invalides');
   if(!nonEmpty(p?.sourceIds)||!p.sourceIds.every(id=>sourceIds.has(id)))errors.push('Planche '+(index+1)+' : sources absentes ou inconnues');
   if(p?.kind!=='original_infographic'||p?.medicalReview!=='approved'||p?.graphicalReview!=='approved')errors.push('Planche '+(index+1)+' : originalité ou double revue manquante');
  });
 }
 if(!nonEmpty(item?.qcm))errors.push('QCM absent');else{
  if(!unique(item.qcm.map(x=>x?.id)))errors.push('IDs QCM dupliqués');
  item.qcm.forEach(q=>{checkOptions(q,'QCM '+(q?.id||'?'),errors);checkSourceRefs(q,'QCM '+(q?.id||'?'),sourceIds,errors);});
  checkAnswerSpread(item.qcm,q=>q?.correct,'QCM',errors);
 }
 if(!nonEmpty(item?.flashcards)||!unique(item.flashcards.map(x=>x?.id))||!item.flashcards.every(c=>c&&text(c?.id)&&text(c.front)&&text(c.back)))errors.push('Flashcards invalides');
 if(nonEmpty(item?.flashcards))item.flashcards.forEach(c=>checkSourceRefs(c,'Flashcard '+(c?.id||'?'),sourceIds,errors));
 if(!nonEmpty(item?.cases)||!unique(item.cases.map(x=>x?.id)))errors.push('Cas cliniques absents ou dupliqués');
 else item.cases.forEach(c=>{
  if(!text(c?.id)||!text(c?.title)||!text(c?.context)||!nonEmpty(c?.steps))errors.push('Cas incomplet : '+(c?.id||'?'));
  else c.steps.forEach((s,i)=>{const label='Cas '+c.id+' étape '+(i+1);checkOptions({...s,id:s?.id||('step_'+i),correct:[s?.correct]},label,errors);checkSourceRefs(s,label,sourceIds,errors);});
 });
 if(nonEmpty(item?.cases))checkAnswerSpread(item.cases.flatMap(c=>Array.isArray(c?.steps)?c.steps:[]),s=>[s?.correct],'Cas cliniques',errors);
 if(!approved(item?.publicationApproval))errors.push('Publication non autorisée : GO publication et empreinte requis');
 return errors;
}
function evaluate(q,selected){
 const given=Object.freeze([...new Set((selected||[]).filter(Number.isInteger))].sort((a,b)=>a-b));
 const expected=Object.freeze([...(q.correct||[])].sort((a,b)=>a-b));
 const correct=given.length===expected.length&&given.every((v,i)=>v===expected[i]);
 const details=q.options.map((option,i)=>({index:i,option,selected:given.includes(i),expected:expected.includes(i),message:q.feedback[i]})).filter(v=>v.selected!==v.expected);
 return Object.freeze({correct,selected:given,expected,details,explanation:q.explanation});
}
function readProgress(){
 try{const x=JSON.parse(root.localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}catch{return {};}
}
function record(id,kind,correct){
 try{
  const progress=readProgress(),k=id+':'+kind,prev=progress[k]||{attempts:0,correct:0};
  progress[k]={attempts:prev.attempts+1,correct:prev.correct+(correct?1:0)};
  root.localStorage.setItem(KEY,JSON.stringify(progress));
 }catch{/* Le module doit rester utilisable sans stockage local. */}
}
let entries=[],shellEnabled=false,pendingId=null,state={id:null,mode:'fiche',index:0,step:0,posterIndex:0,flipped:false,submitted:false,selected:[]};
const doc=()=>root.document;
const byId=id=>doc().getElementById(id);
function css(){
 if(byId('ifsiPathologiesStyle'))return;
 const style=doc().createElement('style');style.id='ifsiPathologiesStyle';
 style.textContent='.patho-wrap{display:grid;gap:13px}.patho-toolbar{display:flex;gap:9px;flex-wrap:wrap}.patho-toolbar input{flex:1;min-width:170px}.patho-results{display:grid;gap:9px}.patho-group{border:1px solid var(--line);border-radius:16px;background:var(--card);overflow:hidden}.patho-group>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:15px 13px;cursor:pointer;font-weight:750}.patho-group>summary::-webkit-details-marker{display:none}.patho-group>summary:focus-visible{outline:2px solid var(--p);outline-offset:-2px}.patho-group-name{font-size:15px}.patho-group-count{color:var(--muted);font-size:12px;white-space:nowrap}.patho-group-body{display:grid;gap:8px;padding:0 12px 12px}.patho-group-body .patho-entry{border-radius:12px}.patho-entry{display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--card);color:var(--ink);text-align:left;cursor:pointer;width:100%}.patho-badge{font-size:12px;color:var(--muted)}.patho-panel{padding:14px;border:1px solid var(--line);background:var(--card);border-radius:16px}.patho-panel h3{margin:0 0 8px}.patho-panel p{line-height:1.55;white-space:pre-line}.patho-options{display:grid;gap:7px}.patho-options label{border:1px solid var(--line);padding:10px;border-radius:10px;display:flex;align-items:start;gap:9px}.patho-correction{border:1px solid var(--line);border-radius:10px;padding:12px;margin-top:10px;line-height:1.5}.patho-section-title{font-weight:700}.patho-tabs{display:flex;gap:6px;flex-wrap:wrap}.patho-tabs button{flex:1;min-width:80px}.patho-card{cursor:pointer;text-align:center;min-height:130px;display:grid;place-items:center}.patho-card p{font-size:17px;font-weight:600}.patho-muted{color:var(--muted);font-size:13px}.patho-sources{padding-left:20px}.patho-sources li{margin:6px 0}.patho-figure{margin:12px 0}.patho-figure img{width:100%;height:auto;object-fit:contain;border-radius:12px}.patho-figure figcaption{font-size:12px;color:var(--muted);margin:6px 0}.patho-poster{margin:0}.patho-poster img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:13px;background:#fff}.patho-poster figcaption{font-size:13px;margin:9px 2px;color:var(--muted)}.patho-poster-nav{display:flex;align-items:center;justify-content:space-between;gap:9px;flex-wrap:wrap}.patho-details summary{font-weight:700;cursor:pointer;padding:9px 2px}.patho-poster-nav .btn{min-width:95px}nav.ifsi-pathologies-ready{grid-template-columns:repeat(6,minmax(0,1fr))}nav.ifsi-pathologies-ready button{font-size:11px;overflow-wrap:anywhere}@media(max-width:600px){.patho-tabs button{font-size:12px;padding:9px 4px}}';
 doc().head.appendChild(style);
}
function ensure(){
 if(root.IFSI_APP_FEATURES?.pathologies!==true)return;
 if(byId(SECTION))return;
 css();
 const s=doc().createElement('section');s.id=SECTION;s.className='hidden';s.innerHTML='<div id="ifsiPathologiesBody"></div>';
 const app=doc().querySelector('.app');if(!app)return;
 const nav=app.querySelector('nav');
 if(nav)app.insertBefore(s,nav);else app.appendChild(s);
 if(nav)nav.classList.add('ifsi-pathologies-ready');
 if(nav&&!byId('ifsiPathologiesNav')){
  const b=doc().createElement('button');b.type='button';b.id='ifsiPathologiesNav';b.innerHTML='🩺<br>Pathologies';b.addEventListener('click',open);nav.appendChild(b);
 }
 if(typeof root.show==='function'&&!root.show._pathoWrapped){
  const old=root.show;root.show=function(){s.classList.add('hidden');byId('ifsiPathologiesNav')?.classList.remove('on');return old.apply(this,arguments);};root.show._pathoWrapped=true;
 }
}
function showShell(){
 if(root.IFSI_APP_FEATURES?.pathologies!==true)return false;
 if(!root.document?.querySelector('.app'))return false;
 shellEnabled=true;ensure();return !!byId(SECTION);
}
function open(){
 if(root.IFSI_APP_FEATURES?.pathologies!==true)return false;
 if(!entries.length&&!shellEnabled)return;
 ensure();
 const host=byId(SECTION);if(!host)return;
 doc().querySelectorAll('.app > section').forEach(s=>s.classList.add('hidden'));
 host.classList.remove('hidden');
 doc().querySelectorAll('nav button').forEach(b=>b.classList.remove('on'));
 byId('ifsiPathologiesNav')?.classList.add('on');byId('v87Pathologies')?.classList.add('on');render();
 root.scrollTo?.(0,0);
}
function reset(item,mode='fiche'){pendingId=null;state={id:item.id,mode,index:0,step:0,posterIndex:0,flipped:false,submitted:false,selected:[]};render();}
function action(label,data,primary){return '<button type="button" class="btn '+(primary?'primary':'outline')+'" '+data+'>'+esc(label)+'</button>';}
function catalogRecords(){
 const records=P1_CATALOG.map(p=>{
  const published=entries.find(e=>e.id===p.id);
  return {...p,published:published||null,title:published?.title||p.title};
 });
 for(const e of entries.filter(e=>!P1_IDS.has(e.id)))records.push({id:e.id,title:e.title,shortTitle:e.title,system:e.system,icon:'🩺',courseId:e.courseIds[0],published:e});
 return records;
}
function catalogMarkup(records,term=''){
 const q=term.trim().toLocaleLowerCase('fr');
 const matches=records.filter(r=>!q||(r.title+' '+r.shortTitle+' '+r.system).toLocaleLowerCase('fr').includes(q));
 const systems=[...new Set(matches.map(r=>r.system))];
 if(!systems.length)return '<p class="patho-muted">Aucune pathologie trouvée.</p>';
 return systems.map((system,i)=>{
  const all=matches.filter(r=>r.system===system),icon=all[0]?.icon||'🩺';
  const cards=all.map(r=>'<button type="button" class="patho-entry" data-patho-'+(r.published?'published':'pending')+'="'+esc(r.id)+'"><span><b>'+esc(r.shortTitle)+'</b><span class="patho-badge"> • '+(r.published?'Fiche et entraînements disponibles':root.IFSI_PATHOLOGIES_REVIEW?.has?.(r.id)?'🔒 Pack personnel importé • en revue médicale':'Contenu en cours de validation médicale')+'</span></span><span aria-hidden="true">→</span></button>').join('');
  return '<details class="patho-group" '+(q||i===0?'open':'')+'><summary><span class="patho-group-name">'+icon+' '+esc(system)+'</span><span class="patho-group-count">'+all.length+' pathologie'+(all.length>1?'s':'')+' <span aria-hidden="true">⌄</span></span></summary><div class="patho-group-body">'+cards+'</div></details>';
 }).join('');
}
function showPending(id){
 const record=P1_CATALOG.find(p=>p.id===id);
 if(!record)return list();
 pendingId=id;state.id=null;
 // Le pack personnel a priorité sur le cours IFSI : aucune redirection automatique.
 const review=root.IFSI_PATHOLOGIES_REVIEW;
 if(review?.showIfImported?.(id))return;
 const host=byId('ifsiPathologiesBody');if(!host)return;
 host.innerHTML='<div class="card patho-wrap"><div class="patho-toolbar">'+action('← Toutes les pathologies','id="pathoBack"')+'</div><h2>'+esc(record.title)+'</h2><p class="patho-muted">'+esc(record.system)+'</p>'+
 '<div class="patho-panel" role="status"><h3>🔒 Ouvrir mes supports Pathologies</h3><p>Les 6 planches, QCM, flashcards et cas cliniques sont disponibles dans ton espace Supabase privé. Connecte ton compte ci-dessous pour les charger automatiquement. Les supports restent en revue médicale et ne sont pas publiés aux étudiants.</p><div id="pathoReviewImport" data-patho-id="'+esc(id)+'"></div></div>'+
 '<details class="patho-panel patho-details"><summary>Cours IFSI associé (facultatif, distinct de Pathologies)</summary><p>Ce bouton ouvre le cours existant, et non la fiche Pathologies.</p>'+action('Ouvrir le cours IFSI ↗','data-patho-course="'+esc(record.courseId)+'"')+'</details></div>';
 byId('pathoBack').onclick=()=>list();
 host.querySelectorAll('[data-patho-course]').forEach(b=>b.onclick=()=>openLinkedCourse(b.dataset.pathoCourse));
 review?.attachImport?.();
}
function list(){
 const host=byId('ifsiPathologiesBody');if(!host)return;
 pendingId=null;state.id=null;
 const records=catalogRecords();
 host.innerHTML='<div class="card patho-wrap"><div class="patho-toolbar">'+action('← Accueil','id="pathoHome"')+'</div><h2>🩺 Pathologies</h2><p class="patho-muted">Explore les pathologies par système. Déroule un système pour choisir une pathologie. Les ressources non validées restent indisponibles.</p><div class="patho-toolbar"><input id="pathoSearch" type="search" placeholder="Rechercher une pathologie ou un système" aria-label="Rechercher une pathologie"></div><div id="pathoReviewImport"></div><div id="pathoResults" class="patho-results"></div></div>';
 byId('pathoHome').onclick=()=>root.show?.('home');
 const results=byId('pathoResults');
 function bindRows(){
  results.querySelectorAll('[data-patho-published]').forEach(b=>b.onclick=()=>{const item=entries.find(e=>e.id===b.dataset.pathoPublished);if(item)reset(item);});
  results.querySelectorAll('[data-patho-pending]').forEach(b=>b.onclick=()=>showPending(b.dataset.pathoPending));
 }
 function draw(){results.innerHTML=catalogMarkup(records,byId('pathoSearch').value);bindRows();}
 byId('pathoSearch').oninput=draw;draw();
 root.IFSI_PATHOLOGIES_REVIEW?.attachImport?.();
}
function linkedCourseLabel(id){
 const courses=root.IFSI_V741?.getRegistry?.()?.courses;
 return (Array.isArray(courses)?courses:[]).find(c=>c?.id===id)?.label||id.replaceAll('_',' ');
}
function openLinkedCourse(id){
 if(root.IFSI_V82?.openSystem){root.IFSI_V82.openSystem(id);return true;}
 const courses=root.IFSI_V741?.getRegistry?.()?.courses;
 const course=(Array.isArray(courses)?courses:[]).find(c=>c?.id===id);
 if(course?.label&&typeof root.openCourse74==='function'){root.openCourse74(course.label);return true;}
 if(typeof root.showCourses74==='function'){root.showCourses74();return true;}
 return false;
}
function links(item){
 return '<p class="patho-muted">Cours associés à cette pathologie :</p><div class="patho-toolbar">'+item.courseIds.map(id=>'<button type="button" class="btn outline" data-patho-course="'+esc(id)+'">'+esc(linkedCourseLabel(id))+' ↗</button>').join('')+'</div>';
}
function renderSheet(item){
 const pages=Array.isArray(item.posterPages)?item.posterPages:[];
 const p=pages[state.posterIndex]||pages[0];
 const gallery=p?'<div class="patho-panel"><p class="patho-muted">Fiche illustrée — modèle maître validé • '+pages.length+' planches</p><h3>'+esc(p.title)+'</h3><figure class="patho-poster"><img loading="eager" src="'+esc(p.url)+'" alt="'+esc(p.alt)+'"><figcaption>'+esc(p.alt)+'</figcaption></figure><div class="patho-poster-nav"><button type="button" class="btn outline" id="pathoPosterPrev" '+(state.posterIndex===0?'disabled':'')+'>← Précédente</button><span class="patho-muted">Planche '+(state.posterIndex+1)+' / '+pages.length+'</span><button type="button" class="btn outline" id="pathoPosterNext" '+(state.posterIndex===pages.length-1?'disabled':'')+'>Suivante →</button></div></div>':'';
 const sections=REQUIRED.map(k=>'<div class="patho-panel"><h3>'+esc(LABELS[k])+'</h3><p>'+esc(item.sections[k])+'</p>'+(!p?item.visuals.filter(v=>v?.sectionId===k).map(v=>'<figure class="patho-figure"><img loading="lazy" src="'+esc(v?.url)+'" alt="'+esc(v?.alt)+'"><figcaption>'+esc(v?.alt)+'</figcaption></figure>').join(''):'')+'</div>').join('');
 return gallery+(p?'<details class="patho-details"><summary>Approfondir : définitions, mécanismes et rôle infirmier</summary>'+sections+'</details>':sections)+
 '<div class="patho-panel"><h3>Sources et statut</h3><ul class="patho-sources">'+item.sources.map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.label)+'</a> — '+(s.type==='official'?'Support officiel':'Complément vérifié')+'</li>').join('')+'</ul>'+links(item)+'</div>';
}
function renderQuestion(item,q,kind){
 const key='pathoAnswer',multi=q.correct.length>1;
 return '<div class="patho-panel"><p class="patho-muted">'+esc(kind)+' • '+(state.index+1)+' / '+(kind==='QCM'?item.qcm.length:1)+'</p><h3>'+esc(q.prompt)+'</h3><div class="patho-options">'+q.options.map((opt,i)=>'<label><input type="'+(multi?'checkbox':'radio')+'" name="'+key+'" value="'+i+'" '+(state.submitted?'disabled':'')+' '+(state.selected.includes(i)?'checked':'')+'><span>'+esc(opt)+'</span></label>').join('')+'</div>'+
 (state.submitted?renderCorrection(q):action('Valider ma réponse','id="pathoValidate"',true))+
 '<div class="patho-toolbar">'+action('Recommencer','id="pathoRetry"')+action('Suivant','id="pathoNext"'+(state.submitted?'':' disabled'))+'</div></div>';
}
function renderCorrection(q){
 const report=evaluate(q,state.selected);
 return '<div class="patho-correction" role="status" aria-live="polite"><b>'+(report.correct?'✅ Bonne réponse':'❌ À revoir')+'</b><p><b>Ta réponse :</b> '+(report.selected.map(i=>'ABCDE'[i]).join(', ')||'Aucune')+'</p><p><b>Bonne réponse :</b> '+report.expected.map(i=>'ABCDE'[i]).join(', ')+'</p><p>'+esc(report.explanation)+'</p>'+
 (report.details.length?'<b>Comprendre mes erreurs :</b><ul>'+report.details.map(d=>'<li>'+esc(d.option)+' — '+esc(d.message)+'</li>').join('')+'</ul>':'')+'</div>';
}
function renderCard(item){
 const card=item.flashcards[state.index%item.flashcards.length];
 return '<div class="patho-panel"><p class="patho-muted">Flashcard '+(state.index%item.flashcards.length+1)+' / '+item.flashcards.length+'</p><button type="button" id="pathoFlip" class="patho-entry patho-card"><p>'+esc(state.flipped?card.back:card.front)+'</p><span class="patho-muted">'+(state.flipped?'Voir la question':'Afficher la réponse')+'</span></button><div class="patho-toolbar">'+action('Précédente','id="pathoPrev"')+action('Suivante','id="pathoNext"')+'</div></div>';
}
function renderCase(item){
 const c=item.cases[state.index%item.cases.length],step=c.steps[state.step];
 return '<div class="patho-panel"><h3>'+esc(c.title)+'</h3><p>'+esc(c.context)+'</p><p class="patho-muted">Étape '+(state.step+1)+' / '+c.steps.length+' • Situation fictive pédagogique</p></div>'+renderQuestion(item,{...step,correct:[step.correct]},'Cas clinique');
}
function render(){
 const host=byId('ifsiPathologiesBody');if(!host)return;
 const item=entries.find(x=>x.id===state.id);if(!item){if(pendingId)showPending(pendingId);else list();return;}
 host.innerHTML='<div class="card patho-wrap"><div class="row"><div><span class="badge">'+esc(item.system)+' • '+item.year+'A</span><h2>'+esc(item.title)+'</h2></div>'+action('← Retour','id="pathoBack"')+'</div><div class="patho-tabs">'+['fiche','qcm','flashcards','cas'].map(mode=>action({fiche:'Fiche',qcm:'QCM',flashcards:'Flashcards',cas:'Cas clinique'}[mode],'data-pathomode="'+mode+'"',state.mode===mode)).join('')+'</div>'+
 (state.mode==='fiche'?renderSheet(item):state.mode==='qcm'?renderQuestion(item,item.qcm[state.index%item.qcm.length],'QCM'):state.mode==='flashcards'?renderCard(item):renderCase(item))+'</div>';
 byId('pathoBack').onclick=()=>{state.id=null;list();};
 host.querySelectorAll('[data-pathomode]').forEach(b=>b.onclick=()=>reset(item,b.dataset.pathomode));
 host.querySelectorAll('[data-patho-course]').forEach(b=>b.onclick=()=>openLinkedCourse(b.dataset.pathoCourse));
 byId('pathoPosterPrev')?.addEventListener('click',()=>{state.posterIndex=Math.max(0,state.posterIndex-1);render();});
 byId('pathoPosterNext')?.addEventListener('click',()=>{state.posterIndex=Math.min((item.posterPages||[]).length-1,state.posterIndex+1);render();});
 byId('pathoFlip')?.addEventListener('click',()=>{state.flipped=!state.flipped;render();});
 byId('pathoValidate')?.addEventListener('click',()=>{
  const checked=[...host.querySelectorAll('input[name="pathoAnswer"]:checked')].map(el=>+el.value);
  if(!checked.length){root.alert?.('Sélectionne au moins une proposition.');return;}
  state.selected=checked;state.submitted=true;
  const q=state.mode==='cas'?{...item.cases[state.index].steps[state.step],correct:[item.cases[state.index].steps[state.step].correct]}:item.qcm[state.index];
  record(item.id,state.mode,evaluate(q,checked).correct);render();
 });
 byId('pathoRetry')?.addEventListener('click',()=>{state.submitted=false;state.selected=[];render();});
 byId('pathoPrev')?.addEventListener('click',()=>{state.index=(state.index+item.flashcards.length-1)%item.flashcards.length;state.flipped=false;render();});
 byId('pathoNext')?.addEventListener('click',()=>{
  if(state.mode==='qcm'){state.index=(state.index+1)%item.qcm.length;}
  if(state.mode==='flashcards'){state.index=(state.index+1)%item.flashcards.length;state.flipped=false;}
  if(state.mode==='cas'){
   const c=item.cases[state.index];
   if(state.step<c.steps.length-1)state.step++;else{state.index=(state.index+1)%item.cases.length;state.step=0;}
  }
  state.selected=[];state.submitted=false;render();
 });
}
function activate(catalog){
 if(!Array.isArray(catalog)||!catalog.length)return {activated:false,errors:[{id:null,errors:['Catalogue vide ou invalide']} ]};
 const invalid=(Array.isArray(catalog)?catalog:[]).map(x=>({id:x?.id,errors:validate(x)})).filter(x=>x.errors.length);
 if(invalid.length)return {activated:false,errors:invalid};
 entries=Array.isArray(catalog)?catalog.slice():[];
 ensure();return {activated:true,count:entries.length};
}
function showCatalog(){if(root.IFSI_APP_FEATURES?.pathologies!==true)return false;pendingId=null;state.id=null;list();}
root.IFSI_PATHOLOGIES=Object.freeze({validate,evaluate,activate,open,showShell,showCatalog,openLinkedCourse,getProgress:readProgress,requiredSections:REQUIRED.slice()});
})(window);
