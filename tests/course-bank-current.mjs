import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validateBank} from '../tools/qcm-bank-contract.mjs';
import {execFileSync} from 'node:child_process';
const stage=process.argv[2];
assert.ok(['preparation','publication'].includes(stage),'Étape explicite requise');
const folder='data/course-'+(stage==='preparation'?'preparations':'banks');
const files=fs.readdirSync(folder).filter(f=>f.endsWith('.json')&&!f.endsWith('_lexique.json'));
const base=process.env.IFSI_BASE_SHA;
assert.match(base||'',/^[a-f0-9]{40}$/i,'Base complète requise');
const changed=new Set(execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split(/\r?\n/));
let n=0;
for(const name of files){
 if(stage==='publication'&&!changed.has(folder+'/'+name))continue;
 const rows=JSON.parse(fs.readFileSync(folder+'/'+name,'utf8'));
 // Only authored standalone banks use this contract. Legacy bank formats retain their gates.
 if(!Array.isArray(rows)||!rows[0]?.flashcards)continue;
 const delivery=stage==='publication' ? JSON.parse(fs.readFileSync('docs/course-deliveries.json','utf8')).courses.find(c=>c.qcmBank===folder+'/'+name) : null;
 const glossaryOnly=delivery?.deliveryMode==='existing_course_revision' &&
  ['qcm_pdf_50_qcm_59_interactive_flashcards_only','qcm_50_flashcards_59_fiche_unique_20p'].includes(delivery?.publicationSubset) &&
  delivery?.qcmCount===50 && delivery?.flashcardCount===59;
 n+=validateBank(rows,name,glossaryOnly?{glossaryCount:59}:{});
}
console.log('PASS contrats '+stage+' : '+n+' QCM/cartes');
