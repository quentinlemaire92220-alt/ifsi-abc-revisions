#!/usr/bin/env python3
"""Fail-closed structural infographic gate for a local PDF.

The gate never fetches private Drive files and cannot validate medical accuracy.
Keep the input PDF, manifest and full report in a private/local workspace.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys

try:
    import fitz
except ImportError as exc:
    raise SystemExit("PyMuPDF requis : python -m pip install pymupdf==1.26.7") from exc


def normalized(rect, page):
    if not isinstance(rect, list) or len(rect) != 4 or not all(isinstance(x, (int, float)) for x in rect):
        raise ValueError("region doit être une liste de 4 nombres normalisés")
    x0, y0, x1, y1 = rect
    if not (0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1):
        raise ValueError("region invalide : coordonnées entre 0 et 1, x0<x1 et y0<y1")
    b = page.rect
    return fitz.Rect(b.x0 + x0*b.width, b.y0 + y0*b.height, b.x0 + x1*b.width, b.y0 + y1*b.height)


def intersection_ratio(a, b):
    i = a & b
    return i.get_area()/b.get_area() if not i.is_empty and b.get_area() else 0.0


def relative_ink(page, rect):
    # Detect an entirely blank region, NOT an incorrect medical diagram.
    pix = page.get_pixmap(matrix=fitz.Matrix(.65, .65), clip=rect, alpha=False, colorspace=fitz.csRGB)
    samples = pix.samples
    total = max(1, pix.width * pix.height)
    nonwhite = sum(1 for k in range(0, len(samples), pix.n) if min(samples[k:k+3]) < 235)
    return nonwhite / total


def analyze(pdf_path, manifest, render_dir=None):
    report = {"version": 1, "pdf_sha256": hashlib.sha256(pdf_path.read_bytes()).hexdigest(),
              "medical_validation": "NOT_AUTOMATICALLY_VERIFIED", "figures": [], "errors": [], "warnings": []}
    with fitz.open(pdf_path) as doc:
        report["pages"] = len(doc)
        if not doc.is_pdf or doc.needs_pass:
            report["errors"].append("Le fichier doit être un PDF lisible non chiffré")
            return report
        expected_pages = manifest.get("expected_pages")
        if expected_pages is not None and (type(expected_pages) is not int or expected_pages != len(doc)):
            report["errors"].append(f"Nombre de pages inattendu : {len(doc)} (attendu {expected_pages})")
        figures = manifest.get("figures")
        if not isinstance(figures, list) or not figures:
            report["errors"].append("Manifest sans figures : aucune preuve de couverture. Prévoir un flux distinct pour les cours sans schéma.")
            return report
        ids = [x.get("id") for x in figures if isinstance(x, dict)]
        if len(set(ids)) != len(figures) or any(not isinstance(x, str) or not x.strip() for x in ids):
            report["errors"].append("Identifiants de figures absents ou en doublon")
        for index, figure in enumerate(figures, 1):
            result = {"id": figure.get("id", f"figure_{index}") if isinstance(figure, dict) else f"figure_{index}",
                      "passed": False, "checks": []}
            report["figures"].append(result)
            try:
                if not isinstance(figure, dict):
                    raise ValueError("Entrée figure invalide")
                page_index = figure.get("page")
                if type(page_index) is not int or not 1 <= page_index <= len(doc):
                    raise ValueError("Page cible absente ou hors PDF (numérotation 1-based)")
                if not str(figure.get("source_ref", "")).strip():
                    raise ValueError("Référence source manquante dans la matrice")
                if not str(figure.get("anchor", "")).strip():
                    raise ValueError("Titre/repère de section manquant dans la matrice")
                page = doc[page_index-1]
                rect = normalized(figure.get("region"), page)
                full_text = " ".join(page.get_text().casefold().split())
                anchor = " ".join(str(figure["anchor"]).casefold().split())
                if anchor not in full_text:
                    raise ValueError("Le repère de section attendu est absent de cette page")
                result["checks"].append("section_present")
                ink = relative_ink(page, rect)
                result["ink_ratio"] = round(ink, 3)
                if ink < .025:
                    raise ValueError("Zone quasi blanche : infographie potentiellement absente")
                result["checks"].append("non_blank_render")
                rasters = []
                for im in page.get_image_info(xrefs=True):
                    bbox = fitz.Rect(im["bbox"])
                    coverage = intersection_ratio(bbox, rect)
                    if coverage >= .16:
                        dpi = min(72*im["width"]/max(.1, bbox.width),
                                  72*im["height"]/max(.1, bbox.height))
                        if dpi >= 95:
                            rasters.append((coverage, dpi))
                paths = [fitz.Rect(x["rect"]) for x in page.get_drawings()]
                vector_hits = [r for r in paths if intersection_ratio(r, rect) >= .002]
                kind = figure.get("kind", "auto")
                if kind not in ("auto", "raster", "vector"):
                    raise ValueError("kind doit être auto, raster ou vector")
                raster_ok = bool(rasters)
                vector_ok = len(vector_hits) >= 5
                if (kind == "raster" and not raster_ok) or (kind == "vector" and not vector_ok) or (
                    kind == "auto" and not (raster_ok or vector_ok)
                ):
                    raise ValueError("Infographie trop petite/floue, absente ou composée seulement de texte/encadrés (preuve géométrique insuffisante)")
                result["detected"] = "raster" if raster_ok else "vector"
                result["checks"].append("visible_graphic_with_sufficient_area")
                result["page"] = page_index
                if render_dir:
                    render_dir.mkdir(parents=True, exist_ok=True)
                    page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False).save(str(render_dir / f"page-{page_index:03d}.png"))
                result["passed"] = True
            except Exception as exc:
                result["errors"] = [str(exc)]
                report["errors"].append(f"{result['id']}: {exc}")
    report["expected_count"] = len(report["figures"])
    report["passed_count"] = sum(1 for x in report["figures"] if x["passed"])
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description="Contrôle structurel local des infographies intégrées dans un PDF")
    parser.add_argument("--pdf", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--render-dir", type=Path)
    args = parser.parse_args(argv)
    try:
        data = json.loads(args.manifest.read_text(encoding="utf-8"))
        if not isinstance(data, dict) or data.get("version") != 1:
            raise ValueError("Manifest JSON v1 requis")
        report = analyze(args.pdf, data, args.render_dir)
    except Exception as exc:
        report = {"version": 1, "errors": [str(exc)], "medical_validation": "NOT_AUTOMATICALLY_VERIFIED"}
    report["status"] = "PASS" if not report["errors"] else "FAIL"
    if report["status"] == "PASS":
        # Copiable sans transcription ni URL privée dans docs/course-deliveries.json.
        report["public_record"] = {
            "status": "PASS",
            "pdfSha256": report["pdf_sha256"],
            "expectedCount": report["expected_count"],
            "checkedCount": report["passed_count"],
        }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"PDF_VISUAL_GATE {report['status']} : {report.get('passed_count', 0)}/{report.get('expected_count', 0)} infographies, erreurs={len(report['errors'])}. Revue médicale indépendante toujours requise.")
    for error in report["errors"]:
        print("  - " + error)
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
