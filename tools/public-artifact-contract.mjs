// Local public assets are tied to reviewed bytes; this never verifies a remote copy.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
export const pagesOrigin='https://quentinlemaire92220-alt.github.io';
export const pagesPrefix='/ifsi-abc-revisions/';
export function localAssetPath(value){
 assert.equal(typeof value,'string');
 assert.match(value,/^assets\/[A-Za-z0-9_./-]+\.pdf$/,'Chemin PDF public invalide');
 assert.ok(!value.split('/').includes('..'),'Traversée de répertoire');
 const absolute=path.resolve(value);
 assert.ok(fs.existsSync(absolute),'Asset PDF absent : '+value);
 assert.equal(fs.realpathSync(absolute),absolute,'Lien symbolique interdit');
 return absolute;
}
export function verifyPublicArtifact(delivery,url){
 const parsed=new URL(url);
 assert.equal(parsed.origin,pagesOrigin,'Hôte public inattendu');
 assert.ok(parsed.pathname.startsWith(pagesPrefix),'Projet Pages inattendu');
 assert.ok(!parsed.search&&!parsed.hash,'URL PDF non canonique');
 const relative=decodeURIComponent(parsed.pathname.slice(pagesPrefix.length));
 const matches=Object.values(delivery.publicArtifacts||{}).filter(a=>a.path===relative);
 assert.equal(matches.length,1,'PDF hors inventaire approuvé : '+relative);
 const record=matches[0];
 const hash=createHash('sha256').update(fs.readFileSync(localAssetPath(relative))).digest('hex');
 assert.equal(hash,record.sha256,'Octets publics divergents');
 assert.equal(hash,delivery.artifactSha256s?.[record.artifactId],'Asset hors empreinte du package');
 assert.ok(Number.isInteger(record.pageCount)&&record.pageCount>0,'Pagination absente');
 return record.artifactId;
}
