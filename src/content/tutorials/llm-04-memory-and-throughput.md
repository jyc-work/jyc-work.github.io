---
title: "训练与推理的显存预算：参数、梯度、优化器与 KV Cache"
description: "用量纲和可执行的预算脚本区分模型参数量、训练峰值与推理上下文成本。"
date: 2026-10-27
track: llm-engineering
order: 4
level: 进阶
duration: "60–90 分钟"
tags: ["GPU", "Memory", "KV Cache"]
source: "https://github.com/datawhalechina/diy-llm"
---

## 为什么参数量不是显存占用

推理可能需要参数、输入、临时激活、KV Cache 和运行时工作区；训练还需要梯度、优化器状态和反向传播保存的激活。参数使用 BF16 只表示一个参数的某些存储可以用 2 字节，并不代表整体模型只占“参数数量乘以 2”。

AdamW 的一阶、二阶动量通常以浮点形式保留；混合精度实现还可能维护额外主参数副本。精确内存取决于框架、实现、ZeRO/FSDP、量化和内存管理。

## 估算练习：先算量纲

下面是**简化理论下界或近似**，未包含中间激活、碎片、运行时缓存或跨设备复制。

```python
def gib(num_bytes):
    return round(num_bytes / 1024**3, 3)

params = 1_000_000_000
bytes_per_weight = 2   # Example: BF16 inference weights
print("weights GiB:", gib(params * bytes_per_weight))

batch = 2
layers = 24
kv_heads = 8
tokens = 4096
head_dim = 128
kv_dtype_bytes = 2
cache = 2 * layers * batch * kv_heads * tokens * head_dim * kv_dtype_bytes
print("KV cache GiB:", gib(cache))

for seq_len in [1024, 2048, 4096, 8192]:
    bytes_needed = 2 * layers * batch * kv_heads * seq_len * head_dim * kv_dtype_bytes
    print(seq_len, gib(bytes_needed))
```

这里的公式按每层都存储 K 和 V，并假设 KV 头数与形状固定：`2 × 层数 × Batch × KV 头数 × 序列长度 × 单头维度 × 字节数`。不同架构（例如分组查询注意力）需要使用真实的 KV 头数，而不是总 Q 头数。

## GPU 性能为什么不能只看 FLOPs

矩阵乘法往往关注计算密度；Token-by-token 解码可能更受显存带宽和 KV 读写影响。请区分：

- **Prefill latency**：处理已有上下文的时间。
- **TTFT**（Time To First Token）：从请求到输出首 Token 的时间。
- **TPOT**（Time Per Output Token）：后续 Token 的平均间隔。
- **Throughput**：单位时间内整体系统处理的 Token 数或请求数。

增加 Batch 可能提升总吞吐，却恶化单请求延迟；因此“更快”要明确是指哪个指标。

## 可执行对照计划

从固定小模型开始，选取 `T = 128 / 512 / 1024`，分别记录生成首 Token 的时间、后续平均 Token 时间和设备峰值显存。GPU 计时需要预热和同步，CPU 也应该重复多次并报告统计分布。

当出现 OOM 时，先降低 batch 或上下文长度，再检查是否有训练梯度、缓存保留或模型重复加载。不要因为单次运行成功，就推断生产负载的峰值容量。

## 验收题

1. 参数量相同的两个模型，为什么不同注意力结构的 KV Cache 成本可能不同？
2. 为什么将权重量化到低比特后，显存下降幅度不一定等于理论压缩率？
3. 如何为同一个模型分别报告 TTFT 和吞吐？

**验收产物**：可运行预算脚本、真实设备的测量计划、公式适用条件。
