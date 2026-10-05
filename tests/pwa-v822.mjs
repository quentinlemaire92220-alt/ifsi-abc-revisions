import fs from 'node:fs';
const a=(v,m)=>{if(!v)throw new Error(m)};
const sw=fs.readFileSync('sw.js','utf8');
const m=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
a(m.id&&m.start_url&&m.scope,'manifest incomplet');
a(sw.includes("ifsi-abc-v8-22-local-74"),'cache V8.22 absent');
a(sw.includes('./v822-nervous-atlas.js'),'atlas V8.22 absent du cache');
a(sw.includes('v822-nervous-atlas.js?v=822'),'injection V8.22 absente');
console.log('OK PWA V8.22');
