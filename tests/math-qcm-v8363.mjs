import fs from 'node:fs';
import zlib from 'node:zlib';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const corrected=json('qextra-49.txt');
const required=['cdm2_110','cdm2_112','cdm2_224','cdm_062','cdm_063','cdm_072','cdm_073'];
assert.deepEqual(corrected.map(q=>q.id).slice().sort(),required.slice().sort(),'7 corrections requises et aucun ajout');
const fixed=new Map(corrected.map(q=>[q.id,q]));
for(const q of corrected){
 assert.equal(q.courseId,'calculs_doses_mathematiques',q.id+' rattaché au mauvais cours');
 assert.ok(['easy','medium','hard'].includes(q.difficulty),q.id+' sans difficulté explicite');
 assert.ok(q.choices.length>=4&&q.choices.length<=5,q.id+' : choix invalides');
 assert.ok(q.answers.length>=1&&q.answers.length<=3&&q.answers.length<q.choices.length,q.id+' : combinaison invalide');
 assert.ok(q.answers.every(n=>Number.isInteger(n)&&n>=0&&n<q.choices.length),q.id+' : réponse hors limites');
 assert.ok(q.explanation.trim().length>=80,q.id+' : raisonnement incomplet');
}
const truth=id=>{const q=fixed.get(id);return q.answers.map(i=>q.choices[i]);};
assert.deepEqual(truth('cdm2_110'),['0,125 mg'],'125 µg = 0,125 mg');
assert.deepEqual(truth('cdm2_112'),['0,075 L'],'75 mL = 0,075 L');
assert.deepEqual(truth('cdm2_224'),['0,125 g'],'0,5 g/L × 0,25 L = 0,125 g');
for(const id of ['cdm2_110','cdm2_112','cdm2_224'])assert.ok(fixed.get(id).explanation.includes(truth(id)[0]),id+' : explication incompatible');
for(const id of ['cdm_062','cdm_063','cdm_072','cdm_073'])assert.doesNotMatch(fixed.get(id).question,/(?:pr[ée]c[ée]dent|cette m[êe]me poche|ce m[êe]me flacon|voir question)/i,id+' renvoie à une autre question');
assert.match(fixed.get('cdm_062').question,/500 mL[\s\S]*2 g[\s\S]*20 %/);
assert.match(fixed.get('cdm_063').question,/500 mL[\s\S]*5 mL[\s\S]*5 mL[\s\S]*24 h/);
assert.match(fixed.get('cdm_072').question,/4 %[\s\S]*40 mg\/mL[\s\S]*40 gouttes\/mL[\s\S]*60 gouttes/);
assert.match(fixed.get('cdm_073').question,/30 mL[\s\S]*1 200 gouttes[\s\S]*60 gouttes[\s\S]*3 fois/);

