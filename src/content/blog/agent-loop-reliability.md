---
title: "最小 Agent Loop：工具执行为什么需要可靠性外壳"
description: "从一次模型调用扩展到可控的工具调用：参数验证、授权、事件记录、终止条件与故障测试。"
date: 2026-10-22
tags: ["Agent Engineering", "Tool Calling", "Harness"]
---

## 模型决定动作，不等于模型执行动作

典型 Agent Loop 由模型提出下一步，再由应用程序解释结构化工具请求、校验参数、执行工具并将结果写回上下文。模型输出应被看作待审核的动作提案，不能作为绕过应用权限检查的理由。

## 最小状态模型

可以从以下字段开始：

```ts
type RunState = {
  runId: string;
  step: number;
  status: 'running' | 'waiting_approval' | 'done' | 'failed' | 'cancelled';
  pendingToolCallId?: string;
  errorCount: number;
  eventCursor: number;
};
```

这里不是一个完整的运行时实现，还需要持久化、鉴权、取消和超时处理。

## 工具边界应分三层

1. **静态约束**：工具名称白名单、JSON Schema、参数范围及副作用等级。
2. **运行期约束**：服务端鉴权、最大迭代次数、超时与资源预算。
3. **执行后验证**：结果结构检查、状态核验和事件追踪。

不要让模型自行决定是否需要审批。支付、删除或真实交易等高风险操作必须由服务器上的策略强制执行。

## 失败路径优先测试

至少覆盖如下情形：

- 工具不存在或参数结构错误。
- 工具超时、错误响应、用户取消。
- 模型重复请求同一个写操作。
- 工具执行成功、保存 checkpoint 前发生崩溃。
- 达到步数或 token 预算后正确退出。

外部写入往往需要幂等键、操作回执或补偿机制；简单重试不一定安全。

## 最小验收标准

在固定的模拟工具集上，分别记录成功路径与注入故障路径，并保证测试可重复运行。没有实际跑过的测试用例，只能称为**测试计划**。

延伸阅读：[Agent 设计模式：行动章节](https://zhiwenliang.github.io/learning/agent-design-patterns/05-action.html)、[治理章节](https://zhiwenliang.github.io/learning/agent-design-patterns/08-governance.html)。
