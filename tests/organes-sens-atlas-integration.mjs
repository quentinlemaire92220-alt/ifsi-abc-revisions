import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const window={addEventListener(){}};
vm.runInNewContext(read('v8467-sens-atlas.js'),{window,document:{addEventListener(){}},setInterval(){return 0},clearInterval(){}});
const atlas=window.IFSI_SENS_ATLAS.atlas();
assert.equal(atlas.length,7,'Les sept planches doivent être individuellement enregistrées');
assert.equal(new Set(atlas.map(x=>x.id)).size,7);
const sw=read('sw.js'),index=read('index.html');
assert(index.indexOf('v8467-sens-atlas.js')<index.indexOf('v82-nav-anatomy.js'),'Atlas disponible avant l’initialisation du catalogue');
assert(sw.includes("'./v8467-sens-atlas.js'"),'Module absent du cache hors ligne');
for(const d of atlas){
 assert(d.labels.length>=6,'Repères manquants : '+d.id);
 for(const p of [d.src,d.zoomSrc]){
  assert(p.startsWith('./assets/sens-refonte-20261103/'),'Une planche ouvre un lien externe : '+p);
  assert(sw.includes("'"+p+"'"),'Ressource absente du cache hors ligne : '+p);
  assert(fs.statSync(new URL('../'+p,import.meta.url)).size>1000);
 }
 const svg=read(d.zoomSrc);
 assert(svg.includes('<text')&&svg.includes('data:image/png;base64,'),'Zoom avec vrais textes et illustration incorporée');
 assert(!/xlink:href="https?:/.test(svg),'Dépendance d’image distante dans le zoom');
}
const source=read('v82-nav-anatomy.js');
const route=source.split("if(def.id==='organes_des_sens_b11')return ")[1]?.split('\n')[0];
assert(route?.includes('IFSI_SENS_ATLAS'),'Le catalogue doit utiliser les planches individuelles');
assert(!route.includes('.pdf')&&!route.includes('https://'),'Ancien lien PDF réintroduit dans Anatomie');
assert(read('v8467-sens-atlas.js').includes('role="dialog"'),'Zoom intégré accessible');
console.log('PASS : sept planches individuelles, atlas interne, SVG autonomes et ressources mises en cache.');
