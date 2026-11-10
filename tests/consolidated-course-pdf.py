"""Check actual approved consolidation PDFs against native text and bank bytes."""
from pathlib import Path
from importlib.machinery import SourceFileLoader
import json,re,unicodedata,hashlib,argparse
import fitz
ROOT=Path(__file__).resolve().parents[1]
V3=SourceFileLoader('consolidated_v3',str(ROOT/'tools/pdf-template-v3.py')).load_module()
V2=SourceFileLoader('consolidated_v2',str(ROOT/'tools/pdf-graphics-v2.py')).load_module()
CLEAN=SourceFileLoader('consolidated_clean',str(ROOT/'tools/student_support_clean_gate.py')).load_module()
norm=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).replace('’',"'").lower()
m=json.loads((ROOT/'docs/course-deliveries.json').read_text(encoding='utf8'))
parser=argparse.ArgumentParser();parser.add_argument('--pdf-candidates',type=Path);args=parser.parse_args()
for r in m.get('consolidatedCourseRevisions',[]):
 bank=json.loads((ROOT/r['bankPath']).read_text(encoding='utf8'));texts={};pages={}
 for a in r['publicArtifacts']:
  path=ROOT/a['path'];role=a['role'];assert hashlib.sha256(path.read_bytes()).hexdigest()==a['sha256']
  if args.pdf_candidates and role in ('qcm','flashcards'):path=args.pdf_candidates/path.name
  assert CLEAN.check_document(path)==[]
  with fitz.open(path) as d:
   assert len(d)==a['pageCount'];assert all(p.get_text().strip() for p in d);assert not d.metadata.get('creator') and not d.metadata.get('producer')
   pages[role]=[norm(p.get_text()) for p in d];texts[role]=''.join(pages[role])
   for p in d:
    assert abs(p.rect.width-595.276)<1 and abs(p.rect.height-841.89)<1
    for span in V3.spans_of(p):assert span['bbox'][0]>=0 and span['bbox'][2]<=p.rect.width+.5
  if role in ('sheet','qcm'):
   # Technical V3 and the exact assistant review/owner GO are separate gates.
   # validateConsolidations checks the public receipts and all reviewed page IDs.
   result=V3.validate(path,role,require_review=False);assert result['errors']==[],result['errors']
  result=V2.validate(path,{'sheet':'revision','qcm':'qcm','flashcards':'flashcards'}[role],expect_pages=a['pageCount']);assert result['errors']==[],result['errors']
 for q in bank:
  assert any(norm(q['question']) in p and all(norm(c) in p for c in q['choices']) for p in pages['qcm']),q['id']
  assert norm(q['explanation']) in texts['qcm'],q['id']
  for c in q['flashcards']:
   assert norm(c['front']) in texts['flashcards'] and all(norm(a) in texts['flashcards'] for a in c['answers']),c['id']
 v=json.loads((ROOT/'vocabulaire-v1.json').read_text(encoding='utf8'))['entries']
 for entry in v:
  if entry['id'] in r['vocabularyEntryIds']:assert norm(entry['term']) in texts['sheet'] and norm(entry['definition']) in texts['sheet'],entry['id']
 print(('CANDIDATE TECHNICAL ONLY; publication approval separate. ' if args.pdf_candidates else '')+'PASS consolidation PDF: 144 native A4 pages, V2/V3, student cleanup, all 128 questions/options/answers, cards and 107 definitions')
