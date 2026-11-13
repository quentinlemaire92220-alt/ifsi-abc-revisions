"""Reject altered native question, answer and option-rationale text."""
import importlib.util,sys
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'tools/pdf-bank-coherence.py'
sys.path.insert(0,str(p.parent))
spec=importlib.util.spec_from_file_location('coherence',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
row=dict(id='fixture',number=1,theme='Thème',difficulty='medium',question='Quelle proposition est correcte ?',choices=['Choix '+x for x in 'ABCDE'],answers=[1,3],announcedCorrectCount=2,explanation='Explication générale.',rationales=['Justification '+x+'.' for x in 'ABCDE'])
text='QCM de révision\nThème\nQ01\nMoyen\n'+row['question']+' (2 bonnes réponses)\n'+'\n'.join(chr(65+i)+'. '+v for i,v in enumerate(row['choices']))+'\nCorrigés argumentés\nThème\nQ01 — Réponses : B, D. '+row['explanation']+' '+' '.join(chr(65+i)+' : '+('Vrai. ' if i in row['answers'] else 'Faux. ')+v for i,v in enumerate(row['rationales']))+'\n'
m.validate_boxed_inline_rationales(text,[row])
for old,new in [('Q01','Q02'),('Moyen','Facile'),('(2 bonnes réponses)','(3 bonnes réponses)'),('Choix C','Choix modifié'),('B, D.','A, D.'),('Explication générale.','Explication changée.'),('B : Vrai.','B : Faux.'),('Justification E.',''),('Quelle proposition','Quelle autre proposition')]:
    try:m.validate_boxed_inline_rationales(text.replace(old,new),[row])
    except AssertionError:pass
    else:raise AssertionError('Altération acceptée : '+old)
print('PASS QCM encadrés : texte exact, cardinalité, clé et cinq justifications ; neuf altérations refusées.')

# The once-printed profile keeps the same native-text checks. Exercise the real
# accepted 60-question PDF, then reject changes in each pedagogical component.
import json,copy
import fitz
root=Path(__file__).resolve().parents[1]
rows=json.loads((root/'data/course-banks/prevention_promotion_sante.json').read_text(encoding='utf8'))
with fitz.open(root/'assets/prevention-promotion-20261113/UE_C1_S1_Prevention_Promotion_QCM_60_Corriges.pdf') as doc:
    native=m.body(doc)
m.validate_boxed_inline_rationales(native,rows,embedded_rationales=True)
for mutate in [
    lambda q:q.update(question=q['question']+' altérée'),
    lambda q:q['choices'].__setitem__(0,'Choix altéré'),
    lambda q:q.update(answers=[1]),
    lambda q:q.update(announcedCorrectCount=1),
    lambda q:q.update(difficulty='hard'),
    lambda q:q.update(explanation=q['explanation']+' Phrase ajoutée.'),
    lambda q:q['rationales'].__setitem__(0,'Justification altérée.'),
]:
    changed=copy.deepcopy(rows);mutate(changed[0])
    try:m.validate_boxed_inline_rationales(native,changed,embedded_rationales=True)
    except AssertionError:pass
    else:raise AssertionError('Altération acceptée dans le profil à correction unique')
try:m.validate_boxed_inline_rationales(native,rows)
except AssertionError:pass
else:raise AssertionError('Le profil historique accepte une liste répétée manquante')
print('PASS correction unique : 60 QCM réels, sept altérations refusées ; profil historique préservé.')
