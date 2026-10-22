#!/usr/bin/env python3
"""Offline publishing gate for engineering case studies.
Checks evidence references and structure, not the correctness of claims.
"""
from __future__ import annotations
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src" / "content" / "blog"
SHA = re.compile(r"^[0-9a-f]{40}$")
FIELDS = ("title", "description", "date", "kind", "verification", "repository", "revision")
HEADINGS = ("问题", "环境", "设计", "复现", "验证", "局限")


def frontmatter(text: str) -> tuple[str, str]:
    hit = re.match(r"\A---\s*\n(.*?)\n---\s*\n(.*)\Z", text, re.S)
    if not hit:
        raise ValueError("missing YAML frontmatter")
    return hit.group(1), hit.group(2)


def scalar(meta: str, name: str) -> str:
    hit = re.search(rf'(?m)^{re.escape(name)}:\s*(.*?)\s*$', meta)
    return hit.group(1).strip().strip('"').strip("'") if hit else ""


def evidence_links(meta: str) -> list[str]:
    block = re.search(r"(?m)^evidence:\s*\n((?:\s+-\s+https://[^\n]+\n?)+)", meta)
    if not block:
        return []
    return [line.strip()[2:].strip().strip('"').strip("'") for line in block.group(1).splitlines()]


def check_document(text: str, path: str = "<document>") -> list[str]:
    issues = []
    try:
        meta, body = frontmatter(text)
    except ValueError as exc:
        return [f"{path}: {exc}"]
    if scalar(meta, "draft").lower() == "true":
        return []
    for name in FIELDS:
        if not scalar(meta, name):
            issues.append(f"{path}: missing {name}")
    if scalar(meta, "kind") not in ("engineering-case", "incident-analysis"):
        issues.append(f"{path}: published posts must be engineering-case or incident-analysis")
    if scalar(meta, "verification") not in ("source-reviewed", "runtime-tested", "externally-reproduced"):
        issues.append(f"{path}: invalid verification level")
    revision = scalar(meta, "revision")
    if not SHA.fullmatch(revision):
        issues.append(f"{path}: revision must be a pinned 40-char lowercase Git SHA")
    links = evidence_links(meta)
    if len(set(links)) < 2:
        issues.append(f"{path}: at least two distinct direct evidence links required")
    if not any(f"/blob/{revision}/" in link for link in links):
        issues.append(f"{path}: at least one evidence URL must reference the pinned revision")
    if len(body.strip()) < 1700:
        issues.append(f"{path}: body too short (>=1700 characters required)")
    if len(re.findall(r"(?m)^## ", body)) < 5:
        issues.append(f"{path}: at least five technical sections expected")
    if body.count("~~~") < 4:
        issues.append(f"{path}: at least two fenced configuration/code blocks expected")
    for heading in HEADINGS:
        if not any(heading in line for line in re.findall(r"(?m)^## .+$", body)):
            issues.append(f"{path}: missing section covering {heading}")
    if not re.search(r"(?m)^date:\s*\d{4}-\d\d-\d\d", meta):
        issues.append(f"{path}: date must be YYYY-MM-DD")
    return issues


def main() -> int:
    errors, public = [], 0
    for file in sorted(CONTENT.glob("*.md")):
        content = file.read_text(encoding="utf-8")
        errors.extend(check_document(content, str(file.relative_to(ROOT))))
        try:
            meta, _ = frontmatter(content)
            if scalar(meta, "draft").lower() != "true":
                public += 1
        except ValueError:
            pass
    if not public:
        errors.append("blog: no public engineering posts")
    for issue in errors:
        print("FAIL:", issue, file=sys.stderr)
    print(f"blog gate: public={public}, errors={len(errors)}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
