"""Strict native-text reader for variable-size themed QCM banks (Q01..Q100+).

Separate from the historical layout readers: checks every printed frame,
cardinality, difficulty, choice, key and explanation against the real bank.
"""
import re,unicodedata
import fitz
def norm(s):return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',s)).strip()
def frame(page,anchor):
    rects=[fitz.Rect(d['rect']) for d in page.get_drawings() if fitz.Rect(d['rect']).width>490 and fitz.Rect(d['rect']).height>25 and fitz.Rect(d['rect']).contains(anchor)]
    assert rects,'Question/correction sans cadre'
    return min(rects,key=lambda r:r.get_area())
def validate_badge_qcm(doc,rows):
    cut=next(i for i,p in enumerate(doc) if re.search(r'^Corrigés argumentés\s*$',p.get_text(),re.M))
    numbers=[];corrections=[]
    for pi,page in enumerate(doc):
        spans=[s for b in page.get_text('dict')['blocks'] for line in b.get('lines',[]) for s in line['spans']]
        if pi<cut:
            assert 'Réponses :' not in page.get_text(),'Réponse divulguée'
            for badge in [s for s in spans if re.fullmatch(r'Q\d{2,}',s['text'])]:
                n=int(badge['text'][1:]);numbers.append(n);q=rows[n-1];area=frame(page,fitz.Rect(badge['bbox']))
                inside=[s for s in spans if area.contains(fitz.Rect(s['bbox']))]
                labels=[s for s in inside if s['text'] in ['Facile','Moyen','Difficile'] and s['size']<10]
                assert len(labels)==1 and labels[0]['text']=={'easy':'Facile','medium':'Moyen','hard':'Difficile'}[q['difficulty']],q['id']+': difficulté différente'
                content=' '.join(s['text'] for s in inside if s is not badge and s is not labels[0])
                k=len(q['answers']);heading=q['question']+f' ({k} bonne'+('s réponses)' if k>1 else ' réponse)')
                expected=heading+' '+' '.join(chr(65+i)+'. '+s for i,s in enumerate(q['choices']))
                assert norm(content)==norm(expected),q['id']+': énoncé/choix/cardinalité différents'
        else:
            starts=[s for s in spans if re.match(r'^Q\d{2,}\s*—\s*Réponses\s*:',s['text'])]
            for start in starts:
                n=int(re.match(r'Q(\d+)',start['text'])[1]);corrections.append(n);q=rows[n-1]
                area=frame(page,fitz.Rect(start['bbox']));actual=page.get_text(clip=area)
                expected=f'Q{n:02} — Réponses : '+', '.join(chr(65+i) for i in q['answers'])+'. '+q['explanation']
                assert norm(actual)==norm(expected),q['id']+': clé ou explication différente'
    expected=[q['number'] for q in rows]
    assert numbers==corrections==expected,'Questions/corrigés manquants, dupliqués ou désordonnés'
    return len(rows)
