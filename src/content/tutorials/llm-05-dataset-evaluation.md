---
title: "模型数据与评估：去重、污染、切分和可复现报告"
description: "围绕数据泄漏和评估污染构建检查脚本，用固定测试协议解释指标而不是只展示排行榜。"
date: 2026-10-27
track: llm-engineering
order: 5
level: 进阶
duration: "60–90 分钟"
tags: ["Data Quality", "Evaluation", "Reproducibility"]
source: "https://github.com/datawhalechina/diy-llm"
---

## 为什么数据质量决定模型评估是否可信

同一问答模板可能被复制到训练和测试数据。如果测试题实际已经出现在训练语料里，指标可能高得令人误解。对于代码任务，还要关注题目、测试用例、仓库提交之间的重叠和时序污染。

最小工程原则：每个数据集都应该有来源、许可证、采集时间、清洗版本、去重规则和划分方式。

## 可运行实验：规范化哈希查重

下面用标准库检测**规范化后完全相同**的样本。它不是语义近重复检测，也无法发现同义改写。

```python
import hashlib
import re
import unicodedata

train = [
    "What is KV cache?",
    "Explain causal mask",
    "What is a tokenizer?",
]
test = [
    " what   is kv cache? ",
    "Explain retrieval augmentation",
]

def canonical(text):
    normalized = unicodedata.normalize("NFKC", text)
    normalized = normalized.casefold().strip()
    return re.sub(r"\s+", " ", normalized)

def fingerprint(text):
    return hashlib.sha256(canonical(text).encode("utf-8")).hexdigest()

train_keys = {fingerprint(item) for item in train}
overlap = [(item, fingerprint(item)) for item in test
           if fingerprint(item) in train_keys]
print("exact normalized overlap:", len(overlap))
assert len(overlap) == 1
```

扩展实验时可尝试 n-gram Jaccard、MinHash 或向量召回，但不同方法误报率不同，需要人工复核。

## 评估设计四要素

1. **固定样本**：测试集 ID、版本、随机种子与输入格式。
2. **固定生成协议**：模型版本、温度、最大输出长度、工具权限与提示模板。
3. **固定判定标准**：能自动判断的使用测试器；开放回答要说明人工评审流程。
4. **报告不确定性**：样本量、置信区间或重抽样方式、失败样例及成本。

分类准确率、代码测试通过率、LLM judge 评分与真实业务成功率是不同指标，不能互相替代。尤其不能把“评测模型偏好”直接视为事实正确率。

## 把训练和评估的时序隔离

如果在看完测试集失败案例后反复改 Prompt，再用同一个测试集公布最终成绩，就发生了测试集调参。应保留开发集供迭代，把最终保留集隔离，必要时采用时间后移的新样本。

## 实践任务

为你自己的 Agent 故障诊断任务构造 20 条模拟案例，按故障类型分层。每条包含输入证据、预期诊断、可接受的动作范围和验证器。测量成功、拒绝、越权和无答案四类结果，而不只是平均分。

## 验收问题

- 什么是数据集污染？精确去重无法解决哪些泄漏？
- 模型 A 平均分高 1%，但样本仅 20 条，能否认定更优？
- 哪些数据和日志不应该上传第三方评测 API？

**验收产物**：清洗脚本、数据划分说明、固定协议和可审查失败样例。
