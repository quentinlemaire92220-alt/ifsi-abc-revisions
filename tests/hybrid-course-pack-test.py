"""Tests sans données réelles ni publication du générateur hybride v1.46."""
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import sys

import fitz
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from hybrid_course_pack import make_pack

with TemporaryDirectory() as tmp:
    root = Path(tmp)
    Image.new("RGB", (1100, 800), (211, 232, 245)).save(root / "figure.png")
    fixture = {
        "title": "Physiologie fictive - pilote hybride",
        "courseMeta": "UE fictive ; contenu de test uniquement",
        "notions": [
            {"id": "a", "sourcePage": "support fictif p.1"},
            {"id": "b", "sourcePage": "support fictif p.2"}
        ],
        "sections": [
            {"heading": "Deux notions importantes", "notionIds": ["a", "b"],
             "paragraphs": ["La première notion est expliquée sous forme textuelle.",
                            "La deuxième nuance est préservée pour une révision fiable."],
             "figure": {"path": "figure.png", "caption": "Schéma pédagogique fictif"}}
        ],
        "lexicon": [
            {"id": "l1", "term": "Terme de test A", "definition": "Première définition."},
            {"id": "l2", "term": "Terme de test B", "definition": "Deuxième définition."}
        ]
    }
    dest = root / "out"
    result = make_pack(fixture, root, dest)
    assert result["packFormat"] == "hybrid_v1"
    assert result["status"] == "DRAFT_REVIEW_ONLY"
    assert result["publicationApproval"] == "NOT_GRANTED"
    assert result["notionsCovered"] == 2
    assert result["lexiconTermCount"] == 2
    assert len(result["files"]) == 2
    assert "infographic" not in result["files"]
    assert (dest / "Cours_Complet_Infographie.pdf").exists() is False
    with fitz.open(dest / result["files"]["hybrid"]) as pdf:
        txt = "\n".join(p.get_text() for p in pdf)
        assert "Définitions et mots-clés" in txt
        assert "Terme de test A" in txt and "Terme de test B" in txt
        assert any(page.get_images() for page in pdf)
    assert json.loads((dest / result["files"]["lexicon"]).read_text()) == fixture["lexicon"]
    second = make_pack(fixture, root, dest)
    assert second["reusedFromCache"] is True

    def reject(patch, expected):
        payload = json.loads(json.dumps(fixture))
        patch(payload)
        try:
            make_pack(payload, root, dest)
        except (ValueError, FileNotFoundError) as exc:
            assert expected in str(exc), (expected, str(exc))
        else:
            raise AssertionError("La matrice invalide a été acceptée : " + expected)

    reject(lambda x: x["sections"][0].update({"notionIds": ["a"]}), "essentielles incomplète")
    reject(lambda x: x["sections"][0].pop("figure"), "infographies intégrées")
    reject(lambda x: x.update({"lexicon": []}), "mots-clés manquants")
    reject(lambda x: x["lexicon"].append(dict(x["lexicon"][0])), "Doublon")
    reject(lambda x: x["notions"][0].pop("sourcePage"), "Page source")
    reject(lambda x: x["sections"][0]["figure"].update({"path": "../outside.png"}), "hors")
print("✅ hybrid_v1 : un PDF, figures intégrées, couverture essentielle, lexique texte, cache et refus des pertes.")
