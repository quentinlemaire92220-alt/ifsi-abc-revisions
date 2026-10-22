#!/usr/bin/env python3
"""Préparation PRIVÉE du support hybride IFSI ABC v1.47.

Un seul PDF de révision avec textes + illustrations originales intégrées + lexique.
Les QCM, flashcards et vocaux relèvent toujours de leurs contrats existants.
Aucune publication, écriture Drive, GitHub ou certification médicale automatique.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from copy import deepcopy
from pathlib import Path

import fitz

from revision_compose import render
from revision_course_pack import checked_asset, digest

VERSION = "hybrid_v1-charte_1.47"
REFERENCE = "pharmacologie_v1.47_24_pages"


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True,
                      separators=(",", ":")).encode("utf-8")


def _filled(value):
    return isinstance(value, str) and bool(value.strip())


def validate(data, assets_root):
    if not isinstance(data, dict) or not _filled(data.get("title")):
        raise ValueError("Titre du cours absent")
    notions = data.get("notions")
    if not isinstance(notions, list) or not notions:
        raise ValueError("Matrice des notions essentielles absente")
    ids = []
    for notion in notions:
        if not isinstance(notion, dict) or not _filled(notion.get("id")):
            raise ValueError("ID de notion manquant")
        if not _filled(notion.get("sourcePage")):
            raise ValueError("Page source de la notion absente")
        ids.append(notion["id"])
    if len(set(ids)) != len(ids):
        raise ValueError("IDs de notion dupliqués")
    essential = set(ids)
    sections = data.get("sections")
    if not isinstance(sections, list) or not sections:
        raise ValueError("Sections de la fiche hybride absentes")
    seen = set()
    figures = {}
    for section in sections:
        if not isinstance(section, dict) or not _filled(section.get("heading")):
            raise ValueError("Section sans titre")
        paragraphs = section.get("paragraphs")
        if not isinstance(paragraphs, list) or not paragraphs or not all(map(_filled, paragraphs)):
            raise ValueError("Explications écrites incomplètes")
        notion_ids = section.get("notionIds")
        if not isinstance(notion_ids, list) or not notion_ids:
            raise ValueError("Notions non rattachées à une section")
        if not set(notion_ids).issubset(essential):
            raise ValueError("Notion référencée hors matrice essentielle")
        seen.update(notion_ids)
        figure = section.get("figure")
        if figure:
            if not isinstance(figure, dict) or not _filled(figure.get("path")) or not _filled(figure.get("caption")):
                raise ValueError("Figure sans chemin ou légende pédagogique")
            checked_asset(assets_root, figure["path"])
            figures[figure["path"]] = digest(checked_asset(assets_root, figure["path"])[0])
    if seen != essential:
        raise ValueError("Couverture des notions essentielles incomplète : " +
                         ", ".join(sorted(essential - seen)))
    if not figures:
        raise ValueError("Le support hybride nécessite des infographies intégrées validables")
    glossary = data.get("lexicon")
    if not isinstance(glossary, list) or not glossary:
        raise ValueError("Définitions et mots-clés manquants")
    terms = []
    for entry in glossary:
        if not isinstance(entry, dict) or not _filled(entry.get("term")) or not _filled(entry.get("definition")):
            raise ValueError("Entrée de lexique sans terme ou définition")
        terms.append(entry["term"].casefold().strip())
    if len(set(terms)) != len(terms):
        raise ValueError("Doublon dans les mots-clés")
    return essential, figures


def make_pack(data, assets_root, out):
    root = Path(assets_root).resolve()
    destination = Path(out).resolve()
    important, figures = validate(data, root)
    files = {"hybrid": "Fiche_Revision_Hybride_Infographiee.pdf",
             "lexicon": "Lexique_source_prive.json"}
    cache_key = hashlib.sha256(canonical({"version": VERSION, "data": data,
                                         "figures": figures})).hexdigest()
    old = destination / "manifest_prive.json"
    if old.is_file():
        try:
            previous = json.loads(old.read_text(encoding="utf8"))
            if previous.get("cacheKey") == cache_key and all(
                (destination / name).is_file() and
                digest(destination / name) == previous.get("artifactSha256s", {}).get(name)
                for name in files.values()
            ):
                return {**previous, "reusedFromCache": True}
        except (OSError, ValueError, TypeError):
            pass
    destination.mkdir(parents=True, exist_ok=True)
    payload = deepcopy(data)
    glossary_text = [entry["term"] + " : " + entry["definition"] for entry in data["lexicon"]]
    payload["sections"].append({
        "heading": "Définitions et mots-clés",
        "paragraphs": glossary_text,
        "notionIds": sorted(important)
    })
    pdf_path = destination / files["hybrid"]
    render(payload, pdf_path, root)
    (destination / files["lexicon"]).write_text(
        json.dumps(data["lexicon"], indent=2, ensure_ascii=False) + "\n",
        encoding="utf8"
    )
    with fitz.open(pdf_path) as pdf:
        if not pdf:
            raise ValueError("PDF hybride vide")
        content = "\n".join(page.get_text() for page in pdf)
        plain = re.sub(r"\s+", " ", content).casefold()
        for section in payload["sections"]:
            if re.sub(r"\s+", " ", section["heading"]).casefold() not in plain:
                raise ValueError("Titre de section perdu dans le PDF : " + section["heading"])
        for entry in data["lexicon"]:
            if re.sub(r"\s+", " ", entry["term"]).casefold() not in plain:
                raise ValueError("Terme du lexique non sélectionnable : " + entry["term"])
        image_pages = sum(bool(page.get_images()) for page in pdf)
        if image_pages < 1:
            raise ValueError("PDF sans infographie intégrée")
        pages = len(pdf)
    manifest = {
        "packFormat": "hybrid_v1",
        "status": "DRAFT_REVIEW_ONLY",
        "publicationApproval": "NOT_GRANTED",
        "cacheKey": cache_key,
        "files": files,
        "notionsEssential": len(important),
        "notionsCovered": len(important),
        "embeddedFiguresDeclared": len(figures),
        "pages": pages,
        "pagesWithFigures": image_pages,
        "lexiconTermCount": len(data["lexicon"]),
        "lexiconSourceSha256": hashlib.sha256(canonical(data["lexicon"])).hexdigest(),
        "figureSourceSha256s": figures,
        "artifactSha256s": {name: digest(destination / name) for name in files.values()},
        "visualReference": REFERENCE,
        "visualPageByPageReview": "REQUIRED",
        "medicalReview": "REQUIRED",
        "readabilityReview": "REQUIRED",
        "publishedVerification": "NOT_AVAILABLE",
        "warning": "Génération PDF et comptages ne prouvent ni fidélité graphique ni exactitude médicale."
    }
    old.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    return manifest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--content", type=Path, required=True, help="Matrice privée sourcée")
    parser.add_argument("--assets-root", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    data = json.loads(args.content.read_text(encoding="utf8"))
    result = make_pack(data, args.assets_root, args.out)
    print("Fiche hybride privée : " + str(result["pages"]) +
          " pages, validation visuelle/scientifique encore requise ; aucune publication.")


if __name__ == "__main__":
    main()
