#!/usr/bin/env python3
"""Brouillons privés PDF VIH depuis la banque réelle et la fiche source.
Ne publie, n'approuve et ne modifie aucun PDF historique.
La revue humaine V3 et le GO sur les octets finaux restent obligatoires.
"""
from __future__ import annotations
import argparse
import hashlib
import html
import json
import re
from pathlib import Path
import fitz
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Flowable, KeepTogether, HRFlowable
from reportlab.pdfgen import canvas

ROOT=Path(__file__).resolve().parents[1]
PURPLE=colors.HexColor('#5E3587')
INK=colors.HexColor('#222431')
BLUE=colors.HexColor('#225784')
GREEN=colors.HexColor('#216645')
RED=colors.HexColor('#A63042')
BG=colors.HexColor('#F7F5FA')
MARGIN=41
W,H=A4
HEAD=45.35
FOOT=42.52
levels={'easy':'FACILE','medium':'MOYEN','hard':'DIFFICILE'}

def fonts():
    roots=[Path('/usr/share/fonts/truetype/lato'),Path('/usr/share/fonts/truetype/Lato')]
    for root in roots:
        if (root/'Lato-Regular.ttf').is_file():
            pdfmetrics.registerFont(TTFont('Lato',str(root/'Lato-Regular.ttf')))
            pdfmetrics.registerFont(TTFont('Lato-Bold',str(root/'Lato-Bold.ttf')))
            return
    raise RuntimeError('Lato absente : installer fonts-lato, ne pas substituer Helvetica')

def p(txt,style):
    return Paragraph(html.escape(str(txt)).replace('\n',' '),style)

ST={}
def styles():
    ST['body']=ParagraphStyle('body',fontName='Lato',fontSize=9.6,leading=13.8,textColor=INK,spaceAfter=6)
    ST['title']=ParagraphStyle('title',fontName='Lato-Bold',fontSize=18.4,leading=23.2,textColor=PURPLE,spaceAfter=12)
    ST['h1']=ParagraphStyle('h1',fontName='Lato-Bold',fontSize=13.8,leading=19,textColor=PURPLE,spaceBefore=12,spaceAfter=7,keepWithNext=True)
    ST['h2']=ParagraphStyle('h2',fontName='Lato-Bold',fontSize=11.6,leading=16,textColor=BLUE,spaceBefore=8,spaceAfter=6,keepWithNext=True)
    ST['small']=ParagraphStyle('small',fontName='Lato',fontSize=9.3,leading=12.7,textColor=INK,spaceAfter=5)
    ST['q']=ParagraphStyle('question',fontName='Lato-Bold',fontSize=10.2,leading=14.4,textColor=PURPLE)
    ST['choice']=ParagraphStyle('choice',fontName='Lato',fontSize=9.55,leading=13.0,textColor=INK)
    ST['label']=ParagraphStyle('label',fontName='Lato-Bold',fontSize=9.3,leading=12.4,textColor=PURPLE)
    ST['correction']=ParagraphStyle('correction',fontName='Lato',fontSize=9.5,leading=13.6,textColor=INK,spaceAfter=10)

class NumberedCanvas(canvas.Canvas):
    def __init__(self,*a,**k):
        super().__init__(*a,**k)
        self.pages=[]
    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()
    def save(self):
        total=len(self.pages)
        for i,state in enumerate(self.pages,1):
            self.__dict__.update(state)
            self.setFillColor(PURPLE)
            self.rect(0,H-HEAD,W,HEAD,stroke=0,fill=1)
            self.rect(0,0,W,FOOT,stroke=0,fill=1)
            self.setFillColor(colors.white)
            self.setFont('Lato-Bold',10)
            self.drawString(MARGIN,H-29,'IFSI ABC  ·  UE B1.3 S1  ·  VIH')
            self.setFont('Lato',9.2)
            self.drawString(MARGIN,16,'VIH · Cours du 27/10/2026 · Support provisoire')
            self.drawRightString(W-MARGIN,16,f'{i} / {total}')
            super().showPage()
        super().save()

class Doc(SimpleDocTemplate):
    def afterFlowable(self,f):
        if getattr(f,'section_title',None):
            self.canv.bookmarkPage(f.section_title)
            self.canv.addOutlineEntry(f.section_title,f.section_title,0,False)

def document(path,story):
    doc=Doc(str(path),pagesize=A4,leftMargin=MARGIN,rightMargin=MARGIN,
            topMargin=66,bottomMargin=63,pageCompression=1,title='')
    doc.build(story,canvasmaker=NumberedCanvas)
    # Les métadonnées techniques du moteur ne font pas partie du support étudiant.
    with fitz.open(path) as pdf:
        pdf.set_metadata({})
        tmp=path.with_name(path.stem+'.clean.pdf')
        pdf.save(tmp,garbage=4,deflate=True)
    tmp.replace(path)

