import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../planning-v1.js',import.meta.url),'utf8');
const store=new Map();
const context={
 document:{},window:{},Date,Intl,setInterval:()=>0,
 localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))}
};
vm.runInNewContext(source,context,{filename:'planning-v1.js'});
const api=context.window.IFSI_PLANNING;
const week=api.weeks.find(w=>w.id==='S9');
assert.ok(week,'Semaine 09 absente');
assert.equal(week.start,'2026-10-26');
assert.equal(week.end,'2026-10-31');
assert.equal(new Date(week.start+'T12:00:00').getDay(),1,'S9 ne commence pas le lundi');
assert.equal(week.events.length,18,'Nombre de créneaux S9 inattendu');
assert.ok(week.events.every(e=>e.date>='2026-10-26'&&e.date<='2026-10-30'),'Aucun cours de S9 ne doit être inventé le samedi 31 octobre');
const match=(date,promo,group)=>week.events.filter(e=>e.date===date&&(e.promo==='all'||e.promo===promo)&&(!e.groups||e.groups.includes(group)));
for(const [grp,room,teacher] of [['B1','S10','DELABARRE Isabelle'],['B2','S3','POULAIN Muriel']]){
 const events=match('2026-10-30','B',grp).filter(e=>e.start==='09:00');
 assert.equal(events.length,1,'B1/B2 non séparés le 30 octobre : '+grp);
 assert.equal(events[0].room,room,'Salle incorrecte : '+grp);
 assert.equal(events[0].teacher,teacher,'Formatrice incorrecte : '+grp);
 assert.deepEqual(Array.from(events[0].groups),[grp]);
}
for(const [grp,room] of [['A1','S10'],['A2','S3']]){
 const events=match('2026-10-30','A',grp).filter(e=>e.start==='13:30');
 assert.equal(events.length,1,'A1/A2 non séparés : '+grp);
 assert.equal(events[0].room,room);
}
const b1=match('2026-10-28','B','B1');
assert.equal(b1.length,2,'Mercredi Promo B = 2 séances');
assert.equal(b1[0].start,'09:30','TD2 douleur B débute à 09h30');
assert.equal(b1[0].room,'S11');
assert.equal(b1[1].start,'13:30');
assert.equal(b1[1].room,'S10');
assert.equal(match('2026-10-26','B','B1').length,3);
assert.equal(match('2026-10-27','B','B1').length,2);
const thu=match('2026-10-29','B','B1');
assert.equal(thu.length,3);
assert.equal(thu[0].type,'Asynchrone','Connexion Mischool doit rester asynchrone');
assert.equal(thu[0].site,'Distanciel');
assert.equal(thu[1].site,'Lieu à confirmer','Ne pas inventer la salle du CM organes des sens');
assert.equal(thu[2].site,'FAC KB');
assert.equal(match('2026-10-30','B','B1').length,2);
assert.equal(match('2026-10-30','B','B2').length,2);
assert.ok(source.includes("if(w.id==='S9')return"),'Traçabilité source S9 manquante');
console.log('✅ Planning S9 : 18 séances, jours, horaires, promo A/B, B1/B2, A1/A2, lieux et asynchrone OK');
