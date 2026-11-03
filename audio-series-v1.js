(()=>{
'use strict';
let series=[];
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
function validate(data){
  if(data?.schemaVersion!==1||!Array.isArray(data.series))throw Error('Séries audio invalides');
  const courses=new Set(),ids=new Set(),paths=new Set();
  for(const s of data.series){
    if(courses.has(s.courseId)||!/^[a-z0-9_]+$/.test(s.courseId)||!['prepared','approved'].includes(s.status))throw Error('Cours ou statut audio invalide');
    courses.add(s.courseId);
    if(!Array.isArray(s.replaces)||!s.replaces.length||new Set(s.replaces).size!==s.replaces.length||!Array.isArray(s.vocals)||!s.vocals.length)throw Error('Remplacement audio incomplet');
    if(!Array.isArray(s.artifacts)||s.artifacts.length!==s.vocals.length)throw Error('Octets audio non documentés');
    for(let i=0;i<s.vocals.length;i++){
      const v=s.vocals[i],a=s.artifacts[i];
      if(ids.has(v.id)||s.replaces.includes(v.id)||v.courseId!==s.courseId||v.number!==i+1||v.mime!=='audio/mpeg'||!v.title?.trim()||!v.course?.trim())throw Error('Ordre ou identité audio invalide');
      if(!Number.isFinite(v.durationSeconds)||v.durationSeconds<=0||v.durationSeconds>=600)throw Error('Durée audio invalide');
      if(!/^\.\/assets\/audio\/[\w/-]+\.mp3$/.test(v.localAudio)||paths.has(v.localAudio))throw Error('Chemin audio invalide');
      if(a.vocalId!==v.id||a.path!==v.localAudio.slice(2)||a.durationSeconds!==v.durationSeconds||!Number.isSafeInteger(a.bytes)||a.bytes<1024||!/^[a-f0-9]{64}$/.test(a.sha256))throw Error('Empreinte audio invalide');
      if(s.status==='approved'&&s.reviewContract!=='provided_audio_series_v1'&&!/^[A-Za-z0-9_-]+$/.test(v.driveId||''))throw Error('Copie Drive absente');
      ids.add(v.id);paths.add(v.localAudio);
    }
    if(s.status==='approved'){
      if(s.reviewContract==='provided_audio_series_v1'){
        const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x),ids=s.vocals.map(v=>v.id);
        if(!/^[A-Za-z0-9_-]{15,}$/.test(s.sourceArchive?.driveId||'')||!sha(s.sourceArchive?.sha256)||s.sourceArchive.fileCount!==ids.length)throw Error('Archive Drive source absente');
        const r=s.review;
        if(r?.status!=='documentary_decode_and_sampled_speech_completed'||r.independentHumanListening!==false||!sha(r.privateEvidenceSha256)||JSON.stringify(r.decodedVocalIds)!==JSON.stringify(ids)||JSON.stringify(r.speechSampledVocalIds)!==JSON.stringify(ids))throw Error('Revue technique et documentaire absente');
        if(Object.keys(r.scriptSha256s||{}).sort().join('|')!==[...ids].sort().join('|')||!ids.every(id=>sha(r.scriptSha256s[id])))throw Error('Scripts non rapprochés');
        if(JSON.stringify(canonical(r.artifactSha256s))!==JSON.stringify(canonical(Object.fromEntries(s.artifacts.map(a=>[a.path,a.sha256])))))throw Error('Revue pour d’autres octets');
        if(!Array.isArray(s.downloads)||s.downloads.length!==2||s.downloads.map(d=>d.kind).join('|')!=='study_scripts|course_package')throw Error('Téléchargements incomplets');
        for(const d of s.downloads)if(!/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.zip$/.test(d.path)||!d.label?.trim()||!sha(d.sha256)||!Number.isSafeInteger(d.bytes)||d.bytes<1024)throw Error('Téléchargement invalide');
        if(!sha(s.publicationApproval?.privateEvidenceSha256)||!Number.isFinite(Date.parse(s.publicationApproval?.approvedAt)))throw Error('Autorisation du lot fourni absente');
      }else{
        if(s.reviewContract!==undefined)throw Error('Contrat de revue inconnu');
        if(s.review?.status!=='owner_listened_and_accepted')throw Error('Revue ou accord audio absent');
      }
      if(!s.review.privateEvidenceSha256?.match(/^[a-f0-9]{64}$/)||s.publicationApproval?.authorization!=='explicit_go_publication'||s.publicationApproval.scope!=='audio_series_replacement'||!/^[a-f0-9]{64}$/.test(s.publicationApproval.bundleSha256||''))throw Error('Revue ou accord audio absent');
    }else if(s.review?.status!=='pending'||s.publicationApproval!==null)throw Error('Préparation audio incohérente');
  }
  return data.series;
}
async function load(){
  const r=await fetch('./audio-series-v1.json',{cache:'no-store'});if(!r.ok)throw Error('Séries audio indisponibles');
  const next=validate(await r.json());
  for(const s of next.filter(x=>x.status==='approved')){
    const {publicationApproval,...content}=s;
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(canonical(content))));
    const hex=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
    if(hex!==publicationApproval.bundleSha256)throw Error('Série audio modifiée après accord');
  }
  series=next.filter(x=>x.status==='approved');
}
function applyVocals(catalogue){
  let result=[...catalogue];
  for(const s of series){
    const old=result.filter(v=>v.courseId===s.courseId);
    if(JSON.stringify(old.map(v=>v.id))!==JSON.stringify(s.replaces))throw Error('Historique audio différent de la série remplacée');
    if(s.vocals.some(v=>result.some(old=>old.id===v.id)))throw Error('Identifiant audio déjà utilisé');
    const first=result.findIndex(v=>v.courseId===s.courseId);
    result=result.filter(v=>v.courseId!==s.courseId);result.splice(first,0,...s.vocals.map(v=>({...v})));
  }
  return result;
}
function applyRegistry(registry){return {...registry,courses:registry.courses.map(c=>{const s=series.find(x=>x.courseId===c.id);return s?{...c,audioCount:s.vocals.length,audioStatus:'available'}:c;})};}
const ready=load();
// Les chargeurs attendent cette même promesse avant de construire leurs listes.
ready.catch(error=>console.error('Nouvelle série audio indisponible.',error));
const downloadsFor=courseId=>series.find(s=>s.courseId===courseId)?.downloads?.map(d=>({...d}))||[];
window.IFSI_AUDIO_SERIES={ready,applyVocals,applyRegistry,downloadsFor,validate};
})();
