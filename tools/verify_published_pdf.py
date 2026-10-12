#!/usr/bin/env python3
"""Compare the *downloaded, published* private Drive PDF to a pre-upload visual report.

Requires an authenticated download performed outside the public GitHub runner.
Never uploads documents or reads remote Drive URLs.
"""
import argparse
import hashlib
import hmac
import json
from pathlib import Path
import sys

from pdf_visual_gate import analyze

def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

def verify(published_pdf, original_report, manifest):
    result = {"version": 1, "status": "FAIL", "errors": [],
              "medical_validation": "NOT_AUTOMATICALLY_VERIFIED"}
    try:
        if original_report.get("status") != "PASS":
            raise ValueError("Rapport original FAIL / absent")
        initial_digest = original_report.get("pdf_sha256", "")
        if not isinstance(initial_digest, str) or len(initial_digest) != 64:
            raise ValueError("Empreinte initiale manquante")
        downloaded_digest = sha256(published_pdf)
        if not hmac.compare_digest(downloaded_digest, initial_digest.lower()):
            raise ValueError("Le PDF Drive retéléchargé ne correspond pas au PDF audité avant dépôt")
        rerun = analyze(published_pdf, manifest)
        if rerun.get("errors") or rerun.get("passed_count") != rerun.get("expected_count"):
            raise ValueError("Le PDF publié ne passe plus le contrôle structurel")
        for field in ("expected_count", "passed_count", "pages"):
            if rerun[field] != original_report.get(field):
                raise ValueError("Incohérence entre rapport initial et contrôle de la copie publiée : " + field)
        if [x.get("id") for x in rerun["figures"]] != [
                x.get("id") for x in original_report.get("figures", [])]:
            raise ValueError("Inventaire des schémas différent")
        result["status"] = "MATCH"
        result["pdf_sha256"] = downloaded_digest
        result["expected_count"] = rerun["expected_count"]
        result["checked_count"] = rerun["passed_count"]
        result["public_record"] = {
            "status": "MATCH",
            "source": "authenticated_drive_download",
            "pdfSha256": downloaded_digest,
            "expectedCount": rerun["expected_count"],
            "checkedCount": rerun["passed_count"],
        }
    except Exception as exc:
        result["errors"].append(str(exc))
    return result

def main():
    parser = argparse.ArgumentParser(description="Contrôle d'identité binaire du PDF Drive privé retéléchargé")
    parser.add_argument("--published-pdf", type=Path, required=True,
                        help="Fichier retéléchargé APRES publication par accès Drive authentifié")
    parser.add_argument("--original-report", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    try:
        original = json.loads(args.original_report.read_text(encoding="utf8"))
        matrix = json.loads(args.manifest.read_text(encoding="utf8"))
        result = verify(args.published_pdf, original, matrix)
    except Exception as exc:
        result = {"version": 1, "status": "FAIL", "errors": [str(exc)],
                  "medical_validation": "NOT_AUTOMATICALLY_VERIFIED"}
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print("DRIVE_PDF_IDENTITY " + result["status"] + " : " +
          ("fichier publié identique au rapport initial" if result["status"] == "MATCH"
           else "; ".join(result["errors"])))
    return 0 if result["status"] == "MATCH" else 1

if __name__ == "__main__":
    sys.exit(main())
