from pathlib import Path
import sys,json,re,hashlib,unicodedata
from importlib.machinery import SourceFileLoader
import fitz
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'tools'))
template=SourceFileLoader('qcm_card_template',str(ROOT/'tools/pdf-template-v3.py')).load_module()
def norm(s):
 for dash in ['\u2011','\u2013','\u2014']:s=s.replace(dash,'-')
 return re.sub(r'\s+','',unicodedata.normalize('NFKC',s))
def body(p):return p.get_text(clip=fitz.Rect(0,46,p.rect.width,p.rect.height-43))
def blocks(text):return list(re.finditer(r'(?m)^Q(\d{2})\s+',text))
m=json.loads((ROOT/'docs/course-deliveries.json').read_text(encoding='utf8'))
for r in m.get('scopedCourseRevisions',[]):
 if r.get('profile')!='qcm_flashcards_only_v1':continue
 rows=json.loads((ROOT/r['bankPath']).read_text(encoding='utf8'))
 for a in r['publicArtifacts']:
  path=ROOT/a['path'];assert hashlib.sha256(path.read_bytes()).hexdigest()==a['sha256']
  with fitz.open(path) as doc:
   assert len(doc)==a['pageCount'];assert all(p.get_text().strip() for p in doc)
   if a['role']=='qcm':
    report=template.validate(path,'qcm',require_review=False);assert report['status']=='PASS',report['errors']
    for mode,text in [('questions','\n'.join(body(p) for p in doc[:23])),('corrections','\n'.join(body(p) for p in doc[24:]))]:
     marks=blocks(text);assert [int(x[1]) for x in marks]==list(range(1,91))
     for i,(q,mark) in enumerate(zip(rows,marks)):
      actual=text[mark.end():marks[i+1].start() if i+1<len(marks) else len(text)]
      if mode=='questions':expected=q['question']+' '+{'easy':'Facile','medium':'Moyen','hard':'Difficile'}[q['difficulty']]+' - '+q['theme']+' '+' '.join('ABCDE'[k]+'. '+v for k,v in enumerate(q['choices']))
      else:expected=q['question']+' Réponses exactes : '+', '.join('ABCDE'[k] for k in q['answers'])+' '+q['explanation']
      assert norm(actual)==norm(expected),(q['id'],mode,'PDF text differs')
    grid=re.findall(r'Q(\d{2})\s+([A-E](?:,\s*[A-E])*)',body(doc[23]));assert len(grid)==90
    for (n,letters),q in zip(grid,rows):assert int(n)==q['number'] and re.findall('[A-E]',letters)==['ABCDE'[i] for i in q['answers']]
   else:
    W,H=doc[0].rect.width,doc[0].rect.height;M=38;CW=W-2*M;gap=12;ww=(CW-gap)/2;top=H-68;bottom=65;hh=(top-bottom-2*gap)/3
    for start in range(0,90,6):
     for back in [False,True]:
      page=doc[start//6*2+int(back)]
      for i,q in enumerate(rows[start:start+6]):
       row,col=divmod(i,2);col=1-col if back else col;x=M+col*(ww+gap);y=top-row*(hh+gap)
       text=page.get_text(clip=fitz.Rect(x+3,H-y+28,x+ww-3,H-y+hh-3))
       c=q['flashcards'][0];expected=' '.join(c['answers'])+' '+c['explanation'] if back else c['front'];assert norm(text)==norm(expected),(q['id'],back,'Printed card differs')
  print('PASS exact PDF/bank text:',r['courseId'],a['role'],a['pageCount'],'pages')
