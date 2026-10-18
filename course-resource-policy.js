(()=>{
'use strict';
const root=typeof window==='object'?window:globalThis;
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('_',' ').toLowerCase();
function driveIdentity(value){
  try{
    const u=new URL(value);
    if(u.protocol!=='https:'||u.username||u.password||u.port)return null;
    if(!['drive.google.com','docs.google.com'].includes(u.hostname))return null;
    const folder=u.pathname.match(/^\/drive\/(?:u\/\d+\/)?folders\/([\w-]+)\/?$/);
    if(folder)return 'folder:'+folder[1];
    const file=u.pathname.match(/^\/(?:file|document|spreadsheets|presentation)\/d\/([\w-]+)(?:\/|$)/);
    if(file)return 'file:'+file[1];
    if(u.hostname==='drive.google.com'&&/^\/(?:open|uc|thumbnail)\/?$/.test(u.pathname)&&/^[\w-]+$/.test(u.searchParams.get('id')||''))return 'file:'+u.searchParams.get('id');
  }catch{}
  return null;
}
function isStudentResource(x){
  if(!x||typeof x!=='object')return false;
  if(x.publish===false||x.confidential===true||x.private===true||x.internal===true)return false;
  const text=norm(['label','title','displayTitle','name','category','type','kind','role','sourceType','audience','visibility','access'].map(k=>x[k]||'').join(' '));
  if(/\b(?:scripts?|transcriptions?|transcripts?|plaud|internal|private|confidential|workflow|extraction|brouillons?|privee?s?|internes?|confidentielle?s?)\b/.test(text))return false;
  if(/\bsources?\s+(?:de travail|brutes?)\b/.test(text))return false;
  if(/(?:\.txt|\.md|\.json)(?:$|[?#])/i.test(x.url||'')||/\.(?:txt|md|json)\b/i.test(text))return false;
  if(['text/plain','text/markdown','application/json'].includes(x.mimeType||x.mime_type))return false;
  return true;
}
function uniqueResources(items,seen=new Set()){
  return (Array.isArray(items)?items:[]).filter(x=>{
    const key=driveIdentity(x?.url);
    if(!key||!isStudentResource(x)||seen.has(key))return false;
    seen.add(key);return true;
  });
}
function supportResources(course,kind='official',seen=new Set()){
  const prefix=kind==='capture'?'captureSupport':'officialSupport';
  const primary={url:course[prefix+'Url'],title:kind==='capture'?'Captures provisoires':'Support officiel'};
  const links=uniqueResources([primary,...(course[prefix+'Items']||[])],seen);
  return {url:links.includes(primary)?primary.url:'',parts:links.filter(x=>x!==primary)};
}
function cleanCourse(course){
  const out=JSON.parse(JSON.stringify(course));
  const seen=new Set();
  for(const kind of ['official','capture']){
    const prefix=kind==='capture'?'captureSupport':'officialSupport';
    const links=supportResources(course,kind,seen);
    if(out[prefix+'Url']&&!links.url)delete out[prefix+'Url'];
    if(out[prefix+'Items'])out[prefix+'Items']=links.parts;
  }
  if(out.qcmPdfUrl){const key=driveIdentity(out.qcmPdfUrl);if(key)seen.add(key);}
  if(out.additionalDocuments)out.additionalDocuments=uniqueResources(out.additionalDocuments,seen);
  return out;
}
root.IFSI_COURSE_RESOURCES={driveIdentity,isStudentResource,uniqueResources,supportResources,cleanCourse};
})();
