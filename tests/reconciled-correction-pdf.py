"""Check every actual PDF in a stable-ID correction, without changing legacy V3.
The accepted flowing sheet has one integrated glossary and native figure labels;
only those two legacy assumptions are replaced after independent geometry checks.
"""
from pathlib import Path
from importlib.machinery import SourceFileLoader
import json,re,hashlib,unicodedata,tempfile
import fitz
ROOT=Path(__file__).resolve().parents[1]
V3=SourceFileLoader('correction_v3',str(ROOT/'tools/pdf-template-v3.py')).load_module()
norm=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).replace('’',"'").lower()
def section_order(doc):
 roots=[x for x in doc.get_toc() if x[0]==1]
 if len(roots)<3 or len({x[1] for x in roots})!=len(roots):return False
 if 'définitions' not in roots[-1][1].lower() or 'pièges' not in roots[-2][1].lower():return False
 if sum('pièges' in x[1].lower() for x in roots)!=1 or not any('synthèse' in x[1].lower() for x in roots[:-2]):return False
 if [x[2] for x in roots]!=sorted(x[2] for x in roots):return False
 return all(1<=pg<=len(doc) and norm(title) in norm(' '.join(s['text'] for s in V3.spans_of(doc[pg-1]) if s['size']>=13)) for _,title,pg in roots)
def sheet_errors(path,r):
 result=V3.validate(path,'sheet',require_review=False);errors=list(result['errors'])
 with fitz.open(path) as doc:
  if section_order(doc) and 'SECTION_ORDER_OR_DUPLICATION' in errors:errors.remove('SECTION_ORDER_OR_DUPLICATION')
  regions=r['nativeDiagramReview']['regions'];assert len(regions)==r['nativeDiagramReview']['count']
  for region in regions:
   rect=fitz.Rect(region['rect']);assert 0<rect.height<=320 and rect.width<=520 and 0<=rect.y0<rect.y1<doc[region['page']-1].rect.height-60
  for i,p in enumerate(doc,1):
   small=[s for s in V3.spans_of(p) if 100<s['bbox'][1]<p.rect.height-105 and s['size']<9]
   allowed=small and all(s['size']>=8.89 and any(x['page']==i and fitz.Rect(x['rect']).contains(fitz.Rect(s['bbox'])) for x in regions) for s in small)
   e=f'p{i}:FONT_TOO_SMALL'
   if allowed and e in errors:errors.remove(e)
 return errors
def qcm_errors(path,bank):
 result=V3.validate(path,'qcm',require_review=False);errors=list(result['errors']);levels={'easy':'Facile','medium':'Intermédiaire','hard':'Difficile'}
 with fitz.open(path) as doc:
  for error in list(errors):
   match=re.fullmatch(r'p(\d+):DIFFICULTY:Q(\d+)',error)
   if not match:continue
   pg,num=map(int,match.groups());words=doc[pg-1].get_text('words');q=next(q for q in bank if q['number']==num)
   anchors=[w for w in words if w[4]==f'Q{num:02d}'];labels=[w for w in words if w[4]==levels[q['difficulty']]]
   if len(anchors)==1 and len([w for w in labels if w[0]>anchors[0][2] and abs((w[1]+w[3]-anchors[0][1]-anchors[0][3])/2)<8])==1:errors.remove(error)
 return errors
manifest=json.loads((ROOT/'docs/course-deliveries.json').read_text(encoding='utf8'))
for r in manifest.get('scopedCourseRevisions',[]):
 if r.get('profile')!='reconciled_written_correction_v1':continue
 assert V3.reference_errors(V3.policy())==[]
 arts={a['role']:a for a in r['publicArtifacts']};bank=json.loads((ROOT/r['bankPath']).read_text(encoding='utf8'))
 assert sheet_errors(ROOT/arts['sheet']['path'],r)==[]
 assert qcm_errors(ROOT/arts['qcm']['path'],bank)==[]
 alltexts={}
 for role,a in arts.items():
  with fitz.open(ROOT/a['path']) as d:
   assert len(d)==a['pageCount'];assert all(p.get_text('text',clip=fitz.Rect(0,55,p.rect.width,p.rect.height-55)).strip() for p in d)
   alltexts[role]=norm('\n'.join(p.get_text() for p in d));assert '\x00' not in alltexts[role]
   for p in d:
    for s in V3.spans_of(p):assert fitz.Rect(s['bbox']).x0>=0 and fitz.Rect(s['bbox']).x1<=p.rect.width+.5
   if role=='qcm':
    pages=[norm(p.get_text()) for p in d]
    for q in bank:assert any(norm(q['question']) in p and all(norm(c) in p for c in q['choices']) for p in pages),q['id']
    last=max(i for i,p in enumerate(pages) if norm(bank[-1]['question']) in p);first=min(i for i,p in enumerate(pages) if norm('Q01 — Réponses :') in p);assert first>last
 for q in bank:
  assert all(norm(x) in alltexts['qcm'] for x in [q['question'],*q['choices'],q['explanation']]),q['id']
  assert norm('Q%02d — Réponses : %s.'%(q['number'],', '.join(chr(65+i) for i in q['answers']))) in alltexts['qcm'],q['id']
  for c in q['flashcards']:assert all(norm(x) in alltexts['flashcards'] for x in [c['front'],*c['answers'],c['explanation']]),q['id']
 vocabulary=json.loads((ROOT/'vocabulaire-v1.json').read_text(encoding='utf8'))['entries']
 for v in vocabulary:
  if v['id'] in r['vocabularyEntryIds']:assert norm(v['term']) in alltexts['sheet'] and norm(v['definition']) in alltexts['sheet'],v['id']
 # Real negative cases: no blanket waiver for small body or unreadable figures.
 for where,size,expected in [((50,500),8,'p3:FONT_TOO_SMALL'),((80,180),8,'p3:FONT_TOO_SMALL')]:
  with tempfile.TemporaryDirectory() as temp:
   d=fitz.open(ROOT/arts['sheet']['path']);d[2].insert_text(where,'Unreadable injected text',fontsize=size);out=Path(temp)/'bad.pdf';d.save(out);d.close();assert expected in sheet_errors(out,r)
 with tempfile.TemporaryDirectory() as temp:
  d=fitz.open(ROOT/arts['sheet']['path']);toc=d.get_toc();toc[-1][2]=1;d.set_toc(toc);out=Path(temp)/'bad.pdf';d.save(out);d.close();assert 'SECTION_ORDER_OR_DUPLICATION' in sheet_errors(out,r)
 print('PASS corrected PDF: all native text/keys/cards/glossary, page ownership, V3 QCM, independent sheet order and bounded readable native labels; three injected defects rejected.')
