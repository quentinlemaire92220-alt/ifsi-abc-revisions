import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const read=p=>readFileSync(p);
const json=p=>JSON.parse(read(p).toString('utf8'));
const bankBytes=read('qextra-50.txt');
const bank=JSON.parse(bankBytes);
const registry=json('course-registry-v741.json');
const manifest=json('docs/course-deliveries.json');
const meta=json('build-meta.json');
const sw=read('sw.js').toString('utf8');
const index=read('index.html').toString('utf8');

const blobHash=createHash('sha1').update('blob '+bankBytes.length+'\0').update(bankBytes).digest('hex');
assert.equal(blobHash,'de31dc5abe8e3e5aae191c9ba6039b2b731ec9f6','La banque V4.2 doit rester exacte, aucune question régénérée');
assert.match(meta.version,/^8\.30\.\d+$/);
assert.ok(Number(meta.build)>=8413,'Version future ne doit pas rétablir le build V4.2');
assert.equal(registry.version,meta.version);
assert.equal(registry.courses.length,50,'Les 50 cours doivent être conservés');
assert.ok(registry.courses.some(c=>c.id==='pssm'));
assert.ok(registry.courses.some(c=>c.id==='sante_mondiale_sante_france'));
assert.ok(sw.includes('ifsi-abc-v'+meta.version.replaceAll('.','-')+'-local-'),'PWA cache de version non synchronisé');
assert.ok(index.includes('v8413-changelog.js?v='+meta.build),'Changelog V4.2 historique non maintenu');
assert.ok(index.includes('qextra-50.txt')||sw.includes('./qextra-50.txt'),'Banque non référencée par les assets PWA');

const current=registry.courses.find(c=>c.id==='plaies_pansements');
const delivery=manifest.courses.find(c=>c.courseId==='plaies_pansements');
assert.ok(current&&delivery);
const qcmId='1Tc1Lry4cQVDXzW2-YmkXw_MW2WfekXI5';
const correctionId='1-RkE3yi1qEGctKc9mStTNGg-JxYcz18o';
assert.equal(current.qcmPdfUrl,'https://drive.google.com/file/d/'+qcmId+'/view');
assert.equal(current.qcmPdfQuestionCount,50);
assert.ok(current.additionalDocuments?.some(x=>x.category==='qcm-corrige'&&x.url==='https://drive.google.com/file/d/'+correctionId+'/view'));
assert.equal(delivery.qcmDriveId,qcmId);
assert.equal(delivery.qcmCorrectionDriveId,correctionId);
assert.equal(delivery.qcmBank,'qextra-50.txt');
assert.equal(delivery.qcmCount,50);
assert.equal(delivery.flashcardCount,40);
assert.equal(delivery.artifactSha256s[qcmId],'2089e3f2a7c4f5bbffa06d8624a0cc3e0d8b61b15f2f0251a31f3930aad76571');
assert.equal(delivery.artifactSha256s[correctionId],'61f0407301f27e0b724e892c43f084429071fb63dd1621b85f0b1f51058fa1f1');
assert.equal(delivery.publicationApproval.authorization,'explicit_go_publication');
assert.equal(delivery.publicationApproval.scope,'course_package');

const referenceKeys='D D CD DE ABD D AD C BE A ACE B AE D CDE C A C DE BCE B A BD AB B ABE CE B B E ACD C ADE E AB A AD D C AE CE AC BE E ABC BC E BD BCD AC'.split(' ');
assert.equal(referenceKeys.length,50);
assert.equal(bank.length,50);
assert.equal(new Set(bank.map(q=>q.id)).size,50);
let countAnswers=0,countFlashcards=0;
for(let n=0;n<bank.length;n++){
 const q=bank[n];
 assert.equal(q.id,'plaies_p1_'+String(n+1).padStart(3,'0'));
 assert.equal(q.courseId,'plaies_pansements');
 assert.equal(q.choices.length,5);
 assert.ok(q.answers.length>=1&&q.answers.length<=3);
 const key=q.answers.map(i=>'ABCDE'[i]).sort().join('');
 assert.equal(key,referenceKeys[n],'Désaccord corrigé PDF V4.2 pour '+q.id);
 assert.ok(q.explanation.length>25);
 countAnswers+=q.answers.length;countFlashcards+=(q.flashcards||[]).length;
}
assert.equal(countAnswers,86);
assert.equal(countFlashcards,40);
console.log('PASS : V8.30.113, 50 QCM V4.2 identiques (SHA Git), 50 clés PDF, 86 bonnes réponses, 40 flashcards, 50 cours, URLs et hashes PDF.');
console.log('SHA256 PDF issus de téléchargements Drive vérifiés manuellement : GitHub Actions ne retélécharge pas ces PDF.');
