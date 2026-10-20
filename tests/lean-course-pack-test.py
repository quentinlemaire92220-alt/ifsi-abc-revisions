"""TNR synthétique pack lean : aucune donnée réelle ni publication."""
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import sys

import fitz
from PIL import Image as PILImage

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"tools"))
from lean_course_pack import make_pack

with TemporaryDirectory() as d:
    root=Path(d)
    PILImage.new("RGB",(1100,800),(151,202,219)).save(root/"figure.png")
    lesson={
        "title":"Système fictif — UE B1",
        "notions":[{"id":"a","sourcePage":"officiel p.2"},{"id":"b","sourcePage":"officiel p.3"},
                   {"id":"c","sourcePage":"officiel p.4"}],
        "sections":[
          {"heading":"Première notion","notionIds":["a","b"],
           "paragraphs":["La première notion est expliquée clairement, sans remplacer le texte par une figure.",
                         "La deuxième notion apporte une nuance utile au raisonnement."],
           "figure":{"path":"figure.png","caption":"Illustration didactique contrôlée"}},
          {"heading":"Troisième notion","notionIds":["c"],
           "paragraphs":["La troisième notion est présente dans le cours détaillé mais pas obligatoirement dans la synthèse."]}
        ],
        "summaryPanels":[
          {"heading":"Essentiel 1","body":"La notion principale doit être compréhensible en quelques phrases.",
           "notionIds":["a"],"figure":{"path":"figure.png"}},
          {"heading":"Essentiel 2","body":"La deuxième notion permet une compréhension pédagogique plus rapide.",
           "notionIds":["b"]}
        ],
        "qcmQuestions":[{
            "id":"fictif_q01","courseId":"fictif","theme":"Notions fictives","difficulty":"easy",
            "question":"Quelles notions expliquent ce mécanisme fictif ?",
            "choices":["Proposition A","Proposition B","Proposition C","Proposition D","Proposition E"],
            "answers":[0,2],"announcedCorrectCount":2,
            "explanation":"Les propositions A et C sont choisies parce qu'elles correspondent au contenu fictif validé."
        }],
        "flashcards":[{"id":"fictif_f01","qid":"fictif_q01","front":"Quel est le principe de la première notion fictive ?",
                       "answers":["Un principe pédagogique fictif, pour tester le moteur."],
                       "explanation":"Cette explication est issue de la matrice fictive."}]
    }
    out=root/"private"
    report=make_pack(lesson,root,out)
    assert report["status"]=="DRAFT_REVIEW_ONLY"
    assert report["publicationApproval"]=="NOT_GRANTED"
    assert report["notions"]==3 and report["summarySelectedNotions"]==2
    assert not (out/"04_Infographies").exists(), "Aucun export automatique attendu"
    with fitz.open(out/"Synthese_Infographiee_A4.pdf") as s:
        assert len(s)==1, "Une seule page A4 pour la synthèse"
        assert s[0].get_text().find("Essentiel 1")!=-1
        assert s[0].get_image_info(), "L'illustration source doit être réutilisée"
    with fitz.open(out/"Fiche_Revision.pdf") as c:
        text="\n".join(page.get_text() for page in c)
        assert "Troisième notion" in text, "La fiche doit conserver toutes les sections"
    with fitz.open(out/"QCM_Corrige.pdf") as q:
        text="\n".join(page.get_text() for page in q)
        assert "Corrigé argumenté" in text and "A, C" in text
    assert report["artifactSha256s"]["QCM.json"]
    assert len(json.loads((out/"Flashcards.json").read_text(encoding="utf8")))==1
    bank=json.loads((out/"QCM.json").read_text(encoding="utf8"))
    assert bank[0]["flashcards"][0]["front"]==lesson["flashcards"][0]["front"], "Rattachement carte au QCM perdu"
    assert bank[0]["flashcards"][0]["answers"]==lesson["flashcards"][0]["answers"]
    cached=make_pack(lesson,root,out)
    assert cached["reusedFromCache"] is True, "Réemploi du cache requis"
    wrong=dict(lesson,sections=[{"heading":"Première notion","notionIds":["a"],
                                 "paragraphs":["Explication présente."]}])
    try:make_pack(wrong,root,root/"bad")
    except ValueError as e:assert "toutes les notions" in str(e)
    else:raise AssertionError("Perte de couverture non refusée")
    wrong=dict(lesson,flashcards=[{**lesson["flashcards"][0],"qid":"unknown"}])
    try:make_pack(wrong,root,root/"bad-flashcards")
    except ValueError as e:assert "qid" in str(e)
    else:raise AssertionError("Flashcard orpheline acceptée")
    wrong=dict(lesson,qcmQuestions=[{**lesson["qcmQuestions"][0],"announcedCorrectCount":1}])
    try:make_pack(wrong,root,root/"bad-qcm")
    except ValueError as e:assert "contradictoire" in str(e)
    else:raise AssertionError("Cardinalité erronée du QCM acceptée")
    wrong=dict(lesson,summaryPanels=[
        {"heading":"Surcharge","body":"Texte excessif. "*900,
         "notionIds":["a"],"figure":{"path":"figure.png"}}])
    try:make_pack(wrong,root,root/"overflow")
    except ValueError as e:assert "dépasse une page" in str(e)
    else:raise AssertionError("Synthèse trop longue autorisée")
    wrong=dict(lesson,summaryPanels=[{"heading":"Inexacte","body":"Notion absente",
                                      "notionIds":["inconnue"]}])
    try:make_pack(wrong,root,root/"bad-id")
    except ValueError as e:assert "absente du cours" in str(e)
    else:raise AssertionError("Notion non sourcée acceptée")
print("✅ lean_v1 : chaîne unique, PDF de synthèse A4, QCM cohérent, flashcards, cache et refus de perte.")
