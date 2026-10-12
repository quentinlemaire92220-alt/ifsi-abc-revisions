"""Synthetic tests for comparing a privately downloaded PDF to its initial report."""
from pathlib import Path
import shutil
import sys
import tempfile

import fitz

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from pdf_visual_gate import analyze
from verify_published_pdf import verify


def check(ok, message):
    assert ok, message
    print("✅ " + message)


with tempfile.TemporaryDirectory() as tmp:
    path=Path(tmp)
    original=path/"pre_upload.pdf"
    downloaded=path/"downloaded_after_upload.pdf"
    changed=path/"changed.pdf"
    doc=fitz.open()
    page=doc.new_page(width=595,height=842)
    page.insert_text((35,80),"Schema test")
    pix=fitz.Pixmap(fitz.csRGB,fitz.IRect(0,0,640,360),0)
    pix.clear_with(0x4176A2)
    page.insert_image(fitz.Rect(80,170,510,410),pixmap=pix)
    doc.save(original)
    doc.close()
    matrix={"version":1,"expected_pages":1,"figures":[{
        "id":"schema_01","page":1,"source_ref":"Synthetic source",
        "anchor":"Schema test","region":[.12,.19,.88,.51],"kind":"raster"
    }]}
    initial=analyze(original,matrix)
    initial["status"]="PASS" if not initial["errors"] else "FAIL"
    check(initial["status"]=="PASS","Le contrôle initial synthétique passe")
    shutil.copyfile(original,downloaded)
    good=verify(downloaded,initial,matrix)
    check(good["status"]=="MATCH","Une copie de publication identique passe")
    check(good["public_record"]["pdfSha256"]==initial["pdf_sha256"],"Le hash de publication provient des octets contrôlés")
    doc=fitz.open(original)
    doc[0].insert_text((35,600),"PDF modifie")
    doc.save(changed)
    doc.close()
    check(verify(changed,initial,matrix)["status"]=="FAIL","PDF modifié après publication refusé")
    check(verify(path/"introuvable.pdf",initial,matrix)["status"]=="FAIL","PDF publié absent refusé")
    check(verify(downloaded,{**initial,"status":"FAIL"},matrix)["status"]=="FAIL","Rapport initial invalide refusé")
    check(verify(downloaded,{**initial,"pdf_sha256":"f"*64},matrix)["status"]=="FAIL","Empreinte initiale incohérente refusée")
    check(verify(downloaded,initial,{**matrix,"figures":[]})["status"]=="FAIL","Manifest différent refusé")
    bad_report={**initial,"expected_count":2}
    check(verify(downloaded,bad_report,matrix)["status"]=="FAIL","Décompte initial modifié refusé")
print("✅ Contrôle de correspondance au PDF publié : 9 cas synthétiques réussis")
