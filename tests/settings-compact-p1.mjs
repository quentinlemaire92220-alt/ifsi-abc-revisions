import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=path=>fs.readFileSync(path,'utf8');
const settings=read('v87-settings.js'),audit=read('v821-resource-audit.js');
const markup=settings.match(/sec\.innerHTML=`([\s\S]*?)`;\s*app\.insertBefore/);
assert.ok(markup,'Gabarit Paramètres absent');
const ui=markup[1];
for(const id of ['v87Dark','v87Timer','v87Analytics','v87ExportResults','v87ExportBackup','v87Whatsapp','v87Followup','v87AuditOpen','v87Installed','v87Server','v87Build','v87Update','v87UpdateStatus','v87ForceUpdate','v87Reload','v87Improve','v87LogDisclosure','v87Log']){
 assert.ok(ui.includes('id="'+id+'"'),'Contrôle historique absent: '+id);
}
for(const id of ['v87Dark','v87Timer','v87Analytics','v87ExportResults','v87ExportBackup','v87Whatsapp','v87Followup','v87AuditOpen','v87Update','v87ForceUpdate','v87Reload','v87Improve']){
 assert.ok(settings.includes("$('"+id+"').onclick"),'Gestionnaire manquant: '+id);
}
assert.match(settings,/v87LogDisclosure'\)\.addEventListener\('toggle'/,'Journal non chargé à l’ouverture');
assert.ok(!settings.includes('versionLog();refreshVersionState()'),'Le journal et la version ne doivent pas être régénérés à chaque préférence');
assert.match(settings,/dataset\.checked/,'La version serveur doit être chargée une seule fois à l’initialisation');
assert.match(settings,/v87AuditOpen[^\n]*onclick[^\n]*panel\.open=true/,'Accès au diagnostic manquant');
assert.match(settings,/#settings87 \.v87-head\{background:var\(--card\)/,'Contraste du bandeau non corrigé');
assert.match(settings,/safe-area-inset-bottom/,'Marge de navigation basse absente');
assert.ok(!/setTimeout\(runAudit/.test(audit),'Audit automatique toujours actif');
assert.ok(!/addEventListener\('ifsi:v741-ready',[^\n]*runAudit/.test(audit),'Audit déclenché au chargement du registre');
assert.match(audit,/createElement\('details'\)/,'Le diagnostic ne doit plus occuper une carte ouverte par défaut');
assert.match(audit,/section\.appendChild\(d\)/,'Le diagnostic doit être en dehors de la grille principale');
assert.match(audit,/v821Run'\)\.onclick=async/,'Audit manuel non disponible');
assert.match(audit,/window\.IFSI_V821=\{version:V,runAudit/,'API existante du diagnostic supprimée');
console.log('✅ Paramètres P1 : commandes conservées, audit manuel, rapport et journal différés, adaptation mobile');
