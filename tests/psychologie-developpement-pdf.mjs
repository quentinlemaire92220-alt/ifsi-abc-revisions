import fs from 'node:fs';
const rev=JSON.parse(fs.readFileSync('docs/course-deliveries.json')).scopedCourseRevisions.find(r=>r.profile==='development_official_update_v1');
const python=process.env.IFSI_PYTHON||'python';
const {execFileSync}=await import('node:child_process');
for(const a of rev.publicArtifacts.filter(a=>['sheet','qcm'].includes(a.role)))execFileSync(python,['tools/pdf-template-v3.py',a.path,'--role',a.role,'--technical-only'],{maxBuffer:4*1024*1024});
console.log('PASS development PDF V3: sheet and QCM technical template checks');
