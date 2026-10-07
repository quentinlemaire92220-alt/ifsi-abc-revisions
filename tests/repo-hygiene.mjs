import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const exists=p=>fs.existsSync(new URL(p,root));
const read=p=>fs.readFileSync(new URL(p,root),'utf8');

for(const p of ['qextra-08.txt','resource-audit-v88.json','schema-resp003.svg','schema-resp013.svg','schema-resp015.svg']){
  assert.ok(!exists(p),`Fichier legacy revenu à la racine: ${p}`);
}
assert.ok(exists('archive/qextra-08-legacy-calculs.txt'),'Archive qextra-08 absente');
assert.ok(exists('docs/archive/resource-audit-v88.json'),'Archive audit V8.8 absente');
const hygiene=read('REPO_HYGIENE.md');
for(const token of ['qextra-08-legacy-calculs.txt','resource-audit-v88.json','schema-resp003.svg']){
  assert.ok(hygiene.includes(token),`Documentation hygiene incomplète: ${token}`);
}

const sw=read('sw.js');
assert.ok(!sw.includes('qextra-08.txt'),'Le pack qextra-08 legacy ne doit pas être chargé par le Service Worker');

const forbiddenNames=[/^\.env(?:\.|$)/i,/\.pem$/i,/\.key$/i,/id_rsa/i,/credentials?\.json$/i];
const textExt=/\.(?:js|mjs|json|md|yml|yaml|html|webmanifest|txt)$/i;
const secretPatterns=[
  /\bghp_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bsb_secret_[A-Za-z0-9_-]{10,}\b/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/
];
const skipContent=/^(?:qextra-\d+\.txt|.*\.b64)$/i;
const walk=(dir='')=>{
  for(const ent of fs.readdirSync(new URL(dir||'./',root),{withFileTypes:true})){
    const rel=path.posix.join(dir,ent.name);
    if(rel.startsWith('.git/')||rel.startsWith('node_modules/'))continue;
    if(ent.isDirectory()){walk(rel+'/');continue}
    assert.ok(!forbiddenNames.some(r=>r.test(ent.name)),`Fichier sensible versionné: ${rel}`);
    if(textExt.test(ent.name)&&!skipContent.test(ent.name)){
      const s=read(rel);
      for(const re of secretPatterns)assert.ok(!re.test(s),`Secret potentiel détecté dans ${rel}: ${re}`);
    }
  }
};
walk();

console.log('✅ Hygiène dépôt : archives, fichiers legacy et secrets contrôlés');
