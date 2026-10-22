import os
import sys
import unittest
from unittest.mock import patch
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import tech_watch


class TechWatchTests(unittest.TestCase):
    def test_repository_validation(self):
        for value in ("owner/repo", "apache/kafka"):
            self.assertIsNotNone(tech_watch.ALLOWED_REPO.fullmatch(value))
        for value in ("../private", "repo;rm -rf /", "foo/bar/baz", "owner name/repo"):
            self.assertIsNone(tech_watch.ALLOWED_REPO.fullmatch(value))

    def test_paid_provider_opt_in(self):
        env = {
            "NVIDIA_API_KEY": "dummy",
            "OPENCODE_ZEN_API_KEY": "dummy",
            "DEEPSEEK_API_KEY": "dummy",
            "OPENCODE_ZEN_MODEL": "longcat-2.5-preview-free",
        }
        with patch.dict(os.environ, env, clear=True):
            free = tech_watch.provider_candidates(False)
            paid = tech_watch.provider_candidates(True)
        self.assertEqual([p["name"] for p in free], ["nvidia", "opencode_zen"])
        self.assertEqual([p["name"] for p in paid], ["nvidia", "opencode_zen", "deepseek"])

    def test_non_free_zen_model_requires_paid_opt_in(self):
        with patch.dict(os.environ, {"OPENCODE_ZEN_API_KEY": "dummy", "OPENCODE_ZEN_MODEL": "paid-model"}, clear=True):
            self.assertEqual(tech_watch.provider_candidates(False), [])
            self.assertEqual(len(tech_watch.provider_candidates(True)), 1)

    def test_invalid_ai_output_never_masquerades_as_verified(self):
        self.assertFalse(tech_watch.valid_note({"summary": "ok"}))
        self.assertTrue(tech_watch.valid_note({"summary": "上游仓库出现一次提交", "impact": "仅凭标题无法判断影响", "next_action": "阅读源码并运行测试后确认"}))
        self.assertEqual(tech_watch.fallback_note("refactor")["review_status"], "待人工审核")

    def test_sources_have_eight_unique_repositories(self):
        sources = tech_watch.read_json(tech_watch.SOURCES, [])
        self.assertEqual(len(sources), 8)
        self.assertEqual(len({s["repo"] for s in sources}), 8)


if __name__ == "__main__":
    unittest.main()
