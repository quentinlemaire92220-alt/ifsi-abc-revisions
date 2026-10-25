import fs from 'node:fs';
import assert from 'node:assert/strict';

const css=fs.readFileSync('tests/fixtures/course-visual-redesign-v3.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const registry=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8'));
const version=JSON.parse(fs.readFileSync('build-meta.json','utf8'));

assert.equal(registry.courses.length,55,'Les 55 cours doivent rester préservés');
assert.equal(version.version,'8.30.130','Ne pas provoquer un changement de version en phase de conception');
assert.doesNotMatch(html,/course-visual-redesign-v3\.css/,'La V3 ne doit pas être chargée en production');
assert.doesNotMatch(sw,/course-visual-redesign-v3\.css/,'Ne pas précacher la V3 sans GO de publication');
assert.match(css,/^:root\{/m,'Mode clair absent');
assert.match(css,/body\.v72-dark\{/,'Mode sombre absent');
assert.match(css,/#courses74 \.v74-domain-group/,'Carte de Domaine manquante');
assert.match(css,/#courses74 \.v8430-ue-switch \.v8430-ue-name/,'Hiérarchie pédagogique manquante');
assert.match(css,/#courses74 \.v74-course-card::before/,'Identité des cartes de cours manquante');
assert.match(css,/#v74CourseDetail \.v74-resource-list>/,'Mise en page des ressources manquante');
assert.match(css,/#v74CourseDetail \.v74-resource-list>\.v74-resource>\.actions/,'Actions des ressources manquantes');
assert.match(css,/@media\(max-width:740px\)/,'Mise en page mobile absente');
assert.match(css, /prefers-reduced-motion/,'Accessibilité motion manquante');
assert.doesNotMatch(css,/display:none!important|pointer-events:none|visibility:hidden|localStorage|MutationObserver|fetch\(/,
  'Une refonte purement CSS ne doit masquer ni ressources ni commandes');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Accolades CSS déséquilibrées');
console.log('✅ V3 design preview : 55 cours, clair/sombre/mobile, aucune activation en production et aucun JS modifié');
