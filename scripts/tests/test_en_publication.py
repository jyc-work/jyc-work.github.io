import sys
from pathlib import Path
import unittest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from check_en_publication import EN, ZH, check_english_document

class EnglishPublicationTests(unittest.TestCase):
    def setUp(self):
        self.files=sorted(EN.glob("*.md"))
    def test_curated_cases_have_pinned_chinese_correspondence(self):
        self.assertEqual(len(self.files),2)
        for file in self.files:
            with self.subTest(file=file.name):
                errors=check_english_document(file,file.read_text(encoding="utf-8"))
                self.assertEqual(errors,[])
    def test_missing_evidence_rejected(self):
        file=self.files[0]
        text=file.read_text(encoding="utf-8")
        text=text.replace("evidence:", "evidence_broken:")
        errors=check_english_document(file,text)
        self.assertTrue(any("evidence" in item for item in errors))
    def test_invalid_chinese_counterpart_rejected(self):
        file=self.files[0]
        text=file.read_text(encoding="utf-8")
        text=text.replace('zhSlug: "astro-pages-engineering-case"', 'zhSlug: "does-not-exist"')
        errors=check_english_document(file,text)
        self.assertTrue(any("counterpart" in item for item in errors))

if __name__=="__main__":
    unittest.main()
