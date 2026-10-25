"""Contract fixtures for PDF V2: actual drawing geometry, not JSON PASS flags."""
import sys, tempfile
from pathlib import Path
import fitz
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"tools"))
from importlib.machinery import SourceFileLoader
gate=SourceFileLoader("pdf_graphics_v2",str(Path(__file__).resolve().parents[1]/"tools"/"pdf-graphics-v2.py")).load_module()

PURPLE=(.31,.15,.48)
def sample(path,mode="revision",damage=None):
    doc=fitz.open()
    titles=["Pièges QCM / confusions à éviter","Synthèse générale","Définitions et mots-clés"] if mode=="revision" else ["QCM — Fondamentaux","QCM — Suite","Corrigés argumentés"]
    if damage=="order":titles[0],titles[2]=titles[2],titles[0]
    for n,title in enumerate(titles):
        p=doc.new_page(width=595 if damage!="size" or n!=1 else 500,height=842)
        p.draw_rect(fitz.Rect(0,0,p.rect.width,48),fill=PURPLE,color=None)
        if not (damage=="bottom" and n==1):
            p.draw_rect(fitz.Rect(0,811,p.rect.width,842),fill=PURPLE,color=None)
        p.insert_text((45,78),title,fontsize=17,color=(.31,.15,.48))
        p.insert_text((45,150),"Un raisonnement clinique adapte a chaque personne.",fontsize=(7 if damage=="font" and n==1 else 10))
        if damage=="marker" and n==1:p.insert_text((45,185),"Brouillon",fontsize=10)
        if damage=="overflow" and n==1:p.insert_text((582,185),"Texte tres long",fontsize=10)
        if mode=="qcm" and n==0:
            for i,letter in enumerate("ABCDE"):
                yy=208+i*28
                if damage!="checkbox" or i!=3:p.draw_rect(fitz.Rect(47,yy-9,57,yy+1),color=PURPLE)
                p.insert_text((67,yy),letter+". Proposition de test",fontsize=10)
    doc.save(path);doc.close()
def check(kind,damage,expected):
    with tempfile.TemporaryDirectory() as tmp:
        f=Path(tmp)/"test.pdf";sample(f,kind,damage)
        result=gate.validate(f,kind)
        assert (result["status"]=="PASS")==expected,(kind,damage,result)
        if not expected: assert result["errors"]
for kind in ("revision","qcm"):
    check(kind,None,True)
for damage in ("bottom","size","font","marker","overflow","order"):
    check("revision",damage,False)
check("qcm","checkbox",False)
print("PASS PDF V2 : rendu réel, 3 pages, bandeaux, limites, fontes, sections et cases à cocher")
