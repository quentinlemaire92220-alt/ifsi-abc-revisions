import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p));
const json=p=>JSON.parse(read(p).toString('utf8'));
const plan=json('docs/candidates/plaies-pansements-v42/reconciliation.json');
const file=read(plan.candidateFile);
const reviewed=JSON.parse(file.toString('utf8'));
const active=json(plan.currentProductionBank);

const gitBlobSha=data=>createHash('sha1').update(Buffer.from('blob '+data.length+'\0')).update(data).digest('hex');
const correctText=q=>(q.answers||[]).map(index=>q.choices[index]).sort();
const byId=new Map(active.map(q=>[q.id,q]));
const edited=[];
let choiceCount=0,correctCount=0,cardCount=0;

assert.equal(plan.mode,'review_only');
assert.equal(plan.notActive,true);
assert.equal(plan.releaseGate.drivePublicationAllowed,false);
assert.equal(plan.releaseGate.deployAllowed,false);
assert.equal(plan.releaseGate.packageApprovalForMain112,'pending');
assert.equal(plan.releaseGate.publicationBundleSha256,null);
assert.equal(plan.releaseGate.doNotCopyApprovalDigestFromLegacyPr,true);
assert.equal(gitBlobSha(file),plan.candidateSource.verifiedGitBlobSha,
  'Le snapshot V4.2 ne correspond plus aux octets de la banque des PR source');
assert.equal(reviewed.length,plan.expected.questions,'Banque V4.2 tronquée');
assert.equal(active.length,reviewed.length,'Les 50 IDs de la banque live doivent rester disponibles');
assert.equal(new Set(reviewed.map(q=>q.id)).size,reviewed.length,'IDs V4.2 dupliqués');

for(const q of reviewed){
 const old=byId.get(q.id);
 assert.ok(old,'Question historique supprimée: '+q.id);
 assert.equal(q.courseId,'plaies_pansements');
 assert.equal(q.choices.length,5,'5 choix obligatoires: '+q.id);
 assert.ok(q.answers.length>=1&&q.answers.length<=3,'1 à 3 bonnes réponses: '+q.id);
 assert.equal(new Set(q.answers).size,q.answers.length,'Indices corrects dupliqués: '+q.id);
 for(const idx of q.answers)assert.ok(Number.isInteger(idx)&&idx>=0&&idx<5,'Indice hors bornes: '+q.id);
 assert.deepEqual(correctText(q),correctText(old),'Bonne réponse modifiée: '+q.id);
 assert.deepEqual(q.flashcards,old.flashcards,'Flashcard historique modifiée: '+q.id);
 assert.equal(q.difficulty,old.difficulty,'Niveau modifié: '+q.id);
 assert.equal(q.theme,old.theme,'Thème modifié: '+q.id);
 assert.equal(q.source,old.source,'Source modifiée: '+q.id);
 assert.ok(typeof q.explanation==='string'&&q.explanation.length>25,'Correction insuffisante: '+q.id);
 choiceCount+=q.choices.length;correctCount+=q.answers.length;cardCount+=q.flashcards?.length||0;
 if(JSON.stringify(old.choices)!==JSON.stringify(q.choices)||old.question!==q.question||old.explanation!==q.explanation)edited.push(q.id);
}
assert.equal(choiceCount,plan.expected.choices);
assert.equal(correctCount,plan.expected.correctAnswerTexts);
assert.equal(cardCount,plan.expected.flashcards);
assert.equal(edited.length,plan.expected.editedEntries);
const changedStems=reviewed.filter(q=>byId.get(q.id).question!==q.question).map(q=>q.id).sort();
assert.deepEqual(changedStems,plan.expected.changedStemIds);

const proof=plan.pdfProof;
assert.ok(proof.verifiedAgainstActualDriveDownloads);
for(const value of Object.values(proof.canonical)){
 assert.match(value.sha256,/^[a-f0-9]{64}$/);
 assert.ok(value.bytes>0&&value.pages>0);
}
assert.notEqual(proof.canonical.qcm.driveId,proof.verifiedIdenticalAlternateCopies.qcmDriveId);
assert.notEqual(proof.canonical.correction.driveId,proof.verifiedIdenticalAlternateCopies.correctionDriveId);

console.log('PASS banque V4.2 en revue privée : 50 QCM, 250 choix, 86 bonnes réponses par texte et 40 flashcards conservés ; banque applicative inchangée.');
console.log('ATTENTION : hashes PDF documentés mais fichiers Drive non re-téléchargés par la CI, revue clinique/publication toujours nécessaires.');
