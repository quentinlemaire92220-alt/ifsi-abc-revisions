import assert from 'node:assert/strict';
import {validateBank} from '../tools/qcm-bank-contract.mjs';
const make=()=>({id:'fixture',courseId:'synthetic',theme:'Communication',question:'Comment vérifier la compréhension ?',choices:['Reformuler','Presser','Ignorer','Imposer','Partir'],answers:[0],announcedCorrectCount:1,explanation:'Un échange permet de vérifier le message reçu.',flashcards:[{front:'À quoi sert le feedback ?',answers:['Vérifier le message reçu.'],explanation:'Il permet une adaptation de l’explication.'}]});
assert.equal(validateBank([make()]),1);
for(const change of [q=>q.answers=[],q=>q.answers=[0,0],q=>q.answers=[5],q=>q.announcedCorrectCount=2,q=>q.choices.pop(),q=>q.flashcards[0].front='Quels faits dans la vignette ?',q=>q.explanation='La formatrice indique la réponse.',q=>q.flashcards[0].answers=[]]){
 const q=make();change(q);assert.throws(()=>validateBank([q]));
}
assert.throws(()=>validateBank([make(),make()]));
console.log('PASS contrats QCM/cartes : clés, cardinalité, champs et autonomie');
