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
