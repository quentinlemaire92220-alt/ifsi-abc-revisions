// TNR du filtrage réel SW, sans charger le catalogue étudiant.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('sw.js','utf8');
const cutoff=source.indexOf("self.addEventListener('install'");
assert.ok(cutoff>0,'Bloc de validation Service Worker introuvable');
const context={Response,Blob,DecompressionStream,TextDecoder,Uint8Array,atob,
 console:{log(){},warn(){},error(){}}};
vm.createContext(context);
vm.runInContext(source.slice(0,cutoff),context);
const base={id:'lean_fictif_01',courseId:'fictif',theme:'Rôle',difficulty:'easy',
 question:'Quelles propositions sont correctes ?',choices:['A','B','C','D','E'],
 answers:[0,2],announcedCorrectCount:2,
 explanation:'A et C correspondent à la matrice pédagogique de test.'};
const accepted=q=>{context.fixture=q;return vm.runInContext('validQuestions([fixture]).length',context)};
assert.equal(accepted(base),1,'QCM correct perdu');
assert.equal(accepted({...base,answers:[0,2,3]}),0,'Cardinalité fausse acceptée');
assert.equal(accepted({...base,answers:[0,1,2,3],announcedCorrectCount:4}),0,'4 bonnes réponses acceptées pour lean');
assert.equal(accepted({...base,choices:['A','B','C','D']}),0,'4 options acceptées pour lean');
assert.equal(accepted({...base,announcedCorrectCount:1}),0,'Annonce contradictoire acceptée');
console.log('✅ Service Worker : cinq propositions, 1–3 réponses et cardinalité annoncée exacte pour les nouveaux QCM.');
