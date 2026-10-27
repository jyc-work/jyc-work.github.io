---
title: "系统设计实战：需求、SLO、容量估算与 ADR"
description: "通过具体服务算吞吐与容量，定义失败预算，并比较同步和异步方案的权衡。"
date: 2026-10-27
track: software-architecture
order: 1
level: 进阶
duration: "60–90 分钟"
tags: ["System Design", "SLO", "ADR"]
source: "https://github.com/donnemartin/system-design-primer"
---

## 架构设计从假设出发

一个系统架构题不应从“要不要 Redis/Kafka”开始，而应先确认用户操作、读写量、延迟目标、可用性目标和数据一致性要求。设计文档要清楚写出：哪些数值是需求，哪些是假设，哪些是实际测量。

以一个“团队知识文档检索服务”为例，假设日活 10,000，每人每天触发 20 次搜索。日请求量是 200,000；平均 QPS 约为 2.31。平均值不足以规划容量，因为峰值可能高度集中。

## 用脚本记录假设，而不是凭直觉

```python
daily_users = 10_000
searches_per_user = 20
peak_factor = 8
avg_qps = daily_users * searches_per_user / 86_400
peak_qps = avg_qps * peak_factor
print("average QPS:", round(avg_qps, 2))
print("assumed peak QPS:", round(peak_qps, 2))
assert peak_qps > avg_qps
```

**峰值倍数 8 是教学假设**，不是来自监控的真实流量；实际容量规划需要按小时分布、峰值窗口、缓存命中率和重试放大率调整。

## SLI、SLO 与错误预算

- **SLI** 是观测指标，例如请求成功比例、延迟分位数。
- **SLO** 是目标，例如 30 天内 99.9% 请求成功。
- **错误预算** 是目标允许的失败量，若按请求比例计算，在 200,000 次请求中 0.1% 对应 200 次失败（仅作为同时间窗示例）。

不要把 SLO 写成“永远不出错”，也不要把服务实际达到某个 SLO 当成未测试就成立的事实。

## 设计两种方案

方案 A：同步查询数据库并返回搜索结果，结构简单、数据更新路径短，但高峰时数据库可能成为瓶颈。方案 B：异步构建搜索索引，查询与写入解耦，但带来索引延迟、一致性和失败补偿问题。

比较时至少写出：关键瓶颈、失败路径、观测指标、数据刷新延迟及回滚方式。你不能只因为方案 B 更复杂就认定它“企业级”。

## ADR 模板

```markdown
# ADR-001: 检索数据如何索引

## 背景与约束
- 峰值 QPS：假设 19，等待实测
- 延迟目标：P95 < 300ms（产品目标）
- 更新延迟：允许 30s（待业务确认）

## 备选
A. 同步数据库查询
B. 异步搜索索引

## 选择及原因
记录证据，不写未经验证的性能数字。

## 风险及回滚
记录索引落后、同步失败、回滚路径和责任人。
```

## 验收题

1. 为什么平均 QPS 不能直接作为机器配额？
2. 目标 99.9% 与观测到 99.9% 有什么区别？
3. 引入异步索引有哪些非功能性成本？

**验收**：容量估算表、完整 ADR、三个故障场景和验证计划。参考 [System Design Primer](https://github.com/donnemartin/system-design-primer)。
