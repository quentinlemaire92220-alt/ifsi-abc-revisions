"""Défauts injectés dans de vrais PDF ; aucune validation utilisateur produite."""
import copy, json, tempfile
from pathlib import Path
from importlib.machinery import SourceFileLoader
import fitz
ROOT=Path(__file__).resolve().parents[1]
gate=SourceFileLoader('template_v3',str(ROOT/'tools/pdf-template-v3.py')).load_module()
SHEET=ROOT/'assets/relation-soignant-ecoute/D1_Relation_Soignant_Soigne_Fiche_21p_20261026.pdf'
QCM=ROOT/'assets/relation-soignant-ecoute/D1_Relation_Soignant_Soigne_QCM_48_Corriges_20261026.pdf'
spec=gate.policy()
assert gate.reference_errors(spec)==[]
for role,p in [('sheet',SHEET),('qcm',QCM)]:
    assert gate.validate(p,role,require_review=False)['errors']==[]
    assert 'REVIEW_MISSING' in gate.validate(p,role)['errors']
def mutate_pdf(source,role,mutate,code):
    with tempfile.TemporaryDirectory() as tmp:
        d=fitz.open(source);mutate(d);out=Path(tmp)/'broken.pdf';d.save(out);d.close()
        errors=gate.validate(out,role,require_review=False)['errors']
        assert any(code in e for e in errors),(code,errors)
def cover_top(d):d[1].draw_rect(fitz.Rect(0,0,596,46),fill=(1,1,1),color=None)
mutate_pdf(SHEET,'sheet',cover_top,'MODEL_BAND_RENDER_TOP')
mutate_pdf(SHEET,'sheet',lambda d:d.set_toc([[1,'Section ajoutée après le lexique',21]]),'TOC_GLOSSARY_LAST')
mutate_pdf(SHEET,'sheet',lambda d:d[0].draw_rect(fitz.Rect(0,800,596,843),fill=(1,0,0),color=None),'MODEL_BAND_RENDER_BOTTOM')
mutate_pdf(SHEET,'sheet',lambda d:d[0].insert_text((45,780),'Wrong font',fontname='helv',fontsize=10),'MODEL_FONT')
mutate_pdf(SHEET,'sheet',lambda d:d[0].insert_text((20,140),'Wrong margin',fontsize=10),'MODEL_BODY_MARGIN')
def erase_footer(d):
    p=d[2]
    for s in gate.spans_of(p):
        if s['bbox'][1]>800:p.add_redact_annot(s['bbox'],fill=tuple(v/255 for v in spec['geometry']['purpleRgb']))
    p.apply_redactions(images=0,graphics=0)
mutate_pdf(SHEET,'sheet',erase_footer,'PAGE_NUMBER')
def erase_choice(d):
    p=d[1];s=next(s for s in gate.spans_of(p) if s['text'].startswith('B.'));p.add_redact_annot(s['bbox'],fill=(1,1,1));p.apply_redactions(images=0,graphics=0)
mutate_pdf(QCM,'qcm',erase_choice,'FIVE_CHOICES_SAME_PAGE')
def erase_checkbox(d):
    p=d[1];square=gate.V2.vector_squares(p)[0]
    p.add_redact_annot(square,fill=(1,1,1));p.apply_redactions(images=0,graphics=2,text=1)
mutate_pdf(QCM,'qcm',erase_checkbox,'CHECKBOX_LEFT')
def erase_difficulty(d):
    p=d[1];s=next(s for s in gate.spans_of(p) if s['text']=='MOYEN');p.add_redact_annot(s['bbox'],fill=(1,1,1));p.apply_redactions(images=0,graphics=0)
mutate_pdf(QCM,'qcm',erase_difficulty,'DIFFICULTY')
def erase_boxes(d):
    p=d[1]
    # Les traits sont retirés ; textes, glyphes des choix et difficultés sont intacts.
    shapes=p.get_drawings()
    for shape in shapes:
        if 60<shape['rect'].y0<800 and shape['rect'].height>100:p.add_redact_annot(shape['rect'],fill=False)
    p.apply_redactions(images=0,graphics=2,text=1)
