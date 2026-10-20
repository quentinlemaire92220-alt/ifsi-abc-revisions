#!/usr/bin/env python3
"""Adaptive PDF composer for newly authored IFSI revision sheets.

Input: private structured JSON with complete paragraphs and validated figures.
Preserve pedagogical text. Prefer readable inline figures; reserve full pages
for complex visuals. This is NOT a medical validation or a PDF-rewriting tool.
"""
from __future__ import annotations
import argparse
import html
import json
from pathlib import Path

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Flowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

MARGIN=48
BODY_W=A4[0]-MARGIN*2
MAX_FIGURE_H=A4[1]-2*MARGIN-42


class AdaptiveFigure(Flowable):
    def __init__(self,image_path,caption,min_width=420,mode="auto"):
        super().__init__()
        self.image_path=Path(image_path)
        if not self.image_path.is_file(): raise FileNotFoundError(str(self.image_path))
        with Image.open(self.image_path) as original:
            self.pxw,self.pxh=original.size
        if self.pxw<100 or self.pxh<100: raise ValueError("Figure source trop petite")
        self.aspect=self.pxh/self.pxw
        self.caption=str(caption)
        self.min_width=float(min_width)
        self.mode=mode
        if self.mode not in ("auto","dedicated"):
            raise ValueError("Mode invalide: auto ou dedicated")
        if not 200<=self.min_width<=BODY_W:
            raise ValueError("Largeur minimale de lisibilité invalide")
        if self.min_width*self.aspect+38>MAX_FIGURE_H:
            raise ValueError("Planche trop haute: la scinder sans perdre les légendes")
        self.width=0
        self.height=0

    def wrap(self,availW,availH):
        target=min(availW,BODY_W)
        if self.mode=="dedicated":
            width=min(target,(MAX_FIGURE_H-28)/self.aspect,self.pxw*72/110)
            if width<self.min_width:
                raise ValueError("Planche dédiée insuffisamment lisible")
            self.width=width
            self.height=28+width*self.aspect
            if availH<MAX_FIGURE_H-20:
                return availW,availH+500
            return self.width,self.height
        width=min(target,max(0,(availH-28)/self.aspect))
        if width<self.min_width:
            return availW,availH+500
        width=min(width,self.pxw*72/110)  # at least 110 dpi at printed size
        if width<self.min_width:
            raise ValueError("Résolution image insuffisante pour lecture")
        self.width=width
        self.height=28+width*self.aspect
        return self.width,self.height

    def draw(self):
        canvas=self.canv
        canvas.setFont("Helvetica-Bold",9.5)
        canvas.setFillColor(colors.HexColor("#176077"))
        canvas.drawString(0,self.height-12,self.caption[:95])
        canvas.drawImage(ImageReader(str(self.image_path)),0,0,width=self.width,
                         height=self.width*self.aspect,preserveAspectRatio=True,mask="auto")


