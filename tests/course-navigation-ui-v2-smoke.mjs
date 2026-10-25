import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=fs.readFileSync('tests/fixtures/course-navigation-ui-v2.js','utf8');
const published=fs.readFileSync('index.html','utf8');
const serviceWorker=fs.readFileSync('sw.js','utf8');
const registry=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8'));

assert.equal(registry.courses.length,55,'Les 55 cours historiques sont conservés');
assert.equal(fs.readFileSync('course-navigation-ui-v2.js','utf8'),src,'Le code déployé doit être identique au module testé');
assert.equal((published.match(/course-navigation-ui-v2\.js\?v=8430/g)||[]).length,1,'V2 doit être chargée une seule fois et versionnée');
assert.doesNotMatch(published,/course-navigation-ui-v1\.js\?v=/,'V1 bloquante ne doit pas être rechargée');
assert.ok(serviceWorker.includes("'./course-navigation-ui-v2.js'")&&serviceWorker.includes('"course-navigation-ui-v2.js"'),'V2 dans le cache et la reconstruction PWA');
assert.doesNotMatch(serviceWorker,/['"]\.\/course-navigation-ui-v1\.js['"]/,'V1 bloquante ne doit pas être précachée');
assert.match(src,/version: '2\.0'/);
assert.match(src,/observer\.disconnect\(\)/,'Suspendre la surveillance pendant nos écritures');
assert.match(src,/observer\.observe\(gridRoot, \{childList: true\}\)/,'Observer seulement le remplacement de la liste');
assert.match(src,/observer\.observe\(detailRoot, \{childList: true\}\)/,'Observer seulement le changement de cours');
assert.doesNotMatch(src,/subtree:\s*true|queueMicrotask\(/,'Ne pas relancer le même traitement sur les mutations internes');
assert.match(src,/requestAnimationFrame\(runRefresh\)/,'Déduplication par frame obligatoire');
assert.match(src,/status: function \(\)/,'Données de diagnostic non sensibles');
assert.match(src,/stop: function \(\)/,'Arrêt de secours');
assert.match(src,/EXPLANATION/,'Note pédagogique du statut Provisoire');
for(const name of [
  'Sciences infirmières et raisonnement clinique',
  'Fondements des sciences infirmières et raisonnement clinique',
  'Pratiques cliniques infirmières, qualité et gestion des risques',
  'Communication, travail en équipe et leadership',
  'Démarche scientifique, recherche et méthodologie'
]) assert.ok(src.includes(name),'Arborescence pédagogique manquante : '+name);
for(const [marker,n] of [
  ["'v74-original-support')) return 0",0],
  ["'v74-qcm-section')) return 2",2],
  ["heading.includes('fiches de revision')) return 1",1],
  ["heading.includes('infographies')) return 3",3],
  ["heading.includes('vocaux')) return 4",4]
]) assert.ok(src.includes(marker),'Ressource non ordonnée : '+n);
assert.doesNotMatch(src,/localStorage\.clear|localStorage\.removeItem|fetch\s*\(|window\.location\s*=|location\.href\s*=/,'La V2 est strictement une couche UI');

function bootFixture({throwOnDetail=false,missingRoot=false}={}){
  const frames=[],listeners=new Map(),observations=[],errors=[];
  const grid={querySelectorAll:()=>[]};
  const catalog={querySelector:()=>null};
  const detail={querySelector:()=>{
    if(throwOnDetail)throw Error('Anomalie simulée dans le détail');
    return null;
  }};
  const nodes={
    v74CourseGrid:missingRoot?null:grid,
    courses74:catalog,
    v74CourseDetail:missingRoot?null:detail
  };
  const style={};
  class Observer{
    constructor(fn){this.fn=fn;this.active=[]}
    observe(target,options){
      observations.push({target,options});
      this.active.push(target);
    }
    disconnect(){this.active=[]}
    trigger(target){if(this.active.includes(target))this.fn([{target,type:'childList'}])}
  }
  let observer;
  const originalConstructor=Observer;
  const sandbox={
    console:{error:(...args)=>errors.push(args.map(String).join(' ')),warn:()=>{}},
    document:{
      readyState:'complete',
      getElementById:id=>id==='v8430CourseStyles'?style:nodes[id]||null,
      createElement:()=>({id:'',textContent:'',setAttribute:()=>{}}),
      head:{appendChild:()=>{}},
    },
    window:{
      addEventListener:(name,callback)=>listeners.set(name,callback),
      requestAnimationFrame:callback=>{frames.push(callback);return frames.length},
      IFSI_V741:{getRegistry:()=>({courses:registry.courses})}
    },
    MutationObserver:class extends originalConstructor{
      constructor(fn){super(fn);observer=this}
    },
    Set,Array,Object,String
  };
  vm.runInNewContext(src,sandbox,{filename:'tests/fixtures/course-navigation-ui-v2.js',timeout:2000});
  const api=sandbox.window.IFSI_COURSE_NAV_UI;
  const flush=()=>{let count=0;while(frames.length){if(++count>8)throw Error('Boucle de raf détectée');frames.shift()()}return count};
  return {api,frames,listeners,observations,errors,flush,trigger:target=>observer?.trigger(target),grid,detail,observer:()=>observer};
}

// Cas 1 : démarrage, événements et changements concurrents dédupliqués.
const x=bootFixture();
assert.equal(x.frames.length,1,'Un seul RAF au démarrage');
assert.equal(x.flush(),1);
assert.equal(x.api.status().passes,1);
assert.equal(x.observations.length,4,'Initialisation + réabonnement contrôlé');
assert.ok(x.observations.every(x=>x.options.childList===true&&x.options.subtree!==true));
for(let i=0;i<1000;i++)x.api.refresh();
assert.equal(x.frames.length,1,'1000 demandes ne doivent pas créer 1000 passages');
x.trigger(x.grid);
x.trigger(x.detail);
assert.equal(x.frames.length,1,'Mutations de deux racines regroupées');
assert.equal(x.flush(),1);
assert.equal(x.api.status().passes,2);
assert.equal(x.flush(),0,'Aucune boucle après écriture');
x.listeners.get('ifsi:v741-ready')();
x.listeners.get('storage')();
assert.equal(x.flush(),1);
assert.equal(x.api.status().passes,3);
x.api.stop();
x.api.refresh();
assert.equal(x.flush(),0);
assert.equal(x.api.status().active,false);

// Cas 2 : erreur DOM : la couche nouvelle se désactive, sans planter le site.
const bad=bootFixture({throwOnDetail:true});
bad.flush();
assert.equal(bad.api.status().active,false);
assert.equal(bad.flush(),0,'Une erreur ne doit pas créer de boucle');
assert.ok(bad.errors.some(x=>x.includes('désactivée')));

// Cas 3 : runtime V74 absent : aucune exception / aucune relance.
const absent=bootFixture({missingRoot:true});
assert.equal(absent.frames.length,0);
assert.equal(absent.api.status().active,false);

console.log('✅ UI v2 : 55 cours inchangés, aucune activation prématurée, observateurs bornés, 1 RAF/lot, arrêt sur erreur');
