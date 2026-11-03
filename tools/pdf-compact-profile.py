"""Explicit compact profile; legacy V3 remains unchanged and still reports its errors.
Only four legacy assumptions may be replaced, after independently checking the
real PDF geometry, headings and destinations. This never attests owner page review.
"""
import json,re,sys,unicodedata
from pathlib import Path
from importlib.machinery import SourceFileLoader
import fitz
ROOT=Path(__file__).resolve().parents[1]
V3=SourceFileLoader('compact_legacy_v3',str(ROOT/'tools/pdf-template-v3.py')).load_module()
def norm(s):return re.sub(r'[^\w]+','',unicodedata.normalize('NFKC',s).casefold())
def section_check(doc):
    roots=[r for r in doc.get_toc() if r[0]==1]
    lex=[i for i,r in enumerate(roots) if re.match(r'^LEXIQUE\s+\d+\b',r[1])]
    if not lex or lex!=list(range(lex[0],len(roots))):return False
    if [int(re.match(r'^LEXIQUE\s+(\d+)',roots[i][1])[1]) for i in lex]!=list(range(1,len(lex)+1)):return False
    if lex[0]<3 or 'pièges' not in roots[lex[0]-1][1].casefold():return False
    before=roots[:lex[0]-1]
    if not any('synthèse' in r[1].casefold() for r in before):return False
    if sum('pièges' in r[1].casefold() for r in roots)!=1:return False
    if [r[2] for r in roots]!=sorted(r[2] for r in roots):return False
    for _,title,pg in roots[1:]:
        if not 1<=pg<=len(doc):return False
        large=' '.join(s['text'] for s in V3.spans_of(doc[pg-1]) if s['size']>=13)
        if norm(title) not in norm(large):return False
    return True
def node_label(page,s):
    if not re.fullmatch('[A-F]',s['text']) or not 8<=s['size']<9:return False
    r=fitz.Rect(s['bbox'])
    for d in page.get_drawings():
        circle=d.get('rect')
        if (d.get('fill') and circle and 15<=circle.width<=17 and 15<=circle.height<=17
            and len(d.get('items',[]))==4 and all(i[0]=='c' for i in d['items'])
            and circle.contains(r) and abs((r.x0+r.x1-circle.x0-circle.x1)/2)<1
            and abs((r.y0+r.y1-circle.y0-circle.y1)/2)<1):return True
    return False
def validate(path):
    legacy=V3.validate(path,'sheet',require_review=False)
    remaining=list(legacy['errors']);replaced=[]
    with fitz.open(path) as doc:
        if section_check(doc):
            for e in ['SECTION_ORDER_OR_DUPLICATION','TOC_GLOSSARY_LAST']:
                if e in remaining:remaining.remove(e);replaced.append(e)
        for n,p in enumerate(doc,1):
            spans=V3.spans_of(p)
            footer=' '.join(s['text'] for s in spans if s['bbox'][1]>=p.rect.height-42)
            e=f'p{n}:PAGE_NUMBER'
            if e in remaining and re.search(r'(?<!\d)0*'+str(n)+r'\s*/\s*'+str(len(doc))+r'(?!\d)',footer):remaining.remove(e);replaced.append(e)
            small=[s for s in spans if 100<s['bbox'][1]<p.rect.height-105 and s['size']<9]
            e=f'p{n}:FONT_TOO_SMALL'
            if e in remaining and small and len(small)<=24 and all(node_label(p,s) for s in small):remaining.remove(e);replaced.append(e)
    return {'profile':'compact_thematic_lexicon_v1','status':'FAIL' if remaining else 'PASS','errors':remaining,'legacyErrors':legacy['errors'],'independentlyReplaced':replaced,'artifactSha256':legacy['artifactSha256'],'pageCount':legacy['pageCount'],'ownerReviewAttestedByTool':False}
if __name__=='__main__':
    r=validate(sys.argv[1]);print(json.dumps(r,ensure_ascii=False));sys.exit(bool(r['errors']))
