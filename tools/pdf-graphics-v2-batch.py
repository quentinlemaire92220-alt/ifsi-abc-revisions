"""Apply V2 PDF gate to each NEW or byte-modified written course, not historical PDFs."""
import argparse, json, os, subprocess, sys
from pathlib import Path
from importlib.machinery import SourceFileLoader
GATE=SourceFileLoader("pdf_graphics_v2",str(Path(__file__).resolve().parent/"pdf-graphics-v2.py")).load_module()
def git(*args):
    return subprocess.run(["git",*args],capture_output=True,text=True,check=True).stdout
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--base",default=os.getenv("IFSI_BASE_SHA"))
    args=p.parse_args()
    if not args.base or len(args.base)!=40:raise SystemExit("Base Git SHA complete requise")
    before=json.loads(git("show",args.base+":docs/course-deliveries.json"))
    now=json.loads(Path("docs/course-deliveries.json").read_text(encoding="utf8"))
    previous={x["courseId"]:x for x in before.get("courses",[])}
    modified=set(git("diff","--name-only",args.base,"HEAD").splitlines())
    checked=0;fail=[]
    for c in now["courses"]:
        if c.get("packFormat")!="written_v1":continue
        old=previous.get(c["courseId"],{})
        arts=c.get("publicArtifacts")
        changed=not old or (arts!=old.get("publicArtifacts")) or any(
            isinstance(a,dict) and a.get("path") in modified for a in (arts or {}).values())
        if not changed:continue
        if not arts or "sheet" not in arts:
            fail.append(c["courseId"]+": PDFs de publication non declares")
            continue
        for role,art in arts.items():
            kind={"sheet":"revision","qcm":"qcm","flashcards":"flashcards"}.get(role)
            if not kind:continue
            path=Path(art["path"])
            if not path.is_file():
                fail.append(c["courseId"]+":"+role+": fichier absent")
                continue
            report=GATE.validate(path,kind,expect_pages=art.get("pageCount"))
            checked+=1
            if report["status"]=="FAIL":
                fail.append(c["courseId"]+":"+role+": "+", ".join(report["errors"]))
    for e in fail:print("FAIL visual V2",e)
    print("V2: ",checked,"PDF nouveau(x)/modifie(s) testes;",len(fail),"echec(s).",
          "Anciens lots identiques preserves.")
    return 1 if fail else 0
if __name__=="__main__":sys.exit(main())
