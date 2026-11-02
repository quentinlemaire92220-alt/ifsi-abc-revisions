// Historical tests continue to inspect the exact package covered by its original GO.
// The new audio contract separately validates every excluded row and its bytes.
import fs from 'node:fs';
import {historicalAudioView} from '../tools/hosted-audio-supplement-contract.mjs';
const raw=file=>JSON.parse(fs.readFileSync(file,'utf8'));
export function readHistoricalAudioJson(file){
 if(!['vocals.json','course-registry-v741.json','docs/course-deliveries.json'].includes(file))return raw(file);
 const manifest=raw('docs/course-deliveries.json');
 const view=historicalAudioView(manifest,{registry:raw('course-registry-v741.json'),vocals:raw('vocals.json')});
 if(file==='docs/course-deliveries.json'){
  const {hostedAudioSupplements,...historicalManifest}=manifest;
  return historicalManifest;
 }
 return file==='vocals.json'?view.vocals:view.registry;
}
