import {readHistoricalAudioJson,readHistoricalAudioGitJson} from './historical-audio-fixture.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {countAuthoredListItems} from './flashcard-answer-enumeration.mjs';
import {execFileSync} from 'node:child_process';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
import {isExistingWrittenUpdate,validateExistingWrittenUpdate,verifyExistingWrittenHistory} from './existing-course-written-update-contract.mjs';
const read=readHistoricalAudioJson;
const data=await runtimeDeck();
const enumerationCases=[
 ['Stagnation, dépôts et températures favorables. La maîtrise du réseau doit être organisée et contrôlée.',3],
 ['Le lien avec les soins et l’absence au début, y compris d’incubation. Le délai seul ne suffit pas.',2],
 ['Patient et site, geste et produit, dispositif et circuit. La sécurité dépend de leur cohérence.',3],
 ['Chambre et sanitaires, matériel, information des équipes. Ils complètent les mains et les protections adaptées.',3]
];
for(const [answer,n] of enumerationCases)assert.equal(countAuthoredListItems(answer,n),n);
for(const answer of ['Un seul facteur. Explication.', 'Patient et site, geste et produit. Explication.','Un élément ; deux éléments ; trois éléments ; quatre éléments.'])assert.notEqual(countAuthoredListItems(answer,3),3);

const extra={sheets:[1,2,3].flatMap(n=>read(`sheets-${n}.json`)),questions:data.questions,deck:data.deck,vocabulary:read('vocabulaire-v1.json').entries,vocals:read('vocals.json'),infographics:read('infographics.json')};
for(const d of read('docs/course-deliveries.json').courses.filter(isExistingWrittenUpdate)){
 const course=read('course-registry-v741.json').courses.find(c=>c.id===d.courseId);
 validateExistingWrittenUpdate(course,d,extra);
 const old=readHistoricalAudioGitJson('course-registry-v741.json',process.env.IFSI_BASE_SHA).courses.find(c=>c.id===d.courseId);
 verifyExistingWrittenHistory(old,course,d);
 assert.deepEqual(JSON.parse(JSON.stringify(data.window.IFSI_V741.resourcesForCourse(course.id).questions.map(q=>q.id))),course.canonicalQuestionIds);
 for(const change of [x=>x.qcmCount--,x=>x.flashcardCount--,x=>x.vocabularyCount--,x=>x.vocabularyEntryIds.pop(),x=>x.blockers=[],x=>x.partDeliveries[0].vocalIds=['fake'],x=>x.publicAudioArtifacts=[],x=>x.publicationApproval.status='pending',x=>x.sourceAudit.oralStatus='unverified',x=>x.publicArtifacts.qcm.sha256='0'.repeat(64)]){
  const altered=structuredClone(d);change(altered);assert.throws(()=>validateExistingWrittenUpdate(course,altered,extra));
 }
 for(const change of [x=>x.label+=' autre',x=>x.officialSupportUrl+='wrong',x=>x.audioCount++,x=>x.additionalDocuments.pop()]){
  const altered=structuredClone(course);change(altered);assert.throws(()=>verifyExistingWrittenHistory(old,altered,d));
 }
 // Execute the actual glossary selection API with the current registry.
 const source=fs.readFileSync('v8355-vocabulary.js','utf8');const window={IFSI_V741:{getRegistry:()=>data.registry},addEventListener(){},dispatchEvent(){}};
 const context={window,console,Event,Q:[],S:[],I:[],document:{getElementById:()=>({classList:{contains:()=>true},addEventListener(){}})},fetch:async()=>({ok:true,json:async()=>read('vocabulaire-v1.json')}),localStorage:{getItem(){},setItem(){}},setTimeout(){},setInterval(){},CustomEvent:class{}};
 vm.createContext(context);vm.runInContext(source,context);await window.IFSI_VOCAB.refresh();
 assert.deepEqual(JSON.parse(JSON.stringify(window.IFSI_VOCAB.forCourse(course.id).map(t=>t.id))),course.vocabularyEntryIds);
 assert.equal(window.IFSI_VOCAB.countForCourse(course.id),d.vocabularyCount);
 for(const other of data.registry.courses.filter(c=>c.id!==course.id&&!c.vocabularyEntryIds))assert.equal(window.IFSI_VOCAB.countForCourse(other.id),extra.vocabulary.filter(t=>t.courseIds.includes(other.id)).length);
 console.log('PASS mise à jour additive : banque active, cartes et lexique complets ; mutations de compte, autorisation, support et vocaux rejetées.');
}
