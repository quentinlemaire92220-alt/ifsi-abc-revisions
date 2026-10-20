import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8');
const manifest=JSON.parse(read('docs/anatomy-reproductive-preview-v8402.json'));
const meta=JSON.parse(read('build-meta.json'));
const inventory=JSON.parse(read('resource-audit-v821.json'));
const sw=read('sw.js');
const nav=read('v82-nav-anatomy.js');
const idx=read('index.html');
const startup=read('v8303-home-startup.js');
const expected={
 R03:{sha:'c53f39594fba856f5a38d65957aacd7dc71b8a24ded5e7d5e4024332167a95e8',page:1},
 R05:{sha:'4bde13b6c977f3b8f9ca48cd539fe54c0ef8a72d1a3a264d41e7f5c4a5b087f8',page:2}
};
const unaffected={
 R02:'455955d8583ae63e40ec795d6a268a1c30c409c747ada66e8e065429f71eba51',
 R04:'9bad01f128ecd8e542c2ed75ba89b863ab754fdbd1ffe2964729918d449785bb',
 R06:'c71dd3b43e3692bd738ef37b6567d0725db6fe8ca51d839bbb0efcc8302b0b05',
 R07:'4511ee1f98e0ecdcc7072583cd1eadbd60105144789e54a7a1eec0c9cc574cc6'
};
assert.match(meta.version,/^\d+\.\d+\.\d+$/,'Current release version invalid');
assert.match(String(meta.build),/^\d+$/,'Current build invalid');
assert.equal(manifest.lastAssetRefresh.version,'8.30.104','R03/R05 preview must retain its original provenance release');
assert.deepEqual(manifest.lastAssetRefresh.boardIds,['R03','R05']);
assert.equal(manifest.lastAssetRefresh.medicalApproval,false);
const permission=manifest.provisionalPublicationApproval;
assert.equal(permission.status,'approved_for_provisional_display_only');
assert.equal(permission.authorization,'explicit_go_publication');
assert.equal(permission.scope,'replace_only_R03_and_R05_preview_jpegs');
assert.equal(permission.release,manifest.lastAssetRefresh.version,'Provisional anatomy approval is scoped to its historical release only');
assert.equal(permission.clinicalApproval,false);
assert.equal(permission.rightsProvenanceVerified,false);
assert.deepEqual(permission.assets.map(x=>x.id),['R03','R05']);
for(const approvedPreview of permission.assets){
  const board=manifest.boards.find(b=>b.id===approvedPreview.id);
  assert.equal(approvedPreview.path,board.path);
  assert.equal(approvedPreview.sha256,board.sha256);
  assert.equal(approvedPreview.status,'provisional_review_only');
}
assert.equal(manifest.clinicalReview,'PENDING');
assert.equal(manifest.officialSupport,false);
assert.equal(manifest.pedagogicalApproval,false);
assert.equal(manifest.countedInHdAtlas,false);
assert.equal(manifest.questionsEnabled,false);
assert.equal(manifest.boards.length,6);
assert.equal(inventory.expectedTotals.hdAtlasBoards,106);
assert.equal(Object.values(inventory.atlasBoardContracts).reduce((sum,n)=>sum+n,0),106);
assert.equal(inventory.atlasBoardContracts.systeme_reproducteur,undefined);
assert.ok(idx.includes(`./v8404-changelog.js?v=${meta.build}`),'Historical R03/R05 changelog must stay available in the current build');
assert.ok(sw.includes("'./v8404-changelog.js'"));
assert.ok(sw.includes('"v8404-changelog.js"'));
assert.ok(startup.includes('IFSI_V8404_CHANGELOG'));
assert.ok(nav.includes('0 planche validée'));
assert.ok(nav.includes('6 maquettes en revue'));
for(const [id,expectedRecord] of Object.entries(expected)){
 const b=manifest.boards.find(x=>x.id===id);
 assert.ok(b,id+' absent');
 assert.equal(b.sha256,expectedRecord.sha);
 assert.equal(b.width,1489);assert.equal(b.height,2106);
 assert.ok(b.latestSource?.includes('page '+expectedRecord.page),id+' wrong Canva PDF page');
 assert.equal(b.clinicalReview,'PENDING');
 assert.equal(b.isApproved,false);
 assert.ok(b.warning.length>=60,id+' must describe limitations');
 assert.ok(nav.includes('./'+b.path));
 assert.ok(nav.includes(id+':{src:'));
 const buffer=fs.readFileSync(b.path);
 assert.equal(crypto.createHash('sha256').update(buffer).digest('hex'),b.sha256,id+' file checksum mismatch');
 assert.ok(sw.includes("'./"+b.path+"'"),id+' not in service worker');
}
for(const [id,sha] of Object.entries(unaffected)){
 const b=manifest.boards.find(x=>x.id===id);
 assert.equal(b.sha256,sha,id+' unrelated image unexpectedly changed');
 const buf=fs.readFileSync(b.path);
 assert.equal(crypto.createHash('sha256').update(buf).digest('hex'),sha,id+' unrelated bytes changed');
}
assert.ok(nav.includes('Sens des flèches rouges du trajet à vérifier'),'Warn of possible incorrect sperm-flow direction');
assert.ok(nav.includes('portion intramurale non légendée'),'Missing intramural tube segment warning absent');
assert.ok(!read('v83-anatomy-interactive.js').includes('assets/anatomy/reproductive/review/'),'Never create anatomy quizzes on preview images');
for(const filename of ['R03.jpg','R05.jpg']){
 assert.ok(sw.includes(filename),'PWA cache misses '+filename);
}
console.log('✅ Export Canva R03/R05 : 2 JPEG remplacés et hachés, 4 JPG intacts, avertissements + PWA, 0 validation fictive, 106 planches inchangées');
