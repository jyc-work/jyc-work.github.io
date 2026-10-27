---
title: "Agent Tool Loop：从模型动作提案到服务端工具执行"
description: "建立最小工具循环、白名单校验、错误反馈与有限步退出，并以故障案例进行验收。"
date: 2026-10-27
track: agent-engineering
order: 1
level: 进阶
duration: "60–90 分钟"
tags: ["Agent", "Tool Calling", "Reliability"]
source: "https://github.com/shareAI-lab/learn-claude-code"
---

## 为什么 Agent 不是无限循环调用模型

用户给出任务，模型可以决定下一步是否需要调用工具。但模型返回的工具名称与参数仍是**不可信输入**。真正执行工具的主体应该是应用运行时：它检查 Schema、授权、预算、超时与副作用，然后返回结构化结果。

基本控制流：`用户请求 → 模型提案 → 校验与授权 → 工具调用 → 结果追加上下文 → 模型下一步/结束`。当遇到迭代上限、明确拒绝或不可恢复错误时，必须停止。

## 完全离线的工具循环演示

不需要 AI Key。用固定 `planner` 模拟模型产出，重点练习 Harness 的**控制权**：

```python
TOOLS = {
    "read_status": lambda args: {"status": "healthy", "service": args["service"]},
}
ALLOWED_SERVICES = {"demo-api", "test-worker"}

def execute(call):
    name = call.get("name")
    args = call.get("arguments")
    if name not in TOOLS:
        return {"ok": False, "error": "UNKNOWN_TOOL"}
    if not isinstance(args, dict) or set(args) != {"service"}:
        return {"ok": False, "error": "INVALID_ARGUMENTS"}
    if args["service"] not in ALLOWED_SERVICES:
        return {"ok": False, "error": "NOT_ALLOWED"}
    try:
        return {"ok": True, "data": TOOLS[name](args)}
    except Exception as exc:
        return {"ok": False, "error": "TOOL_FAILURE", "type": type(exc).__name__}

def run(tool_calls, limit=4):
    transcript = []
    for call in tool_calls[:limit]:
        transcript.append(execute(call))
    return transcript

assert run([{"name": "read_status",
             "arguments": {"service": "demo-api"}}])[0]["ok"]
assert run([{"name": "delete_files",
             "arguments": {"path": "/"}}])[0]["error"] == "UNKNOWN_TOOL"
assert run([{"name": "read_status",
             "arguments": {"service": "production"}}])[0]["error"] == "NOT_ALLOWED"
print("toy tool dispatch passed")
```

这只是工具调度层，不包含真正的模型 API、多轮消息串、工具调用 ID 或用户身份认证。切忌将 `ALLOWED_SERVICES` 当成生产权限系统。生产授权必须关联登录身份、租户、资源和操作级别，不能只看字符串是否在列表中。

## 升级成真实模型循环

模型侧需要把 `tools` 定义与参数 JSON Schema 传给支持 Tool Calling 的模型；收到工具调用时取出稳定 call ID，执行后按同一 ID 返回结果。服务端需要保留结构化事件：`run_started / tool_requested / tool_finished / run_finished`。超过最大轮数应返回明确失败或部分完成，而不是“悄悄成功”。

## 故障注入测试

| 情况 | 期望结果 |
| --- | --- |
| 未知工具名 | 拒绝执行，返回可机器读取的错误 |
| 不符合 Schema | 拒绝，不尝试猜测参数 |
| 工具超时 | 记录超时，受限次数重试或终止 |
| 重复写动作 | 根据幂等键去重/查询回执，不能盲目重试 |
| 用户取消 | 不再发起后续步骤，记录取消原因 |

## 验收与延伸

改写离线示例，为每次调用生成 `tool_call_id`，将输入/输出写入 JSONL，限制每次运行最多 4 步。设计 5 个回归测试证明不会越过工具白名单。

**验收**：代码、错误表、测试记录与状态图。对标 [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) 的教学结构，必要时参考 [Pi](https://github.com/earendil-works/pi) 的源码，但不要把教学调度器称为完整生产 Harness。