function gzipBody(raw){let p=10,flags=raw[3]||0;if(flags&4){const n=raw[p]|(raw[p+1]<<8);p+=2+n}if(flags&8)while(p<raw.length&&raw[p++]);if(flags&16)while(p<raw.length&&raw[p++]);if(flags&2)p+=2;return raw.subarray(p,-8)}
function parsePackText(txt){try{return JSON.parse(txt)}catch(first){const body=txt.trim().replace(/^\s*\[/,'').replace(/\]\s*$/,'');const parts=body.split(/}\s*,\s*\{"id":/),recovered=[];for(let i=0;i<parts.length;i++){let s=(i?'{"id":':'')+parts[i];if(!s.trim().endsWith('}'))s+='}';try{const q=JSON.parse(s);if(q?.id)recovered.push(q)}catch{}}if(recovered.length)return recovered;throw first}}
function decodePack(p){const txt=read(p).trim();if(txt.startsWith('[')||txt.startsWith('{')){const a=parsePackText(txt);return Array.isArray(a)?a:(a.questions||[])}const raw=Buffer.from(txt,'base64');const body=(raw[0]===31&&raw[1]===139?(()=>{try{return zlib.gunzipSync(raw)}catch{return zlib.inflateRawSync(gzipBody(raw))}})():raw).toString('utf8');const a=parsePackText(body);return Array.isArray(a)?a:(a.questions||[])}
const schemaRegex=/\b(sch[ée]ma|schema|figure|illustration|diagramme|image\s+ci|ci-dessous|boucle\s+anonyme)\b/i;
const keep=q=>q?.id==='pharmaco_031'||(!schemaRegex.test(q.question||'')&&!(/\brep[eè]re\b/i.test(q.question||'')&&/(association|associer|structure|lettre)/i.test(q.question||'')));
const base=Array.from({length:5},(_,i)=>json('questions-'+(i+1)+'.json')).flat();
const extras=[];
for(const n of [1,2,3,4,5,6,7,...Array.from({length:30},(_,i)=>i+9),46]){const p='qextra-'+String(n).padStart(2,'0')+'.txt';if(fs.existsSync(new URL('../'+p,import.meta.url)))extras.push(...decodePack(p))}
const overrides=[];
for(const n of [39,40,41,42,43,44,45,47,48,49])overrides.push(...decodePack('qextra-'+n+'.txt'));
const byId=new Map(overrides.filter(keep).map(q=>[q.id,q]));
const all=[...base.filter(keep)], seen=new Set(all.map(q=>q.id));
for(const q of extras.filter(keep).filter(q=>!byId.has(q.id)).concat([...byId.values()]))if(!seen.has(q.id)){all.push(q);seen.add(q.id)}
const math=all.filter(q=>q.courseId==='calculs_doses_mathematiques'||/calculs? de doses|math[eé]matiques/i.test(q.course||''));
assert.equal(math.length,226,'La banque de maths doit conserver exactement 226 QCM');
assert.equal(new Set(math.map(q=>q.id)).size,226,'ID mathématique dupliqué');
for(const q of corrected){
 const active=math.find(x=>x.id===q.id);
 assert.ok(active,'QCM absent du runtime : '+q.id);
 assert.deepEqual(active.choices,q.choices,'Choix incohérents : '+q.id);
 assert.deepEqual(active.answers,q.answers,'Vérité du corrigé décalée : '+q.id);
 assert.equal(active.question,q.question,'Énoncé non retenu : '+q.id);
 assert.equal(active.explanation,q.explanation,'Correction non retenue : '+q.id);
}
const difficulties={easy:0,medium:0,hard:0};
for(const q of math){
 assert.ok(q.explanation?.trim().length>=45,q.id+' : explication trop courte');
 assert.ok(q.answers.length>=1&&q.answers.length<=3,q.id+' : trop de réponses correctes');
 difficulties[q.difficulty]++;
}
assert.deepEqual(difficulties,{easy:72,medium:110,hard:44},'Difficultés modifiées');

const sandbox={window:{},Q:math,document:{},setInterval:()=>0,setTimeout:()=>{},clearInterval:()=>{},console};
vm.runInNewContext(read('calculs-parcours-v1.js'),sandbox,{filename:'calculs-parcours-v1.js'});
const api=sandbox.window.IFSI_CALCULS_MASTERY;
assert.ok(api?.levelOf&&api?.stageFor&&api?.mastery,'Parcours mathématique absent');
const levels=Array.from({length:10},(_,i)=>({n:i+1,qs:math.filter(q=>api.levelOf(q)===i+1)}));
assert.equal(levels.reduce((n,row)=>n+row.qs.length,0),226,'QCM manquants dans le parcours');
for(const row of levels){
 assert.ok(row.qs.length>=5,'Niveau '+row.n+' insuffisant : '+row.qs.length);
 assert.ok(row.qs.some(q=>q.difficulty==='easy'),'Niveau '+row.n+' sans question facile');
 assert.ok(row.qs.some(q=>q.difficulty==='medium'),'Niveau '+row.n+' sans question moyenne');
 if(row.n!==7)assert.ok(row.qs.some(q=>q.difficulty==='hard'),'Niveau '+row.n+' sans question difficile');
}
sandbox.st=()=>({v7QuestionStats:Object.fromEntries(math.map(q=>[q.id,{answered:1,correct:1}]))});
assert.equal(api.stageFor(7),'mixed','Niveau 7 bloqué faute de QCM difficile');
for(const row of levels)assert.equal(api.mastery(row.n),true,'Niveau '+row.n+' impossible à maîtriser à 100 %');
const sw=read('sw.js');
assert.ok(sw.includes("'./qextra-49.txt'"),'Pack correctif absent du PWA');
assert.ok(sw.includes("'./qextra-48.txt','./qextra-49.txt'])"),'Pack absent de la liste des overrides SW');
console.log('✅ Maths : 226 QCM, 3 calculs exacts, 4 énoncés autonomes, 10 niveaux accessibles');
console.log('📊 Distribution : '+levels.map(l=>l.n+':'+l.qs.length).join(' | '));
