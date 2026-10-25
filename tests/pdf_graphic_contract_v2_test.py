"""TNR graphiques V2, fixtures fictives et volontairement défectueuses uniquement."""
from pathlib import Path
from tempfile import TemporaryDirectory
import sys
import fitz
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from pdf_graphic_contract_v2 import inspect

PURPLE=(.35686,.20392,.54118)
def sample(path,role='fiche',fault=None):
    doc=fitz.open();p=doc.new_page(width=595.276,height=841.89)
    if fault!='no_top':p.draw_rect(fitz.Rect(0,0,595.276,46.77),color=PURPLE,fill=PURPLE)
    if fault!='no_footer':p.draw_rect(fitz.Rect(0,799.37,595.276,841.89),color=PURPLE,fill=PURPLE)
    p.insert_text((47,32),'IFSI ABC',fontsize=9,color=(1,1,1))
    p.insert_text((47,822),'FICHE - PAGE 1',fontsize=9,color=(1,1,1))
    if role=='fiche':
        p.insert_text((50,105),'Notions essentielles',fontsize=12)
        p.insert_text((50,145),'Observer, comprendre, agir.',fontsize=8.7)
        p.insert_text((50,255),'Pièges QCM',fontsize=12)
        p.insert_text((50,355),'Synthèse générale',fontsize=12)
        if fault!='no_lexicon':p.insert_text((50,455),'Définitions et mots-clés',fontsize=12)
    elif role=='qcm':
        p.insert_text((50,105),'Q01',fontsize=12)
        p.insert_text((95,105),'Comment observer ?',fontsize=12)
        if fault!='no_question_panel':
            p.draw_line((45,90),(45,285),color=PURPLE)
            p.draw_line((550,90),(550,285),color=PURPLE)
        for i,t in enumerate(['A. Observer','B. Expliquer','C. Demander','D. Ecouter','E. Rassurer']):
            y=150+i*24
            if fault!='no_checkbox':
                x=120 if fault=='right_checkbox' else 55
                p.draw_rect(fitz.Rect(x,y-9,x+9,y),color=PURPLE)
            p.insert_text((80,y),t,fontsize=9)
        p.insert_text((50,450),'Corrigés argumentés',fontsize=11)
    else:
        p.insert_text((50,150),'CARTE 01 : posture professionnelle',fontsize=12)
    if fault=='tiny_font':p.insert_text((50,610),'Illisible',fontsize=5)
    if fault=='overflow':p.insert_text((590,640),'Depassement de page',fontsize=12)
    if fault=='overlap':
        p.insert_text((50,665),'Texte superpose',fontsize=10)
        p.insert_text((50,666),'Autre texte superpose',fontsize=10)
    doc.save(path);doc.close()

with TemporaryDirectory() as tmp:
    root=Path(tmp)
    for role in ('fiche','qcm','flashcards'):
        path=root/(role+'.pdf');sample(path,role)
        result=inspect(path,role,1)
        assert result['status']=='PASS',f'Faux négatif {role}: {result["errors"]}'
    cases={'no_top':('fiche','Bandeau violet supérieur'),
           'no_footer':('fiche','Bandeau violet inférieur'),
           'tiny_font':('fiche','Police trop petite'),
           'overflow':('fiche','Texte hors de la page'),
           'overlap':('fiche','lignes de texte se chevauchent'),
           'no_lexicon':('fiche','lexique doit être'),
           'no_checkbox':('qcm','Case QCM absente'),
           'right_checkbox':('qcm','Case QCM absente'),
           'no_question_panel':('qcm','Encadré vectoriel de question')}
    for fault,(role,needle) in cases.items():
        pdf=root/(fault+'.pdf');sample(pdf,role,fault)
        result=inspect(pdf,role,1)
        assert result['status']=='FAIL' and needle in '\n'.join(result['errors']),f'{fault}: {result["errors"]}'
    assert inspect(root/'fiche.pdf','fiche',2)['status']=='FAIL','Pagination fausse admise'
    print('PASS V2 : 3 PDF conformes et 10 défauts rejetés (bandeaux, lisibilité, débordement, collision, lexique, cases, pagination)')
