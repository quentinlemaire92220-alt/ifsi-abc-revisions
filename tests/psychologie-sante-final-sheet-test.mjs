import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const d=read('docs/course-deliveries.json').courses.find(c=>c.courseId==='psychologie_sante');
const sheets=read('sheets-3.json').filter(s=>s.courseId===d.courseId),active=sheets.filter(s=>s.sourceStatus==='active');
const p='assets/psychologie-sante-20261102/Fiche_Psychologie_Sante_52p_79_Definitions.pdf';
assert.equal(sheets.length,5);assert.equal(active.length,1);assert.equal(active[0].resourceId,'psychologie_sante_fiche_20261102_52p');
assert.equal(d.publicArtifacts.sheet.path,p);assert.equal(d.publicArtifacts.sheet.pageCount,52);
assert.equal(createHash('sha256').update(fs.readFileSync(p)).digest('hex'),'9c651de40791b83755bf11a883f40d5f2a96729afedc217b27c6d30d49126f4d');
assert.equal(active[0].pageCount,52);assert.equal(active[0].lexiconTermCount,79);assert.equal(active[0].provisional,false);
assert.equal(d.postOfficialSheetRevision.status,'approved_for_publication');assert.deepEqual(d.blockers,[]);
const c=read('course-registry-v741.json').courses.find(c=>c.id===d.courseId);
assert.equal(c.officialSupportItems.length,3);assert.equal(c.nativeSupportAvailable,true);assert.equal(c.provisional,false);
assert.equal(d.sourceAudit.originalAudioCompared,false);assert.equal(d.sourceAudit.oralCoverageExhaustive,false);
assert.equal(d.pedagogicalNonRegression.sheetSha256,d.publicArtifacts.sheet.sha256);
for(const s of [d,d.partDeliveries[0]]){assert.equal(s.templateConformance.artifacts.sheet.artifactSha256,d.publicArtifacts.sheet.sha256);assert.equal(s.writtenCoverage.coveredEssential,147);}
console.log('PASS : fiche finale 52p/79, trois supports officiels, une seule fiche active et réserves audio conservées');
