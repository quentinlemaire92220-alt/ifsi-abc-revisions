import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const meta=JSON.parse(read('build-meta.json'));
assert.equal(meta.version,'8.30.42');
assert.equal(String(meta.build),'8342');
const mod=read('v8338-flashcards.js');
for(const token of ['directQuestion','vagueFront','À quoi correspond','À quoi peut faire appel','Quels sont','if(!p)continue'])assert.ok(mod.includes(token),`Correctif formulation absent: ${token}`);
assert.ok(!mod.includes("const card=trueFalseCard(q,t)||"),'Le Vrai/Faux automatique ne doit plus être prioritaire');
assert.ok(mod.includes("/que faut-il retenir concernant/"),'Filtre formulations vagues absent');
const bad=[
  'Que faut-il retenir concernant les granulocytes cités sont ?',
  'Que faut-il retenir concernant un nerf correspond ?',
  'Que faut-il retenir concernant la mise en évidence du virus entier peut faire appel à ?'
];
for(const s of bad)assert.ok(!mod.includes(s),`Formulation interdite présente: ${s}`);
const expected=['Quels sont','À quoi correspond','À quoi peut faire appel'];
for(const s of expected)assert.ok(mod.includes(s),`Reformulation attendue absente: ${s}`);
const index=read('index.html'),sw=read('sw.js');
assert.ok(index.includes('./v8342-changelog.js?v=8342'),'Changelog V8.30.42 absent de index.html');
assert.ok(sw.includes("'./v8342-changelog.js'"),'Changelog V8.30.42 absent du cache PWA');
console.log('✅ V8.30.42 : formulations flashcards ambiguës éliminées');