class QuestionCard(Flowable):
    def __init__(self,q):
        Flowable.__init__(self)
        self.q=q
    def wrap(self,aw,ah):
        self.width=min(aw,W-2*MARGIN)
        inner=self.width-57
        self.question=p(f"Q{self.q['number']:02d} · {self.q['question']}",ST['q'])
        _,qh=self.question.wrap(inner,800)
        self.choices=[]
        h=12+12+qh+10
        for idx,text in enumerate(self.q['choices']):
            part=p(chr(65+idx)+'. '+text,ST['choice'])
            _,ch=part.wrap(self.width-70,800)
            self.choices.append((part,ch))
            h+=ch+5
        h+=26
        self.height=h
        return self.width,self.height
    def draw(self):
        c=self.canv
        c.setFillColor(colors.white)
        c.setStrokeColor(colors.HexColor('#C5B6D2'))
        c.setLineWidth(0.85)
        c.rect(0,0,self.width,self.height,stroke=1,fill=1)
        c.setFillColor(colors.HexColor('#ECE7F4'))
        c.rect(0,self.height-23,self.width,23,stroke=0,fill=1)
        c.setFont('Lato-Bold',9.3)
        c.setFillColor(PURPLE)
        c.drawString(15,self.height-16,levels[self.q['difficulty']])
        y=self.height-34
        _,qh=self.question.wrap(self.width-35,800)
        self.question.drawOn(c,15,y-qh)
        y-=qh+10
        for part,ch in self.choices:
            c.setStrokeColor(BLUE)
            c.setLineWidth(.85)
            c.rect(17,y-ch/2-2,10,10,stroke=1,fill=0)
            part.drawOn(c,41,y-ch)
            y-=ch+5
        c.setFillColor(BLUE)
        c.setFont('Lato-Bold',9.1)
        count=self.q['announcedCorrectCount']
        c.drawRightString(self.width-15,10,f'{count} réponse' + ('s' if count>1 else '') + ' attendue' + ('s' if count>1 else ''))

class FlashCard(Flowable):
    def __init__(self,q):
        Flowable.__init__(self)
        self.q=q
    def wrap(self,aw,ah):
        self.width=min(aw,W-2*MARGIN)
        f=self.q['flashcards'][0]
        self.parts=[
            p(f"CARTE {self.q['number']:02d} · {self.q['theme']}",ST['label']),
            p('RECTO — '+f['front'],ST['q']),
            p('VERSO — '+' '.join(f['answers']),ST['body']),
            p('POUR COMPRENDRE — '+f['explanation'],ST['small'])
        ]
        self.parts_h=[item.wrap(self.width-30,900)[1] for item in self.parts]
        self.height=sum(self.parts_h)+45
        return self.width,self.height
    def draw(self):
        c=self.canv
        c.setFillColor(colors.white)
        c.setStrokeColor(colors.HexColor('#B7AEC9'))
        c.rect(0,0,self.width,self.height,fill=1,stroke=1)
        y=self.height-15
        for i,(part,height) in enumerate(zip(self.parts,self.parts_h)):
            part.drawOn(c,15,y-height)
            y-=height+(9 if i<2 else 5)
        c.setStrokeColor(PURPLE)
        c.line(15,self.height-15-self.parts_h[0]-7,self.width-15,self.height-15-self.parts_h[0]-7)

class CorrectionCard(Flowable):
    """One argumented answer card; green key and rose distractors."""
    def __init__(self,q):
        Flowable.__init__(self)
        self.q=q
    def wrap(self,aw,ah):
        self.width=min(aw,W-2*MARGIN)
        bits=self.q['explanation'].split('Propositions à écarter :',1)
        self.head=p('Q%02d — Réponses : %s.' % (self.q['number'],', '.join(chr(65+i) for i in self.q['answers'])),ST['label'])
        self.body=p(bits[0].strip(),ST['small'])
        self.traps=p('Propositions à écarter :'+bits[1],ST['small']) if len(bits)==2 else None
        self.hh=self.head.wrap(self.width-36,1000)[1]
        self.bh=self.body.wrap(self.width-36,1000)[1]
        self.th=self.traps.wrap(self.width-36,1000)[1] if self.traps else 0
        self.height=12+self.hh+10+self.bh+14+(self.th+16 if self.traps else 0)
        return self.width,self.height
    def draw(self):
        c=self.canv
        c.setStrokeColor(colors.HexColor('#DFDBE8'));c.setLineWidth(.7)
        c.setFillColor(colors.white);c.rect(0,0,self.width,self.height,stroke=1,fill=1)
        c.setFillColor(colors.HexColor('#E4F3E8'))
        c.rect(1,self.height-5-self.hh-10,self.width-2,self.hh+16,stroke=0,fill=1)
        self.head.drawOn(c,16,self.height-7-self.hh)
        y=self.height-16-self.hh
        self.body.drawOn(c,16,y-self.bh-4)
        if self.traps:
            c.setFillColor(colors.HexColor('#FBF0F1'))
            c.rect(8,8,self.width-16,self.th+12,stroke=0,fill=1)
            self.traps.drawOn(c,16,14)

