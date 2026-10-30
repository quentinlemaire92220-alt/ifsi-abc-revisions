"""Contrôle technique du vrai PDF anatomique ; ne crée pas d'avis médical humain."""
import hashlib,json,re
from pathlib import Path
import fitz

root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'docs/publication-candidates/organes_des_sens_b11_sans_vocaux.json').read_text(encoding='utf8'))
asset=manifest['candidatePdfEvidence']['boards']
pdf=root/asset['githubPath']
assert hashlib.sha256(pdf.read_bytes()).hexdigest()==asset['sha256'],'SHA anatomie divergent'
assert asset['ownerAcceptance']=='pending','Acceptation humaine non justifiée'
assert manifest['deliveryPlan']['publicationApproval'] is False
document=fitz.open(pdf);assert len(document)==7
minimum=float('inf')
for number,page in enumerate(document,1):
    assert page.get_text().strip(),f'Page {number} : texte natif absent'
    images=page.get_image_info();assert images,f'Page {number} : illustration absente'
    for image in images:
        rect=fitz.Rect(image['bbox'])
        assert rect.width>0 and rect.height>0
        dpi=min(image['width']*72/rect.width,image['height']*72/rect.height)
        minimum=min(minimum,dpi)
        assert dpi>=95,f'Page {number} : résolution effective {dpi:.1f} dpi < 95 dpi'
labels=['Surface de la peau','Pore de transpiration','Tige du poil','Capillaires',
        'Muscle érecteur du poil','Glande sudoripare exocrine','Glande sébacée',
        'Réseau artériel','Réseau veineux','Cellules adipeuses','Terminaisons nerveuses',
        'Cellules matricielles','Tissu conjonctif','Épiderme','Derme','Hypoderme']
native=re.sub(r'\s+',' ',document[6].get_text())
for label in labels:assert label in native,f'Légende native manquante : {label}'
print(f'PASS anatomie B1.1 : 7 pages, images >= 95 dpi (minimum {minimum:.1f}), 16 légendes natives ; acceptation humaine en attente.')
