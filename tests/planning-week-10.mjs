import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../planning-v1.js',import.meta.url),'utf8');
const store=new Map();
const context={document:{},window:{},Date,Intl,setInterval:()=>0,localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))}};
vm.runInNewContext(source,context,{filename:'planning-v1.js'});
const api=context.window.IFSI_PLANNING;
const oldS8=api.weeks.find(w=>w.id==='S8'),oldS9=api.weeks.find(w=>w.id==='S9');
const week=api.weeks.find(w=>w.id==='S10');
assert.ok(oldS8&&oldS9,'Les semaines historiques doivent rester disponibles');
assert.equal(oldS9.events.length,18,'Ne pas modifier S9');
assert.ok(week,'S10 doit être présente');
assert.equal(week.start,'2026-11-02');
assert.equal(week.end,'2026-11-07');
assert.equal(week.events.length,23);
assert.ok(week.events.every(e=>e.date>='2026-11-02'&&e.date<='2026-11-06'),'Pas de séance inventée le week-end');
const pick=(date,promo,title)=>week.events.filter(e=>e.date===date&&e.promo===promo&&e.title.includes(title));
for(const [promo,room,teacher] of [['A','S10','SOARES Sonia'],['B','S11','POULAIN Muriel']]){
 const a=pick('2026-11-04',promo,'Présentation de la validation');
 assert.equal(a.length,1);assert.equal(a[0].room,room);assert.equal(a[0].teacher,teacher);
}
const coping=pick('2026-11-04','all','coping');
assert.equal(coping.length,1);assert.equal(coping[0].start,'09:45');
assert.match(coping[0].room,/confirmer/);
for(const [d,title,rooms] of [['2026-11-04','Recueil de données',['S10','S11','S3']],['2026-11-06','cartes mécanographiques',['S10','S11','S3']]]){
 const e=pick(d,'all',title);assert.equal(e.length,3);
 assert.deepEqual(e.map(x=>x.room),rooms);
 assert.deepEqual(e.map(x=>x.groupLabel),['Groupe 1/3','Groupe 2/3','Groupe 3/3']);
}
for(const [day,promo] of [['2026-11-05','A'],['2026-11-06','B']]){
 assert.equal(pick(day,promo,'Psychogestuelle').length,1);
}
for(const [day,promo] of [['2026-11-05','B'],['2026-11-06','A']]){
 const e=pick(day,promo,'objectifs de stage');assert.equal(e.length,1);assert.equal(e[0].type,'Asynchrone');
}
const asym=week.events.filter(e=>e.type==='Asynchrone');
assert.equal(asym.length,4,'Stage A/B, anti-infectieux, socle numérique');
for(const p of ['A','B'])assert.equal(pick('2026-11-06',p,'Douleurs chroniques').length,1);
assert.ok(source.includes("if(w.id==='S10')return"),'Provenance S10 attendue');
console.log('✅ Planning S10 : 23 créneaux, salles séparées, sous-groupes 1/3, asynchrones et provenance OK');
