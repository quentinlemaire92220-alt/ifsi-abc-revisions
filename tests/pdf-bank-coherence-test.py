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
