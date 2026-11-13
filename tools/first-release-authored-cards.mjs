// Exact reviewed card bytes and glossary coverage for an additive first release.
// This validator never changes cards or grants publication approval.
import assert from 'node:assert/strict';
import {reviewedFieldDigest} from '../tests/qcm-autonomy-contract.mjs';
export function validateFirstReleaseAuthoredCards(d,course,bank,vocabulary){
 assert.equal(d.deliveryMode,'first_release');assert.equal(d.packFormat,'written_v1');
 assert.equal(d.validated,true);assert.equal(d.status,'complete');
 assert.equal(d.publicationApproval?.status,'approved');assert.equal(d.publicationApproval.authorization,'explicit_go_publication');assert.equal(d.publicationApproval.scope,'course_package');
 assert.equal(d.firstReleaseBaseline?.contract,'additive_course_rows_v1');assert.ok(!d.firstReleaseBaseline.previousCourseIds.includes(d.courseId));
 assert.equal(course.id,d.courseId);assert.ok(bank.every(q=>q.courseId===d.courseId));
 const review=d.authoredCardReview;assert.equal(review.contract,'first_release_authored_cards_v1');assert.equal(review.status,'owner_accepted_agent_documentary_review');
 assert.match(review.privateEvidenceSha256,/^[a-f0-9]{64}$/);assert.match(review.ownerApprovalEvidenceSha256,/^[a-f0-9]{64}$/);
 const cards=bank.flatMap(q=>q.flashcards.map(card=>({q,card})));assert.equal(cards.length,d.flashcardCount);assert.equal(new Set(cards.map(x=>x.card.id)).size,cards.length);assert.equal(review.cards.length,cards.length);
 assert.equal(new Set(review.cards.map(x=>x.cardId)).size,cards.length);
 for(const item of review.cards){const pair=cards.find(x=>x.q.id===item.questionId&&x.card.id===item.cardId);assert.ok(pair);assert.equal(reviewedFieldDigest('flashcards',[pair.card]),item.sha256,'Reviewed card text changed');}
 if(course.vocabularyCoveredByAuthoredCards){
  assert.equal(course.vocabularyCardIds?.length,d.vocabularyCount);assert.equal(new Set(course.vocabularyCardIds).size,d.vocabularyCount);
  const terms=vocabulary.filter(v=>course.vocabularyEntryIds.includes(v.id));assert.equal(terms.length,d.vocabularyCount);assert.equal(terms.length,course.vocabularyEntryIds.length);
  for(let i=0;i<terms.length;i++){const card=cards.find(x=>x.card.id===course.vocabularyCardIds[i])?.card;assert.ok(card);assert.equal(card.front,'Définir : '+terms[i].term+'.');assert.deepEqual(card.answers,[terms[i].definition],'Glossary not fully covered by authored cards');}
 }
 return review.cards;
}
