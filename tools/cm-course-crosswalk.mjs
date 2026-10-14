// Validation locale d'un rapprochement de planning, sans accès Drive ni publication de données privées.
// Entrée JSON externe : ne jamais ajouter un véritable planning d'IFSI au dépôt public.
// Syntaxe : node tools/cm-course-crosswalk.mjs --input /chemin/PRIVE.json
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

export const allowedRelations = new Set([
 'direct','mixed','partial','child','unregistered','new_topic','outside_course'
]);
const allowedWarnings=new Set(['none','year_inconsistency','time_inferred']);
const courseMatchesUE=(course,ue)=>(
 course?.domain===ue.split('.')[0] &&
 String(course?.ue||'').replace('.','')===ue.replace('.','')
);

export function validateCrosswalk(data,registry){
 assert.ok(data&&Array.isArray(data.rows)&&data.rows.length>0,'Tableau de correspondance vide');
 assert.ok(typeof data.asOf==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(data.asOf),
  'Date de coupe YYYY-MM-DD absente');
 assert.ok(Array.isArray(registry?.courses)&&registry.courses.length,'Registre GitHub absent');
 const byId=new Map(registry.courses.map(c=>[c.id,c]));
 const out={rows:data.rows.length,linked:0,unregistered:0,prepared:0,hiddenChild:0,
  dateWarnings:0,ueWarnings:0,warnings:[]};
 for(const [n,r] of data.rows.entries()){
  const prefix='ligne '+(n+1)+' : ';
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(r.dateSource||''),prefix+'dateSource invalide');
  assert.ok(/^\d{2}:\d{2}$/.test(r.start||'')&&/^\d{2}:\d{2}$/.test(r.end||''),
   prefix+'plage horaire invalide');
  assert.ok(r.end>r.start,prefix+'fin avant début');
  assert.ok(Number.isInteger(r.sourcePage)&&r.sourcePage>=1,
   prefix+'numéro de page du planning absent');
  assert.ok(typeof r.topic==='string'&&r.topic.trim(),prefix+'intitulé de séance absent');
  assert.ok(typeof r.ue==='string'&&/^(?:[A-E]\.[1-4]|ACCUEIL)$/.test(r.ue),
   prefix+'UE invalide');
  assert.ok(allowedRelations.has(r.relation),prefix+'type de rapprochement invalide');
  assert.ok(allowedWarnings.has(r.dateWarning||'none'),prefix+'anomalie de date inconnue');
  const ids=r.courseIds??[];
  assert.ok(Array.isArray(ids)&&new Set(ids).size===ids.length,prefix+'courseIds invalides/dupliqués');
  for(const id of ids)assert.ok(byId.has(id),prefix+'courseId inconnu : '+id);
  if(['direct','mixed','partial','child'].includes(r.relation))
   assert.ok(ids.length,prefix+'aucun courseId pour rapprochement existant');
  if(['outside_course','unregistered','new_topic'].includes(r.relation))
   assert.equal(ids.length,0,prefix+'un identifiant ne doit pas être inventé');
  if(r.relation==='child'){
   assert.ok(ids.some(id=>byId.get(id).parentId),
    prefix+'un cours enfant masqué est attendu');
   out.hiddenChild++;
  }
  if(r.relation==='new_topic'){
   assert.ok(r.ue==='C.1'||r.note?.trim(),
    prefix+'une nouvelle rubrique doit être contextualisée');
   out.prepared++;
  }
  if(r.relation==='unregistered')out.unregistered++;
  if(ids.length)out.linked++;
  if(r.dateWarning&&r.dateWarning!=='none'){
   assert.ok(r.note?.trim(),prefix+'anomalie date/heure sans explication');
   out.dateWarnings++;
  }
  for(const id of ids){
   const c=byId.get(id);
   if(r.ue!=='ACCUEIL'&&!courseMatchesUE(c,r.ue)){
    assert.ok(typeof r.note==='string'&&r.note.trim().length>=15,
     prefix+'différence UE catalogue/planning non explicitée : '+id);
    out.ueWarnings++;
    out.warnings.push(prefix+'UE différente du registre : '+id+' ('+r.ue+' vs '+c.ue+')');
   }
  }
 }
 return out;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const args=process.argv.slice(2),p=args.indexOf('--input');
 assert.ok(p>=0&&args[p+1],'Utilisation : --input /chemin/prive/matrice.json [--registry course-registry-v741.json]');
 const r=args.indexOf('--registry');
 const source=JSON.parse(fs.readFileSync(args[p+1],'utf8'));
 const registry=JSON.parse(fs.readFileSync(r>=0?args[r+1]:'course-registry-v741.json','utf8'));
 console.log(JSON.stringify(validateCrosswalk(source,registry),null,2));
}