mutate_pdf(QCM,'qcm',erase_boxes,'QUESTION_BOX')
mutate_pdf(QCM,'qcm',lambda d:d[0].insert_text((45,780),'Réponses : A.',fontsize=10),'EARLY_ANSWER')
ref=spec['references']['sheet'];pages=21
review={'templateId':ref['id'],'templateSha256':ref['sha256'],'artifactSha256':gate.sha(SHEET),'pageCount':pages,'status':'owner_accepted','method':'all_pages_compared_at_100_and_200_percent','decision':'explicit_graphic_acceptance','reviewerRole':'owner','pagesChecked':list(range(1,pages+1)),'reviewedAt':'2026-10-26T16:00:00+01:00','checks':{k:'PASS' for k in spec['reviewChecks']},'privateEvidenceSha256':'a'*64}
assert gate.validate_review(review,'sheet',gate.sha(SHEET),pages,spec)==[]
for key,value in [('artifactSha256','b'*64),('templateSha256','c'*64),('templateId','autre'),('pageCount',20),('status','pending'),('method','automatic'),('decision','go_production'),('reviewerRole','script'),('pagesChecked',[1,21]),('pagesChecked',[True]+list(range(2,pages+1))),('reviewedAt','hier'),('reviewedAt',42),('checks',{}),('checks',[]),('privateEvidenceSha256','absent')]:
    broken=copy.deepcopy(review);broken[key]=value;assert gate.validate_review(broken,'sheet',gate.sha(SHEET),pages,spec),(key,value)
bad=copy.deepcopy(spec);bad['references']['sheet']['sha256']='d'*64;assert 'REFERENCE_SHA:sheet' in gate.reference_errors(bad)
a={'path':str(SHEET.relative_to(ROOT)),'sha256':gate.sha(SHEET),'pageCount':21};old={'publicArtifacts':{'sheet':a}};assert gate.changed_roles(old,copy.deepcopy(old))==[]
new=copy.deepcopy(old);new['publicArtifacts']['sheet']['sha256']='e'*64;assert gate.changed_roles(old,new)==['sheet']
old=copy.deepcopy(new);assert gate.changed_roles(old,new)==['sheet'] # octets changés sans déclaration fidèle
print('PASS trame V3 : vrais PDF fiche/QCM, 11 défauts graphiques, 15 faux reçus, référence altérée et modification cachée refusés ; historique inchangé exempté.')

# Exercer aussi l'entrée de publication : lot nouveau, reçu absent, puis historique.
import shutil, subprocess
with tempfile.TemporaryDirectory() as tmp:
    root=Path(tmp);(root/'docs').mkdir();(root/'docs/course-deliveries.json').write_text(json.dumps({'courses':[]}))
    def git(*args):return subprocess.check_output(['git',*args],cwd=root,stderr=subprocess.DEVNULL).decode().strip()
    git('init');git('add','docs/course-deliveries.json');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','base');base=git('rev-parse','HEAD')
    c={'courseId':'fixture','packFormat':'written_v1','publicArtifacts':{},'templateConformance':{'contract':spec['contract'],'artifacts':{}}}
    for role,source in [('sheet',SHEET),('qcm',QCM)]:
        dest=root/'assets'/source.name;dest.parent.mkdir(exist_ok=True);shutil.copyfile(source,dest)
        count=len(fitz.open(source));a={'path':str(dest.relative_to(root)),'sha256':gate.sha(source),'pageCount':count};c['publicArtifacts'][role]=a
        r=copy.deepcopy(review);r.update(templateId=spec['references'][role]['id'],templateSha256=spec['references'][role]['sha256'],artifactSha256=a['sha256'],pageCount=count,pagesChecked=list(range(1,count+1)));c['templateConformance']['artifacts'][role]=r
    manifest=root/'docs/course-deliveries.json'
    manifest.write_text(json.dumps({'courses':[c]}));assert gate.batch(base,root)['errors']==[]
    missing=copy.deepcopy(c);del missing['templateConformance']['artifacts']['qcm'];manifest.write_text(json.dumps({'courses':[missing]}));assert any('REVIEW_MISSING' in e for e in gate.batch(base,root)['errors'])
    manifest.write_text(json.dumps({'courses':[c]}));git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','published');published=git('rev-parse','HEAD')
    legacy=copy.deepcopy(c);del legacy['templateConformance'];manifest.write_text(json.dumps({'courses':[legacy]}));assert gate.batch(published,root)['checked']==0
    target=root/c['publicArtifacts']['qcm']['path'];d=fitz.open(target);d.set_metadata({'subject':'octets changés sans manifeste'});d.save(str(target)+'.tmp');d.close();target.write_bytes(Path(str(target)+'.tmp').read_bytes())
    assert any('REVIEW_MISSING' in e for e in gate.batch(published,root)['errors'])
print('PASS entrée de publication : nouveau lot contrôlé, QCM sans revue bloqué, octets modifiés sans déclaration détectés, historique conservé.')
