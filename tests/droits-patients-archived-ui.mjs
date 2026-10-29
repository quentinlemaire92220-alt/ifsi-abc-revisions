// Contrat UI : une fiche archivée reste dans l'inventaire mais disparaît de la liste étudiantes.
// Exécution réelle de renderSheets() extrait de l'interface, avec DOM minimal isolé.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('function renderSheets(){');
const end=html.indexOf('function showSheets(){',start);
assert.ok(start>=0&&end>start,'renderSheets introuvable dans index.html');
const implementation=html.slice(start,end);
const mk=(resourceId,sourceStatus,title,courseId='droits_patients')=>({
 resourceId,courseId,sourceStatus,title,label:title,ue:'UE A2.1',url:'https://example.org/'+resourceId+'.pdf',
 sheetFormat:'written_revision',primaryRevision:resourceId==='droits_patients_fiche_unique_v7_20261029'
});
const original=[
 mk('droits_patients_fiche_p01','archived','CLASSIQUE ARCHIVEE'),
 mk('droits_patients_fiche_infographiee_p01','archived','ILLUSTREE ARCHIVEE'),
 mk('droits_patients_fiche_complement_p01_20261021','archived','COMPLEMENT ARCHIVE'),
 mk('droits_patients_fiche_unique_v7_20261029','official','V7 UNIQUE ACTIVE')
];
function render(rows,search=''){
 const dom={
  ue:{options:[{}],value:'Toutes les UE'},
  search:{value:search},
  sheetCount:{textContent:null},
  sheetList:{innerHTML:''}
 };
 const ctx={S:rows,$:key=>dom[key],uniq:arr=>[...new Set(arr)]};
 vm.runInNewContext(implementation+'\nrenderSheets();',ctx,{timeout:1000});
 return dom;
}
const live=render(original);
assert.equal(live.sheetCount.textContent,1,'La fiche V7 doit être seule visible');
assert.match(live.sheetList.innerHTML,/V7 UNIQUE ACTIVE/);
for(const row of original.filter(x=>x.sourceStatus==='archived'))
 assert.ok(!live.sheetList.innerHTML.includes(row.title),'Archive exposée : '+row.resourceId);
const search=render(original,'ARCHIVEE');
assert.equal(search.sheetCount.textContent,0,'La recherche ne doit pas réexposer les archives');
// La compatibilité avec les cours déjà visibles ne doit pas être altérée.
const previousCourse=mk('other_course_sheet',undefined,'AUTRE COURS','cours_existant');
const mixed=render([...original,previousCourse]);
assert.equal(mixed.sheetCount.textContent,2,'Une fiche active d’un autre cours a disparu');
assert.match(mixed.sheetList.innerHTML,/AUTRE COURS/);
console.log('PASS UI: archives historiques invisibles, fiche V7 unique, recherche sûre et cours existants conservés.');
