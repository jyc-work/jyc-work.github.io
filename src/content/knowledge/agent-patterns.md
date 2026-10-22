---
title: "Agent 设计模式：从概念到工程验收"
description: "对《Agent 设计模式之美》建立独立学习索引：按功能、执行拓扑和治理机制归类，并补充实践验收问题。"
date: 2026-10-22
tags: ["Agent", "Patterns", "Reading Notes"]
source: "https://zhiwenliang.github.io/learning/agent-design-patterns/index.html"
---

## 知识地图

外部参考资料：[《Agent 设计模式之美》原始目录](https://zhiwenliang.github.io/learning/agent-design-patterns/index.html)，作者的完整章节应在原站阅读。这里不转载原文或原图。

采用两条观察维度：**Agent 具备什么认知功能**（感知、记忆、推理、行动、反思），以及**任务如何组织执行**（顺序、并行、委派、交接）。跨越两条维度的是权限、审计、可恢复性和验证。

## 原始章节索引

| 章节 | 学习目标 | 本站建议的实践 |
| --- | --- | --- |
| [01 范式觉醒](https://zhiwenliang.github.io/learning/agent-design-patterns/01-paradigm.html) | 设计边界与模式选型 | 绘制最小 Agent 状态图 |
| [02 感知](https://zhiwenliang.github.io/learning/agent-design-patterns/02-perception.html) | 管理上下文与观测 | 比较不同信息注入策略 |
| [03 记忆](https://zhiwenliang.github.io/learning/agent-design-patterns/03-memory.html) | 检索和跨运行经验 | 构造带来源的失败记忆 |
| [04 推理](https://zhiwenliang.github.io/learning/agent-design-patterns/04-reasoning.html) | 准确率、延迟、成本权衡 | 比较不同推理预算 |
| [05 行动](https://zhiwenliang.github.io/learning/agent-design-patterns/05-action.html) | 工具设计和安全执行 | 注入参数错误与超时 |
| [06 反思](https://zhiwenliang.github.io/learning/agent-design-patterns/06-reflection.html) | 自我修复与外部验证 | 用自动化测试做 oracle |
| [07 协作](https://zhiwenliang.github.io/learning/agent-design-patterns/07-collaboration.html) | 多 Agent 拓扑 | 比较单 Agent 和多 Agent |
| [08 治理](https://zhiwenliang.github.io/learning/agent-design-patterns/08-governance.html) | 权限与控制面 | 审批、隔离及追踪 |
| [09 组合](https://zhiwenliang.github.io/learning/agent-design-patterns/09-composition.html) | 组合 Harness 系统 | 设计 checkpoint / replay |
| [10 自测](https://zhiwenliang.github.io/learning/agent-design-patterns/10-self-check.html) | 概念和场景判别 | 写一份架构决策记录 |

## 学习顺序

第一阶段只研究一个最小 Tool Loop：从模型工具请求到工具结果回填。第二阶段加入状态、事件流、异常恢复和回归测试。第三阶段再比较多 Agent 架构、推理路由与上下文策略。

## 独立判断

技术教程里的模型性能、价格和生态判断具有时效性。对这些数字不能直接视为当前事实；应以具体版本官方资料和可复现测量核实。

**本篇状态：知识索引已整理，所引用技术机制不等于已全部独立验证。**
