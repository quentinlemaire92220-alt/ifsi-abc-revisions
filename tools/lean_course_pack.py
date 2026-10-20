#!/usr/bin/env python3
"""Prépare en local le pack IFSI ABC lean_v1 à partir d'UNE matrice privée validée.

Sortie uniquement privée : fiche complète, cours infographié complet multipage, QCM PDF + JSON,
flashcards JSON. La qualité clinique/visuelle et le GO publication restent humains.
Ne contacte ni GitHub, ni Drive, ni Work. Aucun export d'image automatique.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
from pathlib import Path

import fitz
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, PageBreak, Spacer

from revision_compose import render as render_classic
from revision_course_pack import checked_asset, digest

VERSION = "lean_v1.1-complete-infographic"
PURPLE = colors.HexColor("#5b46a3")
TEAL = colors.HexColor("#0e93ac")
INK = colors.HexColor("#192937")
PALE = colors.HexColor("#f1effa")
MARGIN = 35
W, H = A4


def canonical(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def validate_source(data, assets):
    if not isinstance(data, dict) or not str(data.get("title", "")).strip():
        raise ValueError("Titre du cours manquant")
    notions = data.get("notions")
    if not isinstance(notions, list) or not notions:
        raise ValueError("Matrice des notions avec ID et source officielle obligatoire")
    ids = [n.get("id") for n in notions if isinstance(n, dict)]
    if (len(ids) != len(notions) or any(not isinstance(i, str) or not i for i in ids)
            or len(set(ids)) != len(ids)
            or any(not str(n.get("sourcePage", "")).strip() for n in notions)):
        raise ValueError("Notions sans ID unique ou référence de page source")
    sections = data.get("sections")
    if not isinstance(sections, list) or not sections:
        raise ValueError("Fiche classique : sections absentes")
    mapped = set()
    for s in sections:
        if not str(s.get("heading", "")).strip() or not s.get("paragraphs"):
            raise ValueError("Section sans titre ou paragraphes explicatifs")
        if not all(isinstance(p, str) and p.strip() for p in s["paragraphs"]):
            raise ValueError("Explications incomplètes")
        if s.get("complexBlocks"):
            raise ValueError("Tableau ou formule complexe non géré : utiliser un moteur sans perte")
        mapped.update(s.get("notionIds", []))
        if s.get("figure"):
            checked_asset(assets, s["figure"]["path"])
    if mapped != set(ids):
        raise ValueError("La fiche classique doit couvrir toutes les notions de la matrice")
    panels = data.get("infographicPanels")
    if not isinstance(panels, list) or not panels:
        raise ValueError("Cours complet infographié : panneaux pédagogiques absents")
    chosen = set()
    for p in panels:
        if not isinstance(p.get("heading"), str) or not str(p.get("body", "")).strip():
            raise ValueError("Panneau de synthèse sans titre/explication")
        if not p.get("notionIds"):
            raise ValueError("Panneau de synthèse sans notion rattachée")
        chosen.update(p["notionIds"])
        if p.get("figure"):
            checked_asset(assets, p["figure"]["path"])
    if chosen != set(ids):
        raise ValueError("Le cours complet infographié doit couvrir toutes les notions de la matrice")
    questions = data.get("qcmQuestions")
    cards = data.get("flashcards")
    if not isinstance(questions, list) or not questions or not isinstance(cards, list) or not cards:
        raise ValueError("QCM et flashcards sont obligatoires dans le pack lean")
    qids = set()
    for q in questions:
        if not q.get("id") or q["id"] in qids or not q.get("question") or not q.get("theme"):
            raise ValueError("QCM : ID unique, thème et question obligatoires")
        qids.add(q["id"])
        if len(q.get("choices", [])) != 5 or not all(str(x).strip() for x in q["choices"]):
            raise ValueError("QCM : 5 propositions A-E obligatoires")
        answers = q.get("answers", [])
        if not isinstance(answers, list) or not 1 <= len(answers) <= 3 or len(set(answers)) != len(answers):
            raise ValueError("QCM : 1 à 3 réponses distinctes")
        if not all(isinstance(x, int) and not isinstance(x, bool) and 0 <= x <= 4 for x in answers):
            raise ValueError("QCM : indices des réponses incorrects")
        if q.get("announcedCorrectCount") != len(answers):
            raise ValueError("QCM : nombre annoncé de réponses contradictoire")
        if q.get("difficulty") not in {"easy", "medium", "hard"} or len(str(q.get("explanation", ""))) < 26:
            raise ValueError("QCM : difficulté ou corrigé argumenté absent")
    seen = set()
    for card in cards:
        if not card.get("id") or card["id"] in seen or not str(card.get("front", "")).strip().endswith("?"):
            raise ValueError("Flashcard : ID unique et question autonome exigés")
        seen.add(card["id"])
        if not card.get("answers") or not all(str(x).strip() for x in card["answers"]) or not card.get("explanation"):
            raise ValueError("Flashcard : réponse/explication manquante")
        if card.get("qid") not in qids:
            raise ValueError("Flashcard : question QCM source (qid) introuvable")
    return len(ids), len(chosen)


def render_infographic(data, dest, assets):
    """Compose un vrai cours infographié exhaustif en pages A4, sans troncature."""
    from reportlab.platypus import KeepTogether, Image, HRFlowable
    heading_style = ParagraphStyle("infographic_heading", fontName="Helvetica-Bold",
        fontSize=13.2, leading=17.3, textColor=PURPLE, spaceBefore=12, spaceAfter=7)
    body_style = ParagraphStyle("infographic_body", fontName="Helvetica",
        fontSize=10.3, leading=15, textColor=INK, spaceAfter=8)
    source_style = ParagraphStyle("infographic_source", fontName="Helvetica",
        fontSize=8.5, leading=11.8, textColor=TEAL, spaceAfter=9)
    title_style = ParagraphStyle("infographic_title", fontName="Helvetica-Bold",
        fontSize=19, leading=24, textColor=PURPLE, spaceAfter=13)
    story = [
        Paragraph(html.escape(data["title"]),title_style),
        Paragraph("Cours complet infographié — toutes les notions de la matrice sont reprises.",body_style)
    ]
    for index,panel in enumerate(data["infographicPanels"],1):
        heading=Paragraph(html.escape(f"{index:02d} — {panel['heading']}"),heading_style)
        intro=Paragraph(html.escape(panel["body"]),body_style)
        figure=panel.get("figure")
        parts=[heading,intro]
        if figure:
            path,iw,ih=checked_asset(assets,figure["path"])
            max_w=W-2*MARGIN-20
            max_h=410
            scale=min(max_w/iw,max_h/ih,1)
            width,height=iw*scale,ih*scale
            parts.append(Image(str(path),width=width,height=height,hAlign="CENTER"))
            if figure.get("caption"):
                parts.append(Paragraph(html.escape(figure["caption"]),source_style))
        if panel.get("sourcePages"):
            parts.append(Paragraph("Source officielle : "+html.escape(", ".join(map(str,panel["sourcePages"]))),source_style))
        parts.append(HRFlowable(width="100%",thickness=.6,color=TEAL))
        story += parts
        story.append(Spacer(1,10))
    doc=SimpleDocTemplate(str(dest),pagesize=A4,leftMargin=MARGIN,
        rightMargin=MARGIN,topMargin=48,bottomMargin=47,
        title=data["title"]+" — Cours complet infographié",invariant=1)
    def decorate(canvas,document):
        canvas.saveState()
        canvas.setStrokeColor(TEAL)
        canvas.line(MARGIN,H-31,W-MARGIN,H-31)
        canvas.setFillColor(INK)
        canvas.setFont("Helvetica",8)
        canvas.drawString(MARGIN,23,"IFSI ABC · Cours complet infographié · REVUE PRIVÉE")
        canvas.drawRightString(W-MARGIN,23,str(document.page))
        canvas.restoreState()
    doc.build(story,onFirstPage=decorate,onLaterPages=decorate)
    with fitz.open(dest) as pdf:
        if len(pdf)<1 or any(abs(p.rect.width-W)>2 or abs(p.rect.height-H)>2 for p in pdf):
            raise ValueError("Cours infographié : format A4 invalide")
        all_text="\n".join(p.get_text() for p in pdf)
        for panel in data["infographicPanels"]:
            if panel["heading"] not in all_text:
                raise ValueError("Cours infographié : panneau perdu : "+panel["heading"])


def render_qcm(data, dest):
    styles={
      "title":ParagraphStyle("t",fontName="Helvetica-Bold",fontSize=17,leading=21,spaceAfter=16,textColor=PURPLE),
      "item":ParagraphStyle("i",fontName="Helvetica-Bold",fontSize=11,leading=15,spaceBefore=13,spaceAfter=7,textColor=INK),
      "body":ParagraphStyle("b",fontName="Helvetica",fontSize=9.6,leading=13,spaceAfter=5,textColor=INK)
    }
    doc=SimpleDocTemplate(str(dest),pagesize=A4,leftMargin=42,rightMargin=42,topMargin=42,bottomMargin=42,invariant=1)
    story=[Paragraph(html.escape(data["title"])+" — QCM",styles["title"])]
    for i,q in enumerate(data["qcmQuestions"],1):
        story.append(Paragraph(f"{i:02d} — "+html.escape(q["question"]),styles["item"]))
        for letter,choice in zip("ABCDE",q["choices"]):
            story.append(Paragraph(letter+" — "+html.escape(choice),styles["body"]))
        story.append(Paragraph(f"Nombre de bonnes réponses : {len(q['answers'])}",styles["body"]))
        story.append(Spacer(1,4))
    story.append(PageBreak())
    story.append(Paragraph("Corrigé argumenté",styles["title"]))
    for i,q in enumerate(data["qcmQuestions"],1):
        letters=", ".join("ABCDE"[j] for j in sorted(q["answers"]))
        story.append(Paragraph(f"{i:02d} — "+letters,styles["item"]))
        story.append(Paragraph(html.escape(q["explanation"]),styles["body"]))
    doc.build(story)


def make_pack(data, assets, out):
    assets=Path(assets).resolve()
    out=Path(out).resolve()
    notions, covered=validate_source(data,assets)
    used=set()
    for entry in data["sections"]+data["infographicPanels"]:
        if entry.get("figure"):used.add(entry["figure"]["path"])
    figure_hashes={p:digest(checked_asset(assets,p)[0]) for p in sorted(used)}
    key=hashlib.sha256(canonical({"version":VERSION,"data":data,"figures":figure_hashes})).hexdigest()
    files={"classic":"Fiche_Revision.pdf","infographic":"Cours_Complet_Infographie.pdf",
           "qcmPdf":"QCM_Corrige.pdf","qcmJson":"QCM.json","flashcardsJson":"Flashcards.json"}
    old=out/"manifest_prive.json"
    if old.exists():
        try:
            saved=json.loads(old.read_text(encoding="utf8"))
            if saved.get("cacheKey")==key and all(
                (out/name).is_file() and digest(out/name)==saved.get("artifactSha256s",{}).get(name)
                for name in files.values()
            ):
                return {**saved,"reusedFromCache":True}
        except (ValueError, OSError, TypeError):
            pass
    out.mkdir(parents=True,exist_ok=True)
    render_classic(data,out/files["classic"],assets)
    render_infographic(data,out/files["infographic"],assets)
    render_qcm(data,out/files["qcmPdf"])
    # Le moteur des flashcards IFSI ABC lit q.flashcards dans les banques QCM.
    # Conserver également l'export cartes autonome pour audit et reprise.
    linked={q["id"]:{**q,"flashcards":list(q.get("flashcards",[]))} for q in data["qcmQuestions"]}
    for card in data["flashcards"]:
        linked[card["qid"]]["flashcards"].append({
            "front":card["front"],"answers":card["answers"],
            "explanation":card["explanation"],"kind":"Cours",
            "atomic":True,"preserveFront":True
        })
    (out/files["qcmJson"]).write_text(json.dumps(list(linked.values()),ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    (out/files["flashcardsJson"]).write_text(json.dumps(data["flashcards"],ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    with fitz.open(out/files["classic"]) as pdf:
        text="\n".join(page.get_text() for page in pdf)
        for s in data["sections"]:
            if s["heading"] not in text:
                raise ValueError("Le PDF de la fiche a perdu une section : "+s["heading"])
    result={"packFormat":"lean_v1","status":"DRAFT_REVIEW_ONLY","cacheKey":key,
            "notions":notions,"infographicCoveredNotions":covered,
            "files":files,"sourceFiguresReused":figure_hashes,
            "artifactSha256s":{name:digest(out/name) for name in files.values()},
            "medicalReview":"REQUIRED","visualReview":"REQUIRED","publicationApproval":"NOT_GRANTED"}
    old.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    return result


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--content",type=Path,required=True,help="Matrice privée JSON validée")
    parser.add_argument("--assets-root",type=Path,required=True)
    parser.add_argument("--out",type=Path,required=True)
    opts=parser.parse_args()
    data=json.loads(opts.content.read_text(encoding="utf8"))
    result=make_pack(data,opts.assets_root,opts.out)
    print("IFSI ABC lean_v1 : "+("réemploi du cache vérifié" if result.get("reusedFromCache") else "production locale privée")
          +", "+str(result["notions"])+" notions ; GO publication non accordé.")


if __name__=="__main__":
    main()
