import assert from 'node:assert/strict';

// New publications only: older course listings are not silently removed.
export function validateAnatomyRouting(course,atlasSource,infographics){
  const docs=course?.additionalDocuments||[];
  for(const item of docs){
    const label=String(item.label||item.title||'');
    if(!/\b(?:planche anatomique|atlas anatomique)\b/i.test(label)&&item.category!=='anatomy')continue;
    assert.equal(item.category,'anatomy',course.id+': planche '+label+' classée comme document de cours');
    assert.ok(/^[a-z0-9_-]+$/i.test(item.atlasId||''),
      course.id+': planche '+label+' sans atlasId Anatomie');
    const matches=[...atlasSource.matchAll(/\bid\s*:\s*['"]([^'"]+)['"]/g)]
      .filter(m=>m[1]===item.atlasId);
    assert.ok(matches.length,course.id+': planche '+label+' absente du registre Anatomie ('+item.atlasId+')');
    assert.ok(!infographics.some(x=>x.url&&x.url===item.url),
      course.id+': planche '+label+' dupliquée dans les infographies du cours');
  }
}
