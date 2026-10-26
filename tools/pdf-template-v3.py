"""Mesure la trame réelle. Ne génère et ne signe JAMAIS une revue humaine."""
import argparse, hashlib, json, re, sys
from datetime import datetime
from pathlib import Path
from importlib.machinery import SourceFileLoader
import fitz
ROOT=Path(__file__).resolve().parents[1]
V2=SourceFileLoader('pdf_graphics_v2',str(ROOT/'tools/pdf-graphics-v2.py')).load_module()
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def policy():return json.loads((ROOT/'docs/pdf-template-policy-v3.json').read_text())
def reference_errors(spec,root=ROOT):
    errors=[]
    for role,ref in spec['references'].items():
        p=root/ref['path']
        if not p.is_file() or sha(p)!=ref['sha256']:errors.append('REFERENCE_SHA:'+role);continue
        with fitz.open(p) as doc:
            if len(doc)!=ref['pageCount']:errors.append('REFERENCE_PAGES:'+role)
    return errors

def validate_review(review,role,artifact_sha,pages,spec):
    errors=[];ref=spec['references'][role]
    if not isinstance(review,dict):return ['REVIEW_MISSING']
    expected={'templateId':ref['id'],'templateSha256':ref['sha256'],'artifactSha256':artifact_sha,
              'pageCount':pages,'status':'owner_accepted','method':'all_pages_compared_at_100_and_200_percent',
              'decision':'explicit_graphic_acceptance','reviewerRole':'owner'}
    for k,v in expected.items():
        if review.get(k)!=v:errors.append('REVIEW_'+k.upper())
    checked=review.get('pagesChecked')
    if checked!=list(range(1,pages+1)):errors.append('REVIEW_PAGES_INCOMPLETE')
    # Un résumé public seulement ; rendus, décision détaillée et identité restent privés.
    stamp=review.get('reviewedAt','')
    try:
        d=datetime.fromisoformat(stamp.replace('Z','+00:00'))
        if d.tzinfo is None:raise ValueError()
    except (ValueError,TypeError):errors.append('REVIEW_DATE')
    for k in spec['reviewChecks']:
        if review.get('checks',{}).get(k)!='PASS':errors.append('REVIEW_CHECK:'+k)
    if not re.fullmatch(r'[a-f0-9]{64}',str(review.get('privateEvidenceSha256',''))):errors.append('REVIEW_PRIVATE_EVIDENCE_SHA')
    return errors

def spans_of(page):
    return [s for b in page.get_text('dict')['blocks'] for line in b.get('lines',[]) for s in line['spans'] if s['text'].strip()]

def question_errors(page,text,spans):
    errors=[];questions=[]
    for s in spans:
        m=re.match(r'^Q(\d{1,3})(?:\s|[·.—-]|$)',s['text'].strip())
        if m and not re.search(r'R[eé]ponses?\s*:',s['text'],re.I):questions.append((m.group(1),fitz.Rect(s['bbox'])))
    drawings=page.get_drawings();squares=[item[1] for d in drawings if d.get('color') and min(d['color'])<.8 and d.get('width',1)>0 for item in d.get('items',[]) if item[0]=='re' and 6<=item[1].width<=16 and 6<=item[1].height<=16]
    for i,(number,qr) in enumerate(questions):
        end=questions[i+1][1].y0 if i+1<len(questions) else page.rect.height-50
        choices=[]
        for s in spans:
            r=fitz.Rect(s['bbox']);m=re.match(r'^([□☐]\s*)?([A-E])[.)](?:\s|$)',s['text'].strip())
            if m and qr.y0<r.y0<end:
                choices.append((m.group(2),r))
                if not m.group(1) and not any(sq.x1<=r.x0+2 and 1<=r.x0-sq.x1<=22 and abs((sq.y0+sq.y1-r.y0-r.y1)/2)<9 for sq in squares):errors.append('CHECKBOX_LEFT:Q'+number)
        if [c[0] for c in choices]!=list('ABCDE'):errors.append('FIVE_CHOICES_SAME_PAGE:Q'+number);continue
        bottom=max(r.y1 for _,r in choices)
        boxes=[d['rect'] for d in drawings if d.get('rect') and d['rect'].x0<=qr.x0+2 and d['rect'].x1>=max(r.x1 for _,r in choices)-2 and d['rect'].y0<=qr.y0 and d['rect'].y1>=bottom and d['rect'].height<page.rect.height-100 and len(d.get('items',[]))>=1]
        if not boxes:errors.append('QUESTION_BOX:Q'+number)
        box=min(boxes,key=lambda b:b.height) if boxes else qr
        region=' '.join(s['text'] for s in spans if box.y0<=s['bbox'][1] and s['bbox'][3]<=box.y1)
        if not re.search(r'\b(?:Facile|Moyen|Difficile)\b',region,re.I):errors.append('DIFFICULTY:Q'+number)
    return errors,len(questions)

