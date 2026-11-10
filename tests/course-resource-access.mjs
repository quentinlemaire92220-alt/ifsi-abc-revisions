import fs from 'node:fs';
import assert from 'node:assert/strict';
import {verifyCourseAccess} from '../tools/course-resource-access.mjs';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const runtime=await runtimeDeck({loadResources:true});
const sheets=[1,2,3].flatMap(n=>read(`sheets-${n}.json`)),vocals=runtime.window.IFSI_V73.getVocals(),vocabulary=read('vocabulaire-v1.json').entries;
const rows=[];
for(const course of runtime.registry.courses.filter(c=>c.canonicalQuestionIds||c.primarySheetResourceId||c.activeVocalIds||c.vocabularyEntryIds)){
 const resources=runtime.window.IFSI_V741.resourcesForCourse(course.id);
 rows.push(verifyCourseAccess({course,sheets,vocals,vocabulary,audioMirrors:read('audio-drive-mirrors-v1.json'),runtime:resources}));
 if(course.vocabularyEntryIds)assert.equal(runtime.window.IFSI_VOCAB.countForCourse(course.id),course.vocabularyEntryIds.length,'Définitions actives non chargées');
}
// Synthetic faults exercise the generic contract, independent of a particular course.
const url='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/assets/fixture.pdf';
const valid={course:{id:'fixture',primarySheetResourceId:'sheet',activeDocumentUrls:[url],qcmPdfUrl:url,additionalDocuments:[{url}],activeVocalIds:['audio'],canonicalQuestionIds:['q'],vocabularyEntryIds:['v']},sheets:[{resourceId:'sheet',courseId:'fixture',url}],vocals:[{id:'audio',courseId:'fixture',localAudio:'./assets/fixture.mp3'}],vocabulary:[{id:'v',courseIds:['fixture']}],runtime:{sheets:[{resourceId:'sheet'}],vocals:[{id:'audio'}],questions:[{id:'q'}]},exists:()=>true};
verifyCourseAccess(valid);
const faults=[x=>x.sheets=[],x=>x.sheets[0].courseId='other',x=>x.course.activeDocumentUrls=[],x=>x.course.additionalDocuments=[],x=>x.vocals=[],x=>x.vocals[0].courseId='other',x=>x.vocals[0].localAudio=null,x=>x.runtime.questions=[],x=>x.runtime.vocals=[],x=>x.vocabulary[0].courseIds=[],x=>x.course.activeVocalIds.push('audio'),x=>x.exists=()=>false];
for(const fault of faults){const x=structuredClone({...valid,exists:undefined});x.exists=()=>true;fault(x);assert.throws(()=>verifyCourseAccess(x),'Accès cassé accepté');}
console.log('PASS accès précoce : '+rows.length+' cours à sélection explicite, fiches/PDF/audio/banques/vocabulaire réellement chargés, 12 défauts refusés. Liens externes non sondés.');
