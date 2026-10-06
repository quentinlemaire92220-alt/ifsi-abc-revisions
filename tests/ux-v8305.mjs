import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(new URL('../'+p, import.meta.url),'utf8');

const features=read('features-v9.js');
assert.match(features,/function ensureSingleFavoriteButton\(\)/);
assert.doesNotMatch(features,/function injectUI\(\)\{\s*if\(document\.getElementById\('favStartBtn'\)\)return;/);
assert.match(features,/cleanMetaText\(theme\)===cleanMetaText\(course\)/);

const themes=read('v79-themes.js');
assert.match(themes,/function clearCourseCustomizer\(\)/);
assert.match(themes,/querySelector\('#v79Builder'\)\?\.remove\(\)/);
assert.match(themes,/querySelector\('#v79ThemesCard'\)\?\.remove\(\)/);

const course=read('v74-pack.js');
assert.match(course,/Réviser ce cours/);
assert.match(course,/Tous les QCM du cours/);
assert.doesNotMatch(course,/QCM favoris de ce cours/);

const revision=read('v81-suite.js');
for (const token of ['v8305Course','v8305Theme','data-cdiff','data-ccount','data-cmode','v8305Launch']) assert.ok(revision.includes(token), token);
assert.ok(revision.includes('Correction et résultat uniquement à la fin.'));
assert.ok(revision.includes('Correction après chaque question.'));

const index=read('index.html');
assert.ok(index.includes('v8305-changelog.js?v=8305'));
assert.ok(index.includes('sw.js?v=8305'));
assert.ok(index.includes('padding:18px 14px 130px'));

const sw=read('sw.js');
assert.ok(sw.includes("ifsi-abc-v8-30-5-local-99"));
assert.ok(sw.includes('v8305-changelog.js'));

console.log('UX V8.30.5 regression checks: OK');
