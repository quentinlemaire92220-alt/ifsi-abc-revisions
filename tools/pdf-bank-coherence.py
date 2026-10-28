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

def strip_qcm_furniture(text):
    # Remove only known repeating headers/page numbering, never clinical content.
    text=re.sub(r'(?m)^[ \t]*IFSI ANTOINE BÉCLÈRE[^\n]*$', '', text)
    text=re.sub(r'(?m)^[ \t]*THÉORIE DE GESTION DES SYMPTÔMES\s*[•·]\s*TD D[’\x27]APPLICATION[^\n]*$', '', text)
    return text

def validate_qcm_written_dot(text,rows):
    parts=re.split(r'Corrigés argumentés',text,maxsplit=1)
    assert len(parts)==2,'Corrigés absents'
    questions,corrections=parts
    questions=strip_qcm_furniture(without_theme_titles(questions,rows))
    # Accept only the two real printed heading conventions, without weakening
    # exact question/choices/answers/explanations comparison.
    blocks=list(re.finditer(r'(?m)^Q(\d{2})(?:\.[ \t]*|[ \t]+)',questions))
    seen=[int(m[1]) for m in blocks]
    expected_numbers=[q['number'] for q in rows]
    if seen!=expected_numbers:
        print('QCM_PDF_NUMBERING_DIAGNOSTIC',json.dumps({'expected_count':len(expected_numbers),'found_count':len(seen),'found_numbers':seen,'expected_numbers':expected_numbers},ensure_ascii=False))
    assert seen==expected_numbers,'Questions manquantes/dupliquées'
    for i,(q,m) in enumerate(zip(rows,blocks)):
        actual=questions[m.end():blocks[i+1].start() if i+1<len(blocks) else len(questions)]
        # Difficulty chips are furniture; their text is checked by the bank.
        actual=re.sub(r'(?m)[ \t]*(?:FACILE|INTERMÉDIAIRE|DIFFICILE)[ \t]*$', '', actual)
        expected=q['question']+' '+' '.join(chr(65+j)+'. '+s for j,s in enumerate(q['choices']))
        assert norm(actual)==norm(expected),q['id']+': énoncé/choix PDF différents'

    corrections=strip_qcm_furniture(without_theme_titles(corrections,rows))
    blocks=list(re.finditer(r'(?m)^Q(\d{2})[ \t]*[—-][ \t]*(?:Réponse\(s\)|Réponses)[ \t]*:[ \t]*([A-E](?:[ \t]*(?:\+|,)[ \t]*[A-E])*)[ \t]*\.?[ \t]*\n?',corrections))
    assert [int(m[1]) for m in blocks]==expected_numbers,'Corrigés manquants/dupliqués'
    for i,(q,m) in enumerate(zip(rows,blocks)):
        assert re.findall(r'[A-E]',m[2])==[chr(65+j) for j in q['answers']],q['id']+': clé PDF différente'
        actual=corrections[m.end():blocks[i+1].start() if i+1<len(blocks) else len(corrections)]
        assert norm(actual)==norm(q['explanation']),q['id']+': argumentation PDF différente'
def validate_qcm(text,rows):
    # Do not change the historical public PDF contract.
    questions=re.split(r'Corrigés argumentés',text,maxsplit=1)[0]
    if re.search(r'(?m)^Q\d{2} · ',questions):
        return validate_qcm_theme_cards(text,rows)
    if re.search(r'(?m)^Q\d{2}\.[ \t]*',questions):
        return validate_qcm_written_dot(text,rows)
    parts=re.split(r'Corrigés argumentés',text,maxsplit=1)
    assert len(parts)==2,'Corrigés absents'
    questions,corrections=parts
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

def validate_cards_written_recto_verso(text,rows):
    # The independent PDF deck is ordered pedagogically, not by QCM index.
    # Require all 40 bank cards EXACTLY once, regardless of order.
    text=strip_qcm_furniture(without_theme_titles(text,rows))
    blocks=list(re.finditer(r'(?m)^CARTE (\d{2})[ \t]*—[ \t]*RECTO[ \t]*\n',text))
    numbered=[int(m[1]) for m in blocks]
    assert numbered==list(range(1,len(rows)+1)),'Cartes manquantes/dupliquées'
    actual=[]
    for i,m in enumerate(blocks):
        page=text[m.end():blocks[i+1].start() if i+1<len(blocks) else len(text)]
        pair=re.split(r'(?m)^VERSO[ \t]*\n',page,maxsplit=1)
        assert len(pair)==2,'CARTE '+str(i+1)+': recto/verso non identifié'
        actual.append((norm(pair[0]),norm(pair[1])))
    expected=[]
    for q in rows:
        assert len(q['flashcards'])==1,q['id']+': structure de flashcards invalide'
        card=q['flashcards'][0]
        reply=' '.join(card['answers'])
        # A missing 'EXPLICATION' label must not hide additional teaching content.
        assert norm(card['explanation'])==norm(reply),q['id']+': explication de la banque non reproduite dans le PDF'
        expected.append((norm(card['front']),norm(reply)))
    assert len(set(actual))==len(rows),'Doublons recto/verso dans le PDF'
    assert len(set(expected))==len(rows),'Doublons recto/verso dans la banque'
    assert sorted(actual)==sorted(expected),'Le PDF des 40 cartes diverge de la banque'

