import assert from 'node:assert/strict';
import {validateAnatomyRouting} from './anatomy-routing-contract.mjs';

const id="urinary_test";
const atlas="const DIAGRAMS=[{id:'plate-01',title:'Coupe anatomique'}]";
const url="https://drive.google.com/file/d/DEMO_PRIVATE/view";
const course={id,additionalDocuments:[{label:'Planche anatomique du rein',
  category:'anatomy',atlasId:'plate-01',url}]};
assert.doesNotThrow(()=>validateAnatomyRouting(course,atlas,[]));
assert.throws(()=>validateAnatomyRouting({...course,additionalDocuments:[{...course.additionalDocuments[0],category:'course'}]},atlas,[]),/classée comme document/);
assert.throws(()=>validateAnatomyRouting({...course,additionalDocuments:[{...course.additionalDocuments[0],atlasId:''}]},atlas,[]),/sans atlasId/);
assert.throws(()=>validateAnatomyRouting({...course,additionalDocuments:[{...course.additionalDocuments[0],atlasId:'unknown'}]},atlas,[]),/absente du registre/);
assert.throws(()=>validateAnatomyRouting(course,atlas,[{url}]),/dupliquée/);
assert.doesNotThrow(()=>validateAnatomyRouting({id,additionalDocuments:[{label:'Fiche de vocabulaire',url}]},atlas,[]));
console.log('✅ v1.13 : 6 scénarios de classement Anatomie, exclusion des doublons et atlas obligatoire');
