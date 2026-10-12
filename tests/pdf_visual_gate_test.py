"""Offline CI tests: synthetic PDFs, no private student material in GitHub."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import fitz

GATE = Path(__file__).resolve().parents[1] / "tools" / "pdf_visual_gate.py"


def check(pdf, manifest, should_pass, reason):
    with tempfile.TemporaryDirectory() as d:
        m = Path(d) / "manifest.json"
        r = Path(d) / "report.json"
        m.write_text(json.dumps(manifest, ensure_ascii=False))
        proc = subprocess.run(
            [sys.executable, str(GATE), "--pdf", str(pdf), "--manifest", str(m), "--report", str(r)],
            capture_output=True, text=True)
        output = json.loads(r.read_text())
        assert (proc.returncode == 0) == should_pass, f"{reason}: {proc.stdout}\n{proc.stderr}"
        assert output["status"] == ("PASS" if should_pass else "FAIL"), f"{reason}: wrong report"
        if not should_pass:
            assert output["errors"], f"{reason}: missing evidence"
        print("✅ " + reason)


def make_fixture(pdf, image=True):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    page.insert_text((35, 80), "Le nephron - mecanisme", fontsize=20)
    page.insert_text((35, 120), "Rappel pedagogique sur le rein.", fontsize=12)
    if image:
        pix = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 800, 400), 0)
        pix.clear_with(0x3284A2)
        page.insert_image(fitz.Rect(80, 190, 510, 405), pixmap=pix)
    page.insert_text((35, 525), "Explications en continu apres la figure.", fontsize=12)
    doc.save(pdf)
    doc.close()


with tempfile.TemporaryDirectory() as temp:
    d = Path(temp)
    good = d / "correct.pdf"
    blank = d / "without_figure.pdf"
    make_fixture(good, True)
    make_fixture(blank, False)
    entry = {"id": "nephron_01", "source_ref": "Support officiel p. 3", "page": 1,
             "anchor": "Le nephron - mecanisme", "region": [.10, .20, .90, .55], "kind": "raster"}
    manifest = {"version": 1, "expected_pages": 1, "figures": [entry]}
    check(good, manifest, True, "PDF avec une infographie intégrée")
    check(blank, manifest, False, "Refuse un schéma manquant malgré le texte de la fiche")
    check(good, {**manifest, "figures": [dict(entry, region=[.05, .72, .90, .92])]}, False,
          "Refuse une infographie située hors de sa section")
    check(good, {**manifest, "figures": [dict(entry, anchor="Terme introuvable")]}, False,
          "Refuse une section inconnue")
    check(good, {**manifest, "figures": [dict(entry, page=2)]}, False,
          "Refuse une page de fiche incorrecte")
    check(good, {**manifest, "figures": [entry, entry]}, False,
          "Refuse un inventaire à identifiants dupliqués")
    check(good, {"version": 1, "expected_pages": 1, "figures": []}, False,
          "Refuse un inventaire vide présenté comme audité")
    check(good, {**manifest, "expected_pages": 3}, False,
          "Refuse le mauvais nombre de pages")
print("✅ Tous les tests du contrôle structurel PDF sont passés")
