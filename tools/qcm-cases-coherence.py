"""Strict additive reader for boxed QCM, answer grid and separate practice cases."""
import re,json,fitz
from pathlib import Path
from importlib.machinery import SourceFileLoader
common=SourceFileLoader('pdf_bank_coherence',str(Path(__file__).with_name('pdf-bank-coherence.py'))).load_module()
norm=common.norm
without_theme_titles=common.without_theme_titles

def validate(document,rows,cases):
    toc={title:page-1 for _,title,page in document.get_toc()}
    headings=['Questions','Cas : énoncés','Grille de réponses','Justification des 5 propositions','Cas : corrections']
    assert all(x in toc for x in headings)
    starts=[toc[x] for x in headings];assert starts==sorted(set(starts))
    def segment(a,b):
        return '\n'.join(p.get_text(clip=fitz.Rect(0,40,p.rect.width,p.rect.height-36)) for p in list(document)[a:b])
    question_text=without_theme_titles(segment(starts[0],starts[1]),rows)
    blocks=list(re.finditer(r'(?m)^Q(\d{2,3})\s*\n',question_text))
    assert [int(m[1]) for m in blocks]==[q['number'] for q in rows]
    levels={'easy':'Facile','medium':'Moyen','hard':'Difficile'}
    for i,(q,m) in enumerate(zip(rows,blocks)):
        actual=question_text[m.end():blocks[i+1].start() if i+1<len(blocks) else len(question_text)]
        n=q['announcedCorrectCount'];assert n==len(q['answers'])
        title=q['question']+f' ({n} bonne'+(' réponse)' if n==1 else 's réponses)')
        expected=levels[q['difficulty']]+' '+title+' '+' '.join(chr(65+j)+'. '+s for j,s in enumerate(q['choices']))
        assert norm(actual)==norm(expected),q['id']+': question/choices/count'
    grid=segment(starts[2],starts[3]);keys=re.findall(r'(?m)^Q(\d{2,3})[ \t]+([A-E](?:, [A-E])*)[ \t]*$',grid)
    assert keys==[(f'{q["number"]:02d}',', '.join(chr(65+j) for j in q['answers'])) for q in rows],'Answer grid differs'
    text=without_theme_titles(segment(starts[3],starts[4]).replace('Corrigés argumentés',''),rows)
    blocks=list(re.finditer(r'(?m)^Q(\d{2,3}) — Réponses : ([A-E](?:, [A-E])*)\.\s*',text))
    assert [int(m[1]) for m in blocks]==[q['number'] for q in rows]
    for i,(q,m) in enumerate(zip(rows,blocks)):
        assert m[2]==', '.join(chr(65+j) for j in q['answers'])
        actual=text[m.end():blocks[i+1].start() if i+1<len(blocks) else len(text)]
        assert norm(actual)==norm(q['explanation']),q['id']+': explanation differs'
        assert len(q['rationales'])==5
        for j,r in enumerate(q['rationales']):
            expected=chr(65+j)+' - '+('Vrai' if j in q['answers'] else 'Faux')+' : '+r
            assert norm(expected) in norm(actual),q['id']+': option rationale absent'
    for face,a,b in [('question',starts[1],starts[2]),('answer',starts[4],len(document))]:
        text=segment(a,b).replace('Corrigés argumentés','')
        blocks=list(re.finditer(r'(?m)^Cas (\d{2}) · ([^\n]+)\n',text))
        assert [int(m[1]) for m in blocks]==list(range(1,len(cases)+1))
        for i,(case,m) in enumerate(zip(cases,blocks)):
            assert norm(m[2])==norm(case['title'])
            actual=text[m.end():blocks[i+1].start() if i+1<len(blocks) else len(text)]
            expected=case['answer'] if face=='answer' else case['situation']+' '+' '.join(f'{j+1}. '+q for j,q in enumerate(case['questions']))
            assert norm(actual)==norm(expected),case['id']+': '+face+' differs'
    return len(rows),len(cases)