def validate_cards_lexical_multi(text, rows):
    # Contrat additif : 50 paires exactes contre toutes les flashcards de la banque.
    cards=[f for q in rows for f in q.get('flashcards',[])]
    markers=list(re.finditer('^CARTE ([0-9][0-9]) / ([0-9][0-9])'+chr(10),text,re.M))
    assert [int(m.group(1)) for m in markers]==list(range(1,len(cards)+1)),'Cartes manquantes ou dupliquees'
    assert all(int(m.group(2))==len(cards) for m in markers),'Comptage divergent'
    actual=[]
    for i,mark in enumerate(markers):
        block=text[mark.end():markers[i+1].start() if i+1<len(markers) else len(text)]
        question=block.split('QUESTION'+chr(10),1)
        assert len(question)==2,'Question manquante carte '+str(i+1)
        answer=question[1].split('RÉPONSE À MÉMORISER'+chr(10),1)
        assert len(answer)==2,'Réponse manquante carte '+str(i+1)
        last=answer[1].split('Réviser à l’oral : répondre avant de lire la correction.',1)
        assert len(last)==2,'Fin de carte manquante '+str(i+1)
        actual.append((norm(answer[0]),norm(last[0])))
    expected=[(norm(f['front']),norm(' '.join(f['answers']))) for f in cards]
    assert len(set(actual))==len(cards),'Doublons PDF'
    assert len(set(expected))==len(cards),'Doublons banque'
    assert sorted(actual)==sorted(expected),'PDF différent de la banque canonique'

def validate_cards(text,rows):
    if 'CARTE 01 / 50' in text:
        return validate_cards_lexical_multi(text,rows)
    if re.search(r'(?m)^CARTE \d{2} · ',text):
        return validate_cards_theme_cards(text,rows)
    if re.search(r'(?m)^CARTE \d{2}[ \t]*—[ \t]*RECTO',text):
        return validate_cards_written_recto_verso(text,rows)
    text=without_theme_titles(text,rows)
    blocks=list(re.finditer(r'(?m)^CARTE (\d{2})\s+',text))
    assert [int(m[1]) for m in blocks]==[q['number'] for q in rows],'Cartes manquantes/dupliquées'
    for i,(q,m) in enumerate(zip(rows,blocks)):
        f=q['flashcards'][0]
        actual=text[m.end():blocks[i+1].start() if i+1<len(blocks) else len(text)]
        expected=f['front']+' Réponse. '+' '.join(f['answers'])+' Explication. '+f['explanation']
        written_v53='RECTO • '+f['front']+' VERSO • '+' '.join(f['answers'])+' EXPLICATION • '+f['explanation']
        assert norm(actual) in {norm(expected),norm(written_v53)},q['id']+': recto/verso/explication PDF différents'

def theme_order(rows):
    themes=list(dict.fromkeys(q['theme'] for q in rows))
    return [q for theme in themes for q in rows if q['theme']==theme]

