import json,tempfile
from pathlib import Path
from importlib.machinery import SourceFileLoader
import fitz
ROOT=Path(__file__).resolve().parents[1]
G=SourceFileLoader('compact_gate',str(ROOT/'tools/pdf-compact-profile.py')).load_module()
assert G.V3.reference_errors(G.V3.policy())==[]
m=json.loads((ROOT/'docs/course-deliveries.json').read_text(encoding='utf8'))
for r in m.get('scopedCourseRevisions',[]):
    if r.get('profile')!='official_complete_written_v1':continue
    assert r['templateConformance']['profile']=='compact_thematic_lexicon_v1'
    arts={a['role']:a for a in r['publicArtifacts']}
    p=ROOT/arts['sheet']['path'];result=G.validate(p)
    assert result['errors']==[],result
    assert result['artifactSha256']==arts['sheet']['sha256']
    assert result['pageCount']==arts['sheet']['pageCount']
    assert G.V3.validate(ROOT/arts['qcm']['path'],'qcm',require_review=False)['errors']==[]
    for defect in ['small_body','small_unbound_label','wrong_order','bad_destination','hidden_band']:
        with tempfile.TemporaryDirectory() as tmp:
            d=fitz.open(p)
            if defect=='small_body':d[1].insert_text((50,180),'Tiny body text',fontsize=8)
            if defect=='small_unbound_label':d[1].insert_text((50,180),'A',fontsize=8)
            if defect=='wrong_order':
                toc=d.get_toc();toc[-1][1]='Appendix after lexicon';d.set_toc(toc)
            if defect=='bad_destination':
                toc=d.get_toc();toc[-1][2]=1;d.set_toc(toc)
            if defect=='hidden_band':d[1].draw_rect(fitz.Rect(0,0,596,46),fill=(1,1,1),color=None)
            out=Path(tmp)/'broken.pdf';d.save(out);d.close()
            errors=G.validate(out)['errors']
            expected={'small_body':'p2:FONT_TOO_SMALL','small_unbound_label':'p2:FONT_TOO_SMALL','wrong_order':'SECTION_ORDER_OR_DUPLICATION','bad_destination':'SECTION_ORDER_OR_DUPLICATION','hidden_band':'p2:MODEL_BAND_RENDER_TOP'}[defect]
            assert expected in errors,(defect,errors)
    with fitz.open(ROOT/arts['flashcards']['path']) as cards:
        assert len(cards)==arts['flashcards']['pageCount']
        text=' '.join(p.get_text() for p in cards)
        assert all(p.get_text().strip() for p in cards)
        bank=json.loads((ROOT/r['bankPath']).read_text(encoding='utf8'))
        for c in [c for q in bank for c in q['flashcards']]:
            assert G.norm(c['front']) in G.norm(text),c['id']
            assert all(G.norm(a) in G.norm(text) for a in c['answers']),c['id']
    print('PASS compact profile: full technical checks, five injected defects, all flashcard fronts/answers.')
