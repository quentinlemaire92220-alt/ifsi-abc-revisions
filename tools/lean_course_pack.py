#!/usr/bin/env python3
"""Prépare en local le pack IFSI ABC lean_v1 à partir d'UNE matrice privée validée.

Sortie uniquement privée : fiche complète, synthèse A4 une page, QCM PDF + JSON,
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

VERSION = "lean_v1.0"
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
    panels = data.get("summaryPanels")
    if not isinstance(panels, list) or not 1 <= len(panels) <= 5:
        raise ValueError("Synthèse A4 : fournir 1 à 5 panneaux pédagogiques")
    chosen = set()
    for p in panels:
        if not isinstance(p.get("heading"), str) or not str(p.get("body", "")).strip():
            raise ValueError("Panneau de synthèse sans titre/explication")
        if not p.get("notionIds"):
            raise ValueError("Panneau de synthèse sans notion rattachée")
        chosen.update(p["notionIds"])
        if p.get("figure"):
            checked_asset(assets, p["figure"]["path"])
    if not chosen or not chosen.issubset(set(ids)):
        raise ValueError("La synthèse ne peut référencer de notion absente du cours")
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
    return len(ids), len(chosen)


def render_summary(data, dest, assets):
    c = canvas.Canvas(str(dest), pagesize=A4, pageCompression=1, invariant=1)
    c.setTitle(data["title"] + " — Synthèse infographiée")
    c.setFillColor(PURPLE)
    c.roundRect(MARGIN, H - 94, W - 2*MARGIN, 60, 12, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    title = str(data["title"])
    if c.stringWidth(title, "Helvetica-Bold", 18) > W-2*MARGIN-24:
        raise ValueError("Titre trop long pour le bandeau de synthèse")
    c.drawString(MARGIN+13, H-60, title)
    c.setFont("Helvetica", 12)
    c.drawString(MARGIN+13, H-79, "L'essentiel en une page — synthèse infographiée")
    y = H-112
    body_style = ParagraphStyle("text", fontName="Helvetica", fontSize=10.2, leading=14.4, textColor=INK)
    for index, p in enumerate(data["summaryPanels"], 1):
        fig = p.get("figure")
        image_w, image_h = 0, 0
        if fig:
            path, iw, ih = checked_asset(assets, fig["path"])
            image_w = 158
            image_h = image_w * ih/iw
            if image_h > 148:
                image_h = 148
                image_w = image_h*iw/ih
        text_w = W-2*MARGIN-32-(image_w+14 if fig else 0)
        paragraph = Paragraph(html.escape(p["body"]),body_style)
        tw,th = paragraph.wrap(text_w, H)
        height = max(th+45, image_h+27, 88)
        if y-height < 69:
            raise ValueError("La synthèse dépasse une page A4 : réduire les panneaux ou proposer un arbitrage")
        c.setFillColor(PALE if index%2 else colors.HexColor("#eaf6f8"))
        c.roundRect(MARGIN,y-height,W-2*MARGIN,height-7,10,stroke=0,fill=1)
        c.setFillColor(PURPLE)
        c.setFont("Helvetica-Bold",12.5)
        heading=f"{index:02d}  {p['heading']}"
        if c.stringWidth(heading,"Helvetica-Bold",12.5) > W-2*MARGIN-30:
            raise ValueError("Titre de panneau trop long")
        c.drawString(MARGIN+12,y-23,heading)
        paragraph.drawOn(c,MARGIN+12,y-42-th)
        if fig:
            c.drawImage(str(path),W-MARGIN-12-image_w,y-31-image_h,
                        width=image_w,height=image_h, preserveAspectRatio=True,mask="auto")
        y -= height+9
    c.setFillColor(TEAL)
    c.setFont("Helvetica",9)
    c.drawString(MARGIN,36,"IFSI ABC · Synthèse issue d'une matrice sourcée · REVUE PRIVÉE")
    c.save()
    with fitz.open(dest) as pdf:
        if len(pdf)!=1 or abs(pdf[0].rect.width-W)>2 or abs(pdf[0].rect.height-H)>2:
            raise ValueError("Contrôle PDF : synthèse non conforme à une page A4")
        if not pdf[0].get_text().strip():
            raise ValueError("Synthèse sans texte exploitable")


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
    notions, selected=validate_source(data,assets)
    used=set()
    for entry in data["sections"]+data["summaryPanels"]:
        if entry.get("figure"):used.add(entry["figure"]["path"])
    figure_hashes={p:digest(checked_asset(assets,p)[0]) for p in sorted(used)}
    key=hashlib.sha256(canonical({"version":VERSION,"data":data,"figures":figure_hashes})).hexdigest()
    files={"classic":"Fiche_Revision.pdf","summary":"Synthese_Infographiee_A4.pdf",
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
    render_summary(data,out/files["summary"],assets)
    render_qcm(data,out/files["qcmPdf"])
    (out/files["qcmJson"]).write_text(json.dumps(data["qcmQuestions"],ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    (out/files["flashcardsJson"]).write_text(json.dumps(data["flashcards"],ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    with fitz.open(out/files["classic"]) as pdf:
        text="\n".join(page.get_text() for page in pdf)
        for s in data["sections"]:
            if s["heading"] not in text:
                raise ValueError("Le PDF de la fiche a perdu une section : "+s["heading"])
    result={"packFormat":"lean_v1","status":"DRAFT_REVIEW_ONLY","cacheKey":key,
            "notions":notions,"summarySelectedNotions":selected,
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
