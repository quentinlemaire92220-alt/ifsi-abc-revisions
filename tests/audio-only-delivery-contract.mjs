// Livraison audio seule : elle n'autorise PAS la publication d'un cours complet.
// PSSM ne dispose pas encore de ses deux fiches officielles et reste partiel.
import assert from 'node:assert/strict';

export function validateAudioOnlyDelivery(course,delivery,vocals){
  const id=course?.id;
  assert.equal(delivery?.deliveryMode,'audio_only',id+': mode audio seul attendu');
  assert.equal(delivery.validated,true,id+': contrôle audio non validé');
  assert.equal(delivery.status,'partial',id+': un cours sans fiche ne peut être complet');
  assert.equal(course?.sourceStatus,'official_support_private_pending_publication',id+': statut support privé incorrect');
  assert.ok(!course?.officialSupportUrl&&!course?.qcmPdfUrl,id+': interdiction d'exposer un support privé');
  assert.ok(!delivery.supportDriveId&&!delivery.sheetResourceId&&!delivery.infographicSheetResourceId,
    id+': ne pas présenter des fiches non encore publiées');
  assert.ok(!delivery.qcmDriveId&&!delivery.flashcardDriveId,id+': pas de QCM/flashcards fictifs');
  assert.ok(Array.isArray(delivery.blockers)&&delivery.blockers.some(b=>
    b.resource==='official_support'&&b.reason==='private_pending'),id+': attente support non déclarée');
  assert.ok(Array.isArray(delivery.vocals)&&delivery.vocals.length>0,id+': liste MP3 absente');
  assert.ok(Array.isArray(delivery.vocalScripts)&&delivery.vocalScripts.length===0,
    id+': scripts privés ne doivent pas être publiés');
  const expected=vocals.filter(v=>v.courseId===id);
  assert.equal(expected.length,delivery.vocals.length,id+': nombre de MP3 incohérent');
  assert.equal(course.audioCount,expected.length,id+': compteur audio incorrect');
  assert.equal(course.audioStatus,'available',id+': disponibilité audio incorrecte');
  assert.equal(delivery.folders?.['05']&&course.audioFolderUrl,
    'https://drive.google.com/drive/folders/'+delivery.folders['05'],
    id+': dossier Drive incorrect');
  assert.equal(new Set(delivery.vocals).size,delivery.vocals.length,id+': doublon audio');
  assert.deepEqual([...delivery.vocals].sort(),expected.map(v=>v.id).sort(),id+': vocaux non concordants');
  const seen=new Set();
  for(const item of expected){
    assert.equal(item.mime,'audio/mpeg',id+': MIME audio incorrect');
    assert.match(item.driveId||'',/^[a-zA-Z0-9_-]{15,}$/,id+': ID Drive manquant');
    assert.ok(!seen.has(item.driveId),id+': doublon Drive MP3');
    seen.add(item.driveId);
    assert.match(delivery.artifactSha256s?.[item.driveId]||'',/^[a-f0-9]{64}$/,
      id+': empreinte MP3 manquante : '+item.driveId);
  }
  assert.ok(!delivery.infographicResourceIds?.length,id+': infographies privées fictives');
  return true;
}
