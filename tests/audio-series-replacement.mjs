import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const digest=x=>createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
const actual=read('audio-series-v1.json'),code=fs.readFileSync('audio-series-v1.js','utf8');
async function boot(manifest){const ctx={window:{},crypto:webcrypto,TextEncoder,Uint8Array,console:{error(){}},fetch:async()=>({ok:true,json:async()=>structuredClone(manifest)})};vm.runInNewContext(code,ctx);await ctx.window.IFSI_AUDIO_SERIES.ready;return ctx.window.IFSI_AUDIO_SERIES;}
const stage=process.argv.includes('--preparation')?'preparation':'publication';
const live=await boot(actual);
for(const s of actual.series){
  if(stage==='publication')assert.equal(s.status,'approved','Écoute et GO explicites requis avant publication');
  for(let i=0;i<s.artifacts.length;i++){
    const a=s.artifacts[i],bytes=fs.readFileSync(a.path);
    assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);
  }
}
const catalogue=read('vocals.json'),registry=read('course-registry-v741.json');
const changed=JSON.parse(JSON.stringify(live.applyVocals(catalogue)));
const activeRegistry=JSON.parse(JSON.stringify(live.applyRegistry(registry)));
for(const s of actual.series.filter(s=>s.status==='approved')){
 assert.deepEqual(changed.filter(v=>v.courseId===s.courseId),s.vocals);
 assert.deepEqual(changed.filter(v=>v.courseId!==s.courseId),catalogue.filter(v=>v.courseId!==s.courseId));
 assert.equal(activeRegistry.courses.find(c=>c.id===s.courseId).audioCount,s.vocals.length);
 assert.deepEqual(activeRegistry.courses.filter(c=>c.id!==s.courseId),registry.courses.filter(c=>c.id!==s.courseId));
}
// Fixture de test explicitement synthétique pour les échecs et les courses de chargement.
const fixture=structuredClone(actual);const s=fixture.series[0];
s.status='approved';s.review={status:'owner_listened_and_accepted',privateEvidenceSha256:'a'.repeat(64)};
s.vocals.forEach((v,i)=>v.driveId='fixture_drive_'+i);
const sign=()=>{const {publicationApproval,...content}=s;s.publicationApproval={authorization:'explicit_go_publication',scope:'audio_series_replacement',bundleSha256:digest(content)};};sign();
const api=await boot(fixture),rows=JSON.parse(JSON.stringify(api.applyVocals(catalogue)));
assert.equal(rows.filter(v=>v.courseId===s.courseId).length,10);
assert.equal(new Set(rows.map(v=>v.id)).size,rows.length);
assert.deepEqual(JSON.parse(JSON.stringify(api.applyVocals(catalogue))),rows,'Projection reproductible');
assert.throws(()=>api.applyVocals(catalogue.filter(v=>v.id!==s.replaces[0])),/Historique/);
const edited=structuredClone(fixture);edited.series[0].vocals[0].title+=' altéré';
await assert.rejects(boot(edited),/modifiée après accord/);
const invalid=structuredClone(fixture);invalid.series[0].vocals[0].durationSeconds=600;
await assert.rejects(boot(invalid),/Durée/);
const noDrive=structuredClone(fixture);delete noDrive.series[0].vocals[0].driveId;
await assert.rejects(boot(noDrive),/Drive/);
const pending=structuredClone(fixture);pending.series[0].status='prepared';pending.series[0].review={status:'pending'};pending.series[0].publicationApproval=null;
assert.deepEqual(JSON.parse(JSON.stringify((await boot(pending)).applyVocals(catalogue))),catalogue);
const html=fs.readFileSync('index.html','utf8');assert.ok(html.indexOf('./audio-series-v1.js')<html.indexOf('./vocals-v73.js'));
assert.ok(fs.readFileSync('vocals-v73.js','utf8').includes('await window.IFSI_AUDIO_SERIES?.ready'));
assert.ok(fs.readFileSync('course-registry-v741.js','utf8').includes('await window.IFSI_AUDIO_SERIES?.ready'));
console.log('PASS séries audio : octets, ordre, durée, accord, altération rejetée, historique préservé et chargement synchronisé — '+stage);
