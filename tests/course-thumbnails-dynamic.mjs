import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const script = fs.readFileSync('course-thumbnails-v1.js', 'utf8');
const registry = JSON.parse(fs.readFileSync('course-registry-v741.json', 'utf8')).courses;
const manifest = JSON.parse(fs.readFileSync('docs/proposals/course-thumbnails-55-assets.json', 'utf8'));

function fakeCard(id, icon='📘') {
  const klass = new Set();
  const box = {
    dataset: {}, childNodes: [{textContent: icon}], title: '',
    classList: {add: x => klass.add(x), remove: x => klass.delete(x), contains: x => klass.has(x)},
    replaceChildren(...children) { this.childNodes = children; }
  };
  return {dataset:{courseId:id},querySelector:()=>box,box};
}
async function scenario({courses, rows, ids}) {
  const cards = ids.map(id => fakeCard(id));
  const events = new Map(), warnings = [], requests = [];
  const document = {
    readyState:'complete',
    createElement: tag => ({
      tagName: tag.toUpperCase(), className:'',textContent:'',src:'',
      setAttribute(){},addEventListener(name,handler){this['on'+name]=handler;}
    }),
    head:{appendChild(){}},
    querySelectorAll: selector => selector.includes('#v74CourseGrid') ? cards : [],
    addEventListener(name,callback){events.set('doc:'+name,callback);}
  };
  const window = {
    IFSI_V741: {getRegistry:()=>({courses}),courseIdForLabel:()=>null},
    addEventListener(name,callback){events.set(name,callback);}
  };
  const sandbox = {window,document,console:{warn:(...args)=>warnings.push(args.join(' '))},
    fetch: async url=>{requests.push(url);return {ok:true,json:async()=>rows};}};
  vm.runInNewContext(script,sandbox,{timeout:2000});
  // Allow both fetch/JSON promise handlers to complete before checking DOM.
  await new Promise(resolve=>setImmediate(resolve));
  return {cards,api:window.IFSI_COURSE_THUMBNAILS,events,warnings,requests};
}

const newCourse = {id:'nouveau_cours_infirmier',label:'Nouveau cours infirmier',domain:'C',ue:'C1'};
const baseline = await scenario({
  courses:[...registry,newCourse],
  rows:manifest,
  ids:['biomolecules','nouveau_cours_infirmier','inconnu_hors_registre']
});
assert.equal(baseline.requests.length,1,'Manifeste téléchargé une seule fois');
assert.equal(baseline.cards[0].box.dataset.thumbnailStatus,'published');
assert.equal(baseline.cards[0].box.childNodes[0].src,'./assets/course-thumbnails/biomolecules.webp');
assert.equal(baseline.cards[1].box.dataset.thumbnailStatus,'pending');
assert.equal(baseline.cards[1].box.childNodes[0].textContent,'C1','Repli temporaire fondé sur UE');
assert.equal(baseline.cards[2].box.dataset.pictureProcessed,undefined,'Aucune attribution à un cours hors registre');
assert.ok(baseline.api.status().pendingCourseIds.includes(newCourse.id));
assert.equal(baseline.api.status().configured,manifest.length);
assert.equal(baseline.api.status().failedImages,0);
baseline.cards[0].box.childNodes[0].onerror();
assert.equal(baseline.cards[0].box.childNodes[0].textContent,'📘','Erreur réseau : pictogramme historique conservé');
assert.equal(baseline.api.status().failedImages,1);

const newPath='assets/course-thumbnails/nouveau_cours_infirmier.webp';
const approved = await scenario({
  courses:[...registry,newCourse],
  rows:[...manifest,{path:newPath,length:1500,sha256:'a'.repeat(64)}],
  ids:[newCourse.id]
});
assert.equal(approved.cards[0].box.dataset.thumbnailStatus,'published','Nouvelle image reconnue sans modifier le module');
assert.equal(approved.cards[0].box.childNodes[0].src,'./'+newPath);
const missingHistoricalImageIds = registry.filter(c=>!manifest.some(a=>a.path==='assets/course-thumbnails/'+c.id+'.webp')).map(c=>c.id);
assert.deepEqual([...approved.api.status().pendingCourseIds].sort(),missingHistoricalImageIds.sort(),
  'Une vignette approuvée pour le nouveau cours ne supprime pas les repères encore en attente');
assert.ok(!approved.api.status().pendingCourseIds.includes(newCourse.id),'Le nouveau cours approuvé doit disposer de sa vignette');

const poisoned = await scenario({
  courses:[...registry,newCourse],
  rows:[...manifest,{path:'assets/course-thumbnails/../admin.webp',length:100,sha256:'a'.repeat(64)}],
  ids:[newCourse.id]
});
assert.equal(poisoned.api.status().manifest,'error','Entrée dangereuse bloquée');
assert.equal(poisoned.cards[0].box.childNodes[0].textContent,'📘','Aucun visuel non certifié ne remplace le repli');
assert.equal(poisoned.warnings.length,1);
assert.doesNotMatch(script,/localStorage|sessionStorage|Q\.push|eval\(/);
console.log('PASS : cours nouveaux, association par manifeste, repli UE, offline et refus d’entrées invalides.');
