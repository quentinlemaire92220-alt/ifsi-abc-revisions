#!/usr/bin/env python3
"""Contrôle hors publication des artefacts étudiants IFSI ABC (PDF/TXT).

Usage: python tools/student_support_clean_gate.py fichier.pdf [autres...]
Contrôle contenu textuel + métadonnées. Ne modifie jamais les fichiers.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import re
import fitz

BANNED = [
  re.compile(r'\bbrouillon\b', re.I),
  re.compile(r'\b(?:à valider|a valider|non publi[eé]|version priv[eé]e|contr[oô]le p[eé]dagogique|rapport QA)\b', re.I),
  re.compile(r'\b(?:fiche|pdf|support|[eé]dition|g[eé]n[eé]ration)\s+v\d+(?:[._]\d+)+\b', re.I),
  re.compile(r'\b(?:sourceSha256|artifactSha256s|DRAFT_REVIEW_ONLY|NOT_GRANTED|QA_STATUT_PRIVE|manifest_prive)\b', re.I),
  re.compile(r'\b(?:version|[eé]dition)\s+(?:priv[eé]e|interne|de test|du brouillon)\b', re.I)
]
def check_text(text: str) -> list[str]:
    return sorted({m.group(0) for rgx in BANNED for m in rgx.finditer(text)})
def check_document(path: Path) -> list[str]:
    path=Path(path)
    if path.suffix.lower()=='.pdf':
        with fitz.open(path) as document:
            if not document or any(not page.get_text().strip() for page in document):
                return ['PDF vide ou non sélectionnable']
            all_text='\n'.join(page.get_text() for page in document)
            metadata=' '.join(str(v or '') for v in document.metadata.values())
        return check_text(all_text+'\n'+metadata)
    if path.suffix.lower() in ('.txt','.md'):
        return check_text(path.read_text(encoding='utf-8'))
    return ['Extension non prise en charge']
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('paths',nargs='+',type=Path)
    args=parser.parse_args()
    errors={}
    for p in args.paths:
        problems=check_document(p)
        if problems:errors[str(p)]=problems
    if errors:
        for p,pbs in errors.items():print('ECHEC',p,':',', '.join(pbs))
        raise SystemExit(1)
    print(f'OK : {len(args.paths)} support(s) étudiant(s) sans marqueur de génération.')
if __name__=='__main__':main()
