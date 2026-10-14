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
    # Sciences humaines : illustrer les concepts SANS fabriquer d'anatomie.
    psychology={
      "title":"Psychologie - étude conceptuelle fictive",
      "schematics":"none",
      "schematicsJustification":"Les théories du cas étudié se prêtent à une comparaison de situations, sans schéma individuel anatomique pertinent.",
      "sections":[{
        "heading":"Comparaison de deux approches",
        "paragraphs":["La première notion fictive peut être étudiée avec des exemples.",
                      "La seconde notion fictive se distingue par sa démarche."],
        "conceptualPanel":[
          {"label":"Approche A","detail":"Description pédagogique de la première notion."},
          {"label":"Approche B","detail":"Description pédagogique de la seconde notion."}
        ],
        "takeaway":"Distinguer les deux démarches.",
        "trap":"Ne pas attribuer la deuxième démarche à la première."
      }]
    }
    psych_out=root/"psychology"
    result=make_pack(psychology,root,psych_out)
    assert result["schematics"]=="none"
    assert result["reusedFigures"]==[]
    assert result["conceptualPanels"]==1
    assert result["medicalReview"]=="NOT_APPLICABLE"
    assert result["disciplinaryReview"]=="REQUIRED"
    with fitz.open(psych_out/"Fiche_Revision.pdf") as a, \
         fitz.open(psych_out/"Fiche_Complete_Infographiee.pdf") as b:
        assert len(a)>=1 and len(b)>=1
        assert "première notion" in a[0].get_text()
        rendered="\n".join(page.get_text() for page in b)
        assert "Approche A" in rendered and "Approche B" in rendered
        assert "PIÈGES QCM" in rendered or "QCM" in rendered
        assert sum(len(page.get_images()) for page in b)==0
    assert list((psych_out/"04_Infographies").iterdir())==[]
    missing=dict(psychology,schematics=None)
    try: make_pack(missing,root,root/"psych-unjustified")
    except ValueError: pass
    else: raise AssertionError("Le cours sans figure doit déclarer schematics=none")
    not_illustrated=dict(psychology,sections=[{
      "heading":"Une section",
      "paragraphs":["Un texte non illustré, malgré l'obligation de fiche complète infographiée."]
    }])
    try: make_pack(not_illustrated,root,root/"psych-without-concepts")
    except ValueError: pass
    else: raise AssertionError("Une fiche complète infographiée doit réellement présenter un panneau conceptuel")
    invalid_panel=dict(psychology,sections=[{
      **psychology["sections"][0],
      "conceptualPanel":[{"label":"A","detail":"Seule notion."}]
    }])
    try: make_pack(invalid_panel,root,root/"psych-invalid-panel")
    except ValueError: pass
    else: raise AssertionError("Panneau avec une seule entrée accepté")

print("✅ v1.13 : deux PDF distincts, figure unique réemployée, guide authentifié, exports, couverture et refus de perte")
print("✅ v1.14 : psychologie sans figure, deux PDF et panneaux conceptuels validés ; absences injustifiées refusées")
