#!/usr/bin/env python3
"""IFSI ABC — QA géométrique des PDF étudiants, sans prétendre certifier la pédagogie."""
from __future__ import annotations
import argparse, hashlib, json, math, re
from pathlib import Path
import fitz

ROLES=('fiche','qcm','flashcards')
def purple(c):
    return bool(c and len(c)>=3 and c[0]>=.23 and c[2]>=.32 and c[0]>c[1]*1.12 and c[2]>c[1]*1.18)

def text_lines(page):
    out=[]
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines',[]):
            ss=line['spans']
            if ss:
                txt=''.join(s['text'] for s in ss).strip()
                if txt: out.append((txt,fitz.Rect(line['bbox']),ss))
    return out

def inspect(pdf:Path,role:str,expected_pages:int|None=None,min_font:float=7.4,render_dir:Path|None=None):
    if role not in ROLES:raise ValueError('Rôle PDF inconnu : '+str(role))
    report={'version':2,'file':pdf.name,'role':role,'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),
            'automatic_review_is_not_scientific_or_visual_owner_approval':True,'pages':[],'errors':[]}
    with fitz.open(pdf) as doc:
        if not doc.is_pdf or doc.needs_pass:
            report['errors'].append('PDF chiffré ou invalide');report['status']='FAIL';return report
        if expected_pages is not None and len(doc)!=expected_pages:
            report['errors'].append(f'Pagination {len(doc)}, attendu {expected_pages}')
        all_body=[];all_choices=[]
        for n,page in enumerate(doc,1):
            errors=[];W,H=page.rect.width,page.rect.height
            drawings=page.get_drawings();lines=text_lines(page)
            bands=[fitz.Rect(d['rect']) for d in drawings if purple(d.get('fill')) and
                   fitz.Rect(d['rect']).width>=.89*W and fitz.Rect(d['rect']).height>=18]
            header=any(r.y0<=4 and r.y1>=20 and r.y1<.15*H for r in bands)
            footer=any(r.y0>.84*H and r.y1>=H-5 for r in bands)
            if not header:errors.append('Bandeau violet supérieur pleine largeur absent')
            if not footer:errors.append('Bandeau violet inférieur pleine largeur absent')
            if not (590<W<600 and 837<H<847):errors.append('Format de page non A4')
            if not lines:errors.append('Page sans texte sélectionnable')
            if page.get_images():errors.append('Image intégrée interdite pour un PDF écrit')
            if not [r for _,r,_ in lines if r.y0>45 and r.y1<H-40]:errors.append('Page sans contenu utile')
            for t,r,spans in lines:
                if not all(math.isfinite(v) for v in r):
                    errors.append('Coordonnées non finies');continue
                if r.x0<-1 or r.y0<-1 or r.x1>W+1 or r.y1>H+1:
                    errors.append('Texte hors de la page : '+t[:35])
                for s in spans:
                    if s['size']<min_font-.001:errors.append('Police trop petite : '+str(round(s['size'],1))+' pt ('+t[:24]+')')
            # Une vraie collision entre deux lignes est détectée par le chevauchement des boîtes PDF.
            for i,(txt,rect,_) in enumerate(lines):
                if rect.y0<45 or rect.y1>H-40:continue
                for title,other,_ in lines[i+1:]:
                    if other.y0<45 or other.y1>H-40:continue
                    ix=rect & other
                    if ix.is_empty:continue
                    area=min(rect.get_area(),other.get_area())
                    if area>1 and ix.get_area()/area>.38 and ix.height>min(rect.height,other.height)*.65:
                        errors.append('Deux lignes de texte se chevauchent : '+txt[:20]+' / '+title[:20])
            # Les cases du QCM doivent être de vrais carrés vectoriels, à GAUCHE de A–E.
            answers=[(t,r) for t,r,ss in lines if re.match(r'^[A-E]\.\s',t)]
            if role=='qcm' and answers:
                boxes=[]
                for d in drawings:
                    for item in d['items']:
                        if item[0]=='re':
                            r=fitz.Rect(item[1])
                            if 6.5<=r.width<=14 and 6.5<=r.height<=14:boxes.append(r)
                for t,r in answers:
                    if not any(4<=r.x0-b.x1<=75 and abs((r.y0+r.y1)/2-(b.y0+b.y1)/2)<=8 for b in boxes):
                        errors.append('Case QCM absente ou après le choix '+t[:14])
            if role=='qcm' and answers:
                for i,(txt,r,_) in enumerate(lines):
                    if not re.fullmatch(r'Q\d{2}',txt):continue
                    next_q=next((k for k in range(i+1,len(lines))
                                   if re.fullmatch(r'Q\d{2}',lines[k][0])),len(lines))
                    ending=next((box for text,box,_ in reversed(lines[i+1:next_q])
                                 if text.startswith('E. ')),None)
                    if ending is None:
                        errors.append('Question sans cinquième choix : '+txt);continue
                    edges=[fitz.Rect(d['rect']) for d in drawings]
                    def side(left):
                        return any(v.height>50 and v.width<4 and
                                   (v.x0<r.x0-3 if left else v.x0>r.x0+350) and
                                   v.y0<=r.y0+5 and v.y1>=ending.y1+1 for v in edges)
                    if not (side(True) and side(False)):
                        errors.append('Encadré vectoriel de question incomplet : '+txt)
            if role=='qcm':all_choices.extend(answers)
            all_body.extend(t for t,r,_ in lines if r.y0>=45 and r.y1<=H-40)
            if render_dir:
                render_dir.mkdir(parents=True,exist_ok=True)
                page.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False).save(str(render_dir/f'page-{n:03d}.png'))
            report['pages'].append({'page':n,'text_lines':len(lines),'checkbox_lines':len(answers),
                 'purple_header':header,'purple_footer':footer,'errors':sorted(set(errors))})
            report['errors'].extend('p'+str(n)+': '+e for e in sorted(set(errors)))
        joined=' '.join(all_body)
        if role=='fiche':
            last=' '.join(t for t,_,_ in text_lines(doc[-1])) if len(doc) else ''
            if 'Définitions et mots-clés' not in last:report['errors'].append('Le lexique doit être en dernière page')
            a=re.search(r'Pièges QCM',joined,re.I);b=re.search(r'Synthèse générale',joined,re.I);c=re.search(r'Définitions et mots-clés',joined,re.I)
            if not(a and b and c and a.start()<b.start()<c.start()):
                report['errors'].append('Ordre des rubriques finales incorrect')
        if role=='qcm' and not all_choices:report['errors'].append('Aucun choix A–E identifiable')
        if role=='flashcards' and 'CARTE' not in joined.upper():report['errors'].append('Cartes introuvables')
    report['status']='PASS' if not report['errors'] else 'FAIL'
    report['page_count']=len(report['pages'])
    return report