def qcm_pdf(rows,path):
    story=[
        p('VIH — 50 QCM de révision',ST['title']),
        p('Questions à cinq propositions (A–E). Les corrigés argumentés suivent les 50 questions. Le nombre de réponses attendues est indiqué dans chaque encadré.',ST['body'])
    ]
    current=None
    for q in rows:
        if q['theme']!=current:
            current=q['theme']
            story.append(p(current,ST['h1']))
        story.append(QuestionCard(q))
        story.append(Spacer(1,10))
    story.append(PageBreak())
    story.append(p('Corrigés argumentés',ST['h1']))
    for q in rows:
        story.append(CorrectionCard(q))
        story.append(Spacer(1,9))
    document(path,story)

def cards_pdf(rows,path):
    story=[p('VIH — 50 flashcards',ST['title']),
           p('Questions de rappel actif. Les réponses et explications sont reprises de la banque canonique du cours.',ST['body'])]
    for q in sorted(rows,key=lambda x:x['number']):
        story.append(FlashCard(q))
        story.append(Spacer(1,11))
    document(path,story)

def revision_pdf(original,path):
    """Preserve every original page, table, callout and clinical sentence."""
    d=fitz.open(original)
    assert len(d)==17,'Source sheet pagination changed; stop rather than lose content'
    cover=d[0]
    target=cover.search_for('OBJECTIFS DE RÉVISION')
    assert len(target)==1,'Unique under-sized heading not found; inspect source manually'
    r=target[0]
    cover.add_redact_annot(fitz.Rect(r.x0-1,r.y0-1,r.x1+2,r.y1+1),fill=(1,1,1))
    cover.apply_redactions(images=0,graphics=0,text=0)
    lato='/usr/share/fonts/truetype/lato/Lato-Bold.ttf'
    cover.insert_font(fontname='LocalLatoBold',fontfile=lato)
    cover.insert_text((59,381.9),'OBJECTIFS DE RÉVISION',fontname='LocalLatoBold',
       fontfile=lato,fontsize=9.4,color=(0.36,0.21,0.53),overlay=True)
    toc=[]
    for i,page in enumerate(d):
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines',[]):
                txt=' '.join(span['text'] for span in line['spans']).strip()
                if re.match(r'^\d{2}\s',txt) and any(span['size']>=14 for span in line['spans']):
                    toc.append([1,txt,i+1])
    assert len(toc)==14,'Missing section bookmark: possible source extraction loss'
    assert toc[-3][1].startswith('12 Pièges QCM')
    assert toc[-2][1].startswith('13 Synthèse générale')
    assert toc[-1][1].startswith('14 Définitions et mots-clés')
    d.set_toc(toc)
    d.set_metadata({})
    d.save(path,garbage=4,deflate=True)
    d.close()
    with fitz.open(path) as pdf:
        assert len(pdf)==17 and len(pdf.get_toc())==14
        for n,page in enumerate(pdf,1):
            for block in page.get_text('dict')['blocks']:
                for line in block.get('lines',[]):
                    for span in line['spans']:
                        bbox=fitz.Rect(span['bbox'])
                        assert not (100<bbox.y0<page.rect.height-105 and span['size']<8.999),(
                            'Small body',n,span['text'])

def validate_inputs(rows):
    assert len(rows)==50 and {x['number'] for x in rows}==set(range(1,51))
    assert all(len(q['choices'])==5 and len(q['flashcards'])==1 and
               1<=len(q['answers'])<=3 and
               q['announcedCorrectCount']==len(q['answers']) for q in rows)
    assert len({q['id'] for q in rows})==50

def main():
    pa=argparse.ArgumentParser()
    pa.add_argument('--out',type=Path,required=True)
    a=pa.parse_args()
    a.out.mkdir(parents=True,exist_ok=True)
    fonts();styles()
    rows=json.loads((ROOT/'data/course-banks/vih_b13_20261027.json').read_text())
    validate_inputs(rows)
    files={
        'sheet':('assets/vih-20261027/UE_B1_3_S1_VIH_Fiche_Revision_17p_v149.pdf','VIH_Fiche_V3_CANDIDAT.pdf'),
        'qcm':(None,'VIH_QCM_50_V3_CANDIDAT.pdf'),
        'flashcards':(None,'VIH_Flashcards_50_V2_CANDIDAT.pdf')
    }
    revision_pdf(ROOT/files['sheet'][0],a.out/files['sheet'][1])
    qcm_pdf(rows,a.out/files['qcm'][1])
    cards_pdf(rows,a.out/files['flashcards'][1])
    meta={}
    for role,(_,name) in files.items():
        path=a.out/name
        with fitz.open(path) as d:
            meta[role]={'filename':name,'pages':len(d),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                        'selectable':all(bool(pg.get_text().strip()) for pg in d)}
    (a.out/'RAPPORT_TECHNIQUE_PRIVE.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(meta,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
