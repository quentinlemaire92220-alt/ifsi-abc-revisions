import assert from 'node:assert/strict';

// The normal limit stays strict. An explicit exception binds an accepted
// duration to one vocal, course and exact MP3 hash in the approved package.
export function validateVocalDuration(vocal,sha256){
  assert.ok(Number.isFinite(vocal.durationSeconds)&&vocal.durationSeconds>0,'Durée MP3 incorrecte');
  const exception=vocal.durationException;
  if(exception!==undefined){
    assert.equal(exception?.status,'owner_accepted','Dépassement non accepté');
    assert.equal(exception.vocalId,vocal.id,'Exception pour un autre vocal');
    assert.equal(exception.courseId,vocal.courseId,'Exception pour un autre cours');
    assert.equal(exception.durationSeconds,vocal.durationSeconds,'Durée différente de celle acceptée');
    assert.match(exception.sha256||'',/^[a-f0-9]{64}$/,'Empreinte exception absente');
    assert.equal(exception.sha256,sha256,'Exception pour un autre MP3');
    assert.ok(typeof exception.reason==='string'&&exception.reason.trim(),'Motif exception absent');
    assert.ok(typeof exception.approvedAt==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(exception.approvedAt)&&Number.isFinite(Date.parse(exception.approvedAt)),'Date exception absente');
  }
  if(vocal.durationSeconds>=600)assert.ok(exception,'MP3 supérieur ou égal à dix minutes sans accord explicite');
  return true;
}