def render(data,output,assets_root=None):
    if not isinstance(data,dict) or not isinstance(data.get("sections"),list) or not data["sections"]:
        raise ValueError("Le JSON doit contenir des sections pédagogiques")
    title=str(data.get("title") or "Fiche de révision")
    # Référence approuvée : fiche cardiovasculaire 17 p., texte et tableaux majoritaires.
    # Ne jamais réutiliser le format infographie pleine page dans cette fiche.
    purple=colors.HexColor("#5b2da3")
    normal=ParagraphStyle("Content",fontName="Helvetica",fontSize=10.5,leading=15.2,
                          spaceAfter=7,textColor=colors.HexColor("#263340"))
    heading=ParagraphStyle("Heading",parent=normal,fontName="Helvetica-Bold",
                           fontSize=15.2,leading=19,spaceBefore=13,spaceAfter=9,
                           keepWithNext=True,textColor=purple)
    h1=ParagraphStyle("Title",parent=normal,fontName="Helvetica-Bold",
                      fontSize=19,leading=23,alignment=1,textColor=colors.white)
    small=ParagraphStyle("Small",parent=normal,fontSize=9.3,leading=12.7)
    priority_heading=ParagraphStyle("PrioritiesHeading",parent=small,fontName="Helvetica-Bold",
                                   textColor=purple)
    path=Path(output)
    path.parent.mkdir(parents=True,exist_ok=True)
    doc=SimpleDocTemplate(str(path),pagesize=A4,leftMargin=MARGIN,rightMargin=MARGIN,
                          topMargin=MARGIN,bottomMargin=MARGIN,title=title,
                          pageCompression=1,invariant=1)
    banner=Table([[Paragraph(html.escape(title),h1)]],colWidths=[BODY_W])
    banner.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),purple),
        ("TOPPADDING",(0,0),(-1,-1),14),
        ("BOTTOMPADDING",(0,0),(-1,-1),13),
        ("LEFTPADDING",(0,0),(-1,-1),14),
        ("RIGHTPADDING",(0,0),(-1,-1),14),
    ]))
    flow=[banner,Spacer(1,10)]
    if data.get("courseMeta"):
        flow.append(Paragraph(html.escape(str(data["courseMeta"])),small))
    priorities=data.get("revisionPriorities") or []
    if priorities:
        if not isinstance(priorities,list) or not all(isinstance(x,str) and x.strip() for x in priorities):
            raise ValueError("Priorités de révision : liste de textes non vides attendue")
        lines=[Paragraph("PRIORITÉS POUR L'ÉVALUATION",priority_heading)]
        lines.extend(Paragraph("• "+html.escape(x),small) for x in priorities)
        box=Table([[lines]],colWidths=[BODY_W])
        box.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#f1eefa")),
            ("BOX",(0,0),(-1,-1),.7,purple),
            ("LEFTPADDING",(0,0),(-1,-1),11),
            ("RIGHTPADDING",(0,0),(-1,-1),11),
            ("TOPPADDING",(0,0),(-1,-1),8),
            ("BOTTOMPADDING",(0,0),(-1,-1),8),
        ]))
        flow.extend([box,Spacer(1,12)])
    root=Path(assets_root or Path.cwd()).resolve()
    for section in data["sections"]:
        if not isinstance(section,dict) or not str(section.get("heading","")).strip():
            raise ValueError("Titre de section obligatoire")
        paragraphs=section.get("paragraphs")
        if not isinstance(paragraphs,list) or not paragraphs:
            raise ValueError("Ne jamais supprimer les explications du cours")
        flow.append(Paragraph(html.escape(str(section["heading"])),heading))
        for content in paragraphs:
            if not isinstance(content,str) or not content.strip():
                raise ValueError("Paragraphe vide")
            flow.append(Paragraph(html.escape(content),normal))
        # Tables comparatives optionnelles, jamais remplacées par une image décorative.
        tables=section.get("tables",[])
        if not isinstance(tables,list):
            raise ValueError("Tables : une liste est attendue")
        for spec in tables:
            headers=spec.get("headers") if isinstance(spec,dict) else None
            rows=spec.get("rows") if isinstance(spec,dict) else None
            if not isinstance(headers,list) or not 2<=len(headers)<=3 or not all(isinstance(x,str) and x.strip() for x in headers):
                raise ValueError("Tableau : 2 ou 3 entêtes non vides obligatoires")
            if not isinstance(rows,list) or not rows or any(not isinstance(row,list) or len(row)!=len(headers) for row in rows):
                raise ValueError("Tableau : lignes incomplètes")
            widths=[BODY_W*.28,BODY_W*.72] if len(headers)==2 else [BODY_W*.24,BODY_W*.42,BODY_W*.34]
            head_style=ParagraphStyle("TableHeader",parent=small,fontName="Helvetica-Bold",textColor=colors.white)
            body_style=ParagraphStyle("TableBody",parent=small)
            cells=[[Paragraph(html.escape(str(x)),head_style) for x in headers]]
            for row in rows:
                cells.append([Paragraph(html.escape(str(x)),body_style) for x in row])
            tab=Table(cells,colWidths=widths,repeatRows=1,hAlign="LEFT")
            tab.setStyle(TableStyle([
                ("BACKGROUND",(0,0),(-1,0),purple),
                ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,colors.HexColor("#f8f6fc")]),
                ("GRID",(0,0),(-1,-1),.35,colors.HexColor("#c8b6e5")),
                ("VALIGN",(0,0),(-1,-1),"TOP"),
                ("LEFTPADDING",(0,0),(-1,-1),7),
                ("RIGHTPADDING",(0,0),(-1,-1),7),
                ("TOPPADDING",(0,0),(-1,-1),6),
                ("BOTTOMPADDING",(0,0),(-1,-1),6),
            ]))
            flow.extend([tab,Spacer(1,10)])
        if section.get("figure"):
            info=section["figure"]
            if not isinstance(info,dict) or not info.get("path"):
                raise ValueError("Figure mal déclarée")
            image=(root/info["path"]).resolve()
            if not image.is_relative_to(root):
                raise ValueError("Figure hors du répertoire privé")
            flow.append(Spacer(1,6))
            flow.append(AdaptiveFigure(image,info.get("caption",section["heading"]),
                                       min_width=info.get("min_width_pt",420),
                                       mode=info.get("mode","auto")))
    def footer(canvas,document):
        canvas.saveState()
        canvas.setFont("Helvetica",8)
        canvas.setFillColor(colors.HexColor("#50636d"))
        canvas.drawString(MARGIN,27,title[:60])
        canvas.drawRightString(A4[0]-MARGIN,27,str(document.page))
        canvas.restoreState()
    doc.build(flow,onFirstPage=footer,onLaterPages=footer)
    return path


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--content",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    parser.add_argument("--assets-root",type=Path)
    args=parser.parse_args()
    payload=json.loads(args.content.read_text(encoding="utf8"))
    path=render(payload,args.output,args.assets_root)
    print("Fiche PDF composée : "+str(path))


if __name__=="__main__":
    main()
