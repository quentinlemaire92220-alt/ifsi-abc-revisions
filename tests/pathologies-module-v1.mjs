import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const src = read('pathologies-module-v1.js');
const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(src, context);
const engine = context.window.IFSI_PATHOLOGIES;
assert.ok(engine, 'Moteur Pathologies non exposé');
const digest = 'a'.repeat(64);
const valid = {
 id:'broncho_test',title:'Pathologie fictive pour les tests',system:'Respiratoire',year:1,courseIds:['systeme_respiratoire'],
 sections:Object.fromEntries(Array.from(engine.requiredSections, key=>[key,'Texte fictif de contrôle — aucune valeur médicale.'])),
 sources:[{id:'fiction',label:'Référence fictive test',url:'https://example.org/reference-test',type:'verified_complement'}],
 visuals:[{id:'faux-visuel-01',sectionId:'physiopathologie',kind:'original_infographic',alt:'Infographie fictive de test',url:'https://example.org/fiction.png',sha256:digest,sourceIds:['fiction'],graphicalReview:'approved',medicalReview:'approved'}],
 visualAudit:{diagramCount:1,rawDiagramCount:0,allPdfPagesChecked:true,clinicalContentReviewed:true},
 qcm:[{id:'q1',prompt:'Quelle proposition fictive est attendue ?',options:['Premier choix','Deuxième choix','Troisième choix','Quatrième choix'],correct:[1],explanation:'La réponse B sert uniquement aux tests du moteur.',feedback:['Choix A non attendu','Choix B attendu','Choix C non attendu','Choix D non attendu'],sourceIds:['fiction']}],
 flashcards:[{id:'f1',front:'Question purement fictive ?',back:'Réponse purement fictive.',sourceIds:['fiction']}],
 cases:[{id:'c1',title:'Situation fictive',context:'Patient entièrement fictif, aucun détail médical.',steps:[{id:'s1',prompt:'Action fictive ?',options:['A','B','C','D'],correct:1,explanation:'Explication de démonstration.',feedback:['A non attendu','B attendu','C non attendu','D non attendu'],sourceIds:['fiction']}]}],
 publicationApproval:{status:'approved',authorization:'explicit_go_publication',scope:'pathology_package',bundleSha256:digest}
};

const errors = x => Array.from(engine.validate(x));
assert.deepEqual(errors(valid),[], 'Fixture valide rejetée');
assert.ok(errors({...valid,publicationApproval:{status:'draft'}}).some(e=>e.includes('Publication non autorisée')), 'GO publication absent doit bloquer');
assert.ok(errors({...valid,sections:{...valid.sections,monitoring:''}}).some(e=>e.includes('monitoring')), 'Surveillance manquante tolérée');
assert.ok(errors({...valid,qcm:[{...valid.qcm[0],correct:[0,1,2,3]}]}).some(e=>e.includes('réponses attendues')), '4/4 autorisé');
assert.ok(errors({...valid,qcm:[{...valid.qcm[0],feedback:['Un seul'] }]}).some(e=>e.includes('correction argumentée')), 'Feedback incomplet');
assert.ok(errors({...valid,sources:[]}).some(e=>e.includes('Sources')), 'Aucune source tolérée');
assert.ok(errors({...valid,qcm:[{...valid.qcm[0],sourceIds:[]}]}).some(e=>e.includes('sourceIds individuels')),'QCM sans source individuel autorisé');
assert.ok(errors({...valid,flashcards:[{...valid.flashcards[0],sourceIds:[]}]}).some(e=>e.includes('sourceIds individuels')),'Flashcard sans source individuel autorisée');
assert.ok(errors({...valid,cases:[{...valid.cases[0],steps:[{...valid.cases[0].steps[0],sourceIds:[]}]}]}).some(e=>e.includes('sourceIds individuels')),'Étape de cas sans source autorisée');
assert.ok(errors({...valid,flashcards:[{...valid.flashcards[0],sourceIds:['inconnue']}]}).some(e=>e.includes('sourceIds individuels')),'Source inconnue acceptée');
assert.doesNotThrow(()=>engine.validate({...valid,cases:[{...valid.cases[0],steps:[null]}]}),'Étape null doit être rejetée sans erreur de runtime');

assert.ok(errors({...valid,visuals:[]}).some(e=>e.includes('Infographies')), 'Absence d’infographies autorisée');
assert.doesNotThrow(()=>engine.validate({...valid,visuals:[null]}),'Visuel null doit être rejeté sans erreur JS');
assert.doesNotThrow(()=>engine.validate({...valid,visuals:[{...valid.visuals[0],sourceIds:'invalid'}]}),'Liens de sources malformés doivent être rejetés');
assert.doesNotThrow(()=>engine.validate({...valid,sources:[null]}),'Source null doit être rejetée sans erreur JS');
assert.doesNotThrow(()=>engine.validate({...valid,cases:[null]}),'Cas clinique null doit être rejeté sans erreur JS');

