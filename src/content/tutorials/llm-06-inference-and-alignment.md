---
title: "从推理服务到对齐：KV Cache、批处理、SFT 与偏好优化"
description: "把生成服务的时延约束与模型训练阶段区分，理解推理调度和对齐方法的工程代价。"
date: 2026-10-27
track: llm-engineering
order: 6
level: 综合
duration: "70–100 分钟"
tags: ["Inference", "SFT", "Alignment"]
source: "https://github.com/weiruihhh/cs336_note_and_hw"
---

## 模型训练与推理服务是两个系统问题

模型训练优化参数；推理服务根据请求使用固定权重生成输出。生产服务需要管理排队、并发、输入长度、生成长度、显存、超时和取消。一个在离线评测里“准确”的模型，也可能因为长队列或昂贵的推理代价不适合实际产品。

## 为什么 KV Cache 有意义

自回归生成第 t 个 Token 时，以前位置的 K/V 通常可复用，而不必每次对整个前缀重新计算。保存 K/V 会消耗显存，但有机会避免大量重复计算。

它不是“永远免费”：长上下文增加缓存规模，多并发请求增加内存压力，缓存失效或动态位置编码策略也会影响正确性。

## 可运行的吞吐预算练习

以下是抽象请求调度，不代表真实推理引擎的连续批处理实现：

```python
requests = [
    {"id": "A", "tokens_left": 5},
    {"id": "B", "tokens_left": 2},
    {"id": "C", "tokens_left": 4},
]
budget_per_step = 2
step = 0

while any(r["tokens_left"] > 0 for r in requests):
    active = [r for r in requests if r["tokens_left"] > 0]
    scheduled = active[:budget_per_step]
    step += 1
    for r in scheduled:
        r["tokens_left"] -= 1
    print(step, [r["id"] for r in scheduled])

assert all(r["tokens_left"] == 0 for r in requests)
```

将 `budget_per_step` 从 2 改为 1，观察总调度步数。真实系统会考虑每个请求的当前长度、KV Cache 页面、Prefill/Decode 阶段、优先级和取消信号；这个玩具模型只演示容量约束的基本效果。

## 对齐阶段先厘清目的

- **SFT**（监督微调）：给定输入与理想响应，优化条件输出概率。
- **偏好优化**（例如 DPO）：利用偏好对调整模型行为，但依赖比较数据的质量与假设。
- **奖励驱动训练**：用奖励模型或可验证规则作为反馈，目标函数和训练稳定性需要额外检查。

不同方法不属于“后者总是替代前者”的线性升级，通常取决于数据、模型能力、可验证性和成本。不要仅凭术语名称认为能复制特定公开模型的训练成果。

## 和 Agent 工程如何连接

Agent 对模型的要求包括可解析的结构化工具请求、拒绝非法操作、长上下文稳定性、可控的成本和一致的终止条件。模型调优不能替代服务端鉴权，也不能替代 Harness 的幂等、恢复和审计。

## 综合验收

编写两份决策记录：

1. 针对一个 4k/16k 上下文聊天服务，比较不同并发下的 KV Cache 预算、TTFT 和吞吐目标。
2. 针对故障诊断 Agent，判断先调整提示/工具设计/检索数据，还是值得做 SFT；说明优先级及验证协议。

**验收产物**：调度模拟脚本、推理性能指标定义、对齐路径的决策记录。不可用这些简单示例宣称实现了真实推理引擎或大型模型训练系统。
