import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const read=p=>fs.readFileSync(p,'utf8');
const data=JSON.parse(read('docs/anatomy-reproductive-import-v1.json'));
const app=read('v82-nav-anatomy.js');
const registry=JSON.parse(read('course-registry-v741.json')).courses;
const audit=JSON.parse(read('resource-audit-v821.json'));

assert.equal(data.schemaVersion,1);
assert.equal(data.expectedBoards,6);
assert.equal(data.boards.length,6);
assert.ok(registry.some(c=>c.id==='systeme_reproducteur'));
assert.deepEqual(data.boards.map(b=>b.key),['R02','R03','R04','R05','R06','R07']);
assert.equal(new Set(data.boards.map(b=>b.atlasId)).size,6);
assert.equal(new Set(data.boards.map(b=>b.plannedAssetPath)).size,6);
assert.equal(data.approvedBoards,data.boards.filter(b=>b.appPublication==='approved').length);
assert.ok(app.includes('6 maquettes en revue')&&app.includes('0 planche validée'));
assert.equal(audit.atlasBoardContracts.systeme_reproducteur,undefined);
assert.equal(audit.expectedTotals.hdAtlasBoards,106);
assert.ok(!JSON.stringify(data).includes('canva.com/')&&!JSON.stringify(data).includes('DAHYd62tg4w'));

const isValidHash=s=>typeof s==='string'&&/^[a-f0-9]{64}$/i.test(s);
for(const b of data.boards){
 assert.equal(b.courseId,'systeme_reproducteur');
 assert.equal(b.category,'anatomy');
 assert.equal(b.styleReview,'approved_by_user');
 assert.ok(b.requiredLandmarks.length>=5);
 assert.ok(Number.isInteger(b.mainImageSourcePixels.width)&&b.mainImageSourcePixels.width>0);
 assert.ok(Number.isInteger(b.mainImageSourcePixels.height)&&b.mainImageSourcePixels.height>0);
 assert.ok(b.plannedAssetPath.startsWith('assets/anatomy/reproductive/'));
 assert.equal(b.testReady,false,'Les planches non approuvées ne peuvent pas être utilisées dans les exercices');
 if(b.appPublication!=='approved'){
   assert.equal(b.imagePath,null,b.key+' : publication prématurée d\'une image');
   assert.equal(b.driveId,null,b.key+' : Drive ID non validé');
   assert.equal(b.approvedAssetSha256,null,b.key+' : empreinte fictive');
   continue;
 }
 assert.equal(b.clinicalReview,'approved',b.key+' : relecture anatomique absente');
 assert.equal(b.rightsReview,'approved_with_provenance',b.key+' : droit de diffusion non documenté');
 assert.equal(b.exportReview,'approved',b.key+' : export HD non vérifié');
 assert.equal(b.labelReview.complete,true,b.key+' : repères manquants');
 assert.equal(b.labelReview.missingOrUnverified.length,0);
 assert.ok(b.imagePath===b.plannedAssetPath,b.key+' : nom export incorrect');
 assert.ok(isValidHash(b.approvedAssetSha256),b.key+' : empreinte de l\'asset manquante');
 assert.ok(b.driveId&&b.driveId.length>10,b.key+' : ID Drive absent');
 assert.ok(fs.existsSync(b.imagePath),b.key+' : fichier absent');
 const bytes=fs.readFileSync(b.imagePath);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),b.approvedAssetSha256,b.key+' : export altéré');
}
if(data.publicStatus==='READY_TO_PUBLISH'){
 assert.equal(data.approvedBoards,data.boards.length,'Seule une série entièrement relue peut être publiée');
}else{
 assert.equal(data.approvedBoards,0,'Le manifeste reste bloqué tant que les vérifications ne sont pas closes');
 assert.equal(data.publicStatus,'BLOCKED_PENDING_ASSETS_AND_REVIEWS');
}
console.log('✅ Reproducteur: 6 emplacements prêts, 0 export ni droit médical inventé, aucun lien privé diffusé, 106 planches publiques inchangées.');
