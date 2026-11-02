import json,importlib.util,copy
from pathlib import Path
import fitz
spec=importlib.util.spec_from_file_location('badge',Path('tools/badge-qcm-coherence.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
for d in json.loads(Path('docs/course-deliveries.json').read_text(encoding='utf8'))['courses']:
 if d.get('qcmPdfLayout')!='theme_badge_cardinality_v1':continue
 rows=json.loads(Path(d['qcmBank']).read_text(encoding='utf8'))
 with fitz.open(d['publicArtifacts']['qcm']['path']) as doc:
  assert m.validate_badge_qcm(doc,rows)==len(rows)
  def rejected(rows):
   try:m.validate_badge_qcm(doc,rows)
   except (AssertionError,IndexError):return
   raise AssertionError('Altération de banque acceptée')
  for field,value in [('question','Énoncé changé'),('choices',['x']*5),('answers',[4]),('difficulty','hard'),('explanation','Argument changé')]:
   bad=copy.deepcopy(rows);bad[0][field]=value;rejected(bad)
  rejected(rows[:-1]);bad=copy.deepcopy(rows);bad[-1]['question']='Dernière question modifiée';rejected(bad)
  bad=copy.deepcopy(rows);bad[0],bad[1]=bad[1],bad[0];rejected(bad)
 print('PASS lecteur QCM sans plafond :',len(rows),'questions, dernières pages et huit mutations contrôlées')