def validate(path,role,spec=None,review=None,require_review=True):
    spec=spec or policy();kind={'sheet':'revision','qcm':'qcm'}[role];g=spec['geometry']
    result=V2.validate(path,kind,min_body_pt=g['bodyMinimumPt']);errors=list(result['errors']);pages=[];qcount=0;corrections=False
    with fitz.open(path) as doc:
        for ix,page in enumerate(doc):
            pe=[];spans=spans_of(page);w,h=page.rect.width,page.rect.height
            for side,expected in [('top',g['topBandHeightPt']),('bottom',g['bottomBandHeightPt'])]:
                candidates=[]
                for d in page.get_drawings():
                    fill=d.get('fill');r=d.get('rect')
                    if not fill or not r or max(abs(fill[j]-g['purpleRgb'][j]/255) for j in range(3))>g['colorTolerance']:continue
                    edge=abs(r.y0) if side=='top' else abs(r.y1-h)
                    if edge<=1 and abs(r.x0)<=1 and abs(r.x1-w)<=1 and abs(r.height-expected)<=g['bandTolerancePt']:candidates.append(r)
                if not candidates:pe.append('MODEL_BAND_'+side.upper())
                # Ne pas accepter un bandeau présent dans les objets mais masqué au rendu.
                pix=page.get_pixmap(matrix=fitz.Matrix(1,1),alpha=False)
                hits=0
                for xf in (.05,.25,.5,.75,.95):
                    for yf in (.2,.5,.8):
                        y=expected*yf if side=='top' else h-expected*yf
                        rgb=pix.pixel(min(pix.width-1,int(w*xf)),min(pix.height-1,int(y)))
                        hits+=max(abs(rgb[j]/255-g['purpleRgb'][j]/255) for j in range(3))<=g['colorTolerance']
                if hits<13:pe.append('MODEL_BAND_RENDER_'+side.upper())
            for s in spans:
                font=re.sub(r'^[A-Z]{6}\+','',s['font'])
                if not font.startswith(g['fontFamily']):pe.append('MODEL_FONT')
                r=fitz.Rect(s['bbox'])
                if g['topBandHeightPt']+3<r.y0<h-g['bottomBandHeightPt']-3 and (r.x0<36 or r.x1>w-36):pe.append('MODEL_BODY_MARGIN')
            footer=' '.join(s['text'] for s in spans if s['bbox'][1]>=h-42)
            if not re.search(r'(?<!\d)'+str(ix+1)+r'\s*/\s*'+str(len(doc))+r'(?!\d)',footer):pe.append('PAGE_NUMBER')
            text=page.get_text()
            if role=='qcm':
                answer_match=re.search(r'^Corrig[eé]s argument[eé]s\s*$',text,re.I|re.M)
                if answer_match:corrections=True
                if not corrections:
                    qe,n=question_errors(page,text,spans);pe+=qe;qcount+=n
                    if re.search(r'R[eé]ponses?\s*:',text,re.I):pe.append('EARLY_ANSWER')
                elif re.search(r'(?m)^Q\d+\s*·',text):pe.append('QUESTION_AFTER_CORRECTIONS')
            errors.extend('p'+str(ix+1)+':'+e for e in sorted(set(pe)));pages.append({'page':ix+1,'errors':sorted(set(pe))})
        count=len(doc)
        if role=='sheet' and count>=6:
            toc=doc.get_toc();roots=[row for row in toc if row[0]==1]
            if not roots or 'définitions et mots-clés' not in roots[-1][1].lower():errors.append('TOC_GLOSSARY_LAST')
            if any(not 1<=row[2]<=count for row in toc):errors.append('TOC_DESTINATION')
    if role=='qcm' and (not corrections or not qcount):errors.append('QCM_SECTIONS')
    if require_review:errors+=validate_review(review,role,sha(path),count,spec)
    return {'contract':spec['contract'],'role':role,'artifactSha256':sha(path),'pageCount':count,'status':'FAIL' if errors else 'PASS','errors':errors,'pages':pages,'technicalOnly':not require_review,'humanReviewRequired':True,'humanReviewProvenByCI':False}

