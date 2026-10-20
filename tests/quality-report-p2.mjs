import assert from 'node:assert/strict';
import {scanQuality,compareReports,toMarkdown} from '../tools/quality-report-p2.mjs';

const course={id:'cours-test',label:'Cours fictif',showInCourses:true,officialSupportUrl:'https://drive.google.com/file/d/abc/view'};
const inputs={
 questions:[{id:'q1',courseId:'cours-test',question:'Quel est le résultat ?',choices:['A','B','C','D'],answers:[1],explanation:'La réponse B est correcte.'}],
 deck:[{id:'fc1',courseId:'cours-test',theme:'Test',front:'Quel est le résultat ?',answers:['B']}],
 registry:{courses:[course]},snapshot:{expectedTotals:{courses:1,sheets:1,infographics:0,vocals:0,hdAtlasBoards:0},atlasBoardContracts:{}},
 sheets:[{courseId:'cours-test',title:'Fiche',url:'https://drive.google.com/file/d/12345678901234567890/view'}],
 infographics:[],vocals:[],atlasCounts:{}
};
const good=scanQuality(inputs);
assert.equal(good.issues.length,0,'Le catalogue fictif sain ne doit signaler aucune anomalie');
assert.equal(compareReports(good,good).new.length,0,'Comparer la base identique sans fausse nouveauté');
const structural=scanQuality({...inputs,questions:[{...inputs.questions[0],answers:[0,1,2,3]}]});
assert.ok(structural.issues.some(x=>x.type==='qcm_answers_invalid'&&x.severity==='error'),'4/4 doit bloquer');
const dup=scanQuality({...inputs,infographics:[{courseId:'cours-test',url:inputs.sheets[0].url}]});
assert.ok(dup.issues.some(x=>x.type==='drive_id_duplicate'&&x.severity==='error'),'ID Drive dupliqué doit bloquer');
assert.ok(!JSON.stringify(dup).includes('12345678901234567890'),'Rapport ne doit pas divulguer les identifiants de fichier');
const warn=scanQuality({...inputs,deck:[{...inputs.deck[0],front:'Question de révision'}]});
assert.ok(warn.issues.some(x=>x.severity==='warning'&&x.type==='flashcard_missing_front'),'Dette flashcards en avertissement');
const compare=compareReports(warn,good);
assert.equal(compare.new.length,1,'Nouvelle alerte isolée');
assert.equal(compare.resolved.length,0);
assert.equal(compare.existing.length,0);
assert.equal(compareReports(good,warn).resolved.length,1,'Anomalie corrigée reconnaissable');
const md=toMarkdown(warn,compare);
assert.match(md,/Avertissements/);
assert.match(md,/nouvelles/);
assert.match(md,/Aucun scan Google Drive/);
console.log('✅ P2 : erreurs bloquantes, alertes non bloquantes, comparaisons et confidentialité vérifiées');