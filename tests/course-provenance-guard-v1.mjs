// Vérifier la provenance déclarée sans inventer de statut "officiel".
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const courses=read('course-registry-v741.json').courses;
const sheets=[1,2,3].flatMap(i=>read('sheets-'+i+'.json'));
const byId=new Map(courses.map(c=>[c.id,c]));
const fileId=url=>(String(url||'').match(/\/d\/([A-Za-z0-9_-]+)/)||[])[1]||'';
let unknown=0,official=0,nonOfficial=0;
for(const sheet of sheets){
  const course=byId.get(sheet.courseId);
  assert.ok(course,'Fiche sans cours déclaré : '+sheet.title);
  assert.ok(!(sheet.provisional===true&&sheet.officialSupport===true),
    'Une fiche provisoire ne peut pas être issue du support officiellement validé : '+sheet.title);
  // Le support officiel et les fiches de révision sont deux ressources distinctes.
  const sourceIds=[course.officialSupportUrl,...(course.officialSupportItems||[]).map(x=>x.url)].map(fileId).filter(Boolean);
  assert.ok(!sourceIds.includes(fileId(sheet.url)),
    'Une fiche de révision ne doit pas être présentée comme le document source : '+sheet.title);
  if(sheet.officialSupport===true)official++;
  else if(sheet.officialSupport===false)nonOfficial++;
  else unknown++;
}
const missing=courses.filter(c=>!c.officialSupportUrl&&!(c.officialSupportItems||[]).length);
console.log('✅ Provenance : '+sheets.length+' fiches, '+official+' déclarées basées sur source officielle, '+nonOfficial+' non officielles, '+unknown+' non qualifiées ; '+missing.length+' cours sans pointeur officiel.');
console.log('ℹ️ Absences de pointeur : '+missing.map(c=>c.id).join(', '));
