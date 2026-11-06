from pathlib import Path
from importlib.machinery import SourceFileLoader
import json,hashlib,sys
import fitz
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'tools'))
template=SourceFileLoader('reviewed_template',str(ROOT/'tools/pdf-template-v3.py')).load_module()
bank_gate=SourceFileLoader('reviewed_bank',str(ROOT/'tools/pdf-bank-coherence.py')).load_module()
cards_gate=SourceFileLoader('reviewed_cards',str(ROOT/'tools/duplex-card-coherence.py')).load_module()
manifest=json.loads((ROOT/'docs/course-deliveries.json').read_text(encoding='utf-8'))
for r in manifest.get('scopedCourseRevisions',[]):
 if r.get('profile')!='reviewed_written_audio_v1':continue
 rows=json.loads((ROOT/r['bankPath']).read_text(encoding='utf-8'))
 for a in r['publicArtifacts']:
  pdf=ROOT/a['path'];assert hashlib.sha256(pdf.read_bytes()).hexdigest()==a['sha256']
  with fitz.open(pdf) as doc:
   assert len(doc)==a['pageCount']
   if a['role']=='flashcards':assert cards_gate.validate_compact_duplex_cards(doc,rows)==len(rows)
   else:
    report=template.validate(pdf,a['role'],require_review=False);assert report['status']=='PASS',report['errors']
    if a['role']=='qcm':bank_gate.validate_boxed_inline_rationales(bank_gate.body(doc),rows)
 print('PASS reviewed written/audio PDF: unchanged V3 geometry, exact five-choice bank and every mirrored card face.')
