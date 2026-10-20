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
 sources:[{label:'Référence fictive test',url:'https://example.org/reference-test',type:'verified_complement'}],
 qcm:[{id:'q1',prompt:'Quelle proposition fictive est attendue ?',options:['Premier choix','Deuxième choix','Troisième choix','Quatrième choix'],correct:[1],explanation:'La réponse B sert uniquement aux tests du moteur.',feedback:['Choix A non attendu','Choix B attendu','Choix C non attendu','Choix D non attendu']}],
 flashcards:[{id:'f1',front:'Question purement fictive ?',back:'Réponse purement fictive.'}],
 cases:[{id:'c1',title:'Situation fictive',context:'Patient entièrement fictif, aucun détail médical.',steps:[{id:'s1',prompt:'Action fictive ?',options:['A','B','C','D'],correct:1,explanation:'Explication de démonstration.',feedback:['A non attendu','B attendu','C non attendu','D non attendu']}]}],
 publicationApproval:{status:'approved',authorization:'explicit_go_publication',scope:'pathology_package',bundleSha256:digest}
};

const errors = x => Array.from(engine.validate(x));
assert.deepEqual(errors(valid),[], 'Fixture valide rejetée');
assert.ok(errors({...valid,publicationApproval:{status:'draft'}}).some(e=>e.includes('Publication non autorisée')), 'GO publication absent doit bloquer');
assert.ok(errors({...valid,sections:{...valid.sections,monitoring:''}}).some(e=>e.includes('monitoring')), 'Surveillance manquante tolérée');
assert.ok(errors({...valid,qcm:[{...valid.qcm[0],correct:[0,1,2,3]}]}).some(e=>e.includes('réponses attendues')), '4/4 autorisé');
assert.ok(errors({...valid,qcm:[{...valid.qcm[0],feedback:['Un seul'] }]}).some(e=>e.includes('correction argumentée')), 'Feedback incomplet');
assert.ok(errors({...valid,sources:[]}).some(e=>e.includes('Sources')), 'Aucune source tolérée');
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
assert.ok(!read('index.html').includes('./pathologies-module-v1.js'),'Le pilote non approuvé ne doit pas être chargé sur le site public');
assert.ok(!read('sw.js').includes('./pathologies-module-v1.js'),'Ne pas précharger le module non approuvé hors ligne');
const result=engine.activate([{...valid,publicationApproval:{status:'draft'}}]);
assert.equal(result.activated,false,'Activation du contenu non approuvé');
assert.equal(result.errors.length,1);
// Le montage DOM du catalogue approuvé sera testé en navigateur lors de son activation contrôlée.
console.log('✅ Pathologies v1 : schéma pédagogique, sources, validation publication, correction contextualisée, non-diffusion');
