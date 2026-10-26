"""Regression fixtures for stale/missing/duplicate PDF questions and cards."""
import importlib.util,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
spec=importlib.util.spec_from_file_location('pdf_coherence',Path('tools/pdf-bank-coherence.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
q={'id':'fixture','number':1,'theme':'Exemple','question':'Quelle action convient ?', 'choices':['Écouter','Ignorer','Presser','Imposer','Partir'], 'answers':[0], 'explanation':'Écouter permet de comprendre le besoin.', 'flashcards':[{'front':'Pourquoi écouter ?', 'answers':['Comprendre le besoin.'], 'explanation':'L’écoute permet un ajustement.'}]}
text='Q01 Quelle action convient ?\n'+'\n'.join(chr(65+i)+'. '+s for i,s in enumerate(q['choices']))+'\nCorrigés argumentés\nQ01 - Réponses : A\n'+q['explanation']
m.validate_qcm(text,[q])
def fails(call):
    try:call()
    except AssertionError:return
    raise AssertionError('Corruption non détectée')
for bad in [text.replace('Réponses : A','Réponses : B'),text.replace('Écouter','Observer',1),text.replace(q['explanation'],'Ancienne explication.'),text+'\nQ01 - Réponses : A\n'+q['explanation']]:fails(lambda:m.validate_qcm(bad,[q]))
card='CARTE 01 Pourquoi écouter ?\nRéponse. Comprendre le besoin.\nExplication. L’écoute permet un ajustement.'
m.validate_cards(card,[q])
for bad in [card.replace('Comprendre','Oublier'),card+'\n'+card,card.replace('Pourquoi écouter ?','Ancien recto ?')]:fails(lambda:m.validate_cards(bad,[q]))
print('PASS PDF/banque : clés, choix, corrigés, recto/verso et doublons corrompus refusés')

# New printed layout: the canonical bank stays numeric, the PDF groups themes.
from copy import deepcopy
rows=[]
for n,theme in [(1,'Premier thème'),(2,'Autre thème'),(3,'Premier thème')]:
    row=deepcopy(q);row.update(id='fixture'+str(n),number=n,theme=theme,difficulty='medium')
    rows.append(row)
ordered=[rows[0],rows[2],rows[1]]
question_block=lambda row:'MOYEN\nQ%02d · '%row['number']+row['question']+'\n'+'\n'.join(chr(65+i)+'. '+s for i,s in enumerate(row['choices']))
correction_block=lambda row:'Q%02d — Réponses : A. '%row['number']+row['explanation']
themed='\n'.join(question_block(row) for row in ordered)+'\nCorrigés argumentés\n'+'\n'.join(correction_block(row) for row in ordered)
m.validate_qcm(themed,rows)
bad_qcm=[themed.replace('Réponses : A.','Réponses : B.',1),themed.replace('A. Écouter','A. Observer',1),themed.replace(q['explanation'],'Ancienne explication.',1),themed.replace('MOYEN','FACILE',1),themed.replace('Q03 ·','Q01 ·'),themed+'\n'+correction_block(rows[0]),themed.replace(question_block(rows[0])+'\n','',1)]
for bad in bad_qcm:fails(lambda:m.validate_qcm(bad,rows))
card_block=lambda row:'CARTE %02d · '%row['number']+row['theme']+'\nRECTO — '+q['flashcards'][0]['front']+'\nVERSO — '+' '.join(q['flashcards'][0]['answers'])+'\nPOUR COMPRENDRE — '+q['flashcards'][0]['explanation']
themed_cards='\n'.join(card_block(row) for row in rows)
m.validate_cards(themed_cards,rows)
for bad in [themed_cards.replace('Pourquoi écouter ?','Ancien recto ?',1),themed_cards.replace('VERSO — Comprendre','VERSO — Oublier',1),themed_cards.replace('L’écoute permet un ajustement.','Autre justification.',1),themed_cards+'\n'+card_block(rows[0]),themed_cards.replace('Premier thème','Autre thème',1)]:fails(lambda:m.validate_cards(bad,rows))
print('PASS nouveau rendu thématique : numérotation, difficultés, choix, clés, arguments, cartes et doublons contrôlés exactement')
