---
title: "Agent 事件流与异常恢复：从 Tool Call 到 Checkpoint"
description: "把可重放事件、幂等键、权限审批与崩溃窗口纳入 Agent 工程，而不仅是保存聊天历史。"
date: 2026-10-22
tags: ["Agent", "Event Stream", "Reliability"]
---

## 一条工具调用链必须回答什么

当模型提出工具调用后，系统需要知道：发起者是谁、调用的是哪一个工具、是否经过授权、何时开始及结束、结果是否保存、用户是否取消，以及失败能否安全重试。

仅保留最终聊天消息，通常无法完整解释这些问题。

## 最小事件模式

以下是用于设计讨论的事件结构，不代表生产环境的唯一选择：

```ts
type AgentEvent = {
  runId: string;
  seq: number;
  timestamp: string;
  kind: 'tool.requested' | 'tool.started' | 'tool.succeeded'
      | 'tool.failed' | 'run.cancelled' | 'checkpoint.saved';
  toolCallId?: string;
  idempotencyKey?: string;
  payloadRef?: string;
};
```

事件应该有稳定排序方式和存储策略。对敏感参数建议保存脱敏摘要或对象存储引用，而不是把原始密钥与隐私数据写进日志。

## 崩溃窗口与幂等

假设工具执行成功，但程序在记录结果之前崩溃。如果恢复逻辑将该步骤简单地重新执行，外部写操作可能发生两次。

稳健方案需要根据工具类型选择：

- 只读调用：通常可按预算重试。
- 幂等写入：在外部系统与本地状态之间使用幂等键及回执对账。
- 不可逆副作用：进入审批、人工确认或补偿流程，不可盲目重试。

## 故障注入用例

在以下时刻人为触发异常：请求发出之前、调用进行中、外部返回成功之后、Checkpoint 提交之前。每一次都应检查工具是否被重复调用、事件是否可关联以及恢复能否产生确定结论。

## 最后产物

将一份 **事件格式说明 + 五个失败场景测试 + 恢复结果报告** 作为可验证作品集材料。若尚未执行测试，应标记为实验计划，而不是 PASS。
