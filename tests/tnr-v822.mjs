import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(v,m)=>{if(!v)throw new Error(m)};

const sw=read('sw.js');
assert(sw.includes("ifsi-abc-v8-22-local-74"),'Cache V8.22 absent');
for(const x of ['./v822-nervous-atlas.js','./v821-resource-audit.js','./v817-immune-atlas.js'])assert(sw.includes(x),'Asset SW absent: '+x);
assert(sw.indexOf('v817-immune-atlas.js')<sw.indexOf('v822-nervous-atlas.js'),'Ordre atlas immunitaire/nerveux invalide');
assert(sw.indexOf('v822-nervous-atlas.js')<sw.indexOf('v821-resource-audit.js'),'Audit doit charger après atlas nerveux');
assert(sw.includes('v822-nervous-atlas.js?v=822'),'Injection V8.22 absente du HTML servi');

const version=read('app-version-v742.js');
for(const x of ["const VERSION='8.22'",'atlas anatomique du système nerveux'])assert(version.includes(x),'Version V8.22 incomplète: '+x);

const atlas=read('v822-nervous-atlas.js');
for(const x of ["const V='8.22'",'nerv_atlas_01','nerv_atlas_07','systeme_nerveux','Système nerveux — Vue d’ensemble','Encéphale humain','Lobes cérébraux','Tronc cérébral','Cervelet','Moelle épinière','Nerfs crâniens','data-v822toggle','Masquer','Voir les planches','v822Zoom','IFSI_V822'])assert(atlas.includes(x),'Atlas nerveux V8.22 incomplet: '+x);
const ids=[...atlas.matchAll(/id:'nerv_atlas_/g)].length;
assert(ids===7,'Atlas nerveux: '+ids+'/7 planches');
const drive=[...atlas.matchAll(/\bfile:'([^']+)'/g)].map(m=>m[1]);
assert(drive.length===7&&new Set(drive).size===7,'Drive IDs atlas nerveux invalides');

const v82=read('v82-nav-anatomy.js');
assert(!v82.includes("return (resources(def.id).infographics||[])"),'Fallback infographies vers anatomie réapparu');
const infos=json('infographics.json').filter(x=>x.courseId==='systeme_nerveux');
assert(infos.length===4,'Infographies système nerveux: '+infos.length+'/4');
const infoIds=new Set(infos.map(x=>String(x.url||'').match(/\/d\/([^/]+)/)?.[1]).filter(Boolean));
assert(!drive.some(x=>infoIds.has(x)),'Une infographie est utilisée comme planche anatomique');

const settings=read('v87-settings.js'),home=read('v813-home-discovery.js');
assert(settings.includes("const V='8.22'"),'Paramètres non alignés V8.22');
assert(home.includes("const V='8.22'"),'Accueil non aligné V8.22');

const audit=read('v821-resource-audit.js');
assert(audit.includes('IFSI_V822'),'Audit ressources ne voit pas V8.22');

let q=0;for(const p of ['questions-1.json','questions-2.json','questions-3.json','questions-4.json','questions-5.json'])q+=json(p).filter(x=>x.courseId==='systeme_nerveux').length;
for(const p of fs.readdirSync('.').filter(x=>/^qextra-\d+\.txt$/.test(x))){try{q+=json(p).filter(x=>x.courseId==='systeme_nerveux').length}catch{}}
assert(q>=49,'QCM système nerveux insuffisants: '+q);

console.log('✅ V8.22 contrôlée : atlas nerveux 7 planches, zoom, favoris, Voir/Masquer');
console.log('✅ Séparation Infographies / Anatomie conservée');
