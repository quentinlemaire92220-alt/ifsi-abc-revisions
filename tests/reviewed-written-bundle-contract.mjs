// Additive first-release contract: written sheet, QCM and optional anatomy PDF.
// No fabricated Drive folders, flashcard export, audio or independent medical signoff.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {verifyPublicArtifact,pagesOrigin,pagesPrefix} from '../tools/public-artifact-contract.mjs';
import {validateBank} from '../tools/qcm-bank-contract.mjs';
import {validateWrittenDelivery} from './written-sheet-contract.mjs';

export function validateReviewedWrittenBundle(course,d,sheets,{questions=[],deck=[],vocabulary=[],vocals=[],infographics=[],runtime=false}={}){
 const id=d.courseId,tag=id+': ';
 assert.equal(d.deliveryMode,'reviewed_written_bundle');
 assert.equal(d.packFormat,'written_v1');
 assert.equal(d.publicationHost,'github_pages');
 assert.equal(d.validated,true);assert.equal(d.pedagogicalValidated,true);
 assert.equal(d.status,'awaiting_mp3');assert.equal(d.scriptsPreparedCount,3);
 assert.deepEqual(d.vocals,[]);assert.ok(d.blockers.some(x=>x.resource==='vocals'&&x.reason==='awaiting_user_mp3'));
 assert.equal(course.id,id);assert.equal(course.officialSupport,true);
 assert.equal(course.flashcardTarget,d.flashcardCount);
 assert.equal(course.authoredFlashcards,true);
 assert.equal(d.sourceAudit.officialChecked,true);assert.equal(d.sourceAudit.oralStatus,'complete');
 assert.equal(d.sourceAudit.oralReviewBasis,'full_transcript_documentary_review');
 assert.equal(d.sourceAudit.originalAudioCompared,false);
 assert.equal(d.sourceAudit.independentClinicalSignoff,false);
 assert.equal(d.sourceAudit.officialSupportPreservedPrivately,true);
 assert.deepEqual(Object.keys(d.publicArtifacts).sort(),['boards','qcm','sheet']);
 for(const [role,a] of Object.entries(d.publicArtifacts)){
  verifyPublicArtifact(d,pagesOrigin+pagesPrefix+a.path);
  assert.equal(d.ownerAcceptedArtifactSha256s[role],a.sha256,tag+'accord sur un autre PDF');
  assert.equal(d.reviewedPageCounts[role],a.pageCount,tag+'revue partielle des pages');
 }
 assert.equal(d.anatomicalReview.status,'owner_accepted_documentary_review');
 assert.equal(d.anatomicalReview.pdfSha256,d.publicArtifacts.boards.sha256);
 assert.equal(d.anatomicalReview.independentClinicalSignoff,false);
 assert.ok(d.anatomicalReview.minimumEffectiveDpi>=95);
 assert.equal(d.writtenCoverage.expectedEssential,d.writtenCoverage.coveredEssential);
 assert.equal(d.templateConformance.contract,'ifsi_pdf_template_v3');
 validateWrittenDelivery(id,d,sheets,{requirePublishedVerification:false});
 const sheet=sheets.filter(s=>s.courseId===id);assert.equal(sheet.length,1);
 assert.equal(sheet[0].url,pagesOrigin+pagesPrefix+d.publicArtifacts.sheet.path);
 assert.equal(course.qcmPdfUrl,pagesOrigin+pagesPrefix+d.publicArtifacts.qcm.path);
 assert.deepEqual(d.infographicResourceIds,[]);
 assert.equal(infographics.filter(x=>x.courseId===id).length,0,tag+'doublon du pack anatomique');
 assert.equal(vocals.filter(x=>x.courseId===id).length,0,tag+'audio non livré');
 const boards=(course.additionalDocuments||[]).filter(x=>x.category==='anatomy');assert.equal(boards.length,1);
 assert.equal(boards[0].url,pagesOrigin+pagesPrefix+d.publicArtifacts.boards.path);
 assert.equal(boards[0].atlasId,id);
 const bank=JSON.parse(fs.readFileSync(d.qcmBank,'utf8'));
 assert.equal(validateBank(bank,id),d.qcmCount);
 assert.equal(bank.reduce((n,q)=>n+q.flashcards.length,0),d.flashcardCount);
 const mirror=JSON.parse(fs.readFileSync('questions-5.json','utf8')).filter(x=>x.courseId===id);
 assert.deepEqual(mirror,bank,tag+'miroir QCM divergent');
 assert.equal(vocabulary.filter(x=>x.courseIds?.includes(id)).length,d.lexicon.termCount);
 assert.equal(d.lexicon.termCount,d.vocabularyCount);
 assert.equal(d.visualOwnerReview.status,'owner_accepted');
 assert.equal(d.publicationApproval.authorization,'explicit_go_publication');
 assert.equal(d.publicationApproval.status,'approved');
 assert.equal(d.publicationApproval.scope,'course_package');
 assert.ok(['PENDING_DEPLOYMENT','MATCH'].includes(d.publishedVerification.status));
 if(runtime){
  assert.deepEqual(JSON.parse(JSON.stringify(questions.filter(x=>x.courseId===id))),bank,tag+'banque non chargée');
  const cards=deck.filter(x=>x.courseId===id&&!String(x.id).startsWith('voc:'));
  assert.equal(cards.length,d.flashcardCount,tag+'cartes perdues au décodage');
  assert.ok(cards.every(c=>bank.some(q=>q.id===c.qid&&q.flashcards.some(f=>f.front===(c.sourceFront||c.front)))));
 }
 return {questions:bank.length,cards:d.flashcardCount,definitions:d.vocabularyCount};
}
