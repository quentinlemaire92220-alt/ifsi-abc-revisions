#!/usr/bin/env python3
"""Offline pilot: compose two revision PDFs from ONE private source/figure set.

No clinical facts are generated here. All figure sources, labels, explanatory
paragraphs and any likeness image must be provided and approved by the author.
No student Drive or GitHub publication is performed by this command.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Image, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from revision_compose import render as render_classic

INK=colors.HexColor("#153a48")
SEA=colors.HexColor("#11637a")
MINT=colors.HexColor("#e8f4ed")
SAND=colors.HexColor("#fff1d8")
IVORY=colors.HexColor("#fffaf1")
MARGIN=37
CONTENT=A4[0]-2*MARGIN


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def checked_asset(root,relative):
    if not isinstance(relative,str) or not relative:
        raise ValueError("Nom d'image absent")
    path=(root/relative).resolve()
    if not path.is_relative_to(root) or not path.is_file():
        raise ValueError("Image manquante ou hors des sources privées: "+relative)
    with PILImage.open(path) as im:
        im.verify()
    with PILImage.open(path) as im:
        w,h=im.size
    if w<500 or h<300:
        raise ValueError("Illustration source insuffisante pour le PDF: "+relative)
    return path,w,h


def box(text,title,background):
    style=ParagraphStyle("box",fontName="Helvetica",fontSize=9.8,leading=14,
                         textColor=INK)
    from xml.sax.saxutils import escape
    content=Paragraph("<b>"+escape(title)+"</b>  "+escape(text),style)
    table=Table([[content]],colWidths=[CONTENT-20],hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),background),
        ("BOX",(0,0),(-1,-1),.5,colors.HexColor("#d9dddb")),
        ("LEFTPADDING",(0,0),(-1,-1),11),
        ("RIGHTPADDING",(0,0),(-1,-1),11),
        ("TOPPADDING",(0,0),(-1,-1),9),
        ("BOTTOMPADDING",(0,0),(-1,-1),9)
    ]))
    return table


def render_visual(payload,output,root,guide):
    from xml.sax.saxutils import escape
    title=str(payload["title"])
    style_title=ParagraphStyle("title",fontName="Helvetica-Bold",fontSize=19,leading=23,
                                textColor=SEA,spaceAfter=10)
    style_head=ParagraphStyle("section",fontName="Helvetica-Bold",fontSize=13,leading=17,
                               textColor=SEA,spaceBefore=13,spaceAfter=5,keepWithNext=True)
    style_body=ParagraphStyle("body",fontName="Helvetica",fontSize=9.4,leading=13.7,
                               textColor=INK,spaceAfter=6)
    doc=SimpleDocTemplate(str(output),pagesize=A4,leftMargin=MARGIN,rightMargin=MARGIN,
                          topMargin=43,bottomMargin=46,title=title,
                          pageCompression=1,invariant=1)
    story=[Paragraph(escape(title)+" — Fiche complète infographiée",style_title),
           Paragraph("Schémas et explications issus de la matrice pédagogique validée.",style_body)]
    if guide:
        # Le guide autorisé est INSÉRÉ sans générer de nouvelle ressemblance.
        _,w,h=checked_asset(root,str(payload["guideImage"]))
        width=min(85,85*w/max(w,h))
        story.append(Image(str(guide),width=width,height=width*h/w,hAlign="RIGHT"))
    for index,section in enumerate(payload["sections"],1):
        story.append(Paragraph(f"{index:02d}  "+escape(section["heading"]),style_head))
        figure=section.get("figure")
        if figure:
            source,w,h=checked_asset(root,figure["path"])
            caption=escape(figure.get("caption") or section["heading"])
            width=min(CONTENT-28, max(240, 340 if h>w else 420),
                      (A4[1]-170)*w/h)
            if width<200: raise ValueError("Figure trop haute: scinder le panneau")
            story.append(Image(str(source),width=width,height=width*h/w,hAlign="CENTER"))
            story.append(Paragraph("<i>"+caption+"</i>",style_body))
        for paragraph in section["paragraphs"]:
            story.append(Paragraph(escape(paragraph),style_body))
        if section.get("conceptualPanel"):
            rows=[]
            for item in section["conceptualPanel"]:
                rows.append([
                  Paragraph("<b>"+escape(item["label"])+"</b>",style_body),
                  Paragraph(escape(item["detail"]),style_body)
                ])
            conceptual=Table(rows,colWidths=[CONTENT*.29,CONTENT*.71],hAlign="LEFT",repeatRows=0)
            conceptual.setStyle(TableStyle([
              ("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#edf5f7")),
              ("ROWBACKGROUNDS",(0,0),(-1,-1),[colors.HexColor("#edf5f7"),IVORY]),
              ("VALIGN",(0,0),(-1,-1),"TOP"),
              ("GRID",(0,0),(-1,-1),.4,colors.HexColor("#d5e2e3")),
              ("LEFTPADDING",(0,0),(-1,-1),9),
              ("RIGHTPADDING",(0,0),(-1,-1),9),
              ("TOPPADDING",(0,0),(-1,-1),8),
              ("BOTTOMPADDING",(0,0),(-1,-1),8),
            ]))
            story.append(conceptual)
        if section.get("takeaway"):
            story.append(box(section["takeaway"],"À RETENIR",MINT))
        if section.get("trap"):
            story.append(box(section["trap"],"PIÈGES QCM",SAND))
        story.append(Spacer(1,9))
    def draw_page(canvas,document):
        canvas.saveState()
        canvas.setFillColor(IVORY)
        canvas.rect(0,0,A4[0],A4[1],fill=1,stroke=0)
        canvas.setStrokeColor(SEA)
        canvas.setLineWidth(2)
        canvas.line(MARGIN,A4[1]-29,A4[0]-MARGIN,A4[1]-29)
        canvas.setFillColor(SEA)
        canvas.setFont("Helvetica",8)
        canvas.drawString(MARGIN,23,"IFSI ABC · Fiche complète infographiée · Revue privée")
        canvas.drawRightString(A4[0]-MARGIN,23,str(document.page))
        canvas.restoreState()
    doc.build(story,onFirstPage=draw_page,onLaterPages=draw_page)


def make_pack(payload,root,out):
    root=Path(root).resolve()
    out=Path(out).resolve()
    sections=payload.get("sections")
    if not isinstance(sections,list) or not sections:
        raise ValueError("Sections de cours absentes")
    for s in sections:
        if not str(s.get("heading","")).strip() or not isinstance(s.get("paragraphs"),list) or not s["paragraphs"]:
            raise ValueError("Une section a perdu son titre ou ses explications")
        if any(not isinstance(p,str) or not p.strip() for p in s["paragraphs"]):
            raise ValueError("Paragraphe invalide")
        if s.get("complexBlocks"):
            raise ValueError("Tableaux/formules complexes: utiliser un générateur sans perte, pas ce pilote")
        if s.get("figure"):
            checked_asset(root,s["figure"]["path"])
    count_figures=sum(bool(s.get("figure")) for s in sections)
    if count_figures==0:
        if payload.get("schematics")!="none":
            raise ValueError("Absence de figures : déclarer explicitement schematics=none")
        rationale=payload.get("schematicsJustification")
        if not isinstance(rationale,str) or len(rationale.strip())<30:
            raise ValueError("L'absence de figures individuelles nécessite une justification pédagogique")
        if not any(s.get("conceptualPanel") for s in sections):
            raise ValueError("La fiche complète infographiée sans figures doit comporter un véritable panneau conceptuel")
    elif payload.get("schematics")=="none":
        raise ValueError("Images présentes alors que schematics=none")
    for section in sections:
        if "conceptualPanel" in section:
            panel=section["conceptualPanel"]
            if not isinstance(panel,list) or not (2<=len(panel)<=8):
                raise ValueError("Panneau conceptuel : fournir entre 2 et 8 notions")
            for item in panel:
                if not isinstance(item,dict) or not isinstance(item.get("label"),str) or not item["label"].strip() or not isinstance(item.get("detail"),str) or not item["detail"].strip():
                    raise ValueError("Panneau conceptuel : chaque notion doit contenir label et detail")
    guide=None
    if payload.get("guideImage"):
        guide=checked_asset(root,payload["guideImage"])[0]
    if payload.get("requireGuide") and not guide:
        raise ValueError("Portrait-guide validé obligatoire, mais fichier non fourni")
    out.mkdir(parents=True,exist_ok=True)
    klass=out/"Fiche_Revision.pdf"
    graphic=out/"Fiche_Complete_Infographiee.pdf"
    render_classic(payload,klass,root)
    render_visual(payload,graphic,root,guide)
    exports=out/"04_Infographies"
    exports.mkdir(exist_ok=True)
    items=[]
    for n,s in enumerate(sections,1):
        fig=s.get("figure")
        if not fig: continue
        image=checked_asset(root,fig["path"])[0]
        dest=exports/(f"Infographie_{n:02d}"+image.suffix.lower())
        shutil.copyfile(image,dest)
        items.append({"section":n,"sourceSha256":digest(image),"export":dest.name,
                      "exportSha256":digest(dest)})
        if items[-1]["sourceSha256"]!=items[-1]["exportSha256"]:
            raise ValueError("Export figure altéré")
    report={"status":"DRAFT_REVIEW_ONLY","classic":{"name":klass.name,"sha256":digest(klass)},
            "completeInfographic":{"name":graphic.name,"sha256":digest(graphic)},
            "reusedFigures":items,"schematics":payload.get("schematics","with_figures"),
            "schematicsJustification":payload.get("schematicsJustification") if count_figures==0 else None,
            "conceptualPanels":sum(bool(s.get("conceptualPanel")) for s in sections),
            "disciplinaryReview":"REQUIRED",
            "medicalReview":"REQUIRED" if count_figures else "NOT_APPLICABLE",
            "publisherApproval":"NOT_GRANTED"}
    (out/"manifest_privé.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    return report


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--content",type=Path,required=True)
    parser.add_argument("--assets-root",type=Path,required=True)
    parser.add_argument("--out",type=Path,required=True)
    args=parser.parse_args()
    report=make_pack(json.loads(args.content.read_text(encoding="utf8")),args.assets_root,args.out)
    print("Pack privé: 2 PDF et "+str(len(report["reusedFigures"]))+" figure(s) réutilisée(s). Revue médicale et GO publication requis.")


if __name__=="__main__":
    main()
