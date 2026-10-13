"""Synthetic, offline TNR for adaptive revision sheet composition. No private PDFs."""
from pathlib import Path
from tempfile import TemporaryDirectory
from PIL import Image
import sys
import fitz

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"tools"))
from revision_compose import render
from revision_layout_gate import audit

with TemporaryDirectory() as temp:
    root=Path(temp)
    Image.new("RGB",(1600,850),(150,204,222)).save(root/"land.png")
    Image.new("RGB",(1200,1700),(170,213,194)).save(root/"portrait.png")
    Image.new("RGB",(100,125),(180,200,210)).save(root/"bad.png")

    brief={
      "heading":"Digestif : fonctionnement",
      "paragraphs":["La description anatomique doit rester complète. La figure illustre sans remplacer le texte. "*3],
      "figure":{"path":"land.png","caption":"Schéma de synthèse","min_width_pt":350}
    }
    p=render({"title":"Fiche test","sections":[brief]},root/"inline.pdf",root)
    with fitz.open(p) as pdf:
        assert len(pdf)==1, "L'illustration horizontale doit rester avec le texte"
        assert pdf[0].get_image_info(), "Figure perdue"
        assert "anatomique" in pdf[0].get_text(), "Texte perdu"

    complex_section={
      "heading":"Appareil urinaire",
      "paragraphs":["Maintenir les explications des voies, connexions, dispositifs et limites."],
      "figure":{"path":"portrait.png","caption":"Planche médicale complexe",
                "min_width_pt":420,"mode":"dedicated"}
    }
    p=render({"title":"Fiche avec grande planche","sections":[complex_section]},root/"complex.pdf",root)
    with fitz.open(p) as pdf:
        assert len(pdf)==2, "Une planche complexe mérite une page dédiée"
        assert pdf[1].get_image_info(), "La planche dédiée a disparu"
        assert "Appareil urinaire" in pdf[0].get_text(), "Explication médicale perdue"

    text=[{"heading":f"Thème {i}",
           "paragraphs":["Explication pédagogique concise sans remplacement décoratif."]}
          for i in range(4)]
    p=render({"title":"Fiche textuelle","sections":text},root/"text.pdf",root)
    with fitz.open(p) as pdf:
        assert len(pdf)==1, "Une page par section textuelle crée de grands blancs"

    for invalid in [
        {"heading":"Erreur","paragraphs":["Texte"],"figure":{"path":"bad.png"}},
        {"heading":"Erreur","paragraphs":[]},
    ]:
        try:
            render({"title":"Invalide","sections":[invalid]},root/"invalid.pdf",root)
            raise AssertionError("Le cas invalide aurait dû échouer")
        except ValueError:
            pass
    assert audit(root/"text.pdf")["complex_figure_pages"]==0
    layout=audit(root/"complex.pdf")
    assert layout["complex_figure_pages"]==1
    assert layout["underused_pages"]==1
print("✅ 7 contrôles synthétiques de composition adaptative réussis")
