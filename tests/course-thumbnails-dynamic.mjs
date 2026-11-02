import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const script=fs.readFileSync('course-thumbnails-v1.js','utf8');
const registry=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8')).courses;
const registryBytes=JSON.stringify(registry);
const manifest=JSON.parse(fs.readFileSync('docs/proposals/course-thumbnails-55-assets.json','utf8'));
function fakeCard(id){
 const klass=new Set();
 const box={dataset:{},childNodes:[{textContent:'📘'}],title:'',
  classList:{add:x=>klass.add(x)},replaceChildren(...children){this.childNodes=children;}};
 return {dataset:{courseId:id},querySelector:()=>box,box};
}
async function scenario({courses,rows=manifest,ids,failFetch=false}){
 const cards=ids.map(fakeCard),events=new Map(),warnings=[],requests=[];
 const document={readyState:'complete',head:{appendChild(){}},querySelectorAll:()=>cards,
  createElement:tag=>({tagName:tag.toUpperCase(),src:'',setAttribute(){},addEventListener(n,h){this['on'+n]=h;}}),
  addEventListener(n,h){events.set('doc:'+n,h);}};
 const window={IFSI_V741:{getRegistry:()=>({courses}),courseIdForLabel:()=>null},addEventListener(n,h){events.set(n,h);}};
 vm.runInNewContext(script,{window,document,console:{warn:(...x)=>warnings.push(x)},
  fetch:async url=>{requests.push(url);if(failFetch)throw Error('offline');return {ok:true,json:async()=>rows};}},{timeout:2000});
 await new Promise(resolve=>setImmediate(resolve));
 return {cards,api:window.IFSI_COURSE_THUMBNAILS,events,warnings,requests};
}
const newCourses=[
 {id:'future_paludisme',label:'Paludisme au retour de voyage',domain:'B',ue:'B1.3.7',expected:'parasites_champignons'},
 {id:'future_social',label:'Psychologie sociale',domain:'B',ue:'B2.1.1',expected:'psychologie_sante'},
 {id:'future_neutral',label:'Nouveau cours',domain:'B',ue:'B3.2',expected:'parametres_vitaux'},
 {id:'future_communication',label:'Entretien et écoute',domain:'D',ue:'D1.1.2',expected:'d1_relation_soignant_soigne_ecoute_active'},
 {id:'future_sante',label:'Organisation du système de santé',domain:'C',ue:'C1.1',expected:'sante_mondiale_sante_france'},
 {id:'future_topic',label:'Cours 2027',topics:['Génétique'],domain:'B',ue:'B1.3',expected:'genetique'},
 {id:'future_unknown',label:'Sujet inédit',domain:'X',ue:'X1',expected:'epistemologie_savoirs'}
];
const sample=await scenario({courses:[...registry,...newCourses],ids:['biomolecules',...newCourses.map(x=>x.id),'outside']});
assert.equal(sample.requests.length,1);
assert.equal(sample.cards[0].box.dataset.thumbnailStatus,'published');
assert.equal(sample.cards[0].box.childNodes[0].src,'./assets/course-thumbnails/biomolecules.webp');
for(const [i,c] of newCourses.entries()){
 assert.equal(sample.cards[i+1].box.childNodes[0].src,'./assets/course-thumbnails/'+c.expected+'.webp',c.id);
 assert.equal(sample.cards[i+1].box.childNodes[0].tagName,'IMG');
 assert.ok(sample.api.status().pendingCourseIds.includes(c.id),'Pas de fausse validation spécifique');
}
assert.equal(sample.cards.at(-1).box.dataset.pictureProcessed,undefined);
const imageBefore=sample.cards[1].box.childNodes[0];sample.api.apply();
assert.equal(sample.cards[1].box.childNodes[0],imageBefore,'Rendus répétés sans rechargement');
sample.cards[0].box.childNodes[0].onerror();
assert.equal(sample.cards[0].box.childNodes[0].tagName,'IMG','Fichier spécifique cassé : autre illustration');
assert.equal(sample.api.status().failedImages,1);

// Tous les nouveaux cours déjà présents reçoivent aussi une illustration sans éditer leur registre.
const historical=await scenario({courses:registry,ids:registry.map(x=>x.id)});
assert.ok(historical.cards.every(c=>c.box.childNodes[0].tagName==='IMG'));
assert.equal(historical.api.status().configured,manifest.length,'Images originales et futures préservées');
assert.equal(JSON.stringify(registry),registryBytes);

// Toute la chaîne de repli reste illustrée, même sans réseau, manifeste ou fichier accessible.
for(const config of [{failFetch:true},{rows:[...manifest,null]},
 {rows:[...manifest,{path:'assets/course-thumbnails/../admin.webp',length:3,sha256:'a'.repeat(64)}]}]){
 const fallback=await scenario({courses:newCourses,ids:[newCourses[0].id],...config});
 assert.equal(fallback.api.status().manifest,'error');
 assert.equal(fallback.warnings.length,1);
 const box=fallback.cards[0].box;
 let hops=0;
 while(!box.childNodes[0].src.startsWith('data:')){box.childNodes[0].onerror();assert.ok(++hops<8);}
 const data=Buffer.from(box.childNodes[0].src.split(',')[1],'base64');
 assert.equal(createHash('sha256').update(data).digest('hex'),
  createHash('sha256').update(fs.readFileSync('assets/course-thumbnails/epistemologie_savoirs.webp')).digest('hex'));
 assert.equal(box.dataset.thumbnailStatus,'embedded');
 assert.equal(box.childNodes[0].tagName,'IMG');
}
// Erreurs de chaque image intermédiaire : chaîne bornée, aucun retour à une lettre/icône.
const chain=await scenario({courses:[...registry,...newCourses],ids:['biomolecules']});
let box=chain.cards[0].box,hops=0;
while(!box.childNodes[0].src.startsWith('data:')){box.childNodes[0].onerror();assert.ok(++hops<8);}
assert.equal(box.dataset.thumbnailStatus,'embedded');
const stale=box.childNodes[0];
box.replaceChildren({tagName:'IMG',src:'new'});stale.onerror();
assert.equal(box.childNodes[0].src,'new','Erreur tardive ignorée après remplacement');

const approved=await scenario({courses:[...registry,newCourses[0]],ids:[newCourses[0].id],
 rows:[...manifest,{path:'assets/course-thumbnails/'+newCourses[0].id+'.webp',length:1500,sha256:'a'.repeat(64)}]});
assert.equal(approved.cards[0].box.dataset.thumbnailStatus,'published','Priorité à la nouvelle image spécifique approuvée');
assert.ok(!approved.api.status().pendingCourseIds.includes(newCourses[0].id));
// Registre chargé après le module et cours ajoutés après démarrage.
const laterCourses=[];
const late=await scenario({courses:laterCourses,ids:[newCourses[0].id]});
laterCourses.push(newCourses[0]);late.events.get('ifsi:v741-ready')();
assert.equal(late.cards[0].box.childNodes[0].tagName,'IMG');
late.cards.push(fakeCard(newCourses[1].id));laterCourses.push(newCourses[1]);
late.events.get('ifsi:course-list-updated')();
assert.equal(late.cards[1].box.childNodes[0].tagName,'IMG');
assert.doesNotMatch(script,/localStorage|sessionStorage|Q\.push|eval\(|ifsi-course-ue-mark|showPlaceholder/);
console.log('PASS : '+registry.length+' cours, futurs thèmes/UE, données inchangées, priorité spécifique, retards, erreurs et image intégrée hors réseau.');
