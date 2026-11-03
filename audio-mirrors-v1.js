(()=>{
'use strict';
const BASE='https://quentinlemaire92220-alt.github.io/ifsi-abc-audio/';
let entries=new Map(),state='loading';
function validateManifest(data){
  if(data?.schemaVersion!==1||data.mediaBaseUrl!==BASE||!Array.isArray(data.entries)||data.count!==data.entries.length||data.originals!=='retained_on_drive')throw Error('Manifeste audio invalide');
  const next=new Map(),drives=new Set();
  for(const e of data.entries){
    if(!/^[A-Za-z0-9_-]+$/.test(e.id)||typeof e.driveId!=='string'||!e.driveId||next.has(e.id)||drives.has(e.driveId))throw Error('Référence audio invalide');
    const ext=e.mime==='audio/mp4'?'.m4a':e.mime==='audio/mpeg'?'.mp3':null;
    if(!ext||e.file!=='audio/'+e.id+ext||!Number.isFinite(e.durationSeconds)||e.durationSeconds<=0||!Number.isSafeInteger(e.bytes)||e.bytes<1024||!/^[a-f0-9]{64}$/.test(e.sha256))throw Error('Copie audio invalide');
    next.set(e.id,Object.freeze({...e}));drives.add(e.driveId);
  }
  return next;
}
function entryFor(vocal){const e=entries.get(vocal?.id);return e&&e.driveId===vocal.driveId&&!vocal.localAudio?e:null;}
function sourceFor(vocal){const e=entryFor(vocal);return e?BASE+e.file:null;}
function durationFor(vocal){return entryFor(vocal)?.durationSeconds??null;}
async function load(){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{const r=await fetch('./audio-drive-mirrors-v1.json',{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error('HTTP '+r.status);entries=validateManifest(await r.json());state='ready';return true;}
  catch(error){state='unavailable';console.warn('Copies audio indisponibles ; les liens Drive sont conservés.',error.message);return false;}
  finally{clearTimeout(timer);}
}
window.IFSI_AUDIO_MIRRORS={sourceFor,durationFor,getStatus:()=>({state,count:entries.size}),ready:load()};
})();
