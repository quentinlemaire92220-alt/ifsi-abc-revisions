#!/usr/bin/env node
// Reçu de publication VIH ; ne valide pas scientifiquement les sources provisoires.
// Exécution autorisée par le GO explicite du 28 octobre 2026 et SHA exacts de la revue.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {publicationBundle,bundleDigest} from '../tests/course-publication-approval-lib.mjs';
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifestPath='docs/course-deliveries.json';
const manifest=json(manifestPath),id='vih_b13_20261027';
const d=manifest.courses.find(c=>c.courseId===id);
assert(d,'Cours VIH absent');
assert.equal(d.packFormat,'written_v1');
assert.equal(d.provisional,true);
assert.equal(d.pedagogicalValidated,false);
assert.equal(d.sourceBasis.nativeSupportAvailable,false);
assert.equal(d.publicationApproval.authorization,'explicit_go_publication');
const expected={
 sheet:{pages:17,sha:'357fcc2dc8c2b20fba5e69cfe091c7249d5c7dffece19cdb44d24725630eff6e'},
 qcm:{pages:26,sha:'884f4150c162727bf79bfed567ce0d239bcc6e705d1d63a92a75176e484ea7c9'},
 flashcards:{pages:11,sha:'a69afdb5b94db1c75368995ef6fd669fbf6596ed37555260fcc94f95a6b653e7'}
};
for(const [role,expectedAsset] of Object.entries(expected)){
 const a=d.publicArtifacts[role];
 assert.equal(a.pageCount,expectedAsset.pages);
 assert.equal(a.sha256,expectedAsset.sha);
 assert.equal(d.artifactSha256s[a.artifactId],expectedAsset.sha);
 assert.equal(sha(a.path),expectedAsset.sha,'Octets non approuvés : '+role);
}
assert.equal(d.writtenPdfAudit.pdfSha256,expected.sheet.sha);
assert.equal(d.templateConformance.artifacts.qcm.pageCount,26);
assert.equal(d.templateConformance.artifacts.sheet.status,'owner_accepted');
assert.equal(d.templateConformance.artifacts.qcm.status,'owner_accepted');
assert.equal(d.visualOwnerReview.reviewedPdfSha256s[d.publicArtifacts.sheet.artifactId],expected.sheet.sha);
assert.equal(d.publicationApproval.status,'awaiting_bundle_digest');
const data={
 registry:json('course-registry-v741.json'),
 sheets:[1,2,3].flatMap(i=>json('sheets-'+i+'.json')),
 infographics:json('infographics.json'),
 vocals:json('vocals.json'),
 banks:{[d.qcmBank]:json(d.qcmBank)},
 vocabulary:json('vocabulaire-v1.json').entries,
 imageHashes:{}
};
const digest=bundleDigest(publicationBundle(id,d,data));
d.publicationApproval.status='approved';
d.publicationApproval.bundleSha256=digest;
d.publicationApproval.approvalBasis='Validation graphique et GO MAJ explicitement donnés le 28 octobre 2026 ; trois PDF finalisés, octets et empreintes contrôlés. Statut scientifique provisoire conservé.';
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n','utf8');
console.log('GO reçu du propriétaire : 2026-10-28, graphiques acceptés');
console.log('BUNDLE_SHA256 : '+digest);
console.log('SOURCES : support officiel attendu, aucune prétention de validation pédagogique définitive');
