---
title: "Transformer 的因果自注意力：张量形状与未来信息屏蔽"
description: "用 PyTorch 写一个最小多头因果 Attention，并以“前缀不应受未来 Token 影响”做单元测试。"
date: 2026-10-27
track: llm-engineering
order: 2
level: 进阶
duration: "70–100 分钟"
tags: ["Transformer", "PyTorch", "Attention"]
source: "https://github.com/datawhalechina/diy-llm"
---

## 为什么需要自注意力

自回归语言模型生成第 t 个位置的表示时，只能使用该位置及之前的信息。Attention 的核心是：将每个位置映射成 Query、Key、Value，计算 Query 与各 Key 的相似度，再对 Value 加权求和。

输入形状通常记为 `[B, T, C]`：Batch、序列长度、隐藏维度。若多头数为 H，单头维度 D，则要求 `C = H × D`。Attention 权重形状为 `[B, H, T, T]`；这个二次方空间规模，是长上下文成本的重要来源之一。

## 数学直觉

缩放点积注意力可以写作：

\[
\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\left(\frac{QK^T}{\sqrt{d_k}}+M\right)V
\]

这里 M 是因果 Mask：当前位置右侧的未来位置填成负无穷，Softmax 后概率趋于零。每个头会学习不同的投影；拼接后再通过输出线性层混合信息。

## 最小 PyTorch 实现

安装 PyTorch（根据自己的 CPU、CUDA 或 MPS 平台选官方安装方式），保存为 `causal_attention.py`：

```python
import torch
from torch import nn

class CausalSelfAttention(nn.Module):
    def __init__(self, channels=16, heads=4):
        super().__init__()
        assert channels % heads == 0
        self.heads = heads
        self.head_dim = channels // heads
        self.qkv = nn.Linear(channels, 3 * channels, bias=False)
        self.out = nn.Linear(channels, channels, bias=False)

    def forward(self, x):
        batch, length, channels = x.shape
        q, k, v = self.qkv(x).chunk(3, dim=-1)

        def shape_heads(t):
            return t.reshape(batch, length, self.heads, self.head_dim).transpose(1, 2)

        q, k, v = map(shape_heads, (q, k, v))
        scores = (q @ k.transpose(-2, -1)) / (self.head_dim ** 0.5)
        mask = torch.triu(
            torch.ones(length, length, device=x.device, dtype=torch.bool),
            diagonal=1,
        )
        scores = scores.masked_fill(mask, float("-inf"))
        weights = torch.softmax(scores, dim=-1)
        values = weights @ v
        combined = values.transpose(1, 2).contiguous().reshape(batch, length, channels)
        return self.out(combined)

torch.manual_seed(7)
model = CausalSelfAttention().eval()
prefix = torch.randn(2, 3, 16)
future = torch.randn(2, 2, 16)

with torch.no_grad():
    before = model(prefix)
    after = model(torch.cat([prefix, future], dim=1))[:, :3]
assert before.shape == (2, 3, 16)
assert torch.allclose(before, after, atol=1e-6), "future token leaked!"
print("PASS: causal prefix is invariant")
```

该模块仅用于解释自注意力：尚未实现 LayerNorm、残差连接、MLP、RoPE、Dropout 和完整 Transformer Block。

## 故障注入

将 `scores.masked_fill(...)` 一行删除，再运行测试。测试**通常应失败**，因为更长序列里的前 3 个位置会访问未来 Key/Value。若想构造确定性断言，可以对更多随机种子重复比较，或直接断言被屏蔽位置的权重为零。

再改 `heads` 为不能整除 `channels` 的值，应触发前置断言；这说明接口的形状约束比“报错后再调参”更重要。

## 实际性能与边界

上面的显式 `T × T` 注意力权重是教学实现。现代高效实现可使用融合核减少中间内存读写；这不意味着计算复杂度就自动从 O(T²) 变成 O(T)。比较性能必须记录 GPU、dtype、长度、预热与同步方式。

## 验收题

1. 为什么要除以 `sqrt(head_dim)`？
2. 为什么因果 Mask 加在 Softmax 之前？
3. 为什么扩展未来位置后，旧位置结果应保持不变（在无 Dropout 的评估模式下）？

**验收产物**：通过的前缀不变性测试、去掉 Mask 后的失败结果及形状示意图。
