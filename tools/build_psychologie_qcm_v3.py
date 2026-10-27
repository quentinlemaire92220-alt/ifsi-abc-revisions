#!/usr/bin/env python3
"""Candidate-only A4 QCM PDF from the unchanged canonical psychology bank.

This generator never writes to student assets, the public manifest or owner approval.
"""
import argparse
import hashlib
import json
import tempfile
from collections import OrderedDict
from pathlib import Path
import fitz
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

W, H = 595.276, 841.89
PURPLE = (94/255, 53/255, 135/255)
PALE = (247/255, 245/255, 250/255)
INK = (36/255, 39/255, 52/255)
EDGE = (212/255, 201/255, 227/255)
GREEN = (35/255, 115/255, 97/255)
FONT_ROOT = Path('/usr/share/fonts/truetype/lato')


def fonts():
    for name in ('Regular', 'Bold'):
        path = FONT_ROOT / ('Lato-' + name + '.ttf')
        if not path.is_file():
            raise FileNotFoundError(str(path))
        pdfmetrics.registerFont(TTFont('Lato-' + name, str(path)))


class Renderer:
    def __init__(self, out):
        fonts()
        self.output = out
        self.tmp = Path(tempfile.mkstemp(suffix='.pdf')[1])
        self.c = canvas.Canvas(str(self.tmp), pagesize=(W,H), pageCompression=1)
        self.y = 66
        self.started = False
        self.answer = False
        self.answer_pages = 0
        self.question_pages = 0

    def draw_text(self, x, y, s, size=10, bold=False, color=INK):
        self.c.setFont('Lato-Bold' if bold else 'Lato-Regular', size)
        self.c.setFillColorRGB(*color)
        self.c.drawString(x, H-y, s)

    def rectangle(self,x0,y0,x1,y1,fill=None,edge=None,linewidth=.8):
        self.c.setLineWidth(linewidth)
        if fill:
            self.c.setFillColorRGB(*fill)
        if edge:
            self.c.setStrokeColorRGB(*edge)
        self.c.rect(x0,H-y1,x1-x0,y1-y0,fill=int(fill is not None),stroke=int(edge is not None))

    def wrap(self,text,maxw,size=10,bold=False):
        font='Lato-Bold' if bold else 'Lato-Regular'
        words=text.split(' ')
        lines=[]
        current=''
        for word in words:
            candidate=(current+' '+word) if current else word
            if pdfmetrics.stringWidth(candidate,font,size)<=maxw:
                current=candidate
            else:
                if not current:
                    raise ValueError('Source token too long to wrap: '+word[:60])
                lines.append(current)
                current=word
        if current:
            lines.append(current)
        return lines

    def new_page(self,answer=False):
        if self.started:
            self.c.showPage()
        self.started=True
        self.answer=answer
        self.rectangle(0,0,W,45.35,fill=PURPLE)
        self.rectangle(0,H-42.52,W,H,fill=PURPLE)
        self.draw_text(42,27,'IFSI ANTOINE BÉCLÈRE  •  UE B2',12.2,True,(1,1,1))
        self.y=67
        if answer:
            self.answer_pages+=1
            self.draw_text(44,80,'Corrigés argumentés' if self.answer_pages==1 else 'Corrigés argumentés — suite',14,True,PURPLE)
            self.y=96
        else:
            self.question_pages+=1

    def theme(self,name):
        lines=self.wrap('THÈME • '+name,506,11.2,True)
        ht=15*len(lines)+10
        if self.y+ht>776:
            self.new_page(answer=self.answer)
        self.rectangle(40,self.y,555,self.y+ht,fill=(239/255,232/255,247/255))
        for i,line in enumerate(lines):
            self.draw_text(52,self.y+16+i*15,line,11.2,True,PURPLE)
        self.y+=ht+10

    def question(self,q):
        level={'easy':'FACILE','medium':'MOYEN','hard':'DIFFICILE'}[q['difficulty']]
        num='Q'+str(int(q['number'])).zfill(2)+' · '
        title=self.wrap(num+q['question'],473,10.6,True)
        choices=[self.wrap(chr(65+i)+'. '+s,446,9.8) for i,s in enumerate(q['choices'])]
        ht=18+7+len(title)*14+8+sum(len(c)*13.2+3.3 for c in choices)+11
        if ht>670:
            raise ValueError('Item cannot fit at correct font size: '+q['id'])
        if self.y+ht>783:
            self.new_page(answer=False)
        y=self.y
        self.rectangle(40,y,555,y+ht,fill=PALE,edge=EDGE)
        self.rectangle(51,y+7,126,y+27,fill=(229/255,217/255,240/255))
        self.draw_text(59,y+21,level,9.4,True,PURPLE)
        cy=y+44
        for line in title:
            self.draw_text(56,cy,line,10.6,True)
            cy+=14
        cy+=6
        for group in choices:
            self.rectangle(63,cy-9.3,73.5,cy+1.2,fill=(1,1,1),edge=PURPLE,linewidth=.9)
            for line in group:
                self.draw_text(87,cy,line,9.8)
                cy+=13.2
            cy+=3.3
        self.y+=ht+9

    def correction(self,q):
        key=', '.join(chr(65+i) for i in q['answers'])
        text='Q'+str(int(q['number'])).zfill(2)+' — Réponses : '+key+'. '+q['explanation']
        lines=self.wrap(text,479,10.1)
        ht=20+len(lines)*14.4+10
        if ht>670:
            raise ValueError('Answer cannot fit '+q['id'])
        if self.y+ht>779:
            self.new_page(answer=True)
        y=self.y
        self.rectangle(40,y,555,y+ht,fill=(250/255,249/255,251/255),edge=EDGE)
        self.rectangle(40,y,45.2,y+ht,fill=GREEN)
        for i,line in enumerate(lines):
            self.draw_text(56,y+21+i*14.4,line,10.1)
        self.y+=ht+8

    def finish(self):
        self.c.save()
        with fitz.open(str(self.tmp)) as doc:
            n=len(doc)
            foot=str(FONT_ROOT/'Lato-Regular.ttf')
            for i,page in enumerate(doc,1):
                page.insert_font(fontname='LatoFoot',fontfile=foot)
                page.insert_text((514,825),str(i)+' / '+str(n),
                    fontname='LatoFoot',fontsize=10.5,color=(1,1,1))
            doc.set_metadata({'title':'','author':'','subject':'','keywords':'','creator':'','producer':''})
            self.output.parent.mkdir(parents=True,exist_ok=True)
            doc.save(str(self.output),garbage=4,deflate=True,clean=False)
        self.tmp.unlink()
        return {'pages':n,'questionPages':self.question_pages,
            'correctionPages':self.answer_pages,
            'sha256':hashlib.sha256(self.output.read_bytes()).hexdigest(),
            'bytes':self.output.stat().st_size}


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--bank',default='data/course-banks/psychologie_sante.json',type=Path)
    p.add_argument('--out',type=Path,required=True)
    args=p.parse_args()
    rows=json.loads(args.bank.read_text(encoding='utf8'))
    assert len(rows)==50 and [q['number'] for q in rows]==list(range(1,51))
    assert all(len(q['choices'])==5 and 1<=len(q['answers'])<=3 for q in rows)
    groups=OrderedDict()
    for q in rows:
        groups.setdefault(q['theme'],[]).append(q)
    doc=Renderer(args.out)
    doc.new_page()
    for theme,qs in groups.items():
        doc.theme(theme)
        for q in qs:
            doc.question(q)
    doc.new_page(answer=True)
    for theme,qs in groups.items():
        doc.theme(theme)
        for q in qs:
            doc.correction(q)
    print(json.dumps(doc.finish(),ensure_ascii=False))


if __name__=='__main__':
    main()