def published_packs(manifest:Path):
    for c in json.loads(manifest.read_text(encoding='utf-8'))['courses']:
        if c.get('packFormat')!='written_v1' or not c.get('publicArtifacts'):continue
        for artifact_role,artifact in c['publicArtifacts'].items():
            role='fiche' if artifact_role=='sheet' else artifact_role
            if role not in ROLES:continue
            p=Path(artifact['path'])
            if not p.is_relative_to('assets') or '..' in p.parts:raise ValueError('Chemin public dangereux')
            yield c['courseId'],p,role,artifact

def main():
    p=argparse.ArgumentParser(description=__doc__)
    mode=p.add_mutually_exclusive_group(required=True)
    mode.add_argument('--pdf',type=Path);mode.add_argument('--all-published',action='store_true')
    p.add_argument('--role',choices=ROLES);p.add_argument('--expected-pages',type=int)
    p.add_argument('--min-font',type=float,default=7.4);p.add_argument('--render-dir',type=Path)
    p.add_argument('--manifest',type=Path,default=Path('docs/course-deliveries.json'))
    p.add_argument('--report',type=Path)
    a=p.parse_args()
    if a.pdf:
        if not a.role:p.error('--role obligatoire avec --pdf')
        runs=[('local',a.pdf,a.role,{'pageCount':a.expected_pages})]
    else:
        runs=list(published_packs(a.manifest))
        if not runs:raise SystemExit('Aucun lot écrit publié avec PDF présent — contrôle non effectué')
    out=[];failed=False
    for course,pdf,role,meta in runs:
        r=inspect(pdf,role,meta.get('pageCount'),a.min_font,a.render_dir/course/role if a.render_dir else None)
        if meta.get('sha256') and r['sha256']!=meta['sha256']:
            r['errors'].append('Empreinte du PDF divergente du manifeste');r['status']='FAIL'
        r['courseId']=course
        out.append(r);failed|=r['status']=='FAIL'
        print(r['status'],course,role,'pages='+str(r['page_count']),'erreurs='+str(len(r['errors'])))
        for e in r['errors'][:15]:print(' - '+e)
    if a.report:
        a.report.parent.mkdir(parents=True,exist_ok=True)
        a.report.write_text(json.dumps({'version':2,'results':out},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    raise SystemExit(1 if failed else 0)
if __name__=='__main__':main()
