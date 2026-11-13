// Restore only a declared FIRST course addition for old whole-file checksums.
// Old rows stay byte-for-byte checked by the original historical checksum.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
export function beforeAdditiveCourses(file,value,manifest){
 // Reconstruct the exact first-release rows before the separately checked,
 // additive official-support revision. Never change its original signature.
 for(const r of (manifest.scopedCourseRevisions||[]).filter(r=>r.profile==='development_official_update_v1')){
  assert.equal(createHash('sha256').update(fs.readFileSync(r.baselinePath)).digest('hex'),r.baselineSha256);
  const old=read(r.baselinePath);assert.equal(old.courseId,r.courseId);
  if(file==='docs/course-deliveries.json'&&value.scopedCourseRevisions)value={...value,scopedCourseRevisions:value.scopedCourseRevisions.filter(x=>x.id!==r.id)};
  else if(file==='vocabulaire-v1.json')value={...value,entries:value.entries.filter(v=>!r.addedVocabularyEntryIds.includes(v.id))};
  else if(file==='questions-5.json')value=value.filter(q=>!r.addedQuestionIds.includes(q.id));
  else if(/^sheets-[123]\.json$/.test(file))value=value.filter(s=>s.resourceId!==r.sheetResourceId);
 }
 for(const d of (manifest.courses||[]).filter(d=>d.firstReleaseBaseline)){
  const b=d.firstReleaseBaseline;
  assert.equal(b.contract,'additive_course_rows_v1');
  assert.ok(!b.previousCourseIds.includes(d.courseId),'An existing course cannot be stripped as a new addition');
  assert.equal(d.publicationApproval?.authorization,'explicit_go_publication');
  assert.equal(d.publicationApproval?.status,'approved');
  assert.match(d.publicationApproval.bundleSha256,/^[a-f0-9]{64}$/);
  const bank=read(d.qcmBank);
  assert.equal(bank.length,d.qcmCount);assert.ok(bank.every(q=>q.courseId===d.courseId));
  if(file==='course-registry-v741.json'){
   value={...value,courses:value.courses.filter(c=>c.id!==d.courseId)};
  }else if(file==='docs/course-deliveries.json'){
   value={...value,courses:value.courses.filter(c=>c.courseId!==d.courseId)};
  }else if(file==='questions-5.json'){
   assert.deepEqual(value.filter(q=>q.courseId===d.courseId),bank,'New course mirror differs');
   value=value.filter(q=>q.courseId!==d.courseId);
  }else if(file==='vocabulaire-v1.json'){
   const added=value.entries.filter(v=>v.courseIds?.includes(d.courseId));
   assert.equal(added.length,d.vocabularyCount);assert.ok(added.every(v=>v.courseIds.length===1),'Shared historical vocabulary cannot be stripped');
   assert.equal(createHash('sha256').update(JSON.stringify(added)).digest('hex'),b.vocabularyRowsSha256);
   value={...value,entries:value.entries.filter(v=>!v.courseIds?.includes(d.courseId))};
  }else if(['vocals.json','sheets-1.json','sheets-2.json','sheets-3.json'].includes(file)){
   const added=value.filter(v=>v.courseId===d.courseId);
   assert.equal(createHash('sha256').update(JSON.stringify(added)).digest('hex'),b.rowSha256s[file]);
   value=value.filter(v=>v.courseId!==d.courseId);
  }
 }
 return value;
}
