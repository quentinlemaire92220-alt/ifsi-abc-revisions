// Historical tests continue to inspect the exact package covered by its original GO.
// The new audio contract separately validates every excluded row and its bytes.
import {scopedHistoricalJson} from '../tools/scoped-course-revision-contract.mjs';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {historicalAudioView} from '../tools/hosted-audio-supplement-contract.mjs';
const raw=file=>JSON.parse(fs.readFileSync(file,'utf8'));
function historical(reader,file){
 const actualReader=reader;reader=p=>scopedHistoricalJson(actualReader,p);
 if(!['vocals.json','course-registry-v741.json','docs/course-deliveries.json'].includes(file))return reader(file);
 const manifest=reader('docs/course-deliveries.json');
 const view=historicalAudioView(manifest,{registry:reader('course-registry-v741.json'),vocals:reader('vocals.json')});
 if(file==='docs/course-deliveries.json'){
  const {hostedAudioSupplements,...historicalManifest}=manifest;
  return historicalManifest;
 }
 return file==='vocals.json'?view.vocals:view.registry;
}
export function readHistoricalAudioJson(file){return historical(raw,file)}
// Compare the same signed historical view on both sides after a supplement is published.
// The independent hosted-audio gate still checks every actual row and MP3 byte.
export function readHistoricalAudioGitJson(file,base){
 const reader=p=>JSON.parse(execFileSync('git',['show',base+':'+p],{encoding:'utf8',maxBuffer:32*1024*1024}));
 return historical(reader,file);
}

export function readHistoricalAudioAt(base,file){return readHistoricalAudioGitJson(file,base)}
