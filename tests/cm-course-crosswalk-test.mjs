import assert from 'node:assert/strict';
import {validateCrosswalk} from '../tools/cm-course-crosswalk.mjs';

const registry={courses:[
 {id:'module_a',domain:'A',ue:'A1'},
 {id:'module_b',domain:'B',ue:'B1'},
 {id:'partie_b',domain:'B',ue:'B1',parentId:'module_b',showInCourses:false},
 {id:'module_c',domain:'C',ue:'C1'}
]};
const direct={dateSource:'2026-09-15',start:'09:00',end:'11:00',sourcePage:1,
 topic:'Étude pédagogique fictive',ue:'B.1',relation:'direct',courseIds:['module_b']};
const child={...direct,topic:'Sous-partie',relation:'child',courseIds:['partie_b']};
const prepared={...direct,dateSource:'2026-10-20',topic:'Cours futur fictif',
 ue:'C.1',relation:'new_topic',courseIds:[]};
const dated={...direct,dateSource:'2027-09-02',dateWarning:'year_inconsistency',
 note:'L’année inscrite sur le document ne correspond pas au calendrier annoncé.'};
const sample={asOf:'2026-10-14',rows:[direct,child,prepared,dated]};
const valid=validateCrosswalk(sample,registry);
assert.equal(valid.rows,4);
assert.equal(valid.prepared,1);
assert.equal(valid.hiddenChild,1);
assert.equal(valid.dateWarnings,1);
const bad=(row,pattern)=>assert.throws(
 ()=>validateCrosswalk({asOf:sample.asOf,rows:[row]},registry),pattern);
bad({...direct,courseIds:['n_existe_pas']},/courseId inconnu/);
bad({...direct,relation:'direct',courseIds:[]},/aucun courseId/);
bad({...prepared,courseIds:['module_c']},/ne doit pas être inventé/);
bad({...direct,ue:'A.1'},/différence UE.*non explicitée/);
assert.equal(validateCrosswalk({asOf:sample.asOf,rows:[{...direct,ue:'A.1',
 note:'Le classement du planning diffère du registre.'}]},registry).ueWarnings,1);
bad({...direct,relation:'child'},/un cours enfant masqué/);
bad({...dated,note:''},/anomalie date\/heure sans explication/);
bad({...direct,end:'08:45'},/fin avant début/);
bad({...direct,sourcePage:0},/numéro de page/);
bad({...direct,relation:'unregistered',courseIds:['module_b']},/ne doit pas être inventé/);
console.log('✅ Audit CM générique : 4 cas valides + 10 rejets, sans planning privé.');
