import fs from 'node:fs';

const m=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
const assert=(v,msg)=>{if(!v)throw new Error(msg)};

assert(m.id,'Manifest PWA sans id stable');
assert(m.name||m.short_name,'Manifest PWA sans nom');
assert(m.start_url,'Manifest PWA sans start_url');
assert(m.scope,'Manifest PWA sans scope');
assert(['standalone','fullscreen','minimal-ui'].includes(m.display),'display PWA non installable');
assert(m.prefer_related_applications!==true,'prefer_related_applications ne doit pas être true');
assert(Array.isArray(m.icons)&&m.icons.length>=2,'Icônes PWA insuffisantes');

const sizes=m.icons.flatMap(i=>String(i.sizes||'').split(/\s+/));
assert(sizes.includes('192x192'),'Icône 192x192 absente');
assert(sizes.includes('512x512'),'Icône 512x512 absente');
assert(!sizes.includes('any'),'sizes:any interdit ici à cause des échecs WebAPK observés sur Android/Chromium');
assert(m.icons.some(i=>String(i.purpose||'').includes('maskable')),'Icône maskable absente');
for(const i of m.icons){
  assert(i.src,'src icône absent');
  const p=i.src.replace(/^\.\//,'');
  assert(fs.existsSync(p),`Fichier icône absent: ${p}`);
}

const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes("ifsi-abc-v7-8-local-30"),'Cache V7.8 local-30 absent');
assert(sw.includes("./analytics-v77.js"),'Module analytics V7.7 absent du cache PWA');
assert(sw.includes("./manifest.webmanifest"),'Manifest absent du cache PWA');

console.log('✅ Manifest PWA Android et cache V7.8 contrôlés');