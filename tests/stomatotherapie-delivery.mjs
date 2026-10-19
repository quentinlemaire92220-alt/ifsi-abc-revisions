import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const bank=read('qextra-53.txt');
const {questions,deck,registry,window}=await runtimeDeck();
const actual=questions.filter(q=>q.courseId==='stomatotherapie');
assert.equal(actual.length,50);
assert.equal(new Set(actual.map(q=>q.id)).size,50);
for(const q of bank){
 const a=actual.find(x=>x.id===q.id);
 assert.deepEqual(JSON.parse(JSON.stringify(a.choices)),q.choices);
 assert.deepEqual(JSON.parse(JSON.stringify(a.answers)),q.answers);
 assert.equal(q.choices.length,5);
 assert.ok(q.answers.length>=1&&q.answers.length<=3);
 assert.ok(q.explanation.length>50);
}
const cards=deck.filter(c=>c.courseIds.includes('stomatotherapie'));
assert.equal(cards.length,69);
assert.equal(cards.filter(c=>!c.id.startsWith('voc:')).length,40);
for(const q of bank)for(const c of q.flashcards||[]){
 const actual=cards.find(x=>x.qid===q.id&&x.front===c.front);
 assert.ok(actual,'Carte explicite filtrée : '+q.id);
 assert.deepEqual(JSON.parse(JSON.stringify(actual.answers)),c.answers);
 assert.equal(actual.explanation,c.explanation,'Explication clinique supprimée : '+q.id);
}
const terms=read('vocabulaire-v1.json').entries.filter(t=>t.courseIds.includes('stomatotherapie'));
assert.equal(terms.length,29);
for(const t of terms){
 const q=bank.find(q=>q.id===t.qcmQuestionId);
 assert.ok(q?.vocabularyTermIds?.includes(t.id),'Terme non couvert : '+t.term);
 assert.equal(q.theme,'Vocabulaire');
 assert.ok(cards.some(c=>c.id==='voc:'+t.id));
}
// Vérifier le bouton vocabulaire sur la banque publiée, sans générer une autre vérité QCM.
const glossary=read('vocabulaire-v1.json');const started=[];
const win={IFSI_V741:{getRegistry:()=>registry,rebuildResourceIndex(){}},addEventListener(){},dispatchEvent(){}};
const ctx={window:win,Q:bank,console,Event,CustomEvent:class{},
 document:{getElementById:id=>['v8355Vocab','v8355VocabCss'].includes(id)?{classList:{contains:()=>true},addEventListener(){}}:null},
 localStorage:{getItem:()=>null,setItem(){}},fetch:async()=>({ok:true,json:async()=>glossary}),begin:q=>started.push(q),shuffle:q=>q,fill(){}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('v8355-vocabulary.js','utf8'),ctx);
await win.IFSI_VOCAB.refresh();
assert.equal(win.IFSI_VOCAB.questions().filter(q=>q.courseId==='stomatotherapie').length,0,'Questions de vocabulaire dupliquées');
win.IFSI_VOCAB.startCourseQuiz('stomatotherapie');
assert.equal(started.length,1);assert.equal(started[0].length,10);
assert.ok(started[0].every(q=>q.theme==='Vocabulaire'&&bank.some(x=>x.id===q.id)));
const old=questions.filter(q=>q.courseId!=='stomatotherapie'&&q.courseId!=="droits_patients");
const supplements=read('docs/qcm-supplements.json').supplements;
const authorized=supplements.flatMap(x=>read(x.pack)).filter(q=>q.courseId!=='stomatotherapie');
const authorizedIds=new Set(authorized.map(q=>q.id));
assert.equal(authorizedIds.size,authorized.length,'Compléments QCM dupliqués');
assert.equal(old.filter(q=>authorizedIds.has(q.id)).length,authorized.length,'Compléments approuvés incomplets');
assert.equal(old.length,2403+authorized.length,'Banques voisines modifiées en dehors des compléments autorisés');
assert.equal(registry.courses.filter(c=>c.id==='stomatotherapie').length,1);
const delivery=read('docs/course-deliveries.json').courses.find(c=>c.courseId==='stomatotherapie');
assert.equal(delivery.status,'complete');
assert.equal(delivery.blockers.length,0);
assert.equal(delivery.publishedVerification.status,'MATCH');
assert.equal(delivery.publicationApproval.status,'approved');
assert.equal(delivery.vocals.length,3);
assert.equal(delivery.vocalScripts.length,3);
const mp3=read('vocals.json').filter(v=>v.courseId==='stomatotherapie');
assert.equal(mp3.length,3);
assert.deepEqual([...delivery.vocals].sort(),mp3.map(v=>v.id).sort());
assert.ok(mp3.every(v=>v.mime==='audio/mpeg'&&/^[a-f0-9]{64}$/.test(delivery.artifactSha256s[v.driveId]||'')));
for(const [path,rows] of Object.entries({
 'course-registry-v741.json':registry.courses,
 'qextra-53.txt':bank,
 'sheets-3.json':read('sheets-3.json'),
 'infographics.json':read('infographics.json'),
 'docs/course-deliveries.json':read('docs/course-deliveries.json').courses
})){
 const own=rows.filter(x=>(x.courseId||x.id)==='stomatotherapie'||bank.includes(x));
 assert.ok(!/PLAUD|transcriptions?|Sources privées/i.test(JSON.stringify(own)),'Source interne exposée : '+path);
}
console.log('✅ Stomatothérapie : 50 QCM identiques à la matrice, 69 cartes décodées, 29 termes reliés, vocabulaire sans doublon, 2403 anciens QCM préservés et compléments QCM autorisés présents, 3 MP3 publiés avec empreintes vérifiées.');
