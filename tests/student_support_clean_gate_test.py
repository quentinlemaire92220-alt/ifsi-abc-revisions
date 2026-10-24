from pathlib import Path
from tempfile import TemporaryDirectory
import sys
import fitz
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from student_support_clean_gate import check_document
with TemporaryDirectory() as t:
 root=Path(t)
 def make(name,body):
  p=root/name
  doc=fitz.open()
  page=doc.new_page()
  page.insert_text((60,60),body)
  doc.save(p)
  doc.close()
  return p
 clean=make('fiche.pdf','UE D1.1 - La communication - Fiche de revision - Page 1')
 assert not check_document(clean)
 for s in ['Brouillon','A valider','Non publie','Fiche V5.3','Edition V1.23','DRAFT_REVIEW_ONLY']:
  p=make(s.replace(' ','_')+'.pdf','UE D1.1 - La communication - '+s)
  assert check_document(p),s
 txt=root/'vocal.txt'
 txt.write_text('Bonjour, nous allons reviser la communication.',encoding='utf-8')
 assert not check_document(txt)
 txt.write_text('Version privee a valider',encoding='utf-8')
 assert check_document(txt)
print('OK : gate documents et metadonnees etudiants - controle negatif et positif')
