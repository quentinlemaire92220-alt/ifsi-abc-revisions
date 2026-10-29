// Vérifie les OCTETS PDF exacts acceptés avant activation du catalogue.
// Le test ne constitue ni une revue juridique ni un reçu de lecture anonyme.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const path='assets/droits-patients/UE_A2_1_S1_Droits_des_patients_Fiche_de_revision.pdf';
const expected='5dafe4f29b9d374e069bc5eabef5bb830656dc8b18f1eb24d387249c73d84361';
assert.ok(fs.existsSync(path),'PDF approuvé manquant des assets de la branche');
const raw=fs.readFileSync(path);
assert.equal(raw.length,1060621,'Taille du PDF approuvé modifiée');
assert.equal(raw.subarray(0,8).toString('latin1').startsWith('%PDF-'),true,'En-tête PDF manquant');
assert.equal(createHash('sha256').update(raw).digest('hex'),expected,'PDF différent des octets approuvés');
console.log('PASS : asset fiche 42 pages, SHA-256 exact, 1 060 621 octets.');
