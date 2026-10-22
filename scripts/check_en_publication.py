#!/usr/bin/env python3
"""Gate independently edited, source-backed English case studies.
This is editorial consistency checking, not a technical truth oracle.
"""
from __future__ import annotations
from pathlib import Path
import re
import sys
from blog_quality import frontmatter, scalar, evidence_links

ROOT = Path(__file__).resolve().parent.parent
EN = ROOT / "src/content/en-blog"
ZH = ROOT / "src/content/blog"
SECTIONS = ("problem", "environment", "design", "reproduc", "verif", "limit")


def check_english_document(path: Path, text: str, source_dir: Path = ZH) -> list[str]:
    errors = []
    try:
        meta, body = frontmatter(text)
    except ValueError:
        return [f"{path}: invalid frontmatter"]
    if scalar(meta, "draft").lower() == "true":
        return []
    revision = scalar(meta, "revision")
    if not re.fullmatch(r"[0-9a-f]{40}", revision):
        errors.append(f"{path}: fixed full revision required")
    if scalar(meta, "verification") != "source-reviewed":
        errors.append(f"{path}: use source-reviewed until linked execution evidence exists")
    if scalar(meta, "kind") != "engineering-case":
        errors.append(f"{path}: engineering-case required")
    if scalar(meta, "repository") != "https://github.com/jyc-work/jyc-work.github.io":
        errors.append(f"{path}: case study must reference the actual public source repo")
    links = evidence_links(meta)
    if len(set(links)) < 2:
        errors.append(f"{path}: two distinct evidence URLs required")
    if not any(f"/blob/{revision}/" in url for url in links):
        errors.append(f"{path}: pinned revision must occur in an evidence URL")
    zh_slug = scalar(meta, "zhSlug")
    # Chinese editions have their own editorial process and are never auto-generated.
    if not re.fullmatch(r"[a-z0-9-]+", zh_slug):
        errors.append(f"{path}: invalid Chinese counterpart slug")
    elif not (source_dir / (zh_slug + ".md")).is_file():
        errors.append(f"{path}: Chinese counterpart missing")
    else:
        zh_meta, _ = frontmatter((source_dir / (zh_slug + ".md")).read_text(encoding="utf-8"))
        if scalar(zh_meta, "draft").lower() == "true":
            errors.append(f"{path}: counterpart is unpublished")
        if scalar(zh_meta, "revision") != revision:
            errors.append(f"{path}: corresponding articles reference different source revisions")
    if len(body.strip()) < 2600:
        errors.append(f"{path}: body too short for English engineering case")
    titles = [x.lower() for x in re.findall(r"(?m)^## (.+)$", body)]
    for section in SECTIONS:
        if not any(section in line for line in titles):
            errors.append(f"{path}: missing {section} section")
    if body.count("~~~") < 4:
        errors.append(f"{path}: at least two runnable/configuration excerpts expected")
    return errors


def main() -> int:
    errors = []
    files = sorted(EN.glob("*.md"))
    if len(files) < 2:
        errors.append("English case studies: expected at least two published source files")
    for file in files:
        errors.extend(check_english_document(file, file.read_text(encoding="utf-8")))
    for error in errors:
        print("FAIL:", error, file=sys.stderr)
    print(f"English publication gate: files={len(files)}, errors={len(errors)}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
