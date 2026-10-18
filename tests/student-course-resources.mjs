import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import '../course-resource-policy.js';
import {publicationBundle,resourceWithdrawalBundle,validateChangedDeliveries} from './course-publication-approval-lib.mjs';
const policy=globalThis.IFSI_COURSE_RESOURCES;
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const link=id=>'https://drive.google.com/file/d/'+id+'/view';
const clone=x=>JSON.parse(JSON.stringify(x));
const variants=[link('official'),link('official')+'?usp=sharing','https://drive.google.com/open?id=official','https://drive.google.com/uc?export=download&id=official'];
assert.equal(policy.uniqueResources(variants.map(url=>({url}))).length,1,'Une identité Drive malgré les formats d’URL');
assert.equal(policy.uniqueResources([{url:link('part1')},{url:link('part2')}]).length,2,'Les vraies parties restent accessibles');
assert.equal(policy.uniqueResources([{url:'https://drive.google.com/drive/folders/folder'},{url:link('part1')}]).length,2,'Dossier et PDF distincts conservés');
for(const url of ['javascript:alert(1)','https://drive.google.com.evil.test/file/d/a/view','https://user@drive.google.com/file/d/a/view','http://drive.google.com/file/d/a/view'])assert.equal(policy.driveIdentity(url),null);
const blocked=[{label:'Scripts vocaux regroupés – Partie 01'},{label:'Scripts vocaux (PDF)'},{title:'UE_S1_Scripts_Vocaux.zip'},{title:'Transcript PLAUD'},{label:'Sources internes'},
 {label:'Source privée'},{label:'Brouillon'},{category:'internal'},{visibility:'private'},{audience:'internal'},
 {confidential:true},{private:true},{internal:true},{publish:false},{mimeType:'text/plain'},{label:'Lecture.txt'},{url:link('a')+'.txt'}];
for(const x of blocked)assert.equal(policy.isStudentResource(x),false,JSON.stringify(x));
for(const label of ['Support officiel du professeur','Vocabulaire','Prescription et traçabilité','Flashcards','Fiche issue de notes'])assert.equal(policy.isStudentResource({label}),true,label);

const registry=json('course-registry-v741.json');
const sheets=[1,2,3].flatMap(n=>json(`sheets-${n}.json`)),infos=json('infographics.json'),vocals=json('vocals.json');
for(const c of registry.courses){
 assert.deepEqual(policy.cleanCourse(c),c,c.id+': doublon ou document interne dans le registre public');
}
for(const x of [...sheets,...infos,...vocals])assert.ok(policy.isStudentResource(x),x.displayTitle||x.title);
const manifest=json('docs/course-deliveries.json');
// Hashed identities catch relabelled/reintroduced private files without
// publishing their identifiers, titles or permission receipts in this test.
const denied=new Set(json('docs/student-resource-access.json').deniedIdentityHashes);
assert.ok(denied.size>=60,'Inventaire des retraits incomplet');
const checkIdentity=id=>assert.ok(!denied.has(createHash('sha256').update(id).digest('hex')),'Ressource privée ou interne réintroduite');
function checkPublicPointers(value){
 if(typeof value==='string'){
  const key=policy.driveIdentity(value);
  if(key)checkIdentity(key);
  else if(/^[\w-]+$/.test(value)){checkIdentity('file:'+value);checkIdentity('folder:'+value);}
 }else if(Array.isArray(value))value.forEach(checkPublicPointers);
 else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>{checkPublicPointers(k);checkPublicPointers(v)});
}
checkPublicPointers([registry,sheets,infos,vocals,manifest]);
const fixtureHash=createHash('sha256').update('file:blocked-private').digest('hex');
denied.add(fixtureHash);
assert.throws(()=>checkPublicPointers({label:'Fiche de révision',url:link('blocked-private')}),/Ressource privée ou interne réintroduite/);
denied.delete(fixtureHash);
for(const c of manifest.courses){
 assert.equal(c.vocalScripts,undefined,c.courseId+': scripts dans le manifeste public');
 assert.equal(c.folders['08'],undefined);assert.equal(c.folders['99'],undefined);
 assert.ok(c.expectedVocalCount>0,'Statut de production conservé sans lien interne');
}

