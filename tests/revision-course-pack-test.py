"""End-to-end offline TNR with fictitious diagrams and no private course data."""
import json
import sys
from pathlib import Path
from tempfile import TemporaryDirectory
import fitz
from PIL import Image as PILImage, ImageDraw

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"tools"))
from revision_course_pack import make_pack

with TemporaryDirectory() as t:
    root=Path(t)
    for name,dim in (("figure_01.png",(1600,900)),("figure_02.png",(1200,1500)),("guide.png",(600,650))):
        image=PILImage.new("RGB",dim,"#e2eee9")
        painter=ImageDraw.Draw(image)
        painter.ellipse((120,100,dim[0]-120,dim[1]-120),outline="#136478",width=25)
        painter.text((140,160),"TEST SYNTHETIQUE - NON MEDICAL",fill="#0b2831")
        image.save(root/name)
    lesson={
      "title":"Cours fictif sans données cliniques",
      "guideImage":"guide.png","requireGuide":True,
      "sections":[
        {"heading":"Premier mécanisme","paragraphs":["Description complete du principe fictif et de ses etapes."*3],
         "takeaway":"Verifier les deux etapes.","trap":"Ne pas confondre les deux phases.",
         "figure":{"path":"figure_01.png","caption":"Figure de test 1","min_width_pt":350}},
        {"heading":"Second mécanisme","paragraphs":["La seconde notion fictive est expliquee sans suppression d'informations."],
         "figure":{"path":"figure_02.png","caption":"Figure de test 2","min_width_pt":350}}
      ]
    }
    out=root/"draft"
    manifest=make_pack(lesson,root,out)
    assert manifest["status"]=="DRAFT_REVIEW_ONLY"
    assert manifest["medicalReview"]=="REQUIRED"
    assert len(manifest["reusedFigures"])==2
    assert all(x["sourceSha256"]==x["exportSha256"] for x in manifest["reusedFigures"])
    with fitz.open(out/manifest["classic"]["name"]) as classic,\
         fitz.open(out/manifest["completeInfographic"]["name"]) as visual:
        assert len(classic)>=1 and len(visual)>=1
        assert classic[0].get_text().find("Premier mécanisme")!=-1
        combined="\n".join(p.get_text() for p in visual)
        assert "Premier mécanisme" in combined and "Second mécanisme" in combined
        assert "RETENIR" in combined and "QCM" in combined
        assert sum(len(p.get_images()) for p in visual)>=3
        assert manifest["classic"]["sha256"]!=manifest["completeInfographic"]["sha256"]
    assert json.loads((out/"manifest_privé.json").read_text(encoding="utf8"))==manifest
    invalid=dict(lesson,sections=[{"heading":"Perte","paragraphs":[] }])
    try: make_pack(invalid,root,root/"bad")
    except ValueError: pass
    else: raise AssertionError("Perte de contenu acceptée")
    missing=dict(lesson,guideImage=None)
    try: make_pack(missing,root,root/"no-guide")
    except ValueError: pass
    else: raise AssertionError("Guide obligatoire absent accepté")
    invalid=dict(lesson,sections=[{"heading":"Tableaux","paragraphs":["Test"],"complexBlocks":["tableau"]}])
    try: make_pack(invalid,root,root/"rich")
    except ValueError: pass
    else: raise AssertionError("Tableau complexe perdu silencieusement")
print("✅ v1.13 : deux PDF distincts, figure unique réemployée, guide authentifié, exports, couverture et refus de perte")