def validate_qcm_theme_cards(text,rows):
    """Themed cards with a printed difficulty before each Qnn · heading.

    Only this concrete layout is admitted. Every clinical character, key,
    difficulty and item is compared; historical parsers remain unchanged.
    """
    parts=re.split(r'Corrigés argumentés',text,maxsplit=1)
    assert len(parts)==2,'Corrigés absents'
    questions,corrections=parts
    ordered=theme_order(rows)
    expected_numbers=[q['number'] for q in ordered]
    levels=list(re.finditer(r'(?m)^(FACILE|MOYEN|DIFFICILE)[ \t]*\nQ(\d{2}) · ',questions))
    assert [int(m[2]) for m in levels]==expected_numbers,'Difficultés/questions manquantes ou dupliquées'
    mapping={'easy':'FACILE','medium':'MOYEN','hard':'DIFFICILE'}
    for q,m in zip(ordered,levels):
        assert m[1]==mapping[q['difficulty']],q['id']+': difficulté PDF différente'
    questions=without_theme_titles(questions,rows)
    questions=re.sub(r'(?m)^(?:FACILE|MOYEN|DIFFICILE)[ \t]*\n','',questions)
    blocks=list(re.finditer(r'(?m)^Q(\d{2}) · ',questions))
    assert [int(m[1]) for m in blocks]==expected_numbers,'Questions manquantes/dupliquées ou ordre thématique différent'
    for i,(q,m) in enumerate(zip(ordered,blocks)):
        actual=questions[m.end():blocks[i+1].start() if i+1<len(blocks) else len(questions)]
        # Cardinalité imprimée dans le pied du cadre : exacte ou rejetée,
        # puis comparaison intégrale de l'énoncé et des cinq choix A-E.
        count_tokens=list(re.finditer(r'(?m)^([1-3]) réponses? attendues?[ ]*$',actual))
        if q['courseId']=='vih_b13_20261027':
            assert len(count_tokens)==1,q['id']+': cardinalité imprimée absente/dupliquée'
        if count_tokens:
            assert len(count_tokens)==1,q['id']+': cardinalité imprimée dupliquée'
            printed=count_tokens[0]
            assert int(printed[1])==len(q['answers'])==q['announcedCorrectCount'],q['id']+': cardinalité imprimée fausse'
            actual=actual[:printed.start()]+actual[printed.end():]
        expected=q['question']+' '+' '.join(chr(65+j)+'. '+s for j,s in enumerate(q['choices']))
        assert norm(actual)==norm(expected),q['id']+': énoncé/choix PDF différents'
    corrections=without_theme_titles(corrections,rows)
    corrections=re.sub(r'(?m)^Corrigés argumentés — suite[ \t]*\n','',corrections)
    blocks=list(re.finditer(r'(?m)^Q(\d{2}) — Réponses : ([A-E](?:, [A-E])*)\. ',corrections))
    assert [int(m[1]) for m in blocks]==expected_numbers,'Corrigés manquants/dupliqués ou ordre différent'
    for i,(q,m) in enumerate(zip(ordered,blocks)):
        assert m[2]==', '.join(chr(65+j) for j in q['answers']),q['id']+': clé PDF différente'
        actual=corrections[m.end():blocks[i+1].start() if i+1<len(blocks) else len(corrections)]
        assert norm(actual)==norm(q['explanation']),q['id']+': argumentation PDF différente'

def validate_cards_theme_cards(text,rows):
    blocks=list(re.finditer(r'(?m)^CARTE (\d{2}) · ([^\n]+)\nRECTO — ',text))
    ordered=sorted(rows,key=lambda q:q['number'])
    assert [int(m[1]) for m in blocks]==[q['number'] for q in ordered],'Cartes manquantes/dupliquées'
    for i,(q,m) in enumerate(zip(ordered,blocks)):
        assert norm(m[2])==norm(q['theme']),q['id']+': thème de carte différent'
        assert len(q['flashcards'])==1,q['id']+': carte unique requise'
        f=q['flashcards'][0]
        actual=text[m.end():blocks[i+1].start() if i+1<len(blocks) else len(text)]
        expected=f['front']+' VERSO — '+' '.join(f['answers'])+' POUR COMPRENDRE — '+f['explanation']
        assert norm(actual)==norm(expected),q['id']+': recto/verso/explication PDF différents'
def _stress_segments(text, pattern):
    markers=list(re.finditer(pattern,text,re.M))
    return [(int(m.group(1)),text[m.end():markers[i+1].start() if i+1<len(markers) else len(text)])
            for i,m in enumerate(markers)]

def _stress_clean(text, rows):
    themes={q['theme'] for q in rows}
    cleaned=[]
    for line in text.splitlines():
        item=line.strip()
        if item.startswith('IFSI ABC') or re.fullmatch(r'GESTION DU STRESS\s*[·•]\s*PAGE\s+\d+\s*/\s*\d+',item):continue
        if item in themes or re.fullmatch(r'\d+\s+(?:questions|corrigés|cartes)',item):continue
        cleaned.append(line)
    return '\n'.join(cleaned)

