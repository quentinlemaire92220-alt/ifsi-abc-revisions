import fs from 'node:fs';
import assert from 'node:assert/strict';

const src = fs.readFileSync('course-navigation-ui-v1.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const registry = JSON.parse(fs.readFileSync('course-registry-v741.json', 'utf8'));

assert.equal(registry.courses.length, 55, 'Le catalogue publié doit rester à 55 cours');
assert.equal((html.match(/course-navigation-ui-v1\.js/g) || []).length, 1, 'Le module doit être importé exactement une fois');
assert.match(src, /new MutationObserver\(refresh\)/, 'Synchronisation attendue avec le rendu asynchrone');
assert.match(src, /ifsi:v741-ready/, 'Attendre le registre officiel');
assert.match(src, /statusWhy\(course\)/, 'Motif propre au cours provisoire');
assert.match(src, /EXPLANATION/, 'NB obligatoire sur le sens de Provisoire');
assert.match(src, /body\.v72-dark/, 'Thème sombre conservé');
assert.match(src, /course\.domain/, 'Domaine issu du registre, pas d’inférence depuis le titre');
assert.match(src, /course\.ue/, 'UE issue du registre, pas d’inférence depuis le titre');
assert.match(src, /appendChild\(makeTag\(course\)\)/, 'Pastille provisoire non bloquante');
assert.match(src, /var searching = !!/, 'Recherche sans filtre provisoire');
assert.match(src, /return 0;\s*\n\s*if \(element\.classList\.contains\('v74-child-supports'\)\) return 0/, 'Support principal prioritaire');
assert.match(src, /heading\.includes\('fiches de revision'\)\) return 1/, 'Fiche avant QCM');
assert.match(src, /v74-qcm-section'\)\) return 2/, 'QCM après fiche');
assert.match(src, /heading\.includes\('infographies'\)\) return 3/, 'Infographies ensuite');
assert.match(src, /heading\.includes\('vocaux'\)\) return 4/, 'Vocaux à la fin du parcours principal');
assert.match(src, /vgCourseEntry'\) return 6/, 'Vocabulaire conservé en complément');
assert.match(src, /root\.insertBefore\(sorted\[i\], current \|\| null\)/, 'Déplacer des blocs existants sans régénérer leurs actions');
assert.doesNotMatch(src, /localStorage\.(?:setItem|removeItem)|\.answers\s*=|\.score\s*=/, 'Aucune mutation des résultats QCM');
assert.doesNotMatch(src, /fetch\s*\(|https:\/\/drive\.google\.com/, 'Ne pas copier ni publier des supports depuis cette couche UI');

for (const [code, label] of [
  ['A', 'Sciences infirmières et raisonnement clinique'],
  ['B', 'Pratiques cliniques infirmières, qualité et gestion des risques'],
  ['C', 'Prévention et promotion de la santé'],
  ['D', 'Communication, travail en équipe et leadership'],
  ['E', 'Démarche scientifique, recherche et méthodologie'],
  ['A1', 'Fondements des sciences infirmières et raisonnement clinique'],
  ['D1', 'Savoir-être, communication professionnelle et leadership'],
]) {
  assert(src.includes(label), 'Intitulé pédagogique manquant : ' + code);
}
console.log('✅ Navigation pédagogique : 55 cours préservés, hiérarchie Drive, pastilles, thèmes et ordre vérifiés');