def changed_roles(old,delivery,root=ROOT):
    roles=[]
    for role in ('sheet','qcm'):
        a=delivery.get('publicArtifacts',{}).get(role);b=old.get('publicArtifacts',{}).get(role)
        if not old or a!=b:roles.append(role);continue
        if a and (not (root/a['path']).is_file() or sha(root/a['path'])!=b['sha256']):roles.append(role)
    return roles

def batch(base,root=ROOT):
    import subprocess
    old=json.loads(subprocess.check_output(['git','show',base+':docs/course-deliveries.json'],cwd=root));now=json.loads((root/'docs/course-deliveries.json').read_text());previous={c['courseId']:c for c in old['courses']}
    spec=policy();errors=reference_errors(spec);checked=0
    for delivery in now['courses']:
        if delivery.get('packFormat')!='written_v1':continue
        roles=changed_roles(previous.get(delivery['courseId'],{}),delivery,root)
        if not roles:continue
        receipt=delivery.get('templateConformance',{})
        if receipt.get('contract')!=spec['contract']:errors.append(delivery['courseId']+':TEMPLATE_CONFORMANCE_MISSING')
        for role in roles:
            a=delivery.get('publicArtifacts',{}).get(role);p=root/(a or {}).get('path','')
            if not a or not p.is_file():errors.append(delivery['courseId']+':'+role+':PDF_MISSING');continue
            r=validate(p,role,spec,receipt.get('artifacts',{}).get(role));checked+=1
            if sha(p)!=a.get('sha256') or r['pageCount']!=a.get('pageCount'):r['errors'].append('ARTIFACT_BYTES_OR_PAGES')
            errors.extend(delivery['courseId']+':'+role+':'+e for e in r['errors'])
    return {'checked':checked,'errors':errors,'status':'FAIL' if errors else 'PASS','historicalUnchangedPreserved':True}

def main():
    p=argparse.ArgumentParser();p.add_argument('pdf',nargs='?');p.add_argument('--role',choices=['sheet','qcm']);p.add_argument('--base');p.add_argument('--review');p.add_argument('--technical-only',action='store_true');p.add_argument('--report');a=p.parse_args()
    if a.base:
        if not re.fullmatch('[a-f0-9]{40}',a.base):p.error('SHA Git complet requis')
        r=batch(a.base)
    else:
        if not a.pdf or not a.role:p.error('PDF et --role requis')
        r=validate(a.pdf,a.role,review=json.loads(Path(a.review).read_text()) if a.review else None,require_review=not a.technical_only)
    if a.report:Path(a.report).write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(r,ensure_ascii=False));return 1 if r['errors'] else 0
if __name__=='__main__':sys.exit(main())
