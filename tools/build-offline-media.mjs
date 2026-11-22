import {createHash} from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const workerPath='sw.js';
const source=fs.readFileSync(workerPath,'utf8');
const assets=source.match(/const BASE_ASSETS=(\[.*?\]);/s);
assert.ok(assets,'Liste de précache introuvable');
const digests={};
for(const name of vm.runInNewContext(assets[1],Object.create(null))){
  if(/\.(pdf|png|jpe?g|webp|svg|gif|avif)$/i.test(name)){
    digests[name]=createHash('sha256').update(fs.readFileSync(name)).digest('base64');
  }
}
const table=/const MEDIA_DIGESTS = \{[\s\S]*?\n\};/;
assert.ok(table.test(source)&&Object.keys(digests).length,'Table des médias introuvable');
const updated=source.replace(table,'const MEDIA_DIGESTS = '+JSON.stringify(digests,null,2)+';');
if(process.argv.includes('--check')){
  assert.ok(source===updated,'Empreintes de médias périmées. Exécuter node tools/build-offline-media.mjs');
}else{
  fs.writeFileSync(workerPath,updated);
}