def validate_stress_qcm(text,rows):
    """Contrôle textuel littéral de 50 questions, 250 choix, clés et 50 corrigés."""
    assert len(rows)==50,'Gestion du stress : 50 QCM attendus'
    parts=text.split('Corrigés argumentés\n',1)
    assert len(parts)==2,'Gestion du stress : séparation corrigés absente'
    questions=_stress_segments(parts[0],r'^Q(\d{2})\s*$')
    corrections=_stress_segments(parts[1],r'^Q(\d{2})\s*$')
    expected=[q['number'] for q in rows]
    assert [n for n,_ in questions]==expected,'Questions manquantes ou dupliquées'
    assert [n for n,_ in corrections]==expected,'Corrigés manquants ou dupliqués'
    levels={'easy':'Facile','medium':'Intermédiaire','hard':'Difficile'}
    for q,(_,segment),(_,corrected) in zip(rows,questions,corrections):
        intro=re.match(r'^\s*(Facile|Intermédiaire|Difficile)\s*[·•]\s*(\d+)\s+r[ée]ponses? attendues?\s*\n',segment)
        assert intro,q['id']+': niveau ou cardinalité absent'
        assert intro[1]==levels[q['difficulty']],q['id']+': difficulté différente'
        assert int(intro[2])==len(q['answers'])==q['announcedCorrectCount'],q['id']+': nombre de réponses divergent'
        area=segment[intro.end():]
        choices=list(re.finditer(r'(?m)^([A-E])\.\s*$',area))
        assert [m[1] for m in choices]==list('ABCDE'),q['id']+': cinq choix obligatoires'
        assert norm(area[:choices[0].start()])==norm(q['question']),q['id']+': énoncé différent'
        for i,m in enumerate(choices):
            portion=area[m.end():choices[i+1].start() if i+1<len(choices) else len(area)]
            assert norm(_stress_clean(portion,rows))==norm(q['choices'][i]),q['id']+': choix '+chr(65+i)+' différent'
        m=re.search(r'(?m)^Bonnes? r[ée]ponses?\s*:\s*([A-E](?:,\s*[A-E]){0,2})\s*$',corrected)
        assert m,q['id']+': clé absente'
        assert norm(corrected[:m.start()])==norm(q['question']),q['id']+': énoncé corrigé différent'
        assert m[1].replace(' ','').split(',')==[chr(65+i) for i in q['answers']],q['id']+': clé différente'
        assert 'Propositions à écarter :' in corrected,q['id']+': justification distracteurs absente'
        explanation,rejected=corrected[m.end():].split('Propositions à écarter :',1)
        assert norm(explanation)==norm(q['explanation']),q['id']+': argumentation différente'
        wrongs=[i for i in range(5) if i not in q['answers']]
        marks=list(re.finditer(r'(?m)^([A-E])\s+[—-]\s+',rejected))
        assert [mark[1] for mark in marks]==[chr(65+i) for i in wrongs],q['id']+': distracteurs omis'
        for i,mark in enumerate(marks):
            part=rejected[mark.end():marks[i+1].start() if i+1<len(marks) else len(rejected)]
            assert norm(_stress_clean(part,rows))==norm(q['choices'][wrongs[i]]),q['id']+': distracteur modifié'

def validate_stress_cards(text,rows):
    assert len(rows)==50,'Gestion du stress : 50 cartes attendues'
    blocks=_stress_segments(text,r'^CARTE (\d{2})\s*$')
    assert [n for n,_ in blocks]==list(range(1,51)),'Cartes absentes ou dupliquées'
    pairs=[]
    for q,(_,block) in zip(rows,blocks):
        assert len(q['flashcards'])==1,q['id']+': une carte par QCM'
        card=q['flashcards'][0]
        assert len(card['answers'])==1,q['id']+': verso unique requis'
        pair=(norm(card['front']),norm(card['answers'][0]))
        assert norm(_stress_clean(block,rows))==norm(' '.join(pair)),q['id']+': carte PDF différente'
        pairs.append(pair)
    assert len(set(pairs))==50,'Cartes identiques dupliquées'
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
            (validate_stress_qcm if role=='qcm' else validate_stress_cards)(text,rows) if course['courseId']=='gestion_stress_professionnel' else (validate_qcm if role=='qcm' else validate_cards)(text,rows)
        print('PASS PDF',course['courseId'],role,asset['pageCount'],'pages')
def main():
    p=argparse.ArgumentParser();p.add_argument('--course');a=p.parse_args()
    courses=json.loads(Path('docs/course-deliveries.json').read_text(encoding='utf8'))['courses']
    selected=[c for c in courses if c.get('publicArtifacts') and (not a.course or c['courseId']==a.course)]
    assert selected,'Aucun contrat PDF sélectionné'
    for c in selected:check(c)
if __name__=='__main__':main()
