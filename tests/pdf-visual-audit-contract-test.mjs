import assert from 'node:assert/strict';
import {validateVisualAudit} from './pdf-visual-audit-contract.mjs';

const course='cours_test_synthetique';
const infos=['visuel_01','visuel_02'];
const good={infographicResourceIds:infos,visualAudit:{
  status:'PASS',pdfSha256:'a'.repeat(64),expectedCount:2,checkedCount:2
}};
assert.doesNotThrow(()=>validateVisualAudit(course,good),'Rapport public cohérent');
assert.doesNotThrow(()=>validateVisualAudit(course,{infographicResourceIds:[]}),
  'Cours sans infographie : pas de faux rapport à inventer');
for (const [label,change] of [
  ['Rapport absent',{visualAudit:undefined}],
  ['Rapport KO',{visualAudit:{...good.visualAudit,status:'FAIL'}}],
  ['Empreinte falsifiée',{visualAudit:{...good.visualAudit,pdfSha256:'abc'}}],
  ['Couverture partielle',{visualAudit:{...good.visualAudit,expectedCount:1,checkedCount:1}}],
  ['Une figure non vérifiée',{visualAudit:{...good.visualAudit,checkedCount:1}}]
]){
  assert.throws(()=>validateVisualAudit(course,{...good,...change}),label);
  console.log('✅ Rejet : '+label);
}
const proof={
  status:'MATCH',source:'authenticated_drive_download',
  pdfSha256:'a'.repeat(64),expectedCount:2,checkedCount:2
};
assert.doesNotThrow(()=>validateVisualAudit(course,{...good,publishedVerification:proof},
  {requirePublishedVerification:true}), 'PDF retéléchargé identique');
for(const [label,bad] of [
  ['Sans vérification après publication',undefined],
  ['Hash différent',{...proof,pdfSha256:'b'.repeat(64)}],
  ['Source non authentifiée',{...proof,source:'manual_guess'}],
  ['Révision incomplète',{...proof,checkedCount:1}]
]){
  assert.throws(()=>validateVisualAudit(course,{...good,publishedVerification:bad},
    {requirePublishedVerification:true}),label);
  console.log('✅ Rejet : '+label);
}
console.log('✅ Validation des preuves structurelles PDF : 12 cas');
