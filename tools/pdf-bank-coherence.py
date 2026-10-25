"""Compare selected native PDF text against the actual public bank, never a sidecar claim."""
import argparse, hashlib, json, re, unicodedata
from pathlib import Path
import fitz
from student_support_clean_gate import check_document
def norm(s):return re.sub(r'\s+',' ',unicodedata.normalize('NFC',s)).strip()
def body(document):
    return '\n'.join(page.get_text(clip=fitz.Rect(0,40,page.rect.width,page.rect.height-36)) for page in document)
def without_theme_titles(text,rows):
    # Strip only headings whose names are present in the actual canonical bank.
    # Never ignore arbitrary text; question/answer contents remain compared exactly.
    themes={q['theme'] for q in rows}
    lines=[]
    for line in text.splitlines():
        t=line.strip()
        if t in themes:continue
        if t.startswith('THÈME • ') and t[len('THÈME • '):] in themes:continue
        lines.append(line)
    return '\n'.join(lines)

def validate_qcm(text,rows):
    parts=re.split(r'Corrigés argumentés',text,maxsplit=1)
    assert len(parts)==2,'Corrigés absents'
    questions,corrections=parts
    # Headings are layout, never question content. Only exact theme lines are stripped.
    questions=without_theme_titles(questions,rows)
    blocks=list(re.finditer(r'(?m)^Q(\d{2})\s+',questions))
    assert [int(m[1]) for m in blocks]==[q['number'] for q in rows],'Questions manquantes/dupliquées'
    for i,(q,m) in enumerate(zip(rows,blocks)):
        actual=questions[m.end():blocks[i+1].start() if i+1<len(blocks) else len(questions)]
        expected=q['question']+' '+' '.join(chr(65+j)+'. '+s for j,s in enumerate(q['choices']))
        assert norm(actual)==norm(expected),q['id']+': énoncé/choix PDF différents'
    corrections=without_theme_titles(corrections.replace('Corrigés argumentés',''),rows)
    blocks=list(re.finditer(r'(?m)^Q(\d{2}) - Réponses : ([A-E](?:, [A-E])*)\s*\n',corrections))
    assert [int(m[1]) for m in blocks]==[q['number'] for q in rows],'Corrigés manquants/dupliqués'
    for i,(q,m) in enumerate(zip(rows,blocks)):
        assert m[2]==', '.join(chr(65+j) for j in q['answers']),q['id']+': clé PDF différente'
        actual=corrections[m.end():blocks[i+1].start() if i+1<len(blocks) else len(corrections)]
        assert norm(actual)==norm(q['explanation']),q['id']+': argumentation PDF différente'
def validate_cards(text,rows):
    text=without_theme_titles(text,rows)
    blocks=list(re.finditer(r'(?m)^CARTE (\d{2})\s+',text))
    assert [int(m[1]) for m in blocks]==[q['number'] for q in rows],'Cartes manquantes/dupliquées'
    for i,(q,m) in enumerate(zip(rows,blocks)):
        f=q['flashcards'][0]
        actual=text[m.end():blocks[i+1].start() if i+1<len(blocks) else len(text)]
        expected=f['front']+' Réponse. '+' '.join(f['answers'])+' Explication. '+f['explanation']
        written_v53='RECTO • '+f['front']+' VERSO • '+' '.join(f['answers'])+' EXPLICATION • '+f['explanation']
        assert norm(actual) in {norm(expected),norm(written_v53)},q['id']+': recto/verso/explication PDF différents'
def check(course):
    for role,asset in course['publicArtifacts'].items():
        path=Path(asset['path'])
        assert path.is_relative_to('assets') and '..' not in path.parts,'Chemin hors assets'
        assert hashlib.sha256(path.read_bytes()).hexdigest()==asset['sha256'],'SHA PDF différent'
        assert not check_document(path),'Marque technique étudiant'
        with fitz.open(path) as doc:
            assert not doc.metadata.get('creator') and not doc.metadata.get('producer'),'Métadonnées du générateur exposées'
            assert len(doc)==asset['pageCount'],'Pagination différente'
            assert all(p.get_text().strip() and not p.get_images() for p in doc),'PDF image/vide'
            assert all(abs(p.rect.width-595.276)<1 and abs(p.rect.height-841.89)<1 for p in doc),'Format A4 absent'
            text=body(doc)
        if role in ('qcm','flashcards'):
            rows=json.loads(Path(course['qcmBank']).read_text(encoding='utf8'))
            (validate_qcm if role=='qcm' else validate_cards)(text,rows)
        print('PASS PDF',course['courseId'],role,asset['pageCount'],'pages')
def main():
    p=argparse.ArgumentParser();p.add_argument('--course');a=p.parse_args()
    courses=json.loads(Path('docs/course-deliveries.json').read_text(encoding='utf8'))['courses']
    selected=[c for c in courses if c.get('publicArtifacts') and (not a.course or c['courseId']==a.course)]
    assert selected,'Aucun contrat PDF sélectionné'
    for c in selected:check(c)
if __name__=='__main__':main()
