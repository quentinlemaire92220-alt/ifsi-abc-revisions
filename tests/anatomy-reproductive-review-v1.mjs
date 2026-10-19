import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const nav=read('v82-nav-anatomy.js');
const snapshot=JSON.parse(read('resource-audit-v821.json'));
const matrix=JSON.parse(read('docs/anatomy-p1-clinical-matrix.json'));
const skill=read('docs/skills/production-planches-anatomiques-canva.md');
const agents=read('AGENTS.md');

assert.ok(nav.includes("id:'systeme_reproducteur'"),'Le système reproducteur doit apparaître dans le navigateur Anatomie');
assert.ok(!nav.includes("['🧬','Reproduction']"),'Ne pas garder une seconde entrée fantôme dans FUTURE');
assert.ok(nav.includes("if(def.id==='systeme_reproducteur')return reproductiveReviewCard(def,term)"),'La rubrique reproducteur doit passer par le mode revue');
assert.ok(nav.includes('0 planche validée'),"Interdiction d'annoncer 6 maquettes comme planches validées");
assert.ok(nav.includes('6 maquettes en revue'),"Mention explicite du statut clinique en attente");
assert.ok(nav.includes("id:'R01'")&&nav.includes("id:'R07'"),'Le registre de suivi doit couvrir R01 à R07');
assert.ok(nav.includes('disabled>Non validée'),"Le bouton d'entraînement ne doit pas être actif");
assert.ok(nav.includes('rel="noopener noreferrer"'),'L’ouverture externe doit être sécurisée');
assert.ok(nav.includes("localStorage.setItem(REPRO_REVIEW_KEY,url)"),'Le lien de revue doit être uniquement local');
assert.ok(!nav.includes('DAHYd62tg4w')&&!nav.includes('GQ6MYI8VJqgsclS'),'Ne jamais publier un identifiant ou lien de revue privé en dur');
assert.ok(!nav.includes('7a2hov21rkj9e7f')&&!nav.includes('0b1n29zj87pent7'),'Ne pas embarquer de shortlink privé de revue');
assert.ok(!read('index.html').includes('DAHYd62tg4w'),'Pas de lien privé dans l’accueil');
assert.equal(matrix.publicationStatus,'BLOCKED');
assert.equal(matrix.imagesReady,0);
assert.equal(matrix.boards.length,7);
assert.ok(!snapshot.atlasBoardContracts.systeme_reproducteur,'Ne jamais incrémenter le compteur avant approbation');
assert.equal(Object.values(snapshot.atlasBoardContracts).reduce((a,b)=>a+b,0),106);
assert.ok(skill.includes('Canva')&&skill.includes('Cellule humaine'));
assert.ok(skill.includes('droits')||skill.includes('licence'));
assert.ok(agents.includes('docs/skills/production-planches-anatomiques-canva.md'));

const begin=nav.indexOf('function validReproLink(raw){'),end=nav.indexOf('\nfunction reproLink()',begin);
assert.ok(begin>=0&&end>begin,'Fonction de validation URL manquante');
const validate=new Function('URL',nav.slice(begin,end)+';return validReproLink;')(URL);
assert.equal(validate('https://www.canva.com/d/ABC'), 'https://www.canva.com/d/ABC');
assert.equal(validate('https://www.canva.com/design/ABC/view'),'https://www.canva.com/design/ABC/view');
assert.equal(validate('https://canva.link/abc'),'https://canva.link/abc');
for(const malicious of ['javascript:alert(1)','http://www.canva.com/d/ABC','https://canva.com.evil.tld/d/ABC','https://www.canva.com.evil.tld/d/ABC','https://evil.example/d/ABC','https://www.canva.com/'])assert.equal(validate(malicious),'','Lien externe non conforme : '+malicious);

console.log('✅ Atlas reproducteur en revue : navigation présente, 0 planche validée, 106 actifs inchangés, liens externes filtrés, charte référencée.');
