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
        "courseMeta":"UE B1 • Simulation pédagogique • Document de test",
        "revisionPriorities":["Comprendre le circuit simulé et son fonctionnement.",
                              "Distinguer les trois notions principales sans illustration."],
        "notions":[{"id":"a","sourcePage":"officiel p.2"},{"id":"b","sourcePage":"officiel p.3"},
                   {"id":"c","sourcePage":"officiel p.4"}],
        "sections":[
          {"heading":"Première notion","notionIds":["a","b"],
           "paragraphs":["La première notion est expliquée clairement, sans remplacer le texte par une figure.",
                         "La deuxième notion apporte une nuance utile au raisonnement."],
           "figure":{"path":"figure.png","caption":"Illustration didactique contrôlée"},
           "tables":[{"headers":["Élément","Rôle essentiel"],
                      "rows":[["Notion A","Un principe explicatif entièrement textuel."],
                              ["Notion B","Un autre mécanisme important pour la révision."]]}]},
          {"heading":"Troisième notion","notionIds":["c"],
           "paragraphs":["La troisième notion est présente dans le cours détaillé mais pas obligatoirement dans la synthèse."]}
        ],
        "infographicPanels":[
          {"heading":"Essentiel 1","body":"La notion principale est expliquée en quelques phrases.",
           "notionIds":["a"],"figure":{"path":"figure.png","caption":"Figure pédagogique fictive 1"}},
          {"heading":"Essentiel 2","body":"La deuxième notion demande un autre repère visuel.",
           "notionIds":["b"],"figure":{"path":"figure.png","caption":"Figure pédagogique fictive 2"}},
          {"heading":"Troisième notion illustrée","body":"La troisième notion apparaît aussi dans le support infographié.",
           "notionIds":["c"],"figure":{"path":"figure.png","caption":"Figure pédagogique fictive 3"}},
          {"heading":"Révision complète","body":"Les trois notions sont expliquées dans les deux PDF.",
           "notionIds":["a","b","c"],"figure":{"path":"figure.png","caption":"Figure pédagogique fictive 4"}}
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
    assert report["styleReview"]["REVISION_TEXT_FIRST"]=="REVIEW_REQUIRED"
    assert report["styleReview"]["INFOGRAPHIC_VISUAL_FIRST"]=="REVIEW_REQUIRED"
    assert report["styleReview"]["revisionReference"].endswith("Fiche_Revision_Coeur_Vaisseaux_et_Sang.pdf")
    assert report["publicationApproval"]=="NOT_GRANTED"
    assert report["notions"]==3 and report["infographicCoveredNotions"]==3
    assert not (out/"04_Infographies").exists(), "Aucun export automatique attendu"
    with fitz.open(out/"Cours_Complet_Infographie.pdf") as s:
        assert len(s)>=2, "Le cours infographié complet doit pouvoir occuper plusieurs pages"
        all_text="\n".join(page.get_text() for page in s)
        assert all(x in all_text for x in ["Essentiel 1","Troisième notion illustrée","Révision complète"])
        assert s[0].get_image_info(), "L'illustration source doit être réutilisée"
    with fitz.open(out/"Fiche_Revision.pdf") as c:
        text="\n".join(page.get_text() for page in c)
        assert "Troisième notion" in text, "La fiche doit conserver toutes les sections"
        assert "PRIORITÉS POUR" in text and "Rôle essentiel" in text, "Texte et tableaux de la fiche absents"
        assert "Notion A" in text, "Le tableau doit rester dans le PDF révisable"
        # Une fiche textuelle n'a PAS besoin d'une image dans chaque section.
        assert len(c)>=1
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
    # Les panneaux nombreux doivent s'étaler sans perdre leurs figures.
    more_panels=[{**p,"heading":p["heading"]+" - variante "+str(i)}
                 for i in range(3) for p in lesson["infographicPanels"]]
    larger=dict(lesson,infographicPanels=more_panels)
    result=make_pack(larger,root,root/"long-infographic")
    assert result["infographicCoveredNotions"]==3
    with fitz.open(root/"long-infographic"/"Cours_Complet_Infographie.pdf") as long_pdf:
        assert len(long_pdf)>3, "Le moteur doit accepter un cours multipage"
        assert all(page.get_image_info() for page in long_pdf), "Page de texte seule dans le cours infographié"
    unillustrated=dict(lesson,infographicPanels=[{**lesson["infographicPanels"][0],"figure":None}]
                       +lesson["infographicPanels"][1:])
    try:make_pack(unillustrated,root,root/"unillustrated")
    except ValueError as e:assert "sans illustration" in str(e)
    else:raise AssertionError("Panneau sans illustration accepté")
    too_textual=dict(lesson,infographicPanels=[{**lesson["infographicPanels"][0],"body":"Un long texte. "*100}]
                     +lesson["infographicPanels"][1:])
    try:make_pack(too_textual,root,root/"too_textual")
    except ValueError as e:assert "trop textuel" in str(e)
    else:raise AssertionError("Panneau uniquement textuel accepté")
    incomplete=dict(lesson,infographicPanels=lesson["infographicPanels"][:2])
    try:make_pack(incomplete,root,root/"missing-illustrated")
    except ValueError as e:assert "toutes les notions" in str(e)
    else:raise AssertionError("Cours infographié incomplet accepté")
    wrong=dict(lesson,infographicPanels=[{"heading":"Inexacte","body":"Notion absente",
                                      "notionIds":["inconnue"],
                                      "figure":{"path":"figure.png","caption":"Repère fictif inconnu"}}])
    try:make_pack(wrong,root,root/"bad-id")
    except ValueError as e:assert "toutes les notions" in str(e)
    else:raise AssertionError("Notion non sourcée acceptée")
print("✅ lean_v1 : chaîne unique, cours infographié complet multipage, QCM, flashcards, cache et refus de perte.")
