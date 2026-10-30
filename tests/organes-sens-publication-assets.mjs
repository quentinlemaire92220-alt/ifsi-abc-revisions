// Contrôle des octets exacts du lot B1.1 avant activation.
// --prepublication : les 3 PDF peuvent être absents, mais une copie partielle est refusée.
// --require-assets : les 3 PDF doivent être présents, SHA-256 identique au manifeste.
// Ne crée jamais d'acceptation humaine ou de GO de publication.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const mode=process.argv[2]||'--prepublication';
assert.ok(['--prepublication','--require-assets'].includes(mode),'Mode inconnu');
const manifest=JSON.parse(fs.readFileSync('docs/publication-candidates/organes_des_sens_b11_sans_vocaux.json','utf8'));
assert.equal(manifest.courseId,'organes_des_sens_b11');
assert.equal(manifest.phase,'prepublication_draft');
assert.equal(manifest.deliveryPlan.vocalsIncluded,false);
assert.equal(manifest.deliveryPlan.vocalMp3Count,0);
const expected={sheet:17,qcm:24,boards:7};
const statuses=[];
for(const [role,count] of Object.entries(expected)){
 const asset=manifest.candidatePdfEvidence?.[role];
 assert.ok(asset,role+': manque dans le manifeste');
 assert.equal(asset.pages,count,role+': nombre de pages attendu');
 assert.match(asset.sha256||'',/^[a-f0-9]{64}$/,role+': SHA-256 invalide');
 const rel=asset.githubPath;
 assert.equal(typeof rel,'string',role+': chemin GitHub manquant');
 assert.ok(rel.startsWith('assets/organes-des-sens-20261029/')&&rel.endsWith('.pdf'),role+': chemin non autorisé');
 assert.equal(path.posix.normalize(rel),rel,role+': chemin non normalisé');
 const exists=fs.existsSync(rel);
 assert.equal(asset.gitBinaryUploaded,exists,role+': statut de transfert non prouvé par les octets du dépôt');
 statuses.push({role,exists});
 if(!exists)continue;
 const bytes=fs.readFileSync(rel);
 assert.ok(bytes.subarray(0,5).equals(Buffer.from('%PDF-')),role+': en-tête PDF absent');
 assert.equal(bytes.length,asset.bytes,role+': nombre d\u0027octets différent');
 const digest=crypto.createHash('sha256').update(bytes).digest('hex');
 assert.equal(digest,asset.sha256,role+': SHA-256 divergent');
}
const present=statuses.filter(s=>s.exists).length;
if(mode==='--prepublication'&&present<statuses.length) console.log('B1.1 : transfert partiel autorisé UNIQUEMENT en brouillon, activation interdite');
if(mode==='--require-assets')assert.equal(present,statuses.length,'PDF binaires non présents dans GitHub');
console.log('PASS B1.1 PDF asset gate:',present+'/'+statuses.length,
  'fichiers exacts ; mode',mode,'; aucune publication automatique.');
