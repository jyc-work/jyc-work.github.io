---
title: "AI 技术动态观察：多模型路由、来源核验与人工审核"
description: "说明如何从八个上游 GitHub 仓库提取提交变更，再通过可选 AI 摘要和人工审查形成可靠的技术追踪。"
date: 2026-10-22
tags: ["GitHub Actions", "AI Gateway", "Research Workflow"]
---

## 数据来源

网站跟踪学习路线中列出的八个开源项目的默认分支最新提交；信息来自 GitHub API，而不是让大模型自行猜测“最近发生了什么”。

这意味着系统能发现**仓库有新提交**，但未必等同于新版本发布、兼容性变化或重大的技术进展。实际影响需要阅读改动和测试才能确认。

## 流程

1. GitHub Actions 定期读取各仓库最新提交 SHA。
2. 与上一次已审核的状态快照比较。
3. 对发生变化的仓库生成简短的原始来源记录。
4. 若配置了支持的 API Key，可使用模型提出审查提示和学习任务。
5. 自动创建待审核 Pull Request；人工核对原始 Commit 后才合并发布。

即使没有模型密钥，步骤 1–3 和 5 也可以执行。

## 多模型调用安全

所有 AI 调用均在 GitHub Actions 服务端完成，密钥保存于 Repository Secrets；不从用户浏览器直接发起付费 API 请求。

默认路线是 NVIDIA API、OpenCode Zen 的免费 Chat Completions 模型。DeepSeek 仅在显式启用允许付费后参与。**免费模型和免费额度可能变化**，上线前需核对供应商的最新政策。

AI 生成的是待审核建议，不承担代码真实性的最终证明。对于时效性较强的接口文档，应优先使用官方来源。

## 成本和失败策略

- 单次检查只为最多三个发生变化的仓库请求 AI 摘要。
- 有请求超时和输出长度限制。
- 不使用多账户或轮换多个免费密钥规避配额。
- 模型不可用时退回到原始提交信息；不编造性能或发布日期。
- 只生成 PR，不自动合并、不自动发布。

具体脚本：[tech_watch.py](https://github.com/jyc-work/jyc-work.github.io/blob/main/scripts/tech_watch.py)。
