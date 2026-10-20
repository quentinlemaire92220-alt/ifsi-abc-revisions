import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const code=read('pathologies-private-review-v1.js'),module=read('pathologies-module-v1.js');
const win={};const ctx={window:win,console};vm.createContext(ctx);vm.runInContext(code,ctx);
const api=win.IFSI_PATHOLOGIES_REVIEW;
assert.ok(api,'Module de revue privée absent');
const sectionKeys=['definition','physiopathologie','riskFactors','clinicalSigns','diagnosis','treatments','nursingCare','monitoring','complications','keywords'];
const item=id=>({
 id,title:'Fictif',sections:Object.fromEntries(sectionKeys.map(s=>[s,'Texte pédagogique fictif'])),
 posterPages:Array.from({length:6},(_,i)=>({number:i+1,title:'Planche fictive',alt:'Schéma fictif',image:'data:image/webp;base64,AAAA'})),
 qcm:Array.from({length:24},(_,i)=>({id:'q'+i,prompt:'Test fictif',options:['A','B','C','D'],correct:[0],explanation:'Fictif',feedback:['test','test','test','test']})),
 flashcards:Array.from({length:20},(_,i)=>({id:'f'+i,front:'Fictive ?',back:'Fictive'})),
 cases:[{steps:Array.from({length:8},(_,i)=>({id:'s'+i,prompt:'Fictif',options:['A','B','C','D'],correct:1}))}]
});
const good={schema:'ifsi-abc-private-pathologies-p1-v1',reviewOnly:true,publicationPermitted:false,clinicalReview:'pending',items:['bpco','hta','dt2'].map(item)};
assert.equal(api.valid(good),true,'Le pack fictif privé conforme devrait être accepté');
assert.equal(api.valid({...good,publicationPermitted:true}),false,'Un pack public ne doit pas être importé comme revue privée');
assert.equal(api.valid({...good,clinicalReview:'approved'}),false,'Une prétention de validation clinique doit être rejetée');
assert.equal(api.valid({...good,reviewOnly:false}),false);
assert.equal(api.valid({...good,items:good.items.slice(0,2)}),false,'Les trois pathologies doivent figurer dans le pack');
const bad=structuredClone(good);bad.items[0].posterPages[0].image='javascript:alert(1)';
assert.equal(api.valid(bad),false,'URL d’image externe/interprétable interdite');
const bad2=structuredClone(good);bad2.items[1].qcm=[];
assert.equal(api.valid(bad2),false,'Banque QCM incomplète interdite');
assert.ok(module.includes('root.IFSI_PATHOLOGIES_REVIEW?.attachImport?.()'),'Le bouton d’import doit être présent dans le catalogue');
assert.ok(module.includes('root.IFSI_PATHOLOGIES_REVIEW?.showIfImported?.(id)'),'Le support privé doit s’ouvrir dans la page de la pathologie');
assert.ok(module.includes('showCatalog'),'Retour depuis la page privée impossible');
assert.ok(code.includes("const DB='ifsi-abc-private-pathologies-v1'")||code.includes("DB='ifsi-abc-private-pathologies-v1'"),'Stockage IndexedDB indisponible');
assert.ok(!code.includes('fetch(')&&!code.includes('XMLHttpRequest'),'Aucune communication réseau pour importer les fichiers privés');
assert.ok(code.includes('Aucun résultat ne contribue aux statistiques.')||code.includes('Aucun résultat ne contribue aux statistiques'),'Le statut sans score doit être annoncé');
const html=read('index.html'),sw=read('sw.js');
assert.ok(html.includes('./pathologies-private-review-v1.js?'),'Le lecteur privé doit être chargé dans IFSI ABC');
assert.ok(sw.includes("'./pathologies-private-review-v1.js'"),'Le lecteur doit fonctionner en cache PWA');
assert.ok(!html.includes('IFSI_ABC_PATHOLOGIES_P1_IMPORT_PRIVE'),'Le pack privé ne doit pas être embarqué dans le dépôt');
assert.ok(!sw.includes('IFSI_ABC_PATHOLOGIES_P1_IMPORT_PRIVE'),'Le pack privé ne doit pas être préchargé');
console.log('✅ Pathologies revue privée : import local, 18 pages et 156 exercices fictifs, aucune publication clinique ni score');
