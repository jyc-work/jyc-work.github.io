---
title: "从 UTF-8 字节到 BPE：亲手训练玩具 Tokenizer"
description: "从词表、字节编码、频次合并讲起，实现可逆的字节级 BPE，并用边界样例验证。"
date: 2026-10-27
track: llm-engineering
order: 1
level: 入门
duration: "60–90 分钟"
tags: ["Tokenizer", "BPE", "Python"]
source: "https://github.com/datawhalechina/diy-llm"
---

## 学习目标与准备

这节不是介绍“分词器有哪些名字”，而是回答三个机制问题：文本为什么必须先编码为整数、BPE 为什么能用有限词表表示任意输入、为什么训练语料变化会影响同一段文字的 Token 数量。只需要 Python 3.11+，不需要 GPU。

模型处理的是整数序列。所谓 Tokenizer 一般同时包含：规范化规则、分割或预切分方式、词表、合并规则、特殊 Token 处理。不同实现的行为不等价；下面故意只实现**教学用字节级 BPE 核心**，不代表生产 Tokenizer 的完整实现。

## 机制：字节级表示与频繁相邻对合并

UTF-8 能将文本转成字节序列。用 0～255 作为基础词表即可完整表达这些字节，避免未知字符直接丢失。BPE 从细粒度单元开始，统计相邻 Token 对出现的次数，把最频繁的一对加入新 Token；合并后再次统计，直到达到目标词表或停止条件。

注意：合并是**有序规则**，不能在编码时随意先合并新发现的高频对。生产分词器通常还涉及正则预切分、特殊 Token 和严格一致的实现细节。

## 可运行实验：单文件玩具 BPE

保存为 `toy_bpe.py`：

```python
from collections import Counter

corpus = "banana bandana 你好 banana".encode("utf-8")
sequences = [list(corpus)]
vocab = {i: bytes([i]) for i in range(256)}
merges = []

def merge_pair(tokens, pair, new_id):
    out = []
    i = 0
    while i < len(tokens):
        if i + 1 < len(tokens) and tuple(tokens[i:i+2]) == pair:
            out.append(new_id)
            i += 2
        else:
            out.append(tokens[i])
            i += 1
    return out

for new_id in range(256, 266):
    counts = Counter(
        (a, b)
        for seq in sequences
        for a, b in zip(seq, seq[1:])
    )
    if not counts:
        break
    pair, frequency = counts.most_common(1)[0]
    if frequency < 2:
        break
    vocab[new_id] = vocab[pair[0]] + vocab[pair[1]]
    merges.append((pair, new_id))
    sequences = [merge_pair(seq, pair, new_id) for seq in sequences]

def encode(text):
    tokens = list(text.encode("utf-8"))
    for pair, token_id in merges:
        tokens = merge_pair(tokens, pair, token_id)
    return tokens

def decode(tokens):
    return b"".join(vocab[token] for token in tokens).decode("utf-8")

samples = ["banana", "你好", "a🚀b", "", "bandana banana"]
for sample in samples:
    encoded = encode(sample)
    assert decode(encoded) == sample
    print(repr(sample), encoded, len(encoded))
print("learned merges:", merges)
```

执行 `python toy_bpe.py`。观察同样长度的字符串可能得到不同的 Token 数量。这里只是玩具规模：未处理特殊 Token、预分词、跨语料边界以及高效训练。

## 实验与排错

将训练语料中的英文替换成中文句子，重新训练，比较相同测试串的 Token 数。再将 `for new_id in range(256, 266)` 上限增大，记录词表数量、平均 Token 数和压缩比例。**不要只比较长度；还要验证 `decode(encode(text)) == text`。**

- 如果合并后解码乱码：检查字节串是否按顺序拼接，最终应一次性以 UTF-8 解码。
- 如果同样输入得到不同输出：检查合并规则的保存顺序和统计并列时的确定性。
- 如果遇到含 emoji 的文本报错：检查是否错误地假设一个 Unicode 字符就是一个字节。

## 验收题

1. 为什么初始 256 个字节 Token 理论上可以表示任意有效 UTF-8 文本？
2. 为什么 Token 数不能简单等同于中文字符数？
3. 改变合并规则之后，之前保存的 Token IDs 是否仍能按原词表解释？

**验收产物**：源文件、五组边界输入、不同训练语料的 token 长度对比，以及局限性说明。

## 参考与延伸

- [Datawhale Diy-LLM](https://github.com/datawhalechina/diy-llm) 的分词章节及基础作业，可用来对照更完整的课程实现。
- [个人 CS336 笔记与作业](https://github.com/weiruihhh/cs336_note_and_hw) 可作为第二种解释来源，但具体代码仍需自行运行和核验。