// Exercise the real renderer with all registry courses, including hidden children.
function renderer(reg=clone(registry),S=clone(sheets),I=clone(infos),V=clone(vocals)){
 const elements=new Map(['v74CourseDetail','v74BackCourses','v74Course10','v74CourseAll','v74FavoritesBody','v74Search','v74SearchResults'].map(id=>[id,{innerHTML:'',value:'',querySelectorAll:()=>[]}]));
 const storage=new Map();
 const context={window:{show(){},IFSI_COURSE_RESOURCES:policy,IFSI_V73:{getVocals:()=>V}},URL,console,Q:[],S,I,registryFixture:reg,
  document:{getElementById:id=>elements.get(id)||null,querySelector:()=>null,querySelectorAll:()=>[]},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setInterval:()=>0,clearInterval(){}};
 vm.createContext(context);
 vm.runInContext(read('course-registry-v741.js').replace('let registry=null,','let registry=registryFixture,').replace('window.IFSI_V741={','buildCourseIndexes();attachIds();rebuildResourceIndex();window.IFSI_V741={'),context);
 const source=read('v74-pack.js');
 vm.runInContext(source.slice(0,source.indexOf('addStyles74();injectSections74();'))+'window.testViews={renderSearch74,renderFavorites74};})();',context);
 return {context,elements,storage,render:course=>{context.window.openCourse74(course);return elements.get('v74CourseDetail').innerHTML}};
}
const actual=renderer();
for(const c of registry.courses){
 const html=actual.render(c.label),urls=[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
 const ids=urls.map(policy.driveIdentity).filter(Boolean);
 assert.equal(new Set(ids).size,ids.length,c.id+': ressource affichée plusieurs fois');
 if(c.officialSupportUrl)assert.ok(ids.includes(policy.driveIdentity(c.officialSupportUrl)),c.id+': support officiel perdu');
 assert.ok(!/Scripts? vocaux|PLAUD|Sources internes/i.test(html),c.id+': contenu de travail visible');
}
const rights=registry.courses.find(c=>c.id==='droits_patients');
assert.equal([...actual.render(rights.label).matchAll(/Ouvrir le support officiel/g)].length,1);
const multi=registry.courses.find(c=>c.id==='cellules_tissus');
for(const x of multi.officialSupportItems)assert.ok(actual.render(multi.label).includes(x.url),'Vraie partie perdue');
const dirty=clone(registry),sample=dirty.courses.find(c=>c.id==='droits_patients');
sample.officialSupportItems=[{url:variants[1].replace('official',policy.driveIdentity(sample.officialSupportUrl).slice(5)),title:'Même document'}];
sample.additionalDocuments=[...blocked.map((x,i)=>({url:link('forbidden'+i),...x})),{label:'Copie QCM',url:sample.qcmPdfUrl}];
const injected={courseId:sample.id,label:'Scripts vocaux (PDF)',title:'Script',url:link('hidden')};
const dirtyView=renderer(dirty,[...sheets,injected],infos,[...vocals,{id:'forbidden-audio',driveId:'private-audio',private:true,courseId:sample.id,title:'Enregistrement'}]),dirtyHtml=dirtyView.render(sample.label);
assert.ok(!dirtyHtml.includes('forbidden')&&!dirtyHtml.includes('/hidden/'));
assert.equal([...dirtyHtml.matchAll(new RegExp(sample.qcmPdfUrl,'g'))].length,1,'QCM principal dupliqué dans les documents');
dirtyView.elements.get('v74Search').value='script';dirtyView.context.window.testViews.renderSearch74();
assert.ok(!dirtyView.elements.get('v74SearchResults').innerHTML.includes('/hidden/'));
dirtyView.storage.set('ifsiabc_v74_resource_favorites_v1',JSON.stringify(['sheet|'+injected.url]));
dirtyView.context.window.testViews.renderFavorites74();
assert.ok(!dirtyView.elements.get('v74FavoritesBody').innerHTML.includes('/hidden/'));

// The withdrawal exception cannot approve a new URL, content, or changed GO.
const data={registry:{courses:[{id:'example',label:'Exemple',officialSupportUrl:link('official'),officialSupportItems:[{title:'Identique',url:link('official')}],additionalDocuments:[{label:'Scripts vocaux',url:link('scripts')}]}]},sheets:[],infographics:[],vocals:[],banks:{bank:[{id:'q',courseId:'example',question:'Question',answers:[1]}]},imageHashes:{},vocabulary:[]};
const old={courseId:'example',qcmBank:'bank',vocalScripts:[{number:1,driveId:'script1'}],artifactSha256s:{scripts:'a'.repeat(64),script1:'b'.repeat(64)}};
const next=clone(old);delete next.vocalScripts;next.artifactSha256s={};
const updated=clone(data);updated.registry.courses=updated.registry.courses.map(policy.cleanCourse);
assert.equal(validateChangedDeliveries({courses:[old]},{courses:[next]},data,updated)[0].kind,'resource_withdrawal');
for(const mutate of [d=>d.banks.bank[0].answers=[0],d=>d.registry.courses[0].officialSupportUrl=link('new'),d=>d.sheets.push({courseId:'example',url:link('new')})]){
 const bad=clone(updated);mutate(bad);assert.throws(()=>validateChangedDeliveries({courses:[old]},{courses:[next]},data,bad),/validation du package absente/);
}
const bad=clone(next);bad.publicationApproval={status:'approved'};
assert.throws(()=>validateChangedDeliveries({courses:[old]},{courses:[bad]},data,updated));
assert.deepEqual(resourceWithdrawalBundle(publicationBundle('example',old,data)),clone(publicationBundle('example',next,updated)));
const html=read('index.html'),sw=read('sw.js');
assert.ok(html.indexOf('./course-resource-policy.js')<html.indexOf('./v74-pack.js'));
assert.ok(sw.includes('./course-resource-policy.js'));
console.log(`✅ ${registry.courses.length} cours rendus : supports uniques, parties/compléments préservés, scripts/privé filtrés, recherche/favoris, manifeste public et garde GO contrôlés.`);
