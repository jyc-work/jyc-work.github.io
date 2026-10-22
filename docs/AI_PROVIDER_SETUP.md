# JYC Engineering Lab：多供应商 AI 配置

## 原则

技术跟踪在 GitHub Actions 服务端执行，不在浏览器执行；所有 API Key 仅保存在 Repository Secrets。来源是八个真实 GitHub 仓库的最新提交记录，不由 AI 编造技术新闻。脚本每次最多对 3 个发生变化的仓库产生 AI 学习提示，结果通过 Pull Request 审核后才能合并到公开网站。

## 准备三个可选 Secret

在 **Settings → Secrets and variables → Actions → Repository secrets** 中创建：

| Secret 名称 | 用途 | 必填 |
| --- | --- | --- |
| `NVIDIA_API_KEY` | NVIDIA NIM Chat Completions | 否 |
| `OPENCODE_ZEN_API_KEY` | OpenCode Zen Chat Completions | 否 |
| `DEEPSEEK_API_KEY` | DeepSeek Chat Completions，付费备用 | 否 |

三个都不填也可以只做原始 GitHub 变更跟踪；填写多个不同服务的 Key 后按优先级逐个尝试。**不支持为了绕过免费配额而轮换同一服务商的多个账户。**

可在 **Repository variables** 中设置：

| Variable | 建议初值 | 说明 |
| --- | --- | --- |
| `NVIDIA_MODEL` | `meta/llama-3.3-70b-instruct` | NVIDIA 模型，必须属于兼容 Chat Completions 的服务 |
| `OPENCODE_ZEN_MODEL` | `longcat-2.5-preview-free` | 选用当时仍可调用且标注免费、支持 Chat Completions 的模型 |
| `DEEPSEEK_MODEL` | `deepseek-flash` | DeepSeek 正式接口模型名 |
| `ALLOW_PAID_AI` | `false` | **显式改成 `true` 才允许尝试 DeepSeek 以及 Zen 非免费模型** |

请以官方最新模型目录核实名字和免费额度。NVIDIA 云端试用是否仍有免费额度，取决于其当时的账户与平台政策；配置 Key 并不代表永久免费。使用 NVIDIA、Zen 或 DeepSeek 都要自行遵守服务条款。

## GitHub Actions 授权

- **Settings → Pages → Source** 选择 **GitHub Actions**。
- **Settings → Actions → General → Workflow permissions** 允许 Actions 具备仓库写权限并允许创建 Pull Request（具体设置依据仓库和 GitHub 管理策略）。
- 仅在用户审核后合并自动生成的 `tech-watch/*` 分支 PR；自动化绝不自行合并。

## 工作流程

1. 手动从 **Actions → Technology watch - review PR → Run workflow** 启动首次扫描，建立 8 个仓库的基准 SHA。
2. 对自动生成的 PR 核查变更，合并后基线落在 main。
3. 后续每天 12:17 UTC 扫描新提交；没有有效变化不创建 PR。
4. 有变化就查看 Commit URL、摘要和学习建议；未核验的模型判断禁止直接当作事实。
5. 合并 PR 后 Github Pages 工作流自动构建并发布。

如果由于 GitHub 的 `GITHUB_TOKEN` 限制，自动 PR 没有触发其他 PR 检查，技术跟踪 Workflow 会在推送 PR 前运行单元测试与静态构建。仍应人工检查 diff。

## 安全边界

- 不在 `.env`、README、浏览器 JS 或公共 GitHub Issue 中放真实 API Key。
- 不将私有 Notion、私有仓库或个人数据发送给外部模型。
- 不把上游 README 里的代码或命令当成自动运行指令。
- 失败回退为源头 Commit 与人工待查提示。
- GitHub Actions 只在可信的 main 分支的 schedule 或手动动作调用 Secrets，不接受外部 PR 执行密钥。
- 创建密钥后，先设置供应商自身的账单限额和密钥权限。

## 原始文档

- [NVIDIA NIM API](https://docs.api.nvidia.com/nim/reference/llm-apis)
- [OpenCode Zen](https://opencode.ai/docs/zen/)
- [DeepSeek API](https://api-docs.deepseek.com/zh-cn/)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
