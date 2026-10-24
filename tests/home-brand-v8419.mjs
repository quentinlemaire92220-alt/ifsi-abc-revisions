import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ui=read('v8419-home-brand.js');
const index=read('index.html');
const sw=read('sw.js');
const base64=read('portrait-infirmier-quentin.b64').trim();
const decoded=Buffer.from(base64,'base64');

assert.equal(decoded.toString('ascii',0,4),'RIFF','Portrait non reconnu comme WebP');
assert.equal(decoded.toString('ascii',8,12),'WEBP','Portrait WebP invalide');
assert.ok(decoded.length>1500,'Portrait trop petit ou vide');
for(const s of [
 'IFSI <strong>ABC</strong> Révisions',
 'IFSI <b>A</b>ntoine <b>B</b>é<b>C</b>lère',
 'Réviser aujourd’hui pour soigner demain.',
 'Application gratuite',
 'Projet étudiant indépendant',
 'Seul on va plus vite, ensemble on va plus loin.',
 'supports pédagogiques fournis à l’IFSI Antoine Béclère et à la faculté',
 'portrait-infirmier-quentin.b64',
 'body.v86-home #v76Home>#ifsiBrandHero',
 'body.v86-home #v76Home>#ifsiFreeNote'
])assert.ok(ui.includes(s),'Bandeau accueil incomplet : '+s);
assert.ok(!ui.toLowerCase().includes('lycée'),'Le mot lycée ne doit pas figurer dans le bandeau');
assert.ok(index.includes('v8419-home-brand.js?v=8419'),'Module accueil absent du HTML');
assert.ok(sw.includes('v8419-home-brand.js'),'Module accueil absent du SW');
assert.ok(sw.includes('./portrait-infirmier-quentin.b64'),'Portrait absent du cache hors ligne');
assert.ok(!ui.includes('<a href="#'),'La bannière ne doit pas créer de faux liens');
console.log('OK bandeau IFSI ABC V8.30.119');
