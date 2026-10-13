#!/usr/bin/env python3
"""Private/local PDF layout triage. Does not validate medical accuracy."""
import argparse
import hashlib
import json
from pathlib import Path
import fitz


def audit(path: Path, max_unused_ratio=0.38):
    result = {"version": 1, "document_hash": hashlib.sha256(path.read_bytes()).hexdigest(),
              "pages": [], "warnings": [], "status": "PASS", "medical_review": "REQUIRED"}
    with fitz.open(path) as pdf:
        for idx, page in enumerate(pdf):
            height = page.rect.height
            footer = height - 55
            text = [fitz.Rect(b[:4]) for b in page.get_text("blocks")
                    if len(b)>4 and isinstance(b[4],str) and b[4].strip()
                    and b[1]<footer and b[3]>55]
            images = [fitz.Rect(i["bbox"]) for i in page.get_image_info(xrefs=True)]
            complex_images = [r for r in images if r.height/height >= .52
                              and r.width/page.rect.width >= .55]
            kind = "complex_full_page_figure" if complex_images else "body_text"
            bottom = max([r.y1 for r in text] +
                         [r.y1 for r in images if r.y0 < footer] + [65.0])
            unused = max(0, (footer-bottom)/height)
            page_info = {"page": idx+1, "type":kind, "unused_ratio":round(unused,3),
                         "figure_count":len(images), "body_present":bool(text)}
            if kind=="body_text" and unused>max_unused_ratio and idx<len(pdf)-1:
                page_info["layout_flag"]="UNDERUSED_TEXT_PAGE"
                result["warnings"].append({"page":idx+1,"issue":"UNDERUSED_TEXT_PAGE",
                                           "unused_ratio":round(unused,3),
                                           "next_page_is_full_figure":False})
            result["pages"].append(page_info)
    for warning in result["warnings"]:
        after=warning["page"]
        if after<len(result["pages"]):
            warning["next_page_is_full_figure"] = result["pages"][after]["type"]=="complex_full_page_figure"
        warning["recommendation"] = ("Vérifier si le visuel complexe doit garder sa page dédiée; ne pas le miniaturiser"
           if warning["next_page_is_full_figure"] else
           "Recomposer les paragraphes; cette page courte n'est pas expliquée par une grande planche immédiatement après")
    result["underused_pages"]=len(result["warnings"])
    result["complex_figure_pages"]=sum(p["type"]=="complex_full_page_figure" for p in result["pages"])
    return result


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--pdf",type=Path,required=True)
    parser.add_argument("--report",type=Path,required=True)
    parser.add_argument("--max-unused",type=float,default=.38)
    parser.add_argument("--fail-on-underused",action="store_true")
    args=parser.parse_args()
    try:
        if not (.05<=args.max_unused<=.75): raise ValueError("Seuil invalide")
        result=audit(args.pdf,args.max_unused)
        if args.fail_on_underused and result["underused_pages"]:
            result["status"]="FAIL"
    except Exception as exc:
        result={"version":1,"status":"FAIL","errors":[str(exc)],"medical_review":"REQUIRED"}
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("LAYOUT_AUDIT {} : {} pages texte peu remplies, {} pages d'infographies complexes".format(
        result["status"],result.get("underused_pages","?"),result.get("complex_figure_pages","?")))
    return 0 if result["status"]=="PASS" else 1


if __name__=="__main__":
    raise SystemExit(main())
