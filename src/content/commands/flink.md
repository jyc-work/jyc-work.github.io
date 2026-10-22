---
title: "Flink｜作业、Checkpoint 与背压排查"
description: "Flink CLI、REST API、作业状态、TaskManager、Checkpoint 与恢复概念。"
category: "大数据组件"
order: 32
keywords: ["Flink","flink list","Flink REST","checkpoint","backpressure","TaskManager"]
updated: 2026-10-22
source: "https://nightlies.apache.org/flink/flink-docs-stable/"
---


> 参考 Flink 1.20+ 常见操作。Standalone、YARN、Kubernetes 的启动和认证方式不同；脚本示例假设本地或授权环境已有 Flink 客户端。

## Flink CLI 作业状态

~~~bash
./bin/flink --version
./bin/flink list
./bin/flink list -r
./bin/flink list -a
~~~

list -r 聚焦运行中的作业，list -a 查看所有可见作业；实际可用性受集群管理模式和客户端版本影响。

## REST API（本地或已授权管理端口）

~~~bash
curl -fsS --max-time 5 http://127.0.0.1:8081/overview
curl -fsS --max-time 5 http://127.0.0.1:8081/jobs/overview
curl -fsS --max-time 5 http://127.0.0.1:8081/taskmanagers
~~~

**安全：** 不要在互联网上直接暴露 Flink Web UI/REST 端口；代理与认证机制需要独立处理。

## 一份故障排查清单

1. 确认 Job 状态、Failover 与 Restart 次数。
2. 观察各 Operator 处理速率和 Busy/Backpressured/Idle 的指标。
3. 检查 Checkpoint 失败信息、对齐时间、State 大小及后端 IO。
4. 核对 Kafka Source 消费进度、下游 Sink 延迟和异常日志。
5. 固定输入，验证故障前后状态恢复与结果一致性。

## 需要额外审批的操作

任务取消、强制 Savepoint、从 Checkpoint 重启以及修改并行度都可能影响服务和数据语义。不能把“开启 Checkpoint”简单等同于端到端 Exactly-Once。

## 参考读取日志方式

~~~bash
find ./log -maxdepth 1 -type f -name '*taskexecutor*.log'
grep -RIn "Checkpoint" ./log | head -n 30
~~~

日志目录在 YARN/K8s 上可能不位于本地 ./log，按发行版和部署模式调整。

## 官方参考

- [命令文档](https://nightlies.apache.org/flink/flink-docs-stable/)

*命令需根据实际系统版本、授权和部署方式确认。*
