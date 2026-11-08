from pathlib import Path
from importlib.machinery import SourceFileLoader
import json,hashlib,sys
import fitz
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'tools'))
template=SourceFileLoader('reviewed_template',str(ROOT/'tools/pdf-template-v3.py')).load_module()
bank_gate=SourceFileLoader('reviewed_bank',str(ROOT/'tools/pdf-bank-coherence.py')).load_module()
cards_gate=SourceFileLoader('reviewed_cards',str(ROOT/'tools/duplex-card-coherence.py')).load_module()
manifest=json.loads((ROOT/'docs/course-deliveries.json').read_text(encoding='utf-8'))
def repaired_difficulty_reading_order(doc,rows):
 # The reviewed legacy PDF has repaired difficulty spans at the end of its
 # content streams. Verify their printed coordinates, then restore reading order
 # for the unchanged exact-text validator. No clinical text is discarded.
 import re
 by_number={q['number']:q for q in rows};found={};levels={'easy':'Facile','medium':'Moyen','hard':'Difficile'}
 for page in doc:
  if 'Corrigés argumentés' in page.get_text():break
  words=page.get_text('words');labels=[w for w in words if w[4] in levels.values()]
  questions=[w for w in words if re.fullmatch(r'Q\d{2,3}',w[4])]
  assert len(questions)==len(labels),'Printed difficulty label missing or duplicated'
  for qword in questions:
   number=int(qword[4][1:]);matches=[w for w in labels if abs((w[1]+w[3]-qword[1]-qword[3])/2)<8 and w[0]>qword[2]]
   assert len(matches)==1 and matches[0][4]==levels[by_number[number]['difficulty']],f'Q{number}: printed difficulty differs'
   assert number not in found;found[number]=matches[0][4]
 assert set(found)==set(by_number)
 questions,corrections=bank_gate.body(doc).split('Corrigés argumentés',1)
 questions='\n'.join(line for line in questions.splitlines() if line.strip() not in levels.values())
 questions=re.sub(r'(?m)^(Q(\d{2,3}))\s*$',lambda m:m[1]+'\n'+found[int(m[2])],questions)
 return questions+'\nCorrigés argumentés'+corrections
def validate_unified_legacy_qcm(doc,rows):
 # This existing print layout presents each A–E rationale once, inside the
 # canonical explanation. The newer boxed layout also has a separate summary.
 import re
 text=repaired_difficulty_reading_order(doc,rows)
 questions,corrections=text.split('Corrigés argumentés',1)
 questions=bank_gate.without_theme_titles(questions,rows);corrections=bank_gate.without_theme_titles(corrections.replace('Corrigés argumentés — suite','').replace('Corrigés argumentés',''),rows)
 marks=list(re.finditer(r'(?m)^Q(\d{2,3})\s*\n',questions))
 assert [int(m[1]) for m in marks]==[q['number'] for q in rows]
 levels={'easy':'Facile','medium':'Moyen','hard':'Difficile'}
 for i,(q,m) in enumerate(zip(rows,marks)):
  actual=questions[m.end():marks[i+1].start() if i+1<len(marks) else len(questions)]
  count=len(q['answers']);assert count==q['announcedCorrectCount']
  expected=levels[q['difficulty']]+' '+q['question']+f' ({count} bonne'+(' réponse)' if count==1 else 's réponses)')+' '+' '.join(chr(65+j)+'. '+c for j,c in enumerate(q['choices']))
  assert bank_gate.norm(actual)==bank_gate.norm(expected),q['id']+': printed question/choices/count/difficulty differ'
 marks=list(re.finditer(r'(?m)^Q(\d{2,3}) — Réponses : ([A-E](?:, [A-E])*)\.\s*',corrections))
 assert [int(m[1]) for m in marks]==[q['number'] for q in rows]
 for i,(q,m) in enumerate(zip(rows,marks)):
  assert m[2]==', '.join(chr(65+j) for j in q['answers']),q['id']+': printed key differs'
  assert len(q['rationales'])==5
  expected=' '.join(chr(65+j)+' - '+('Vrai. ' if j in q['answers'] else 'Faux. ')+t for j,t in enumerate(q['rationales']))
  assert bank_gate.norm(q['explanation'])==bank_gate.norm(expected),q['id']+': rationale coverage differs'
  actual=corrections[m.end():marks[i+1].start() if i+1<len(marks) else len(corrections)]
  assert bank_gate.norm(actual)==bank_gate.norm(expected),q['id']+': printed A–E argument differs'
for r in manifest.get('scopedCourseRevisions',[]):
 if r.get('profile') not in ['reviewed_written_audio_v1','unified_sheet_media_v1']:continue
 rows=json.loads((ROOT/r['bankPath']).read_text(encoding='utf-8'))
 for a in r['publicArtifacts']:
  pdf=ROOT/a['path'];assert hashlib.sha256(pdf.read_bytes()).hexdigest()==a['sha256']
  with fitz.open(pdf) as doc:
   assert len(doc)==a['pageCount']
   if a['role']=='flashcards':assert (cards_gate.validate_duplex_cards(doc,rows) if r.get('profile')=='unified_sheet_media_v1' else cards_gate.validate_compact_duplex_cards(doc,rows))==len(rows)
   else:
    report=template.validate(pdf,a['role'],require_review=False);assert report['status']=='PASS',report['errors']
    if a['role']=='qcm':
     if r.get('profile')=='unified_sheet_media_v1':validate_unified_legacy_qcm(doc,rows)
     else:bank_gate.validate_boxed_inline_rationales(bank_gate.body(doc),rows)
 print('PASS reviewed written/audio PDF: unchanged V3 geometry, exact five-choice bank and every mirrored card face.')