assert.ok(errors({...valid,visuals:[{...valid.visuals[0],medicalReview:'pending'}]}).some(e=>e.includes('double validation')), 'Revue médicale absente autorisée');
assert.ok(errors({...valid,visuals:[{...valid.visuals[0],graphicalReview:'pending'}]}).some(e=>e.includes('double validation')), 'Revue graphique absente autorisée');
assert.ok(errors({...valid,visuals:[{...valid.visuals[0],kind:'raw_diagram'}]}).some(e=>e.includes('brute')), 'Schéma brut autorisé');
assert.ok(errors({...valid,visuals:[{...valid.visuals[0],sourceIds:['inconnue']}]}).some(e=>e.includes('source')), 'Source d’infographie introuvable autorisée');
assert.ok(errors({...valid,visualAudit:{...valid.visualAudit,diagramCount:2}}).some(e=>e.includes('Audit')), 'Inventaire incomplet autorisé');
assert.ok(errors({...valid,visualAudit:{...valid.visualAudit,allPdfPagesChecked:false}}).some(e=>e.includes('Audit')), 'Contrôle PDF incomplet autorisé');
assert.ok(errors({...valid,visualAudit:{...valid.visualAudit,clinicalContentReviewed:false}}).some(e=>e.includes('Audit')), 'Validation clinique incomplète autorisée');
assert.ok(src.includes('class="patho-figure"')&&src.includes('esc(v?.url)'),'Illustrations non intégrées dans les sections');

const sameAnswerQcm=Array.from({length:12},(_,i)=>({...valid.qcm[0],id:'qa'+i,correct:[0]}));
assert.ok(errors({...valid,qcm:sameAnswerQcm}).some(e=>e.includes('concentrées')||e.includes('systématiquement')),'12 QCM toujours en A doivent être bloqués');
const spreadQcm=Array.from({length:12},(_,i)=>({...valid.qcm[0],id:'qb'+i,correct:[i%4]}));
assert.ok(!errors({...valid,qcm:spreadQcm}).some(e=>e.includes('concentrées')||e.includes('systématiquement')),'Distribution équilibrée ne doit pas être bloquée');
const sameCaseSteps=Array.from({length:8},(_,i)=>({...valid.cases[0].steps[0],id:'step'+i,correct:0}));
assert.ok(errors({...valid,cases:[{...valid.cases[0],steps:sameCaseSteps}]}).some(e=>e.includes('Cas cliniques: bonnes réponses')),'Réponse A des cas trop prévisible');
const spreadCaseSteps=sameCaseSteps.map((s,i)=>({...s,correct:i%4}));
assert.ok(!errors({...valid,cases:[{...valid.cases[0],steps:spreadCaseSteps}]}).some(e=>e.includes('Cas cliniques: bonnes réponses')),'Répartition correcte des cas');
const q=valid.qcm[0];
const correct=engine.evaluate(q,[1]);
assert.equal(correct.correct,true);
assert.equal(correct.details.length,0);
const wrong=engine.evaluate(q,[0]);
assert.equal(wrong.correct,false);
assert.equal(wrong.details.length,2,'Erreur sélectionnée et bonne réponse omise doivent être expliquées');
assert.equal(wrong.details[0].message,'Choix A non attendu');
assert.equal(wrong.details[1].message,'Choix B attendu');
assert.ok(Object.isFrozen(wrong.selected),'Réponse non figée après correction');
const multi={...q,correct:[0,2]};
assert.equal(engine.evaluate(multi,[2,0]).correct,true,'Ordre des choix non significatif');
assert.equal(engine.evaluate(multi,[0,1]).correct,false);
assert.ok(src.includes('Ta réponse :')&&src.includes('Bonne réponse :'),'Affichage réponse vs corrigé absent');
assert.ok(src.includes('aria-live="polite"'),'Retour accessible manquant');
assert.ok(src.includes('data-patho-course'),'Les cours associés ne sont pas accessibles depuis les fiches');
assert.ok(src.includes("state.submitted?'':' disabled'"),'Le cas clinique doit imposer une validation avant de continuer');
assert.ok(src.includes("esc(s.url)"),'URL des sources non protégée à l’affichage');
assert.equal(engine.activate([]).activated,false,'Catalogue vide ne doit pas créer d’onglet');
const result=engine.activate([{...valid,publicationApproval:{status:'draft'}}]);
assert.equal(result.activated,false,'Activation du contenu non approuvé');
assert.equal(result.errors.length,1);
// Le montage DOM du catalogue approuvé sera testé en navigateur lors de son activation contrôlée.
console.log('✅ Pathologies v1 : schéma pédagogique, sources, validation publication, correction contextualisée, non-diffusion');

assert.ok(read('index.html').includes('./pathologies-module-v1.js?v=8406'),'Moteur non chargé dans la coque');
assert.ok(read('index.html').includes('./pathologies-boot-v1.js?v=8406'),'Verrou d’activation absent de la coque');
assert.ok(read('sw.js').includes("'./pathologies-module-v1.js'")&&read('sw.js').includes("'./pathologies-boot-v1.js'"),'Scripts inactifs non précachés hors ligne');
assert.ok(!read('index.html').includes('IFSI_PATHOLOGIES_PUBLISHED_BUNDLE'),'Catalogue médical ne doit pas être déclaré dans index.html');
assert.ok(!read('sw.js').includes('IFSI_PATHOLOGIES_PUBLISHED_BUNDLE'),'Catalogue médical ne doit pas être déclaré dans le service worker');
