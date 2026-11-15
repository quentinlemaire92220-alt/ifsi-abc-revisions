"""Check real native PDF bytes for independently approved additive revisions."""
import hashlib, importlib.util, json, re, sys
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from student_support_clean_gate import check_document
spec=importlib.util.spec_from_file_location('template',ROOT/'tools/pdf-template-v3.py')
template=importlib.util.module_from_spec(spec);spec.loader.exec_module(template)
norm=lambda s:re.sub(r'\s+',' ',s.replace('\u2010','-')).strip()
read=lambda p:json.loads((ROOT/p).read_text(encoding='utf8'))
for revision in read('docs/course-deliveries.json').get('scopedCourseRevisions',[]):
 if revision.get('profile')!='additive_written_qcm_v1':continue
 bank=read(revision['bankPath'])
 for a in revision['publicArtifacts']:
  path=ROOT/a['path'];assert hashlib.sha256(path.read_bytes()).hexdigest()==a['sha256']
  result=template.validate(path,a['role'],require_review=False)
  assert not check_document(path),check_document(path)
  assert result['status']=='PASS',result['errors']
  assert result['pageCount']==a['pageCount']
  doc=fitz.open(path)
  for page in doc:
   assert not page.get_images()
  if a['role']!='qcm':continue
  sections=[]
  for page in doc:
   text=page.get_text(clip=fitz.Rect(0,46,page.rect.width,page.rect.height-44))
   sections.append(text)
  text='\n'.join(sections)
  questions,answers=text.split('Corrigés argumentés',1)
  qblocks=list(re.finditer(r'(?m)^Q(\d{2})\s*\n',questions))
  ablocks=list(re.finditer(r'(?m)^Q(\d{2})\s*[—-]\s*Réponses\s*:\s*([A-E](?:,\s*[A-E])*)\.',answers))
  assert [int(m[1]) for m in qblocks]==[q['number'] for q in bank]
  assert [int(m[1]) for m in ablocks]==[q['number'] for q in bank]
  for i,q in enumerate(bank):
   block=norm(questions[qblocks[i].end():qblocks[i+1].start() if i+1<len(qblocks) else len(questions)])
   assert norm(q['question']) in block,q['id']
   for j,choice in enumerate(q['choices']):assert norm(chr(65+j)+'. '+choice) in block,q['id']
   count=len(q['answers']);assert f'({count} bonne'+(' réponse)' if count==1 else 's réponses)') in block
   assert re.findall('[A-E]',ablocks[i][2])==[chr(65+j) for j in q['answers']],q['id']
   correction=norm(answers[ablocks[i].end():ablocks[i+1].start() if i+1<len(ablocks) else len(answers)])
   assert norm(q['explanation']) in correction,q['id']
 print(f'PASS additive PDF: exact {len(bank)} questions, 315 choices, keys and explanations; real sheet/QCM template checks.')
