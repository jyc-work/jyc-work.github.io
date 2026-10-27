---
title: "训练一个最小语言模型：交叉熵、过拟合实验与验证边界"
description: "从 next-token 监督信号和交叉熵开始，搭建小型 Bigram 语言模型训练循环。"
date: 2026-10-27
track: llm-engineering
order: 3
level: 进阶
duration: "70–100 分钟"
tags: ["Training", "Cross Entropy", "PyTorch"]
source: "https://github.com/weiruihhh/cs336_note_and_hw"
---

## 训练目标是什么

自回归语言模型将长度为 T 的 Token 序列转成 `x = ids[:-1]` 与 `y = ids[1:]`。第 t 个位置的预测目标是下一 Token。交叉熵比较模型输出的未归一化 logits 与目标类别：越能给正确下一 Token 分配高概率，损失越低。

训练时会并行处理所有位置（结合因果 Mask），不等于逐 Token 串行执行完整网络。推理时若逐步生成，KV Cache 才变得特别重要。

## 从可验证的最小系统开始

先训练一个 **Bigram 语言模型**，它通过查表预测下一个 Token，不含 Transformer；把整个循环跑通再换成 Transformer 才容易定位错误。

```python
import torch
import torch.nn.functional as F
from torch import nn

torch.manual_seed(11)
text = ("agent tool call result checkpoint\n" * 30).encode("utf-8")
ids = torch.tensor(list(text), dtype=torch.long)
x = ids[:-1]
y = ids[1:]

class BigramLM(nn.Module):
    def __init__(self, vocab_size=256):
        super().__init__()
        self.table = nn.Embedding(vocab_size, vocab_size)

    def forward(self, tokens):
        return self.table(tokens)

model = BigramLM()
optimizer = torch.optim.AdamW(model.parameters(), lr=0.05)
losses = []

for step in range(201):
    logits = model(x)
    loss = F.cross_entropy(logits, y)
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    optimizer.step()
    if step % 40 == 0:
        value = loss.item()
        losses.append(value)
        print(step, round(value, 4))

assert losses[-1] < losses[0]
```

你应该观察损失下降。这是**在同一批训练数据上的拟合演示**，不是泛化能力测试。由于 Bigram 不理解更长上下文，相同 Token 有多个可能后继时，训练损失也不一定趋近零。

## 梯度、优化器和数据切分

执行顺序一般是：`forward → loss → zero_grad → backward → step`。缺少 `zero_grad` 会导致梯度按默认方式累积；缺少 `step` 参数不会更新；将整数类别转成浮点回归目标会改变任务定义。

正式实验应按文档、用户或时间分割训练与验证集，不能在训练后随意用同一批样本“验证模型好不好”。如果对小数据刻意做 overfit 测试，应在报告中写明它只检验训练管线能否学习。

## 拓展为 Transformer 的最小训练

将 `BigramLM` 改为 `token embedding → position representation → masked attention → MLP → vocabulary projection`，保持相同输入目标和损失函数。每一步只替换一个模块，并保留基线结果。

## 故障实验

1. 把 `optimizer.step()` 注释掉，观察参数是否仍变化。
2. 用一个全为相同字节的语料重新训练，比较损失收敛形状。
3. 修改随机种子后，记录三次独立结果，观察初始化差异。

## 验收问题

- 交叉熵为什么接收 logits 而不是先手动 Softmax？
- 单 batch loss 很低为什么不能代表模型“学会自然语言”？
- 如何区分训练代码 Bug 与模型容量不足？

**验收产物**：可运行脚本、训练日志、负对照实验、未来加入验证集的设计方案。
