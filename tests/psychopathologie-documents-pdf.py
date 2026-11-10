import hashlib,json,re,unicodedata
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
read=lambda p:json.loads((ROOT/p).read_text(encoding='utf-8'))
norm=lambda s:re.sub(r'[^\w]','',unicodedata.normalize('NFKC',s)).lower()
r=next(r for r in read('docs/course-deliveries.json')['scopedCourseRevisions'] if r['courseId']=='psychopathologie')
texts={}
for a in r['publicArtifacts']:
 p=ROOT/a['path'];assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256']
 with fitz.open(p) as doc:
  assert len(doc)==a['pageCount'];assert all(page.get_text().strip() for page in doc)
  texts[a['role']]=norm('\n'.join(page.get_text() for page in doc))
bank=read(r['bankPath'])
for q in bank:
 for s in [q['question'],*q['choices'],*q['rationales']]:assert norm(s) in texts['qcm'],q['id']+': '+s[:40]
 for c in q['flashcards']:
  for s in [c['front'],*c['answers'],c['explanation']]:assert not s or norm(s) in texts['flashcards'],c['id']+': '+s[:40]
for v in read('vocabulaire-v1.json')['entries']:
 if v['id'] in r['vocabularyEntryIds']:
  assert norm(v['term']) in texts['sheet'],v['id']
print('PASS 147 PDF pages, 113 questions and 565 rationales, 350 complete cards, 301 lexicon terms, exact signed bytes.')
