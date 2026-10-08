import fs from 'node:fs';
import assert from 'node:assert/strict';
const src=fs.readFileSync('vocals-v73.js','utf8');
const meta=JSON.parse(fs.readFileSync('build-meta.json','utf8'));
assert.ok(Number(meta.build)>=8350);
for(const marker of ['id="vocalAudio"','id="vocalFallback"','id="vocalFallbackBtn"','function rememberPosition()','function restorePosition()','function clearFinishedPosition()','function useDriveFallback(id)','audio.addEventListener(\'error\'','audio.addEventListener(\'loadedmetadata\'','audio.addEventListener(\'ended\'','drivePreview(x.driveId)','driveStream(x.driveId)','VS.positions'])assert.ok(src.includes(marker),'Lecteur vocal : manque '+marker);
assert.ok(!src.includes('></audio>\\n        <div'),'Le retour à la ligne du player est échappé');
console.log('✅ Lecteur vocal : reprise, secours Drive et contrôles audio présents');
