import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from blog_quality import check_document

REV = "a" * 40
META = """---
title: "case"
description: "description"
date: 2026-10-22
kind: engineering-case
verification: source-reviewed
repository: "https://github.com/jyc-work/jyc-work.github.io"
revision: "%s"
evidence:
  - "https://github.com/jyc-work/jyc-work.github.io/blob/%s/.github/workflows/pages.yml"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/%s/tests/e2e/mobile.spec.ts"
---
""" % (REV, REV, REV)
BODY = "\n".join([
    "## 问题与约束", "问题" * 190,
    "## 环境与版本", "版本" * 190,
    "## 系统设计", "设计" * 190,
    "## 复现命令", "~~~bash", "echo test", "~~~", "复现" * 120,
    "## 测试与验证", "~~~yaml", "name: test", "~~~", "验证" * 120,
    "## 局限与后续", "局限" * 100,
])

class PublicationGateTests(unittest.TestCase):
    def test_good_engineering_article(self):
        self.assertEqual(check_document(META + BODY), [])
    def test_missing_proof_fails(self):
        text = META.replace('  - "https://github.com/jyc-work/jyc-work.github.io/blob/%s/tests/e2e/mobile.spec.ts"\n' % REV,'')
        self.assertTrue(any("evidence" in x for x in check_document(text+BODY)))
    def test_unpinned_revision_fails(self):
        self.assertTrue(any("revision" in x for x in check_document(META.replace(REV, "latest")+BODY)))
    def test_draft_excluded(self):
        self.assertEqual(check_document("---\ndraft: true\n---\nhi"),[])
    def test_short_outline_rejected(self):
        self.assertTrue(any("short" in x for x in check_document(META+"## 摘要\n不足")))

if __name__=="__main__":
    unittest.main()
