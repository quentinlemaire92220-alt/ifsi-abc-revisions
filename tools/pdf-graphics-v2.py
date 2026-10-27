#!/usr/bin/env python3
"""IFSI ABC — Visual V2 gate for real PDF bytes (PyMuPDF).
Checks measurable properties; NEVER substitutes for page-by-page human review.
Not a generator, cannot set human approval flags.
"""
import argparse, json, math, re, statistics, sys
from pathlib import Path
import fitz

VIOLET = (0.31, 0.15, 0.48)
A4 = (595.28, 841.89)
ORDER = ("pièges qcm", "synthèse générale", "définitions et mots-clés")
TECHNICAL = re.compile(r"(?i)\b(?:brouillon|à valider|non publié|sourceSha256|rapport QA|DRAFT_REVIEW_ONLY|génération v\d)\b")

def violet(rgb):
    if not rgb or len(rgb) < 3: return False
    r,g,b=rgb[:3]
    return b > g+0.12 and r > g+0.06 and 0.16 < b < 0.85 and g < 0.42

def regions(page):
    found=[]
    for drawing in page.get_drawings():
        fill=drawing.get("fill")
        if not violet(fill): continue
        rect=drawing.get("rect")
        if rect and rect.width >= page.rect.width*.77 and rect.height >= 9:
            found.append(rect)
    return found

def vector_squares(page):
    squares=[]
    for d in page.get_drawings():
        for itm in d.get("items",()):
            if itm[0] == "re":
                rect=itm[1]
                if 6 <= rect.width <= 16 and 6 <= rect.height <= 16:
                    squares.append(rect)
    return squares

def ordered_sections(pages):
    text="\n".join(p.get_text() for p in pages).lower()
    positions=[text.find(s) for s in ORDER]
    if all(p >= 0 for p in positions) and positions == sorted(positions) and text.count(ORDER[0])==1:
        return True
    # A sommaire and introductory navigation may legitimately repeat the words.
    # The actual three section headings must nevertheless appear ONCE, in order.
    # Validate their bookmark destinations AND their real large-type headings;
    # never accept merely a table of contents that points to missing content.
    toc=pages.get_toc() if hasattr(pages,"get_toc") else []
    roots=[(name.lower(),pg) for level,name,pg in toc if level==1]
    matches=[(key,pg) for name,pg in roots for key in ORDER if key in name]
    if len(matches)!=len(ORDER) or [x[0] for x in matches]!=list(ORDER):
        return False
    for key,pg in matches:
        if not 1<=pg<=len(pages):return False
        found=0
        page=pages[pg-1]
        for block in page.get_text("dict").get("blocks",[]):
            for line in block.get("lines",[]):
                spans=line.get("spans",[])
                title=" ".join(x.get("text","") for x in spans).lower()
                if key in title and any(x.get("size",0)>=13 for x in spans):
                    found+=1
        if found!=1:return False
    return True

def validate(path, kind="revision", min_body_pt=9, expect_pages=None, check_checkbox=True):
    errors=[]; pages_out=[]
    with fitz.open(path) as doc:
        if not doc or (expect_pages is not None and len(doc)!=expect_pages):
            errors.append("PAGE_COUNT")
        for ix,page in enumerate(doc):
            pe=[]; page_no=ix+1
            w,h=page.rect.width,page.rect.height
            if abs(w-A4[0])>2 or abs(h-A4[1])>2: pe.append("NOT_A4")
            b=regions(page)
            if not any(r.y0 <= 67 and r.y1 <= 100 for r in b): pe.append("PURPLE_TOP_MISSING")
            if not any(r.y0 >= h-100 and r.y1 >= h-10 for r in b): pe.append("PURPLE_BOTTOM_MISSING")
            if page.get_images(full=True): pe.append("RASTER_IMAGE_PRESENT")
            lines=[]; bodies=[]; choices=[]
            raw=page.get_text("dict")
            for block in raw.get("blocks",[]):
                if block.get("type")!=0: continue
                for line in block.get("lines",[]):
                    for span in line.get("spans",[]):
                        txt=span.get("text","").strip()
                        if not txt: continue
                        r=fitz.Rect(span.get("bbox"))
                        if r.x0 < 16 or r.x1 > w-16 or r.y0 < 2 or r.y1 > h-2:
                            pe.append("TEXT_OUT_OF_BOUNDS")
                        if TECHNICAL.search(txt): pe.append("TECHNICAL_MARKER")
                        if 100 < r.y0 < h-105:
                            bodies.append(span["size"])
                            if span["size"] < min_body_pt: pe.append("FONT_TOO_SMALL")
                        lines.append((txt,r))
                        if kind=="qcm" and re.match(r"^[A-E]\.\s",txt): choices.append((txt,r))
            if not lines: pe.append("NOT_SELECTABLE")
            if kind=="qcm" and choices and check_checkbox:
                squares=vector_squares(page)
                for txt,rect in choices:
                    if not any(sq.x1 <= rect.x0+2 and 1 <= rect.x0-sq.x1 <= 22
                       and abs((sq.y0+sq.y1)/2-(rect.y0+rect.y1)/2) < 9 for sq in squares):
                        pe.append("CHECKBOX_MISSING_LEFT_OF_CHOICE")
                        break
            errors.extend(f"p{page_no}:{code}" for code in sorted(set(pe)))
            pages_out.append({"page":page_no,"violations":sorted(set(pe)),
                              "purple_bands":len(b),"choices_checked":len(choices)})
        if kind=="revision" and not ordered_sections(doc):
            errors.append("SECTION_ORDER_OR_DUPLICATION")
        if kind=="qcm":
            full="\n".join(p.get_text().lower() for p in doc)
            if "corrigés" not in full: errors.append("QCM_ANSWER_SECTION_MISSING")
    return {"file":str(path),"type":kind,"page_count":len(pages_out),
            "status":"PASS" if not errors else "FAIL","errors":errors,
            "pages":pages_out,"human_graphic_review_required":True}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("pdf",type=Path)
    p.add_argument("--kind",choices=["revision","qcm","flashcards"],default="revision")
    p.add_argument("--expected-pages",type=int)
    p.add_argument("--min-body-pt",type=float,default=9.)
    p.add_argument("--report",type=Path)
    args=p.parse_args()
    result=validate(args.pdf,args.kind,args.min_body_pt,args.expected_pages)
    if args.report:
        args.report.parent.mkdir(parents=True,exist_ok=True)
        args.report.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps({k:v for k,v in result.items() if k!="pages"},ensure_ascii=False))
    return 0 if result["status"]=="PASS" else 1

if __name__=="__main__":sys.exit(main())
